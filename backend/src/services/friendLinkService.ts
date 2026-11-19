import { eq, and, desc, asc, like, or, sql } from "drizzle-orm";
import { schema } from "../db";
import { sendNotificationEmail } from "../utils/mail";

const { friendLink } = schema;

const ADMIN_EMAIL = "1040822172@qq.com";

const formatDateTime = (date = new Date()): string => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 文本清洗消毒
 */
export const sanitizeText = (str: string): string => {
  if (!str) return "";
  return str
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

/**
 * 前台：获取所有已通过审核展示的友链
 */
export const getOpenFriendLinks = async (db: any) => {
  const list = await db
    .select({
      id: friendLink.id,
      name: friendLink.name,
      url: friendLink.url,
      logo: friendLink.logo,
      description: friendLink.description,
      createdAt: friendLink.createdAt
    })
    .from(friendLink)
    .where(eq(friendLink.status, "approved"))
    .orderBy(desc(friendLink.sortOrder), asc(friendLink.id));

  return list;
};

/**
 * 前台：访客提交友链申请
 */
export const applyFriendLink = async (db: any, body: any, clientIp = "") => {
  const rawName = (body.name ?? "").toString().trim();
  const rawUrl = (body.url ?? "").toString().trim();
  const rawDescription = (body.description ?? "").toString().trim();
  const rawEmail = (body.email ?? "").toString().trim();
  const rawLogo = (body.logo ?? "").toString().trim();

  // 1. 字段校验
  if (!rawName || rawName.length < 2 || rawName.length > 40) {
    throw new Error("网站名称长度需在 2 到 40 个字符之间");
  }

  if (!rawUrl || !/^https?:\/\/.+/i.test(rawUrl)) {
    throw new Error("网站链接格式不正确，必须以 http:// 或 https:// 开头");
  }

  if (rawDescription && rawDescription.length > 200) {
    throw new Error("网站描述长度不能超过 200 个字符");
  }

  if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    throw new Error("联系邮箱格式不正确");
  }

  // 2. 检查是否重复提交（同一链接已存在）
  const existing = await db
    .select()
    .from(friendLink)
    .where(eq(friendLink.url, rawUrl))
    .limit(1);

  if (existing.length > 0) {
    const item = existing[0];
    if (item.status === "approved") {
      throw new Error("该网站已在友链列表中展示，无需重复申请");
    }
    if (item.status === "pending") {
      throw new Error("该网站已提交申请且正在审核中，请耐心等待");
    }
  }

  const safeName = sanitizeText(rawName);
  const safeDesc = rawDescription ? sanitizeText(rawDescription) : null;
  const nowTime = formatDateTime();

  const insertData = {
    name: safeName,
    url: rawUrl,
    logo: rawLogo || null,
    description: safeDesc,
    email: rawEmail || null,
    status: "pending",
    sortOrder: 0,
    createdAt: nowTime
  };

  const insertResult = (await db.insert(friendLink).values(insertData).returning?.()) ?? [];
  const inserted = insertResult?.[0] ?? insertData;

  // 3. 异步发送邮件通知站长
  setTimeout(async () => {
    try {
      const subject = `【Jie Hub】收到新的友链申请：《${safeName}》`;
      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 20px auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h3 style="color: #2563eb; margin-top: 0; font-size: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
            🔗 Jie Hub - 收到新友链申请
          </h3>
          <p style="color: #334155; font-size: 14px;">站长您好，网站刚刚收到了一条新的友链申请，请及时审核：</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #475569; margin: 16px 0;">
            <tr>
              <td style="padding: 6px 0; width: 90px; color: #94a3b8;">网站名称：</td>
              <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">网站地址：</td>
              <td style="padding: 6px 0;"><a href="${rawUrl}" target="_blank" style="color: #3b82f6; text-decoration: none;">${rawUrl}</a></td>
            </tr>
            ${rawLogo ? `<tr><td style="padding: 6px 0; color: #94a3b8;">网站 Logo：</td><td style="padding: 6px 0;"><a href="${rawLogo}" target="_blank" style="color: #3b82f6;">${rawLogo}</a></td></tr>` : ""}
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">联系邮箱：</td>
              <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${rawEmail || "未提供"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">提交时间：</td>
              <td style="padding: 6px 0;">${nowTime}</td>
            </tr>
            ${clientIp ? `<tr><td style="padding: 6px 0; color: #94a3b8;">来源 IP：</td><td style="padding: 6px 0;">${clientIp}</td></tr>` : ""}
          </table>

          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">网站简介：</div>
            <div style="color: #1e293b; font-size: 14px; line-height: 1.6;">${safeDesc || "（申请人未填写描述）"}</div>
          </div>

          <div style="margin-top: 20px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 12px;">
            提示：可前往后台管理系统「友链管理」模块执行审核与上架操作。
          </div>
        </div>
      `;

      await sendNotificationEmail(ADMIN_EMAIL, subject, html);
    } catch (mailErr) {
      console.error("[Mail] 发送站长友链申请通知邮件异常:", mailErr);
    }
  }, 0);

  return inserted;
};

/**
 * 后台：分页与状态条件查询友链列表
 */
export const getManageFriendLinks = async (db: any, query: Record<string, any>) => {
  const pageNum = Math.max(1, Number(query.pageNum ?? 1));
  const pageSize = Math.max(1, Math.min(100, Number(query.pageSize ?? 10)));
  const offset = (pageNum - 1) * pageSize;

  const status = query.status ? query.status.toString().trim() : "";
  const keyword = query.keyword ? query.keyword.toString().trim() : "";

  const conditions: any[] = [];
  if (status && status !== "all") {
    conditions.push(eq(friendLink.status, status));
  }
  if (keyword) {
    conditions.push(
      or(
        like(friendLink.name, `%${keyword}%`),
        like(friendLink.url, `%${keyword}%`),
        like(friendLink.email, `%${keyword}%`),
        like(friendLink.description, `%${keyword}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(friendLink)
    .where(whereClause);
  const total = Number(totalRes?.[0]?.count ?? 0);

  const list = await db
    .select()
    .from(friendLink)
    .where(whereClause)
    .orderBy(desc(friendLink.sortOrder), desc(friendLink.id))
    .limit(pageSize)
    .offset(offset);

  return {
    list,
    total,
    pageNum,
    pageSize
  };
};

/**
 * 后台：更新友链审核状态（通过 / 拒绝 / 隐藏）
 */
export const updateFriendLinkStatus = async (
  db: any,
  id: number,
  status: string,
  rejectReason = ""
) => {
  const validStatuses = ["pending", "approved", "rejected", "hidden"];
  if (!validStatuses.includes(status)) {
    throw new Error("无效的状态参数");
  }

  const existing = await db
    .select()
    .from(friendLink)
    .where(eq(friendLink.id, id))
    .limit(1);

  if (existing.length === 0) {
    throw new Error("友链记录不存在");
  }

  const target = existing[0];
  const nowTime = formatDateTime();

  await db
    .update(friendLink)
    .set({
      status,
      rejectReason: status === "rejected" ? rejectReason : null,
      reviewedAt: nowTime
    })
    .where(eq(friendLink.id, id));

  // 异步给申请人发送审核反馈邮件
  if (target.email && target.email.includes("@")) {
    setTimeout(async () => {
      try {
        if (status === "approved") {
          const userSubject = `【Jie Hub】恭喜！您的友链申请已通过审核`;
          const userHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 20px auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h3 style="color: #10b981; margin-top: 0; font-size: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                🎉 友链审核通过通知
              </h3>
              <p style="color: #334155; font-size: 14px;">您好，您提交的友链申请已通过站长审核，并已公开展示在 Jie Hub 的「探索好站」页面中！</p>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #475569; margin: 16px 0;">
                <tr><td style="padding: 6px 0; width: 80px; color: #94a3b8;">网站名称：</td><td style="padding: 6px 0; font-weight: 600;">${target.name}</td></tr>
                <tr><td style="padding: 6px 0; color: #94a3b8;">网站链接：</td><td style="padding: 6px 0;"><a href="${target.url}" target="_blank" style="color: #3b82f6;">${target.url}</a></td></tr>
              </table>
              <p style="font-size: 13px; color: #64748b;">感谢您的支持与互联！</p>
            </div>
          `;
          await sendNotificationEmail(target.email, userSubject, userHtml);
        } else if (status === "rejected") {
          const userSubject = `【Jie Hub】友链申请反馈通知`;
          const userHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 20px auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h3 style="color: #ef4444; margin-top: 0; font-size: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                友链申请审核反馈
              </h3>
              <p style="color: #334155; font-size: 14px;">您好，很遗憾通知您，您申请的友链暂未通过审核。</p>
              ${rejectReason ? `<p style="font-size: 13px; color: #dc2626; background: #fef2f2; padding: 10px 14px; border-radius: 6px;">原因说明：${rejectReason}</p>` : ""}
              <p style="font-size: 13px; color: #64748b;">调整后欢迎再次提交申请，感谢您的理解与关注！</p>
            </div>
          `;
          await sendNotificationEmail(target.email, userSubject, userHtml);
        }
      } catch (e) {
        console.error("[Mail] 发送申请人反馈邮件异常:", e);
      }
    }, 0);
  }

  return { id, status };
};

/**
 * 后台：修改友链信息
 */
export const updateFriendLink = async (db: any, id: number, body: any) => {
  const existing = await db
    .select()
    .from(friendLink)
    .where(eq(friendLink.id, id))
    .limit(1);

  if (existing.length === 0) {
    throw new Error("友链记录不存在");
  }

  const updates: any = {};
  if (typeof body.name === "string" && body.name.trim()) updates.name = sanitizeText(body.name.trim());
  if (typeof body.url === "string" && body.url.trim()) updates.url = body.url.trim();
  if (typeof body.logo === "string") updates.logo = body.logo.trim() || null;
  if (typeof body.description === "string" && body.description.trim()) updates.description = sanitizeText(body.description.trim());
  if (typeof body.email === "string" && body.email.trim()) updates.email = body.email.trim();
  if (typeof body.sortOrder === "number") updates.sortOrder = body.sortOrder;

  if (Object.keys(updates).length > 0) {
    await db.update(friendLink).set(updates).where(eq(friendLink.id, id));
  }

  return { id, ...updates };
};

/**
 * 后台：管理员直接创建友链
 */
export const createFriendLink = async (db: any, body: any) => {
  const rawName = (body.name ?? "").toString().trim();
  const rawUrl = (body.url ?? "").toString().trim();
  const rawLogo = (body.logo ?? "").toString().trim();
  const rawDescription = (body.description ?? "").toString().trim();
  const rawEmail = (body.email ?? "").toString().trim();
  const rawStatus = (body.status ?? "approved").toString().trim();
  const rawSortOrder = typeof body.sortOrder === "number" ? body.sortOrder : 0;

  if (!rawName || rawName.length < 2 || rawName.length > 40) {
    throw new Error("网站名称长度需在 2 到 40 个字符之间");
  }

  if (!rawUrl || !/^https?:\/\/.+/i.test(rawUrl)) {
    throw new Error("网站链接格式不正确，必须以 http:// 或 https:// 开头");
  }

  if (rawDescription && rawDescription.length > 200) {
    throw new Error("网站描述长度不能超过 200 个字符");
  }

  if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    throw new Error("联系邮箱格式不正确");
  }

  // 检查链接是否已存在
  const existing = await db
    .select()
    .from(friendLink)
    .where(eq(friendLink.url, rawUrl))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("该网站链接已存在，请勿重复添加");
  }

  const safeName = sanitizeText(rawName);
  const safeDesc = rawDescription ? sanitizeText(rawDescription) : null;
  const nowTime = formatDateTime();

  const insertRes = await db
    .insert(friendLink)
    .values({
      name: safeName,
      url: rawUrl,
      logo: rawLogo || null,
      description: safeDesc,
      email: rawEmail || null,
      status: rawStatus,
      sortOrder: rawSortOrder,
      createdAt: nowTime,
      reviewedAt: rawStatus === "approved" ? nowTime : null
    })
    .returning({ id: friendLink.id });

  const newId = insertRes[0]?.id;
  return { id: newId, name: safeName, url: rawUrl, status: rawStatus };
};

/**
 * 后台：删除友链
 */
export const deleteFriendLink = async (db: any, id: number) => {
  await db.delete(friendLink).where(eq(friendLink.id, id));
  return { id };
};
