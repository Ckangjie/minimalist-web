import request from "@/utils/request";

export interface FriendLinkItem {
  id: number;
  name: string;
  url: string;
  logo: string | null;
  description: string;
  email: string;
  status: "pending" | "approved" | "rejected" | "hidden";
  sortOrder: number;
  rejectReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

/**
 * 分页与条件查询友链管理列表
 */
export const listManageFriendLinks = (params: Record<string, any>) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  }
  const queryString = query.toString();
  return request<PageResult<FriendLinkItem>>(
    `/api/admin/friend-links${queryString ? `?${queryString}` : ""}`
  );
};

/**
 * 修改友链审核状态（通过 / 拒绝 / 隐藏）
 */
export const updateFriendLinkStatus = (id: number, status: string, rejectReason = "") => {
  return request(`/api/admin/friend-links/${id}/status`, {
    method: "PUT",
    body: { status, rejectReason } as any
  });
};

/**
 * 修改友链详情与排序
 */
export const updateFriendLink = (id: number, data: Partial<FriendLinkItem>) => {
  return request(`/api/admin/friend-links/${id}`, {
    method: "PUT",
    body: data as any
  });
};

/**
 * 删除友链
 */
export const deleteFriendLink = (id: number) => {
  return request(`/api/admin/friend-links/${id}`, {
    method: "DELETE"
  });
};
