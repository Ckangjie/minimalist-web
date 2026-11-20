import request from "@/utils/request";

/**
 * 获取前台公开的导航分类及条目列表
 * @returns {Promise<Array>} 与 DEFAULT_NAV_CATEGORIES 结构一致的分类数组
 */
export const getPublicNav = () => {
  return request("/api/nav");
};

/**
 * 获取前台自研导航工具分类及条目列表
 * @returns {Promise<Array>} 导航工具分类数组
 */
export const getPublicTools = () => {
  return request("/api/nav/tools");
};
