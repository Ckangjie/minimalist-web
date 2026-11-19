<template>
  <div class="not-found-page flex-1 min-h-screen min-h-100dvh flex items-center justify-center py-12 px-4 relative overflow-hidden select-none">
    <!-- 专属局部径向渐隐网格背景（降低边缘存在感） -->
    <div class="radial-grid-layer pointer-events-none" aria-hidden="true" />

    <!-- 视觉装饰区：同心轨道线与发光节点 -->
    <div class="orbit-container pointer-events-none" aria-hidden="true">
      <!-- 外层虚线轨道 -->
      <div class="orbit-circle orbit-outer">
        <span class="orbit-dot dot-1" />
        <span class="orbit-dot dot-2" />
      </div>
      <!-- 内层细线轨道 -->
      <div class="orbit-circle orbit-inner">
        <span class="orbit-dot dot-3" />
      </div>
      <!-- 中心柔和背景光晕 -->
      <div class="center-glow" />
    </div>

    <!-- 404 内容区 -->
    <div class="not-found-content relative z-10 flex flex-col items-center text-center max-w-lg w-full">
      <!-- 404 数字（增加柔和光晕与微弱浮动） -->
      <div class="error-code-wrapper mb-6 sm:mb-8">
        <span class="error-code font-black tracking-tight">404</span>
      </div>

      <!-- 自然文案与宽松行间距 -->
      <h1 class="text-2xl sm:text-3xl font-extrabold m-0 mb-3 sm:mb-4 text-[var(--text-primary)] tracking-tight">
        页面似乎迷路了
      </h1>
      <p class="text-sm sm:text-base text-[var(--text-muted)] max-w-xs sm:max-w-md m-0 mb-9 sm:mb-12 leading-relaxed">
        您访问的页面不存在、已被移动或链接有误。不妨返回首页，继续探索精选导航与实用工具。
      </p>

      <!-- 操作按钮组（保持适度舒适间距） -->
      <div class="flex items-center gap-3.5">
        <el-button
          type="primary"
          round
          size="large"
          :icon="HomeFilled"
          class="!px-6 !font-semibold"
          @click="goHome"
        >
          返回首页
        </el-button>
        <el-button
          round
          size="large"
          :icon="Back"
          class="!px-6"
          @click="goBack"
        >
          返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { HomeFilled, Back } from "@element-plus/icons-vue";

const router = useRouter();

const goHome = () => {
  router.push("/");
};

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
};
</script>

<style lang="scss" scoped>
.not-found-page {
  background-color: var(--bg-page);
}

/* 局部径向渐隐网格背景 */
.radial-grid-layer {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, var(--bg-grid) 1px, transparent 1px),
    linear-gradient(to bottom, var(--bg-grid) 1px, transparent 1px);
  background-size: var(--bg-grid-size) var(--bg-grid-size);
  background-position: center center;
  mask-image: radial-gradient(circle at 50% 45%, #000 15%, transparent 70%);
  -webkit-mask-image: radial-gradient(circle at 50% 45%, #000 15%, transparent 70%);
}

/* 轨道与发光节点容器 */
.orbit-container {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-glow {
  position: absolute;
  width: 280px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.28), transparent 70%);
  filter: blur(35px);
  pointer-events: none;
}

/* 轨道线 */
.orbit-circle {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.orbit-outer {
  width: clamp(320px, 45vw, 440px);
  height: clamp(320px, 45vw, 440px);
  border: 1px dashed rgba(59, 130, 246, 0.2);
  animation: rotate-orbit 50s linear infinite;
}

.orbit-inner {
  width: clamp(230px, 32vw, 310px);
  height: clamp(230px, 32vw, 310px);
  border: 1px solid rgba(99, 102, 241, 0.12);
  animation: rotate-orbit-reverse 35s linear infinite;
}

/* 轨道发光节点 */
.orbit-dot {
  position: absolute;
  border-radius: 50%;
  background: #60a5fa;
  box-shadow: 0 0 10px rgba(96, 165, 250, 0.8), 0 0 20px rgba(59, 130, 246, 0.4);
}

.dot-1 {
  width: 6px;
  height: 6px;
  top: 15%;
  left: 12%;
  animation: pulse-dot 3s ease-in-out infinite;
}

.dot-2 {
  width: 5px;
  height: 5px;
  bottom: 20%;
  right: 15%;
  opacity: 0.8;
  animation: pulse-dot 4s ease-in-out infinite 1s;
}

.dot-3 {
  width: 5px;
  height: 5px;
  top: 80%;
  left: 25%;
  background: #a78bfa;
  box-shadow: 0 0 10px rgba(167, 139, 250, 0.8);
  animation: pulse-dot 3.5s ease-in-out infinite 1.5s;
}

/* 404 数字浮动与柔和光晕 */
.error-code-wrapper {
  animation: float-soft 4s ease-in-out infinite alternate;
}

.error-code {
  font-size: clamp(5.5rem, 16vw, 9.5rem);
  line-height: 1;
  color: var(--primary-color);
  filter: drop-shadow(0 12px 28px rgba(59, 130, 246, 0.25));
  letter-spacing: -0.04em;
}

/* 关键帧动效 */
@keyframes float-soft {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-10px);
  }
}

@keyframes pulse-dot {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.35);
    opacity: 1;
  }
}

@keyframes rotate-orbit {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes rotate-orbit-reverse {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}
</style>
