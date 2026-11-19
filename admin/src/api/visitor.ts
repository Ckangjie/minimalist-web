import request from "@/utils/request";

export interface VisitorItem {
  id: number;
  uuid: string;
  nickname: string;
  avatar?: string | null;
  email?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 获取访客用户列表
 */
export const getVisitorList = (params: any = {}) => {
  const query = new URLSearchParams();
  if (params.pageNum) query.append("pageNum", params.pageNum.toString());
  if (params.pageSize) query.append("pageSize", params.pageSize.toString());
  if (params.keyword) query.append("keyword", params.keyword.toString());
  if (params.status) query.append("status", params.status.toString());

  const queryString = query.toString();
  return request(`/api/admin/visitor/list${queryString ? `?${queryString}` : ""}`);
};

/**
 * 删除单个访客用户
 */
export const deleteVisitor = (id: number) => {
  return request(`/api/admin/visitor/${id}`, {
    method: "DELETE"
  });
};

/**
 * 批量删除访客用户
 */
export const batchDeleteVisitors = (ids: number[]) => {
  return request("/api/admin/visitor/batch-delete", {
    method: "POST",
    body: { ids }
  });
};
