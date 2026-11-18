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
    const res = await fetch(requestUrl, config);
    let json: any;
    try {
      json = await res.json();
    } catch {
      // 响应非 JSON 结构
    }

    if (json?.code === 200) {
      return json.data as T;
    }

    // 401 未授权自动清除 token
    if (json?.code === 401) {
      localStorage.removeItem("admin_token");
      if (window.location.pathname !== "/login") {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
      throw new Error("登录已失效，请重新登录");
    }

    if (json?.message) {
      throw new Error(json.message);
    }

    if (!res.ok) {
      throw new Error(`网络请求异常: ${res.status}`);
    }

    throw new Error("业务处理异常");
  } catch (error) {
    console.error("管理端请求异常:", error);
    throw error;
  }
};

export default request;
