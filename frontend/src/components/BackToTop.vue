<template>
  <transition name="fade">
    <button
      v-if="isVisible"
      class="back-to-top"
      type="button"
      aria-label="回到顶部"
      @click="scrollToTop"
    >
      <svg
        class="back-top-icon"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <!-- 底部动力粒子气流 -->
        <path
          class="thrust-beam"
          d="M12 18.5V21"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <!-- 升腾主箭轴与轻盈双羽 -->
        <path
          class="arrow-core"
          d="M12 6.5V15"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
        />
        <path
          class="arrow-head"
          d="M6.5 11.5L12 5L17.5 11.5"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </transition>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const isVisible = ref(false);

const handleScroll = () => {
  isVisible.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => window.addEventListener("scroll", handleScroll));
onUnmounted(() => window.removeEventListener("scroll", handleScroll));
</script>

<style lang="scss" scoped>
.back-to-top {
  position: fixed;
  right: 28px;
  bottom: 36px;
  z-index: 999;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  color: #ffffff;
  background-color: var(--primary-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-3px);
    box-shadow: 0 6px 18px rgba(59, 130, 246, 0.5);

    .arrow-head,
    .arrow-core {
      animation: rocketLift 1s ease-in-out infinite alternate;
    }

    .thrust-beam {
      animation: thrustPulse 0.5s ease-in-out infinite alternate;
    }
  }

  &:active {
    transform: scale(0.92);
  }
}

.back-top-icon {
  width: 22px;
  height: 22px;
  overflow: visible;
}

@keyframes rocketLift {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-2.5px);
  }
}

@keyframes thrustPulse {
  0% {
    opacity: 0.35;
    transform: scaleY(0.7);
    transform-origin: top;
  }
  100% {
    opacity: 1;
    transform: scaleY(1.2);
    transform-origin: top;
  }
}

@media (max-width: 640px) {
  .back-to-top {
    right: 18px;
    bottom: 24px;
    width: 40px;
    height: 40px;

    .back-top-icon {
      width: 20px;
      height: 20px;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}
</style>
