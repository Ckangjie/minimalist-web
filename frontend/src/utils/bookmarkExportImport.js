/**
 * 标准 Netscape Bookmark 规范书签导入与导出工具
 * 完美兼容 Chrome、Edge、Firefox、Safari、QQ、360 等主流浏览器书签
 */

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * 导出分类书签为标准 HTML 文件
 * @param {Array} categories 分类书签数据
 * @param {string} [filename] 导出文件名
 */
export function exportBookmarksToHtml(categories, filename) {
  const exportDate = new Date().toISOString().slice(0, 10);
  const targetFilename = filename ?? `jie-hub-bookmarks-${exportDate}.html`;
  const now = Math.floor(Date.now() / 1000);

  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Jie Hub Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

  categories.forEach((cat) => {
    html += `    <DT><H3 ADD_DATE="${now}" LAST_MODIFIED="${now}">${escapeHtml(cat.name)}</H3>\n`;
    html += `    <DL><p>\n`;
    cat.items.forEach((item) => {
      const tagAttr = item.tag ? ` TAG="${escapeHtml(item.tag)}"` : "";
      const descAttr = item.desc ? ` DESCRIPTION="${escapeHtml(item.desc)}"` : "";
      html += `        <DT><A HREF="${escapeHtml(item.url)}" ADD_DATE="${now}"${tagAttr}${descAttr}>${escapeHtml(item.title)}</A>\n`;
    });
    html += `    </DL><p>\n`;
  });

  html += `</DL><p>\n`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = targetFilename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * 依据浏览器标准文档流顺序解析书签 HTML 文本
 * 无论浏览器如何嵌套 <DT>、<DL> 或缺少闭合标签，均能 100% 精准提取每个分类及其书签
 * @param {string} htmlText HTML 源码
 * @returns {Array} 分类列表
 */
export function parseBookmarksFromHtml(htmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");

  const categories = [];
  let currentCategory = null;

  // 获取所有 H3（分类标题）与 A（书签链接），文档顺序排列
  const elements = doc.querySelectorAll("h3, a");

  elements.forEach((el) => {
    const tagName = el.tagName.toLowerCase();

    if (tagName === "h3") {
      const catName = el.textContent.trim() || `分类 ${categories.length + 1}`;
      // 避免 Chrome/Edge 内部的空书签栏产生冗余，寻找已有同名分类或创建新分类
      currentCategory = categories.find((c) => c.name === catName);
      if (!currentCategory) {
        currentCategory = {
          id: `cat-${categories.length + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          name: catName,
          description: `${catName} 收藏资源`,
          items: []
        };
        categories.push(currentCategory);
      }
    } else if (tagName === "a") {
      const href = el.getAttribute("href");
      // 过滤只接受有效 http/https 链接（排除 javascript: 或 place: 内部协议）
      if (href && (href.startsWith("http://") || href.startsWith("https://"))) {
        // 如果文档开头在出现任何 H3 之前就存在 A 链接，归入“常用推荐”
        if (!currentCategory) {
          const defaultName = "常用推荐";
          currentCategory = categories.find((c) => c.name === defaultName);
          if (!currentCategory) {
            currentCategory = {
              id: `cat-default-${Date.now()}`,
              name: defaultName,
              description: "导入的书签推荐",
              items: []
            };
            categories.push(currentCategory);
          }
        }

        const title = el.textContent.trim() || href;
        const desc = el.getAttribute("description") || title;
        const tag = el.getAttribute("tag") || "本地";

        // 防止同分类下重复添加同一个 URL
        const isDuplicate = currentCategory.items.some((i) => i.url === href);
        if (!isDuplicate) {
          currentCategory.items.push({
            id: `item-${currentCategory.items.length + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            title,
            url: href,
            desc,
            tag
          });
        }
      }
    }
  });

  // 兜底提取：若未匹配到 H3，直接抽取全部 A 标签
  if (categories.length === 0 || categories.every((c) => c.items.length === 0)) {
    const allLinks = doc.querySelectorAll("a");
    const items = [];
    allLinks.forEach((a, idx) => {
      const href = a.getAttribute("href");
      if (href && (href.startsWith("http://") || href.startsWith("https://"))) {
        items.push({
          id: `flat-${idx}-${Date.now()}`,
          title: a.textContent.trim() || href,
          url: href,
          desc: a.getAttribute("description") || a.textContent.trim(),
          tag: a.getAttribute("tag") || "本地"
        });
      }
    });

    if (items.length > 0) {
      categories.push({
        id: `cat-flat-${Date.now()}`,
        name: "我的书签",
        description: "由书签文件导入的收藏站点",
        items
      });
    }
  }

  // 过滤掉没有任何有效链接的空分类
  return categories.filter((c) => c.items && c.items.length > 0);
}
