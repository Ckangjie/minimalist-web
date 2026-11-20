import { getPublicNav, getPublicTools } from "@/api/nav";
import {
  exportBookmarksToHtml,
  parseBookmarksFromHtml
} from "@/utils/bookmarkExportImport";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, ref } from "vue";

/**
 * 顶部「导航工具」专属分类数据
 */
const TOOL_NAV_CATEGORIES = [
  {
    id: "nav-tools",
    name: "导航工具",
    icon: "🧰",
    description: "自研工具资源包与开源项目集合，支持离线包直接下载与 GitHub 仓库直达",
    items: [
      {
        id: "tool-uni-offline-pack",
        title: "UniOfflinePack",
        url: "https://github.com/Ckangjie/uni-packer",
        repoUrl: "https://github.com/Ckangjie/uni-packer",
        desc: "零 Android Studio 依赖的 uni-app 本地离线打包工作台，支持环境一键自愈、证书自动嗅探与极速 APK 编译交付",
        tag: "开源工具",
        icon: "📦"
      },
      {
        id: "tool-bookmark-desk",
        title: "BookmarkDesk",
        url: "https://github.com/Ckangjie/bookmark-desk",
        downloadUrl: "/resources/BookmarkDesk.zip",
        downloadName: "BookmarkDesk.zip",
        repoUrl: "https://github.com/Ckangjie/bookmark-desk",
        desc: "书签管家 BookmarkDesk 是一个本地书签工作台。打开扩展即可在独立标签页里查看、搜索和整理导入的浏览器书签",
        tag: "ZIP",
        isZip: true,
        icon: "📑"
      }
    ]
  }
];

const CUSTOM_STORAGE_KEY = "jie_hub_custom_bookmarks";
const MODE_STORAGE_KEY = "jie_hub_nav_mode";
const NAV_CACHE_KEY = "jie_hub_system_nav_cache";
const TOOL_CACHE_KEY = "jie_hub_tool_nav_cache";
const NAV_CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

// 顶层导航模式仅保存在当前页签的会话中。
const currentNavMode = ref(loadInitialMode());

// 用户自定义收藏书签列表
const customCategories = ref(loadCustomCategories());

// 系统导航：优先读取 sessionStorage 缓存，无缓存默认为空数组，异步从 API 实时加载
const systemCategories = ref(loadSystemNavCache() ?? []);
const isSystemNavLoading = ref(false);

// 导航工具：优先读取缓存，无缓存回退至预设结构，异步从 API 实时加载
const toolCategories = ref(loadToolNavCache() ?? TOOL_NAV_CATEGORIES);
const isToolNavLoading = ref(false);

function loadToolNavCache() {
  try {
    const raw = sessionStorage.getItem(TOOL_CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < NAV_CACHE_TTL && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // 忽略
  }
  return null;
}

function saveToolNavCache(data) {
  try {
    sessionStorage.setItem(TOOL_CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // 忽略
  }
}

async function fetchToolNav() {
  if (isToolNavLoading.value) return;
  isToolNavLoading.value = true;
  try {
    const data = await getPublicTools();
    if (Array.isArray(data) && data.length > 0) {
      toolCategories.value = data;
      saveToolNavCache(data);
    }
  } catch (err) {
    console.warn("[NavHub] 从 API 加载导航工具失败:", err);
  } finally {
    isToolNavLoading.value = false;
  }
}

function loadSystemNavCache() {
  try {
    const raw = sessionStorage.getItem(NAV_CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < NAV_CACHE_TTL && Array.isArray(data) && data.length > 0) {
      return data;
    }
  } catch {
    // 忽略
  }
  return null;
}

function saveSystemNavCache(data) {
  try {
    sessionStorage.setItem(NAV_CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // 忽略
  }
}

async function fetchSystemNav() {
  if (isSystemNavLoading.value) return;
  isSystemNavLoading.value = true;
  try {
    const data = await getPublicNav();
    if (Array.isArray(data) && data.length > 0) {
      systemCategories.value = data;
      saveSystemNavCache(data);
    }
  } catch (err) {
    console.warn("[NavHub] 从 API 加载系统导航失败:", err);
  } finally {
    isSystemNavLoading.value = false;
  }
}

// 应用启动时立即异步拉取
fetchSystemNav();
fetchToolNav();

function loadInitialMode() {
  try {
    localStorage.removeItem(MODE_STORAGE_KEY);
  } catch {
    // 忽略旧存储清理失败。
  }

  try {
    return sessionStorage.getItem(MODE_STORAGE_KEY) || "system";
  } catch {
    return "system";
  }
}

function loadCustomCategories() {
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((cat) => ({
          ...cat,
          items: (cat.items ?? []).map((item) => ({
            ...item,
            tag: item.tag === "导入" ? "本地" : (item.tag || "本地")
          }))
        }));
      }
    }
  } catch (error) {
    console.error("加载收藏导航缓存失败:", error);
  }
  return [];
}

function saveCustomCategories(data) {
  try {
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("保存收藏导航缓存失败:", error);
  }
}

export function useBookmarks() {
  // 当前处于展示中的分类集合
  const activeCategories = computed(() => {
    if (currentNavMode.value === "bookmarks") {
      return customCategories.value;
    }
    if (currentNavMode.value === "tools") {
      return toolCategories.value;
    }
    return systemCategories.value;
  });

  // 收藏导航内的书签总数
  const customCount = computed(() => {
    return customCategories.value.reduce((sum, c) => sum + (c.items?.length || 0), 0);
  });

  // 导航工具内的资源总数
  const toolsCount = computed(() => {
    return toolCategories.value.reduce((sum, c) => sum + (c.items?.length || 0), 0);
  });

  // 切换顶级导航大类
  const switchNavMode = (mode) => {
    currentNavMode.value = mode;
    try {
      sessionStorage.setItem(MODE_STORAGE_KEY, mode);
    } catch {
      // 忽略
    }
  };

  // 导入书签到「收藏导航」
  const importFromFile = async (file) => {
    if (!file) return;

    if (!file.name.endsWith(".html") && !file.name.endsWith(".htm")) {
      ElMessage.warning("请选择以 .html 或 .htm 结尾的浏览器书签文件");
      return;
    }

    try {
      const text = await file.text();
      const parsedCategories = parseBookmarksFromHtml(text);

      if (!parsedCategories || parsedCategories.length === 0) {
        ElMessage.warning("未在该文件中解析到有效的书签内容，请确认文件是否包含书签");
        return;
      }

      const totalIncomingItems = parsedCategories.reduce(
        (sum, cat) => sum + cat.items.length,
        0
      );

      // 若已有收藏数据，提供合并或覆盖选项
      let shouldAppend = false;
      if (customCategories.value.length > 0) {
        try {
          await ElMessageBox.confirm(
            `解析出 ${parsedCategories.length} 个分类（共 ${totalIncomingItems} 个书签）。请选择导入方式：`,
            "导入收藏导航",
            {
              confirmButtonText: "追加合并",
              cancelButtonText: "覆盖现有收藏",
              distinguishCancelAndClose: true,
              type: "info"
            }
          );
          shouldAppend = true;
        } catch (action) {
          if (action === "cancel") {
            shouldAppend = false;
          } else {
            return;
          }
        }
      }

      if (shouldAppend) {
        const merged = JSON.parse(JSON.stringify(customCategories.value));
        let addedCount = 0;

        parsedCategories.forEach((inCat) => {
          const existCat = merged.find((c) => c.name === inCat.name);
          if (existCat) {
            inCat.items.forEach((item) => {
              const hasUrl = existCat.items.some((i) => i.url === item.url);
              if (!hasUrl) {
                existCat.items.push(item);
                addedCount++;
              }
            });
          } else {
            merged.push(inCat);
            addedCount += inCat.items.length;
          }
        });

        customCategories.value = merged;
        saveCustomCategories(merged);
        ElMessage.success(`合并成功！新增 ${addedCount} 个书签到「收藏导航」`);
      } else {
        customCategories.value = parsedCategories;
        saveCustomCategories(parsedCategories);
        ElMessage.success(`成功导入 ${parsedCategories.length} 个分类，共 ${totalIncomingItems} 个书签！`);
      }

      // 导入后自动切换至「收藏导航」模式
      switchNavMode("bookmarks");
    } catch (error) {
      console.error("解析书签文件失败:", error);
      ElMessage.error("解析书签文件失败，请检查文件格式");
    }
  };

  // 清空收藏导航数据
  const clearCustomBookmarks = async () => {
    try {
      await ElMessageBox.confirm(
        "确定要清空「收藏导航」中的所有导入书签吗？",
        "清空确认",
        {
          confirmButtonText: "确定清空",
          cancelButtonText: "取消",
          type: "warning"
        }
      );
      customCategories.value = [];
      localStorage.removeItem(CUSTOM_STORAGE_KEY);
      ElMessage.success("已清空「收藏导航」");
    } catch {
      // 用户取消
    }
  };

  return {
    currentNavMode,
    activeCategories,
    systemCategories,
    toolCategories,
    customCategories,
    customCount,
    toolsCount,
    isSystemNavLoading,
    isToolNavLoading,
    fetchSystemNav,
    fetchToolNav,
    switchNavMode,
    importFromFile,
    clearCustomBookmarks
  };
}
