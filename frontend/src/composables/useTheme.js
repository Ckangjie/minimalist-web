import { nextTick, ref } from "vue";

const THEME_STORAGE_KEY = "jie_theme";

// 同步获取初始主题状态（首帧即刻确定，彻底消除刷新时亮灯闪烁）
function getInitialTheme() {
  if (typeof window === "undefined") return false;
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

// 全局单例响应式状态（直接同步赋初值，绝不延迟到 onMounted）
const isDark = ref(getInitialTheme());

// 模块加载即刻同步文档根节点
if (typeof document !== "undefined") {
  if (isDark.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function useTheme() {
  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const saveThemePreference = () => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark.value ? "dark" : "light");
    } catch (error) {
      console.error("持久化主题偏好异常:", error);
    }
  };

  // 现代 View Transitions API 统一视图过渡（切换期间禁用元素自身颜色过渡，确保全局绝对同步）
  const toggleTheme = () => {
    const isAppearanceTransition =
      typeof document !== "undefined" &&
      typeof document.startViewTransition === "function" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 不支持 View Transitions API 时平滑降级
    if (!isAppearanceTransition) {
      isDark.value = !isDark.value;
      applyTheme();
      saveThemePreference();
      return;
    }

    // 1. 切换期间全局禁用元素自身独立的 transition，避免新旧快照捕获与元素过渡打架
    document.documentElement.classList.add("disable-transitions");

    try {
      const transition = document.startViewTransition(async () => {
        try {
          isDark.value = !isDark.value;
          applyTheme();
          saveThemePreference();
          await nextTick();
        } catch (error) {
          console.error("切换主题状态异常:", error);
        }
      });

      // 2. 视图过渡动画结束，恢复常规交互动效（如卡片 hover 动效）
      transition.finished
        .then(() => {
          document.documentElement.classList.remove("disable-transitions");
        })
        .catch(() => {
          document.documentElement.classList.remove("disable-transitions");
        });
    } catch (error) {
      console.error("启动主题过渡异常:", error);
      document.documentElement.classList.remove("disable-transitions");
      isDark.value = !isDark.value;
      applyTheme();
      saveThemePreference();
    }
  };

  return {
    isDark,
    toggleTheme
  };
}
