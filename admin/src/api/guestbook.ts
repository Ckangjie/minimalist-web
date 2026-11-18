import request from "@/utils/request";

export interface GuestbookComment {
  id: number;
  rootId: number | null;
  replyToId: number | null;
  level: number;
  nickname: string;
  content: string;
  authorType: "visitor" | "admin";
  adminId: number | null;
  status: "pending" | "approved" | "rejected" | "hidden";
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  reviewedBy: number | null;
}

export interface AuditLog {
  id: number;
  commentId: number;
  operatorId: number;
  action: string;
  beforeStatus: string | null;
  afterStatus: string | null;
  createdAt: string;
  remark: string | null;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
}

/**
 * 分页查询留言管理列表
 */
export const listManageComments = (params: Record<string, any>) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  }
  const queryString = query.toString();
  return request<PageResult<GuestbookComment>>(
    `/api/guestbook/manage/list${queryString ? `?${queryString}` : ""}`
  );
};

/**
 * 查询单条留言详情
 */
export const getManageDetail = (id: number) => {
  return request<GuestbookComment & { auditLogs: AuditLog[] }>(`/api/guestbook/manage/${id}`);
};

/**
 * 审核变更留言状态
 */
export const updateCommentStatus = (
  id: number,
  action: "approve" | "reject" | "hide" | "restore",
  remark?: string
) => {
  return request(`/api/guestbook/manage/${id}/status`, {
    method: "PUT",
    body: { action, remark }
  });
};

/**
 * 软删除留言
 */
export const deleteComment = (id: number, remark?: string) => {
  return request(`/api/guestbook/manage/${id}`, {
    method: "DELETE",
    body: { remark }
  });
};

/**
 * 站长回复
 */
export const adminReply = (targetId: number, content: string) => {
  return request("/api/guestbook/manage/reply", {
    method: "POST",
    body: { targetId, content }
  });
};

/**
 * 编辑站长回复
 */
export const updateAdminReply = (id: number, content: string) => {
  return request(`/api/guestbook/manage/reply/${id}`, {
    method: "PUT",
    body: { content }
  });
};

/**
 * 查询留言审核日志
 */
export const getAuditLogs = (id: number) => {
  return request<AuditLog[]>(`/api/guestbook/manage/audit-logs/${id}`);
};
