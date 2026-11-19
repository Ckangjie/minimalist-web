import request from "@/utils/request";

/**
 * 获取公开展示的友链列表
 * @returns {Promise<any[]>}
 */
export const getFriendLinks = () => {
  return request("/api/friend-links");
};

/**
 * 申请添加友链
 * @param {Object} data
 * @param {string} data.name 网站名称
 * @param {string} data.url 网站链接
 * @param {string} [data.logo] 网站Logo
 * @param {string} data.description 网站描述
 * @param {string} data.email 申请人联系邮箱
 * @returns {Promise<any>}
 */
export const applyFriendLink = (data) => {
  return request("/api/friend-links/apply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
};
