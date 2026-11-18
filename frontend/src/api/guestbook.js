import request from "@/utils/request";

/**
 * 获取公开留言列表（含两级楼中楼二级回复）
 * @param {Object} params
 * @param {number} [params.pageNum=1]
 * @param {number} [params.pageSize=10]
 * @returns {Promise<{ list: any[], total: number, pageNum: number, pageSize: number, pages: number }>}
 */
export const getOpenList = (params = {}) => {
  const query = new URLSearchParams();
  if (params.pageNum) query.append("pageNum", params.pageNum.toString());
  if (params.pageSize) query.append("pageSize", params.pageSize.toString());
  // 仅请求审核通过且允许展示的留言
  query.append("status", "approved");
  const queryString = query.toString();
  return request(`/api/guestbook/list${queryString ? `?${queryString}` : ""}`);
};

/**
 * 提交留言或二级回复
 * @param {Object} data
 * @param {string} data.nickname 昵称 (2-20字)
 * @param {string} data.content 留言内容 (5-500字)
 * @param {number} [data.rootId] 所属一级留言ID
 * @param {number} [data.replyToId] 被回复的目标ID
 * @returns {Promise<{ id?: number, message: string }>}
 */
export const submitComment = (data) => {
  return request("/api/guestbook", {
    method: "POST",
    body: data
  });
};

export default {
  getOpenList,
  submitComment
};
