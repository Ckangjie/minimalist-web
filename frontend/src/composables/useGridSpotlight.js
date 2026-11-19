import { onMounted, onUnmounted } from "vue";

/**
 * 监听鼠标移动，实时更新 CSS 变量驱动网格局部聚光灯照亮效果（rAF 节流高性能方案）
 */
export function useGridSpotlight() {
  if (typeof window === "undefined") return;

  let rafId = null;
  let latestX = -9999;
  let latestY = -9999;
  let isPointerVisible = false;

  const updatePosition = () => {
    document.documentElement.style.setProperty("--mouse-x", `${latestX}px`);
    document.documentElement.style.setProperty("--mouse-y", `${latestY}px`);
    document.documentElement.style.setProperty(
      "--spotlight-opacity",
      isPointerVisible ? "1" : "0"
    );
    rafId = null;
  };

  const handlePointerMove = (e) => {
    latestX = e.clientX;
    latestY = e.clientY;
    isPointerVisible = true;

    if (!rafId) {
      rafId = window.requestAnimationFrame(updatePosition);
    }
  };

  const handlePointerLeave = () => {
    isPointerVisible = false;
    if (!rafId) {
      rafId = window.requestAnimationFrame(updatePosition);
    }
  };

  onMounted(() => {
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("pointerleave", handlePointerLeave, { passive: true });
  });

  onUnmounted(() => {
    window.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerleave", handlePointerLeave);
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
  });
}
