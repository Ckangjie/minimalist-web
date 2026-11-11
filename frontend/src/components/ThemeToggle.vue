<template>
  <button
    type="button"
    class="theme-toggle-btn"
    :class="{ 'is-dark': isDark }"
    :aria-label="isDark ? '切换至亮色模式' : '切换至暗色模式'"
    :title="isDark ? '切换至亮色模式' : '切换至暗色模式'"
    @click="toggleTheme"
  >
    <div class="icon-wrapper">
      <!-- 太阳矢量图标 (Light Mode - 无边框无阴影纯净风格) -->
      <svg
        v-if="!isDark"
        class="theme-svg sun-icon"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="4.5"
          stroke="#F59E0B"
          stroke-width="2"
          fill="#FEF3C7"
          fill-opacity="0.4"
        />
        <!-- 8 束精确定向辐射光芒 -->
        <g stroke="#F59E0B" stroke-width="2" stroke-linecap="round">
          <line x1="12" y1="2" x2="12" y2="4.5" />
          <line x1="12" y1="19.5" x2="12" y2="22" />
          <line x1="2" y1="12" x2="4.5" y2="12" />
          <line x1="19.5" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="4.93" x2="6.7" y2="6.7" />
          <line x1="17.3" y1="17.3" x2="19.07" y2="19.07" />
          <line x1="4.93" y1="19.07" x2="6.7" y2="17.3" />
          <line x1="17.3" y1="6.7" x2="19.07" y2="4.93" />
        </g>
      </svg>

      <!-- 月牙与星芒矢量图标 (Dark Mode - 无需 defs 依赖，全端稳定渲染) -->
      <svg
        v-else
        class="theme-svg moon-icon"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- 月弯主体 -->
        <path
          d="M 21 13.25 C 20.08 17.5 16.42 20.65 12 20.65 C 6.84 20.65 2.65 16.46 2.65 11.3 C 2.65 6.88 5.8 3.22 10.05 2.3 C 9.5 3.5 9.2 4.8 9.2 6.2 C 9.2 11.15 13.25 15.2 18.2 15.2 C 19.6 15.2 20.9 14.9 22.1 14.35 C 21.8 14 21.4 13.6 21 13.25 Z"
          stroke="#38BDF8"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="#38BDF8"
          fill-opacity="0.2"
        />
        <!-- 伴随微星芒 (Accent Star) -->
        <path
          d="M 18.5 2.5 L 19 4 L 20.5 4.5 L 19 5 L 18.5 6.5 L 18 5 L 16.5 4.5 L 18 4 Z"
          fill="#FDE047"
        />
        <circle cx="13" cy="4" r="0.8" fill="#38BDF8" opacity="0.8" />
      </svg>
    </div>
  </button>
</template>

<script setup>
import { useTheme } from "@/composables/useTheme";

const { isDark, toggleTheme } = useTheme();
</script>

<style lang="scss" scoped>
.theme-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  cursor: pointer;
  padding: 0;
  transition: transform 0.2s ease, opacity 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
}

.icon-wrapper {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.theme-svg {
  width: 100%;
  height: 100%;
  display: block;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
