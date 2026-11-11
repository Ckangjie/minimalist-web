import { onMounted, ref } from "vue";

const THEME_STORAGE_KEY = "jie_theme";

// 全局单例响应式状态
const isDark = ref(false);

export function useTheme() {
  const initTheme = () => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        isDark.value = savedTheme === "dark";
      } else {
        // 跟随系统主题偏好
        isDark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      applyTheme();
    } catch (error) {
      console.error("初始化主题异常:", error);
    }
  };

  const applyTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    isDark.value = !isDark.value;
    applyTheme();
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark.value ? "dark" : "light");
    } catch (error) {
      console.error("持久化主题偏好异常:", error);
    }
  };

  onMounted(() => {
    initTheme();
  });

  return {
    isDark,
    toggleTheme,
    initTheme
  };
}
