import request from "@/utils/request";

/**
 * 获取前台公开的导航分类及条目列表
 * @returns {Promise<Array>} 与 DEFAULT_NAV_CATEGORIES 结构一致的分类数组
 */
export const getPublicNav = () => {
  return request("/api/nav");
};
