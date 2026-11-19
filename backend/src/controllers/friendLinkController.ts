import type { Context } from "hono";
import { getDb } from "../db";
import { success, fail } from "../utils/response";
import * as friendLinkService from "../services/friendLinkService";

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
 * 前台：获取公开展示的友链列表
 */
export const getOpenList = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const list = await friendLinkService.getOpenFriendLinks(db);
    return success(c, list, "查询成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "获取友链列表失败");
  }
};

/**
 * 前台：访客申请添加友链
 */
export const apply = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const body = await c.req.json();
    const clientIp = getClientIp(c);
    const result = await friendLinkService.applyFriendLink(db, body, clientIp);
    return success(c, result, "申请已提交，审核结果将发送至您的邮箱，感谢支持！");
  } catch (error: any) {
    return fail(c, error?.message ?? "提交申请失败");
  }
};

/**
 * 后台：分页与状态获取友链列表
 */
export const getManageList = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const query = c.req.query();
    const result = await friendLinkService.getManageFriendLinks(db, query);
    return success(c, result, "查询成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "获取友链管理列表失败");
  }
};

/**
 * 后台：修改审核状态（通过 / 拒绝 / 隐藏）
 */
export const changeStatus = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const { status, rejectReason } = body;
    const result = await friendLinkService.updateFriendLinkStatus(db, id, status, rejectReason);
    return success(c, result, "状态更新成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "更新状态失败");
  }
};

/**
 * 后台：编辑友链信息
 */
export const updateInfo = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const result = await friendLinkService.updateFriendLink(db, id, body);
    return success(c, result, "友链信息更新成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "更新失败");
  }
};

/**
 * 后台：管理员直接新增友链
 */
export const createLink = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const body = await c.req.json();
    const result = await friendLinkService.createFriendLink(db, body);
    return success(c, result, "添加友链成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "添加友链失败");
  }
};

/**
 * 后台：删除友链
 */
export const remove = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const id = Number(c.req.param("id"));
    const result = await friendLinkService.deleteFriendLink(db, id);
    return success(c, result, "删除成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "删除失败");
  }
};
