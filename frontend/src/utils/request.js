/**
 * 统一网络请求封装
 * @param {string} url 请求地址
 * @param {RequestInit} [options] 请求配置
 * @returns {Promise<any>} 返回业务层需要的 data
 */
export const request = async (url, options = {}) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {})
      },
      ...options
    };

    if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    const res = await fetch(url, config);
    if (!res.ok) {
      throw new Error(`网络请求异常: ${res.status}`);
    }

    const json = await res.json();
    if (json?.code === 200) {
      return json.data;
    }

    throw new Error(json?.message ?? "业务处理异常");
  } catch (error) {
    console.error("请求异常:", error);
    throw error;
  }
};

export default request;

