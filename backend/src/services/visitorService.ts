import { eq, desc, like, or, inArray, sql, and } from "drizzle-orm";
import { guestbookVisitor } from "../db/schema";

const formatDateTime = (date: Date = new Date()) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

// 内存中维护近 5 分钟活跃会话（UUID -> timestamp）
const activeSessions = new Map<string, number>();

export const recordActiveSession = (uuid: string) => {
  if (uuid) {
    activeSessions.set(uuid, Date.now());
  }
};

export const getOnlineCount = () => {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  for (const [id, time] of activeSessions.entries()) {
    if (time < fiveMinutesAgo) {
      activeSessions.delete(id);
    }
  }
  return Math.max(1, activeSessions.size);
};

export const getOnlineStatsData = async (db: any, currentUuid?: string) => {
  if (currentUuid) {
    recordActiveSession(currentUuid);
  }
  const onlineCount = getOnlineCount();

  const totalRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(guestbookVisitor);
  const totalVisitors = Number(totalRes?.[0]?.count ?? 0);

  return {
    onlineCount,
    totalVisitors
  };
};

// DiceBear 在线头像风格池：覆盖卡通、插画、真实人物肖像、抽象、几何等风格
export const DICEBEAR_STYLES = [
  // 卡通
  "adventurer", "bottts", "fun-emoji",
  // 插画
  "lorelei", "notionists", "open-peeps", "avataaars",
  // 真实人物/肖像
  "personas", "micah",
  // 抽象
  "shapes", "glass",
  // 几何
  "identicon", "rings"
];

export const generateDiceBearAvatar = (seed?: string) => {
  const style = DICEBEAR_STYLES[Math.floor(Math.random() * DICEBEAR_STYLES.length)];
  const safeSeed = encodeURIComponent(seed || Math.random().toString(36).slice(2));
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${safeSeed}`;
};

/**
 * 前台：同步或注册浏览器唯一访客用户（固定昵称与专属 DiceBear 头像，不可随意篡改）
 */
export const syncVisitorUser = async (
  db: any,
  body: { uuid: string; defaultNickname?: string; email?: string; avatar?: string },
  clientIp = "",
  userAgent = ""
) => {
  const uuid = (body.uuid ?? "").trim();
  if (!uuid) {
    throw new Error("UUID 不能为空");
  }

  recordActiveSession(uuid);

  // 1. 先查询数据库中该 uuid 是否已存在
  const existing = await db
    .select()
    .from(guestbookVisitor)
    .where(eq(guestbookVisitor.uuid, uuid))
    .limit(1);

  const nowStr = formatDateTime();

  if (existing && existing.length > 0) {
    const user = existing[0];
    const updates: Record<string, any> = {};

    // 如果用户提交了新邮箱，则更新邮箱
    const newEmail = typeof body.email === "string" ? body.email.trim() : null;
    if (newEmail !== null && newEmail !== user.email) {
      updates.email = newEmail || null;
      user.email = newEmail || null;
    }

    // 若老用户数据库中无头像，自动分配或使用传入的头像
    if (!user.avatar) {
      const assignedAvatar = (body.avatar ?? "").trim() || generateDiceBearAvatar(user.uuid);
      updates.avatar = assignedAvatar;
      user.avatar = assignedAvatar;
    }

    if (Object.keys(updates).length > 0) {
      updates.updatedAt = nowStr;
      await db
        .update(guestbookVisitor)
        .set(updates)
        .where(eq(guestbookVisitor.id, user.id));
    }

    return {
      uuid: user.uuid,
      nickname: user.nickname,
      email: user.email || "",
      avatar: user.avatar
    };
  }

  // 2. 数据库中不存在，初次生成用户信息并持久化存入数据表
  let nickname = (body.defaultNickname ?? "").trim();
  if (nickname.length < 2 || nickname.length > 20) {
    nickname = `极客漫游者_${Math.floor(1000 + Math.random() * 9000)}`;
  }

  const rawEmail = typeof body.email === "string" ? body.email.trim() : null;
  const avatar = (body.avatar ?? "").trim() || generateDiceBearAvatar(uuid);

  const insertData = {
    uuid,
    nickname,
    avatar,
    email: rawEmail || null,
    clientIp,
    userAgent,
    status: "active",
    createdAt: nowStr,
    updatedAt: nowStr
  };

  await db.insert(guestbookVisitor).values(insertData);

  return {
    uuid,
    nickname,
    email: rawEmail || "",
    avatar
  };
};

/**
 * 后台：分页查询访客用户列表
 */
export const getAdminVisitorList = async (
  db: any,
  query: { pageNum?: number; pageSize?: number; keyword?: string; status?: string }
) => {
  const pageNum = Math.max(1, Number(query.pageNum) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10));
  const offset = (pageNum - 1) * pageSize;
  const keyword = (query.keyword ?? "").trim();

  const conditions: any[] = [];

  if (keyword) {
    conditions.push(
      or(
        like(guestbookVisitor.nickname, `%${keyword}%`),
        like(guestbookVisitor.uuid, `%${keyword}%`),
        like(guestbookVisitor.email, `%${keyword}%`)
      )
    );
  }

  if (query.status) {
    conditions.push(eq(guestbookVisitor.status, query.status));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(guestbookVisitor)
    .where(whereClause);

  const total = Number(countResult?.[0]?.count ?? 0);

  const list = await db
    .select()
    .from(guestbookVisitor)
    .where(whereClause)
    .orderBy(desc(guestbookVisitor.createdAt), desc(guestbookVisitor.id))
    .limit(pageSize)
    .offset(offset);

  return {
    list,
    total,
    pageNum,
    pageSize,
    pages: Math.ceil(total / pageSize)
  };
};

/**
 * 后台：删除单个访客用户
 */
export const deleteVisitorUser = async (db: any, id: number) => {
  await db.delete(guestbookVisitor).where(eq(guestbookVisitor.id, id));
  return { message: "用户已删除" };
};

/**
 * 后台：批量删除访客用户
 */
export const batchDeleteVisitorUsers = async (db: any, ids: number[]) => {
  if (!ids || ids.length === 0) {
    throw new Error("请选择要删除的用户");
  }
  await db.delete(guestbookVisitor).where(inArray(guestbookVisitor.id, ids));
  return { message: `已成功删除 ${ids.length} 名用户` };
};
