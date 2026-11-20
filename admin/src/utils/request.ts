import { ElMessage } from "element-plus";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || (import.meta.env.PROD ? "https://du1.ccwu.cc" : "");

/**
 * 管理端统一网络请求封装
 */
export const request = async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
  try {
    const token = localStorage.getItem("admin_token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> ?? {})
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    const requestUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    const res = await fetch(requestUrl, config).catch((error) => {
      throw new Error("网络请求失败，请稍后重试", { cause: error });
    });
    let json: any;
    try {
      json = await res.json();
    } catch {
      // 响应非 JSON 结构
    }

    // 401 未授权自动清除 token
    if (res.status === 401 || json?.code === 401) {
      localStorage.removeItem("admin_token");
      if (window.location.pathname !== "/login") {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
      throw new Error("登录已失效，请重新登录");
    }

    if (res.ok && json?.code === 200) {
      return json.data as T;
    }

    if (typeof json?.message === "string" && json.message.trim() && json.code !== 200) {
      throw new Error(json.message);
    }

    throw new Error(res.ok ? "业务处理异常" : `网络请求异常: ${res.status}`);
  } catch (error) {
    console.error("管理端请求异常:", error);
    ElMessage.error(error instanceof Error ? error.message : "请求失败，请稍后重试");
    throw error;
  }
};

export default request;
