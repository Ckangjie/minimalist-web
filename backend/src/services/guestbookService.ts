import crypto from "node:crypto";
import { eq, and, isNull, desc, asc, like, inArray, sql } from "drizzle-orm";
import { schema } from "../db";
import { sendNotificationEmail } from "../utils/mail";
import { calculateVectorScore } from "../utils/vector";

const { guestbookComment, guestbookAuditLog } = schema;

export const formatDateTime = (date = new Date()): string => {
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
 * 防 XSS 恶意脚本与控制字符消毒清洗
 */
export const sanitizeText = (str: string): string => {
  if (!str) return "";
  return str
    // 过滤有害控制字符
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    // 转义 HTML 特殊字符，彻底杜绝 HTML 标签注入与脚本执行
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/`/g, "&#96;");
};

export const buildSourceHash = (clientIp: string, userAgent = ""): string => {
  return crypto
    .createHash("sha256")
    .update(`${clientIp}::${userAgent}`)
    .digest("hex");
};

/**
 * 前台：公开留言列表（严格只查 approved 审核通过且未删除的一级留言与同楼二级回复，仅返回公开展示字段）
 */
export const getOpenCommentList = async (db: any, params: Record<string, any>) => {
  const pageNum = Math.max(1, Number(params.pageNum ?? 1));
  const pageSize = Math.max(1, Math.min(50, Number(params.pageSize ?? 10)));
  const offset = (pageNum - 1) * pageSize;

  // 1. 查询审核通过且未删除的一级留言总数
  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(guestbookComment)
    .where(
      and(
        eq(guestbookComment.level, 1),
        eq(guestbookComment.status, "approved"),
        isNull(guestbookComment.deletedAt)
      )
    );
  const total = Number(totalCountResult?.[0]?.count ?? 0);

  if (total === 0) {
    return {
      list: [],
      total: 0,
      pageNum,
      pageSize,
      pages: 0
    };
  }

  // 2. 分页查询一级留言（仅查询允许公开展示的安全业务字段，排除 source_hash, admin_id 等内部风控字段）
  const rootComments = await db
    .select({
      id: guestbookComment.id,
      rootId: guestbookComment.rootId,
      replyToId: guestbookComment.replyToId,
      level: guestbookComment.level,
      nickname: guestbookComment.nickname,
      content: guestbookComment.content,
      authorType: guestbookComment.authorType,
      status: guestbookComment.status,
      createdAt: guestbookComment.createdAt
    })
    .from(guestbookComment)
    .where(
      and(
        eq(guestbookComment.level, 1),
        eq(guestbookComment.status, "approved"),
        isNull(guestbookComment.deletedAt)
      )
    )
    .orderBy(desc(guestbookComment.createdAt), desc(guestbookComment.id))
    .limit(pageSize)
    .offset(offset);

  const rootIds = rootComments.map((r: any) => r.id);
  const replyMap = new Map<number, any[]>();

  if (rootIds.length > 0) {
    // 3. 批量查询所属这些一级留言下的已审核通过且未软删除的二级回复
    const allReplies = await db
      .select({
        id: guestbookComment.id,
        rootId: guestbookComment.rootId,
        replyToId: guestbookComment.replyToId,
        level: guestbookComment.level,
        nickname: guestbookComment.nickname,
        content: guestbookComment.content,
        authorType: guestbookComment.authorType,
        status: guestbookComment.status,
        createdAt: guestbookComment.createdAt
      })
      .from(guestbookComment)
      .where(
        and(
          inArray(guestbookComment.rootId, rootIds),
          eq(guestbookComment.level, 2),
          eq(guestbookComment.status, "approved"),
          isNull(guestbookComment.deletedAt)
        )
      )
      .orderBy(asc(guestbookComment.createdAt), asc(guestbookComment.id));

    // 建立 ID -> 昵称 映射以便展示「回复 @目标昵称」
    const idToNicknameMap = new Map<number, string>();
    for (const r of rootComments) {
      idToNicknameMap.set(r.id, r.nickname);
    }
    for (const reply of allReplies) {
      idToNicknameMap.set(reply.id, reply.nickname);
    }

    for (const reply of allReplies) {
      const rId = Number(reply.rootId);
      const list = replyMap.get(rId) ?? [];
      const rootNick = idToNicknameMap.get(rId) ?? "";
      const replyToNickname = reply.replyToId ? idToNicknameMap.get(reply.replyToId) ?? rootNick : rootNick;
      list.push({
        ...reply,
        replyToNickname
      });
      replyMap.set(rId, list);
    }
  }

  const resultList = rootComments.map((r: any) => ({
    ...r,
    replies: replyMap.get(r.id) ?? []
  }));

  return {
    list: resultList,
    total,
    pageNum,
    pageSize,
    pages: Math.ceil(total / pageSize)
  };
};

/**
 * 前台：提交留言或二级回复
 */
export const submitOpenComment = async (
  db: any,
  body: Record<string, any>,
  clientIp: string,
  userAgent = ""
) => {
  const nickname = (body.nickname ?? "").toString().trim();
  const content = (body.content ?? "").toString().trim();
  const rawEmail = (body.email ?? "").toString().trim();
  const rootId = body.rootId ? Number(body.rootId) : null;
  const replyToId = body.replyToId ? Number(body.replyToId) : null;

  if (nickname.length < 2 || nickname.length > 20) {
    throw new Error("昵称长度需在 2–20 个字符之间");
  }
  if (content.length < 1 || content.length > 200) {
    throw new Error("留言内容需在 1–200 个字符之间");
  }

  // 防 XSS 注入清洗
  const safeNickname = sanitizeText(nickname);
  const safeContent = sanitizeText(content);

  let email: string | null = null;
  if (rawEmail) {
    if (rawEmail.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      throw new Error("请输入合法的邮箱地址");
    }
    email = rawEmail;
  }

  // 基础防刷频率控制：同一来源 60 秒内最多提交 1 次（本地开发调试限制为 3 秒）
  const sourceHash = buildSourceHash(clientIp, userAgent);
  const isDev = process.env.NODE_ENV !== "production";
  const limitSeconds = isDev ? 3 : 60;
  const now = new Date();
  const secondsAgo = new Date(now.getTime() - limitSeconds * 1000);
  const secondsAgoStr = formatDateTime(secondsAgo);

  const recentCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(guestbookComment)
    .where(
      and(
        eq(guestbookComment.sourceHash, sourceHash),
        sql`datetime(${guestbookComment.createdAt}) >= datetime(${secondsAgoStr})`
      )
    );

  if (Number(recentCount?.[0]?.count ?? 0) > 0) {
    throw new Error(`提交过于频繁，请稍后再试（提交频率限制为 ${limitSeconds} 秒）`);
  }

  let finalLevel = 1;
  let finalRootId: number | null = null;
  let finalReplyToId: number | null = null;

  if (rootId) {
    // 校验所属一级留言
    const rootList = await db
      .select()
      .from(guestbookComment)
      .where(
        and(
          eq(guestbookComment.id, rootId),
          eq(guestbookComment.level, 1),
          eq(guestbookComment.status, "approved"),
          isNull(guestbookComment.deletedAt)
        )
      )
      .limit(1);

    const rootTarget = rootList?.[0];
    if (!rootTarget) {
      throw new Error("回复的目标一级留言不存在或已不可见");
    }

    finalRootId = rootId;
    finalLevel = 2;

    if (replyToId && replyToId !== rootId) {
      // 校验回复的目标二级评论
      const replyTargetList = await db
        .select()
        .from(guestbookComment)
        .where(
          and(
            eq(guestbookComment.id, replyToId),
            eq(guestbookComment.rootId, rootId),
            eq(guestbookComment.status, "approved"),
            isNull(guestbookComment.deletedAt)
          )
        )
        .limit(1);

      if (!replyTargetList?.[0]) {
        throw new Error("被回复的内容不存在或已下架");
      }
      finalReplyToId = replyToId;
    } else {
      finalReplyToId = rootId;
    }
  }

  const nowTimeStr = formatDateTime(now);
  const insertData = {
    rootId: finalRootId,
    replyToId: finalReplyToId,
    level: finalLevel,
    nickname: safeNickname,
    content: safeContent,
    email,
    authorType: "visitor",
    adminId: null,
    status: "pending",
    createdAt: nowTimeStr,
    updatedAt: nowTimeStr,
    sourceHash
  };

  const insertResult = await db.insert(guestbookComment).values(insertData).returning?.() ?? [];
  const insertedId = insertResult?.[0]?.id;

  // 异步触发邮件通知（只要有人评论/回复，立即通知站长；若为二级回复，同时通知被回复用户）
  const ADMIN_EMAIL = "1040822172@qq.com";
  setTimeout(async () => {
    // 1. 发送给站长的消息通知
    try {
      const isReply = Boolean(finalReplyToId);
      const adminSubject = isReply
        ? `【Jie Hub】留言板收到新回复（来自：${safeNickname}）`
        : `【Jie Hub】留言板收到新留言（来自：${safeNickname}）`;

      const adminHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 20px auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h3 style="color: #2563eb; margin-top: 0; font-size: 18px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
            🛡️ Jie Hub 留言板 - 新消息提醒
          </h3>
          <p style="color: #334155; font-size: 14px;">站长您好，全站留言板刚刚收到了一条新的访客提交：</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #475569; margin: 16px 0;">
            <tr>
              <td style="padding: 6px 0; width: 80px; color: #94a3b8;">类型：</td>
              <td style="padding: 6px 0; font-weight: 600; color: #1e293b;">${isReply ? "二级回复" : "一级留言"}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">访客昵称：</td>
              <td style="padding: 6px 0; font-weight: 600; color: #2563eb;">${safeNickname}</td>
            </tr>
            ${email ? `<tr><td style="padding: 6px 0; color: #94a3b8;">联系邮箱：</td><td style="padding: 6px 0;">${email}</td></tr>` : ""}
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">提交时间：</td>
              <td style="padding: 6px 0;">${nowTimeStr}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #94a3b8;">来源 IP：</td>
              <td style="padding: 6px 0;">${clientIp}</td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">内容正文：</div>
            <div style="color: #1e293b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${content}</div>
          </div>

          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: #94a3b8;">当前状态：待人工审核</span>
          </div>
        </div>
      `;

      await sendNotificationEmail(ADMIN_EMAIL, adminSubject, adminHtml);
    } catch (adminMailErr) {
      console.error("[Mail] 发送站长通知邮件异常:", adminMailErr);
    }

    // 2. 若为二级回复，异步触发邮件通知给被回复的用户（如果对方留了邮箱且不等于当前发信人）
    if (finalReplyToId) {
      try {
        const targetList = await db
          .select()
          .from(guestbookComment)
          .where(eq(guestbookComment.id, finalReplyToId))
          .limit(1);

        const target = targetList?.[0];
        if (target?.email && target.email.includes("@") && target.email !== email) {
          const subject = `【Jie Hub 留言板】您收到了来自「${safeNickname}」的新回复`;
          const html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 20px auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h3 style="color: #2563eb; margin-top: 0; font-size: 18px;">Jie Hub 全站留言板</h3>
              <p style="color: #334155; font-size: 14px;">尊敬的 <b>${target.nickname}</b>：</p>
              <p style="color: #475569; font-size: 13px;">您在留言板发布的内容收到了新回复：</p>
              <div style="background-color: #f8fafc; border-left: 4px solid #cbd5e1; padding: 10px 14px; margin: 12px 0; color: #64748b; font-size: 13px; border-radius: 4px;">
                ${target.content}
              </div>
              <p style="color: #334155; font-size: 13px;"><b>${safeNickname}</b> 回复您：</p>
              <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0; color: #1e3a8a; font-size: 13px; border-radius: 4px;">
                ${content}
              </div>
              <p style="font-size: 11px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                本邮件由系统自动发送，请勿直接回复。
              </p>
            </div>
          `;
          await sendNotificationEmail(target.email, subject, html);
        }
      } catch (userMailErr) {
        console.error("[Mail] 异步回复通知发送失败:", userMailErr);
      }
    }
  }, 0);

  return {
    id: insertedId,
    message: "留言已提交，审核通过后将公开展示"
  };
};

/**
 * 后台：留言管理分页列表
 */
export const listManageComments = async (db: any, params: Record<string, any>) => {
  const pageNum = Math.max(1, Number(params.pageNum ?? 1));
  const pageSize = Math.max(1, Math.min(100, Number(params.pageSize ?? 10)));
  const offset = (pageNum - 1) * pageSize;

  const conditions = [isNull(guestbookComment.deletedAt)];

  if (params.status) {
    conditions.push(eq(guestbookComment.status, params.status));
  }
  if (params.level) {
    conditions.push(eq(guestbookComment.level, Number(params.level)));
  }
  if (params.authorType) {
    conditions.push(eq(guestbookComment.authorType, params.authorType));
  }
  // 兼容单独的 nickname 与 content 模糊查询
  if (params.nickname) {
    conditions.push(like(guestbookComment.nickname, `%${params.nickname}%`));
  }
  if (params.content) {
    conditions.push(like(guestbookComment.content, `%${params.content}%`));
  }

  const keyword = (params.keyword ?? "").toString().trim();

  // 若传入 keyword：执行融合向量空间模型 (VSM) 的余弦相似度检索与精确匹配排序
  if (keyword) {
    // 获取当前其他筛选条件下的候选记录
    const candidates = await db
      .select()
      .from(guestbookComment)
      .where(and(...conditions))
      .orderBy(desc(guestbookComment.createdAt), desc(guestbookComment.id));

    const scoredList: { comment: any; score: number }[] = [];

    for (const item of candidates) {
      const combinedDoc = `${item.nickname} ${item.content}`;
      const score = calculateVectorScore(keyword, combinedDoc);
      // 设定向量相似度/匹配阈值 (大于 0.08 即认为具备向量关联或包含关键词)
      if (score >= 0.08) {
        scoredList.push({ comment: item, score });
      }
    }

    // 按向量相似度得分降序排列
    scoredList.sort((a, b) => {
      if (Math.abs(b.score - a.score) > 0.0001) {
        return b.score - a.score;
      }
      return b.comment.id - a.comment.id;
    });

    const total = scoredList.length;
    const paginated = scoredList.slice(offset, offset + pageSize).map((s) => s.comment);

    return {
      list: paginated,
      total,
      pageNum,
      pageSize,
      pages: Math.ceil(total / pageSize)
    };
  }

  const totalCountResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(guestbookComment)
    .where(and(...conditions));
  const total = Number(totalCountResult?.[0]?.count ?? 0);

  const comments = await db
    .select()
    .from(guestbookComment)
    .where(and(...conditions))
    .orderBy(desc(guestbookComment.createdAt), desc(guestbookComment.id))
    .limit(pageSize)
    .offset(offset);

  return {
    list: comments,
    total,
    pageNum,
    pageSize,
    pages: Math.ceil(total / pageSize)
  };
};

/**
 * 后台：获取留言详情
 */
export const getManageCommentDetail = async (db: any, id: number) => {
  const comments = await db
    .select()
    .from(guestbookComment)
    .where(eq(guestbookComment.id, id))
    .limit(1);

  const comment = comments?.[0];
  if (!comment) {
    throw new Error("留言不存在");
  }

  const auditLogs = await db
    .select()
    .from(guestbookAuditLog)
    .where(eq(guestbookAuditLog.commentId, id))
    .orderBy(desc(guestbookAuditLog.createdAt), desc(guestbookAuditLog.id));

  return {
    ...comment,
    auditLogs
  };
};

/**
 * 后台：审核变更状态（通过/拒绝/隐藏/恢复）
 */
export const updateCommentStatus = async (
  db: any,
  id: number,
  action: "approve" | "reject" | "hide" | "restore",
  operatorId = 1,
  remark = ""
) => {
  const list = await db
    .select()
    .from(guestbookComment)
    .where(and(eq(guestbookComment.id, id), isNull(guestbookComment.deletedAt)))
    .limit(1);

  const target = list?.[0];
  if (!target) {
    throw new Error("目标留言不存在或已被删除");
  }

  const beforeStatus = target.status;
  let afterStatus = beforeStatus;

  switch (action) {
    case "approve":
    case "restore":
      afterStatus = "approved";
      break;
    case "reject":
      afterStatus = "rejected";
      break;
    case "hide":
      afterStatus = "hidden";
      break;
    default:
      throw new Error(`不支持的操作类型: ${action}`);
  }

  const nowTimeStr = formatDateTime();

  await db
    .update(guestbookComment)
    .set({
      status: afterStatus,
      reviewedAt: nowTimeStr,
      reviewedBy: operatorId,
      updatedAt: nowTimeStr
    })
    .where(eq(guestbookComment.id, id));

  // 记录审计日志
  await db.insert(guestbookAuditLog).values({
    commentId: id,
    operatorId,
    action,
    beforeStatus,
    afterStatus,
    createdAt: nowTimeStr,
    remark: remark || null
  });

  return {
    id,
    action,
    beforeStatus,
    afterStatus
  };
};

/**
 * 后台：软删除留言
 */
export const deleteComment = async (db: any, id: number, operatorId = 1, remark = "") => {
  const list = await db
    .select()
    .from(guestbookComment)
    .where(and(eq(guestbookComment.id, id), isNull(guestbookComment.deletedAt)))
    .limit(1);

  const target = list?.[0];
  if (!target) {
    throw new Error("目标留言不存在或已被删除");
  }

  const nowTimeStr = formatDateTime();

  await db
    .update(guestbookComment)
    .set({
      deletedAt: nowTimeStr,
      updatedAt: nowTimeStr
    })
    .where(eq(guestbookComment.id, id));

  await db.insert(guestbookAuditLog).values({
    commentId: id,
    operatorId,
    action: "delete",
    beforeStatus: target.status,
    afterStatus: "deleted",
    createdAt: nowTimeStr,
    remark: remark || null
  });

  return { id };
};

/**
 * 后台：站长回复
 */
export const adminReplyComment = async (
  db: any,
  body: Record<string, any>,
  operatorId = 1,
  operatorNick = "站长"
) => {
  const targetId = Number(body.targetId);
  const content = (body.content ?? "").toString().trim();

  if (!targetId) {
    throw new Error("请指定要回复的目标留言");
  }
  if (content.length < 1 || content.length > 200) {
    throw new Error("回复内容需在 1–200 个字符之间");
  }

  const safeContent = sanitizeText(content);

  const targetList = await db
    .select()
    .from(guestbookComment)
    .where(and(eq(guestbookComment.id, targetId), isNull(guestbookComment.deletedAt)))
    .limit(1);

  const target = targetList?.[0];
  if (!target) {
    throw new Error("回复目标留言不存在或已删除");
  }

  let finalRootId: number;
  let finalReplyToId: number;

  if (target.level === 1) {
    finalRootId = target.id;
    finalReplyToId = target.id;
  } else {
    finalRootId = target.rootId!;
    finalReplyToId = target.id;
  }

  const nowTimeStr = formatDateTime();

  const insertData = {
    rootId: finalRootId,
    replyToId: finalReplyToId,
    level: 2,
    nickname: operatorNick || "站长",
    content: safeContent,
    authorType: "admin",
    adminId: operatorId,
    status: "approved",
    createdAt: nowTimeStr,
    updatedAt: nowTimeStr,
    reviewedAt: nowTimeStr,
    reviewedBy: operatorId
  };

  const insertResult = await db.insert(guestbookComment).values(insertData).returning?.() ?? [];
  const insertedId = insertResult?.[0]?.id;

  // 记录审计日志
  if (insertedId) {
    await db.insert(guestbookAuditLog).values({
      commentId: insertedId,
      operatorId,
      action: "reply",
      beforeStatus: null,
      afterStatus: "approved",
      createdAt: nowTimeStr,
      remark: `站长对留言 #${targetId} 发布回复`
    });
  }

  return {
    id: insertedId,
    message: "回复发布成功"
  };
};

/**
 * 后台：编辑站长回复
 */
export const updateAdminReply = async (
  db: any,
  id: number,
  content: string,
  operatorId = 1
) => {
  const trimmed = (content ?? "").toString().trim();
  if (trimmed.length < 5 || trimmed.length > 500) {
    throw new Error("回复内容需在 5–500 个字符之间");
  }

  const list = await db
    .select()
    .from(guestbookComment)
    .where(and(eq(guestbookComment.id, id), isNull(guestbookComment.deletedAt)))
    .limit(1);

  const target = list?.[0];
  if (!target) {
    throw new Error("留言不存在或已被删除");
  }
  if (target.authorType !== "admin") {
    throw new Error("仅允许编辑站长自身发布的回复");
  }

  const nowTimeStr = formatDateTime();
  await db
    .update(guestbookComment)
    .set({
      content: trimmed,
      updatedAt: nowTimeStr
    })
    .where(eq(guestbookComment.id, id));

  await db.insert(guestbookAuditLog).values({
    commentId: id,
    operatorId,
    action: "edit",
    beforeStatus: target.status,
    afterStatus: target.status,
    createdAt: nowTimeStr,
    remark: "站长修改回复内容"
  });

  return { id };
};

/**
 * 后台：查询单条留言的审计日志
 */
export const getAuditLogs = async (db: any, commentId: number) => {
  return await db
    .select()
    .from(guestbookAuditLog)
    .where(eq(guestbookAuditLog.commentId, commentId))
    .orderBy(desc(guestbookAuditLog.createdAt), desc(guestbookAuditLog.id));
};
