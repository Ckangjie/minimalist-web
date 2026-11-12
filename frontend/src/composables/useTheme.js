import { nextTick, onMounted, ref } from "vue";

const THEME_STORAGE_KEY = "jie_theme";

// 全局单例响应式状态
const isDark = ref(false);
let isTransitioning = false; // 并发互斥锁：防止连击导致多个过渡实例同时存在产生重叠圆

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

  // 现代 View Transitions API 主题切换动画（参考 VitePress / Vue 官方最佳实践）
  const toggleTheme = async (event) => {
    // 1. 防连击并发锁：若已有动画正在执行，立即拦截，从源头杜绝多重圆形
    if (isTransitioning) return;

    const isAppearanceTransition =
      typeof document !== "undefined" &&
      document.startViewTransition &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isAppearanceTransition) {
      isDark.value = !isDark.value;
      applyTheme();
      try {
        localStorage.setItem(THEME_STORAGE_KEY, isDark.value ? "dark" : "light");
      } catch (error) {
        console.error("持久化主题偏好异常:", error);
      }
      return;
    }

    // 2. 精确获取触发按钮中心点与尺寸半径，用于收拢到按钮大小时平滑隐退
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let buttonRadius = 20;

    const triggerEl = event?.currentTarget || event?.target?.closest?.("button");
    if (triggerEl && typeof triggerEl.getBoundingClientRect === "function") {
      const rect = triggerEl.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
      buttonRadius = Math.max(rect.width, rect.height) / 2;
    } else if (event?.clientX !== undefined && event?.clientY !== undefined) {
      x = event.clientX;
      y = event.clientY;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    isTransitioning = true;

    try {
      const isGoingDark = !isDark.value;

      const transition = document.startViewTransition(async () => {
        isDark.value = isGoingDark;
        applyTheme();
        try {
          localStorage.setItem(THEME_STORAGE_KEY, isGoingDark ? "dark" : "light");
        } catch (error) {
          console.error("持久化主题偏好异常:", error);
        }
        await nextTick();
      });

      await transition.ready;

      // 切暗展开：新暗色视图由 0px 放大至全屏 (单圆纯净扩散)
      // 切亮收拢：圆越小透明度越低，收拢到与按钮差不多大时平滑消失
      const keyframes = isGoingDark
        ? [
            { clipPath: `circle(0px at ${x}px ${y}px)`, offset: 0 },
            { clipPath: `circle(${endRadius}px at ${x}px ${y}px)`, offset: 1 }
          ]
        : [
            {
              clipPath: `circle(${endRadius}px at ${x}px ${y}px)`,
              opacity: 1,
              offset: 0
            },
            {
              clipPath: `circle(${Math.round(endRadius * 0.45)}px at ${x}px ${y}px)`,
              opacity: 0.85,
              offset: 0.45
            },
            {
              clipPath: `circle(${Math.round(buttonRadius * 2.5)}px at ${x}px ${y}px)`,
              opacity: 0.5,
              offset: 0.75
            },
            {
              clipPath: `circle(${buttonRadius}px at ${x}px ${y}px)`,
              opacity: 0,
              offset: 1
            }
          ];

      const anim = document.documentElement.animate(keyframes, {
        duration: isGoingDark ? 380 : 520, // 收拢阶段放缓至 520ms，留出充足舒适的渐变过渡过程
        easing: isGoingDark ? "ease-out" : "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
        pseudoElement: isGoingDark
          ? "::view-transition-new(root)"
          : "::view-transition-old(root)"
      });

      await transition.finished;
      anim.cancel(); // 动画结束安全注销，杜绝残余叠加
    } catch (error) {
      console.warn("View Transition 动画调度异常:", error);
    } finally {
      isTransitioning = false;
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
