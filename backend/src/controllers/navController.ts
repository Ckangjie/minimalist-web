import type { Context } from "hono";
import { getDb } from "../db";
import { success, fail } from "../utils/response";
import * as navService from "../services/navService";

const getDatabase = (c: Context) => {
  const d1 = c.env?.DB ?? c.env?.minimalist_db;
  return getDb(d1);
};

/**
 * 前台：获取所有可见导航分类及条目
 */
export const getPublicList = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const list = await navService.getPublicNavCategories(db);
    return success(c, list, "查询成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "获取导航数据失败");
  }
};

/**
 * 后台：分页查询分类列表
 */
export const getManageCategoryList = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const query = c.req.query();
    const result = await navService.getManageCategories(db, query);
    return success(c, result, "查询成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "获取分类列表失败");
  }
};

/**
 * 后台：新建分类
 */
export const createCategory = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const body = await c.req.json();
    const result = await navService.createCategory(db, body);
    return success(c, result, "创建分类成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "创建分类失败");
  }
};

/**
 * 后台：编辑分类
 */
export const updateCategory = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const result = await navService.updateCategory(db, id, body);
    return success(c, result, "更新分类成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "更新分类失败");
  }
};

/**
 * 后台：删除分类（同时删除下属条目）
 */
export const deleteCategory = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const id = Number(c.req.param("id"));
    const result = await navService.deleteCategory(db, id);
    return success(c, result, "删除分类成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "删除分类失败");
  }
};

/**
 * 后台：获取某分类下的条目（支持分页）
 */
export const getCategoryItems = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const categoryId = Number(c.req.param("id"));
    const query = c.req.query();
    const result = await navService.getItemsByCategory(db, categoryId, query);
    return success(c, result, "查询成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "获取条目列表失败");
  }
};

/**
 * 后台：新建条目
 */
export const createItem = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const body = await c.req.json();
    const result = await navService.createItem(db, body);
    return success(c, result, "创建条目成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "创建条目失败");
  }
};

/**
 * 后台：编辑条目
 */
export const updateItem = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const id = Number(c.req.param("id"));
    const body = await c.req.json();
    const result = await navService.updateItem(db, id, body);
    return success(c, result, "更新条目成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "更新条目失败");
  }
};

/**
 * 后台：删除条目
 */
export const deleteItem = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const id = Number(c.req.param("id"));
    const result = await navService.deleteItem(db, id);
    return success(c, result, "删除条目成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "删除条目失败");
  }
};

/**
 * 后台：批量删除条目
 */
export const batchDeleteItems = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const body = await c.req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids.map(Number).filter(Boolean) : [];
    if (ids.length === 0) {
      return fail(c, "请选择要删除的条目ID列表", 400);
    }
    const result = await navService.batchDeleteItems(db, ids);
    return success(c, result, "批量删除条目成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "批量删除条目失败");
  }
};

/**
 * 后台：批量导入导航数据
 */
export const batchImport = async (c: Context) => {
  try {
    const db = getDatabase(c);
    const body = await c.req.json();
    const categories = Array.isArray(body) ? body : body.categories;
    if (!Array.isArray(categories)) throw new Error("请求体必须为分类数组");
    const result = await navService.batchImportNav(db, categories);
    return success(c, result, "批量导入成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "批量导入失败");
  }
};
