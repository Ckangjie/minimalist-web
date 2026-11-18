import type { Context } from "hono";
import { getDb } from "../db";
import { success, fail } from "../utils/response";
import {
  syncVisitorUser,
  getAdminVisitorList,
  deleteVisitorUser,
  batchDeleteVisitorUsers,
  getOnlineStatsData
} from "../services/visitorService";

const getDatabase = (c: Context) => {
  const d1 = c.env?.DB ?? c.env?.minimalist_db;
  return getDb(d1);
};

/**
 * 前台：同步或注册访客用户（固定昵称，不可随意篡改）
 */
export const syncVisitor = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const body = await c.req.json().catch(() => ({}));
    const clientIp =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";
    const userAgent = c.req.header("user-agent") || "";

    const data = await syncVisitorUser(db, body, clientIp, userAgent);
    return success(c, data, "同步成功");
  } catch (error: any) {
    return fail(c, error.message || "同步用户信息失败", 400);
  }
};

/**
 * 前台：获取当前在线用户与全站访客统计
 */
export const getOnlineStats = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const uuid = c.req.query("uuid");
    const data = await getOnlineStatsData(db, uuid);
    return success(c, data, "获取成功");
  } catch (error: any) {
    return fail(c, error.message || "获取在线统计失败", 500);
  }
};

/**
 * 后台：获取访客用户列表
 */
export const getVisitorList = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const query = c.req.query();
    const data = await getAdminVisitorList(db, query);
    return success(c, data, "查询成功");
  } catch (error: any) {
    return fail(c, error.message || "获取用户列表失败", 500);
  }
};

/**
 * 后台：删除单个访客用户
 */
export const removeVisitor = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const id = Number(c.req.param("id"));
    if (!id) {
      return fail(c, "无效的用户ID", 400);
    }
    const data = await deleteVisitorUser(db, id);
    return success(c, data, "删除成功");
  } catch (error: any) {
    return fail(c, error.message || "删除用户失败", 500);
  }
};

/**
 * 后台：批量删除访客用户
 */
export const batchRemoveVisitors = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const body = await c.req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.map(Number).filter(Boolean) : [];
    if (ids.length === 0) {
      return fail(c, "请选择要删除的用户ID列表", 400);
    }
    const data = await batchDeleteVisitorUsers(db, ids);
    return success(c, data, "批量删除成功");
  } catch (error: any) {
    return fail(c, error.message || "批量删除用户失败", 500);
  }
};
