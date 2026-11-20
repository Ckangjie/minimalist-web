import { ElMessage } from "element-plus";

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

    const res = await fetch(url, config).catch((error) => {
      throw new Error("网络请求失败，请稍后重试", { cause: error });
    });
    let json;
    try {
      json = await res.json();
    } catch {
      // 非 JSON 格式
    }

    if (res.ok && json?.code === 200) {
      return json.data;
    }

    if (typeof json?.message === "string" && json.message.trim() && json.code !== 200) {
      throw new Error(json.message);
    }

    if (!res.ok) {
      throw new Error(`网络请求异常: ${res.status}`);
    }

    throw new Error("业务处理异常");
  } catch (error) {
    console.error("请求异常:", error);
    ElMessage.error(error instanceof Error ? error.message : "请求失败，请稍后重试");
    throw error;
  }
};

export default request;
