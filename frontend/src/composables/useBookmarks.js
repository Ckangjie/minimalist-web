import { DEFAULT_NAV_CATEGORIES, TOOL_NAV_CATEGORIES } from "@/config/navData";
import {
  exportBookmarksToHtml,
  parseBookmarksFromHtml
} from "@/utils/bookmarkExportImport";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, ref } from "vue";

const CUSTOM_STORAGE_KEY = "jie_hub_custom_bookmarks";
const MODE_STORAGE_KEY = "jie_hub_nav_mode";

// 当前顶层分类模式：'system'（系统导航） | 'bookmarks'（收藏导航）
const currentNavMode = ref(loadInitialMode());

// 用户自定义收藏书签列表
const customCategories = ref(loadCustomCategories());

function loadInitialMode() {
  try {
    return localStorage.getItem(MODE_STORAGE_KEY) || "system";
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
      return TOOL_NAV_CATEGORIES;
    }
    return DEFAULT_NAV_CATEGORIES;
  });

  // 收藏导航内的书签总数
  const customCount = computed(() => {
    return customCategories.value.reduce((sum, c) => sum + (c.items?.length || 0), 0);
  });

  // 导航工具内的资源总数
  const toolsCount = computed(() => {
    return TOOL_NAV_CATEGORIES.reduce((sum, c) => sum + (c.items?.length || 0), 0);
  });

  // 切换顶级导航大类
  const switchNavMode = (mode) => {
    currentNavMode.value = mode;
    try {
      localStorage.setItem(MODE_STORAGE_KEY, mode);
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
    systemCategories: DEFAULT_NAV_CATEGORIES,
    toolCategories: TOOL_NAV_CATEGORIES,
    customCategories,
    customCount,
    toolsCount,
    switchNavMode,
    importFromFile,
    clearCustomBookmarks
  };
}
