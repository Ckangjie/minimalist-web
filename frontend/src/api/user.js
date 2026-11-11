import request from "@/utils/request";

/**
 * 获取用户信息
 * @returns {Promise<{ name: string }>}
 */
export const getUserInfo = () => {
  return request("/api/user");
};

export default {
  getUserInfo
};

