import { ref } from "vue";

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

  // 现实场景开/关灯切换：全站即时响应
  const toggleTheme = () => {
    isDark.value = !isDark.value;
    applyTheme();
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark.value ? "dark" : "light");
    } catch (error) {
      console.error("持久化主题偏好异常:", error);
    }
  };

  return {
    isDark,
    toggleTheme
  };
}
