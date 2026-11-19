import type { Context } from "hono";
import { getDb } from "../db";
import { success, fail } from "../utils/response";
import * as guestbookService from "../services/guestbookService";

const getDatabase = (c: Context) => {
  const d1 = c.env?.DB ?? c.env?.minimalist_db;
  return getDb(d1);
};

const getClientIp = (c: Context): string => {
  const cfIp = c.req.header("cf-connecting-ip");
  if (cfIp) return cfIp;
  const xff = c.req.header("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xRealIp = c.req.header("x-real-ip");
  if (xRealIp) return xRealIp;
  return "127.0.0.1";
};

/**
 * 前台：获取公开留言列表（严格锁定只允许查询 approved 状态）
 */
export const getOpenList = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const query = c.req.query();
    query.status = "approved";
    const result = await guestbookService.getOpenCommentList(db, query);
    return success(c, result, "查询成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "获取留言列表失败");
  }
};

/**
 * 前台：提交留言或回复
 */
export const submitOpen = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const body = await c.req.json();
    const clientIp = getClientIp(c);
    const userAgent = c.req.header("user-agent") ?? "";
    const result = await guestbookService.submitOpenComment(db, body, clientIp, userAgent);
    return success(c, result, result.message);
  } catch (error: any) {
    return fail(c, error?.message ?? "提交留言失败");
  }
};

/**
 * 后台：留言管理分页列表
 */
export const getManageList = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const query = c.req.query();
    const result = await guestbookService.listManageComments(db, query);
    return success(c, result, "查询成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "获取管理列表失败");
  }
};

/**
 * 后台：获取留言详情
 */
export const getManageDetail = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const id = Number(c.req.param("id"));
    if (!id) {
      return fail(c, "缺少有效留言 ID");
    }
    const result = await guestbookService.getManageCommentDetail(db, id);
    return success(c, result, "查询成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "获取留言详情失败");
  }
};

/**
 * 后台：审核变更留言状态（通过/拒绝/隐藏/恢复）
 */
export const changeStatus = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const id = Number(c.req.param("id"));
    if (!id) {
      return fail(c, "缺少有效留言 ID");
    }
    const body = await c.req.json();
    const { action, remark } = body;
    if (!action) {
      return fail(c, "缺少审核动作 action (approve/reject/hide/restore)");
    }
    const operatorId = 1; // 站长默认操作人ID
    const result = await guestbookService.updateCommentStatus(db, id, action, operatorId, remark);
    return success(c, result, "操作成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "审核操作失败");
  }
};

/**
 * 后台：软删除留言
 */
export const removeComment = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const id = Number(c.req.param("id"));
    if (!id) {
      return fail(c, "缺少有效留言 ID");
    }
    const body = await c.req.json().catch(() => ({}));
    const operatorId = 1;
    const result = await guestbookService.deleteComment(db, id, operatorId, body.remark);
    return success(c, result, "删除成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "删除留言失败");
  }
};

/**
 * 后台：批量软删除留言
 */
export const batchRemoveComments = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const body = await c.req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.map(Number).filter(Boolean) : [];
    if (ids.length === 0) {
      return fail(c, "请选择要删除的留言ID列表", 400);
    }
    const operatorId = 1;
    const result = await guestbookService.batchDeleteComments(db, ids, operatorId, body.remark);
    return success(c, result, `成功删除 ${result.successCount} 条留言`);
  } catch (error: any) {
    return fail(c, error?.message ?? "批量删除留言失败");
  }
};

/**
 * 后台：站长回复
 */
export const replyComment = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const body = await c.req.json();
    const operatorId = 1;
    const operatorNick = "站长";
    const result = await guestbookService.adminReplyComment(db, body, operatorId, operatorNick);
    return success(c, result, result.message);
  } catch (error: any) {
    return fail(c, error?.message ?? "回复失败");
  }
};

/**
 * 后台：编辑站长回复
 */
export const editReply = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const id = Number(c.req.param("id"));
    if (!id) {
      return fail(c, "缺少有效留言 ID");
    }
    const body = await c.req.json();
    const operatorId = 1;
    const result = await guestbookService.updateAdminReply(db, id, body.content, operatorId);
    return success(c, result, "修改回复成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "修改回复失败");
  }
};

/**
 * 后台：获取留言审计日志
 */
export const getAuditLogs = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const id = Number(c.req.param("id"));
    if (!id) {
      return fail(c, "缺少有效留言 ID");
    }
    const result = await guestbookService.getAuditLogs(db, id);
    return success(c, result, "查询成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "获取日志失败");
  }
};
