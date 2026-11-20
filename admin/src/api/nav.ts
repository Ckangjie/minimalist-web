import request from "@/utils/request";

export interface NavCategory {
  id: number;
  slug: string;
  name: string;
  icon: string | null;
  description: string | null;
  sortOrder: number;
  isVisible: boolean;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NavItem {
  id: number;
  categoryId: number;
  slug: string;
  title: string;
  url: string;
  desc: string | null;
  tag: string | null;
  icon: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

// 分类 CRUD
export const listNavCategories = (params: Record<string, any>) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") q.append(k, String(v));
  }
  const qs = q.toString();
  return request<PageResult<NavCategory>>(`/api/admin/nav/categories${qs ? `?${qs}` : ""}`);
};

export const createNavCategory = (data: Partial<NavCategory>) =>
  request("/api/admin/nav/categories", { method: "POST", body: data as any });

export const updateNavCategory = (id: number, data: Partial<NavCategory>) =>
  request(`/api/admin/nav/categories/${id}`, { method: "PUT", body: data as any });

export const deleteNavCategory = (id: number) =>
  request(`/api/admin/nav/categories/${id}`, { method: "DELETE" });

// 条目 CRUD
export const getNavItems = (categoryId: number, params?: Record<string, any>) => {
  const q = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") q.append(k, String(v));
    }
  }
  const qs = q.toString();
  return request<PageResult<NavItem>>(`/api/admin/nav/categories/${categoryId}/items${qs ? `?${qs}` : ""}`);
};

export const createNavItem = (data: Partial<NavItem>) =>
  request("/api/admin/nav/items", { method: "POST", body: data as any });

export const updateNavItem = (id: number, data: Partial<NavItem>) =>
  request(`/api/admin/nav/items/${id}`, { method: "PUT", body: data as any });

export const deleteNavItem = (id: number) =>
  request(`/api/admin/nav/items/${id}`, { method: "DELETE" });

export const batchDeleteNavItems = (ids: number[]) =>
  request("/api/admin/nav/items/batch-delete", { method: "POST", body: { ids } as any });

// 批量导入
export const batchImportNav = (categories: any[]) =>
  request("/api/admin/nav/batch-import", { method: "POST", body: { categories } as any });
