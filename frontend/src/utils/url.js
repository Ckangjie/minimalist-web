/**
 * 为外链追加本站来源参数（例如 ?ref=du1.ccwu.cc）
 * @param {string} targetUrl 目标跳转地址
 * @param {string} [paramKey="ref"] 来源参数键名
 * @returns {string} 拼接后的 URL
 */
export function appendSiteRef(targetUrl, paramKey = "ref") {
  if (!targetUrl || typeof targetUrl !== "string") {
    return "";
  }

  const trimmed = targetUrl.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("javascript:")) {
    return trimmed;
  }

  try {
    let normalized = trimmed;
    // 补齐可能缺失的协议头
    if (
      !/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(normalized) &&
      !normalized.startsWith("//") &&
      !normalized.startsWith("/")
    ) {
      normalized = `https://${normalized}`;
    }

    const origin = typeof window !== "undefined" && window.location ? window.location.origin : "";
    const host = typeof window !== "undefined" && window.location ? (window.location.host || window.location.hostname) : "";
    const parsed = new URL(normalized, origin || undefined);

    // 仅针对外部 HTTP / HTTPS 链接追加来源参数
    const isHttpProtocol = parsed.protocol === "http:" || parsed.protocol === "https:";
    const isExternal = !origin || parsed.origin !== origin;

    if (isHttpProtocol && isExternal && host) {
      parsed.searchParams.set(paramKey, host);
      return parsed.toString();
    }

    return trimmed;
  } catch {
    return trimmed;
  }
}
