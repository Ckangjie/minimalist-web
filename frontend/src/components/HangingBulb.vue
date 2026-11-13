<template>
  <div
    ref="bulb"
    class="hanging-bulb-container hidden md:flex"
    :class="{ 'is-lit': !isDark, 'is-pulling': isPulling }"
    :title="isDark ? '拉动灯泡开灯 (切换为亮色模式)' : '拉动灯泡关灯 (切换为暗色模式)'"
    @click="handlePull"
  >
    <!-- 从天花板垂下的金属细吊线 -->
    <div class="bulb-wire"></div>

    <!-- 吊灯主体挂件（一体化 SVG，严丝合缝无缝咬合） -->
    <div class="bulb-pendant">
      <!-- 现实开灯柔和光锥漫射（亮灯时照射） -->
      <div class="bulb-beam"></div>

      <!-- 一体化矢量吊灯（金属螺头、玻璃泡、钨丝与拉绳融为一个整体） -->
      <svg
        class="bulb-unified-svg"
        viewBox="0 0 60 94"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- 1. 玻璃灯泡外壳（颈部深入金属底座内部 3px，杜绝断节脱节） -->
        <path
          d="M 22 20 L 22 24 C 22 24, 11 36, 11 50 C 11 65, 19 74, 30 74 C 41 74, 49 65, 49 50 C 49 36, 38 24, 38 24 L 38 20 Z"
          class="bulb-glass"
        />

        <!-- 2. 内部导电支架与钨丝 -->
        <g class="bulb-filament">
          <!-- 支架电极引线 -->
          <path d="M 25 20 L 26 38 M 35 20 L 34 38" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          <!-- 钨丝线圈 -->
          <path
            d="M 26 38 Q 28 32, 30 38 Q 32 44, 34 38"
            class="filament-coil"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- 亮灯时的通电光核 -->
          <circle cx="30" cy="38" r="3.5" class="filament-core" />
        </g>

        <!-- 3. 玻璃反光弧线 -->
        <path
          d="M 16 42 C 16 32, 21 26, 27 24"
          class="glass-glare"
          stroke-width="1.5"
          stroke-linecap="round"
        />

        <!-- 4. 金属螺口灯头底座（层叠覆盖在灯泡颈部，严丝合缝） -->
        <g class="bulb-socket-group">
          <!-- 金属上顶盖 -->
          <rect x="23" y="2" width="14" height="6" rx="2" class="socket-cap" />
          <!-- 螺纹金属筒 -->
          <rect x="20" y="8" width="20" height="14" rx="2" class="socket-body" />
          <!-- 螺纹螺旋横纹 -->
          <line x1="20" y1="12" x2="40" y2="12" class="socket-thread" />
          <line x1="20" y1="16" x2="40" y2="16" class="socket-thread" />
          <!-- 底座下压密封圈：紧密锁死灯泡颈部 -->
          <rect x="21" y="20" width="18" height="3" rx="1" class="socket-rim" />
        </g>

        <!-- 5. 底部拉绳与金属拉珠开关 -->
        <g class="pull-chain-group">
          <!-- 细金属珠链吊线 -->
          <line x1="30" y1="74" x2="30" y2="86" class="chain-line" />
          <!-- 坠饰拉珠 -->
          <rect x="28" y="86" width="4" height="6" rx="1.5" class="chain-bead" />
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from "@/composables/useTheme";
import { onMounted, onUnmounted, ref } from "vue";

const { isDark, toggleTheme } = useTheme();
const bulb = ref(null);
const isPulling = ref(false);
let breezeMedia;
let breezeTimer;
let sway;

const scheduleBreeze = () => {
  clearTimeout(breezeTimer);
  sway?.cancel();
  if (!breezeMedia.matches || document.hidden) return;

  breezeTimer = setTimeout(() => {
    const peakAngle = Math.random() < 0.5 ? -4 : 4;
    const duration = 3000;
    const sampleCount = 60;
    const rotations = Array.from({ length: sampleCount + 1 }, (_, index) => {
      const progress = index / sampleCount;
      // 用指数衰减的正弦曲线模拟阻尼摆，末端归零。
      return index === sampleCount
        ? 0
        : Math.exp(-4.5 * progress) * Math.sin(6 * Math.PI * progress);
    });
    const peak = Math.max(...rotations);
    const keyframes = rotations.map((rotation) => ({ rotate: `${(rotation / peak) * peakAngle}deg` }));

    // 旋转整盏灯，让吊线、灯泡和光束从同一个悬挂点摆动。
    sway = bulb.value.animate(keyframes, { duration });
    sway.onfinish = scheduleBreeze;
  }, 9000 + Math.random() * 15000);
};

onMounted(() => {
  breezeMedia = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
  breezeMedia.addEventListener("change", scheduleBreeze);
  document.addEventListener("visibilitychange", scheduleBreeze);
  scheduleBreeze();
});

onUnmounted(() => {
  breezeMedia.removeEventListener("change", scheduleBreeze);
  document.removeEventListener("visibilitychange", scheduleBreeze);
  clearTimeout(breezeTimer);
  sway?.cancel();
});

const handlePull = (event) => {
  if (isPulling.value) return;

  isPulling.value = true;
  toggleTheme(event);

  // 现实拉动微回弹动效
  setTimeout(() => {
    isPulling.value = false;
  }, 320);
};
</script>

<style lang="scss" scoped>
/* 仅在 PC 端展示，移动端彻底隐藏 */
.hanging-bulb-container {
  display: none;
  position: fixed;
  top: 0;
  right: clamp(18px, 4.2vw, 64px);
  z-index: 90;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transform-origin: top center;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

  @media (min-width: 768px) {
    display: flex;
  }

  &.is-pulling {
    transform: translateY(8px);
  }
}

/* 顶部细电线 */
.bulb-wire {
  width: 2px;
  height: clamp(60px, 8vh, 85px);
  background: linear-gradient(180deg, #475569 0%, #334155 100%);
  box-shadow: 1px 0 2px rgba(0, 0, 0, 0.2);
}

.bulb-pendant {
  position: relative;
  width: 48px;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: top center;
  transition: filter 0.25s ease;
}

.bulb-unified-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* 金属灯头底座（一体化金属质感） */
.socket-cap {
  fill: #64748b;
}

.socket-body {
  fill: #475569;
}

.socket-thread {
  stroke: rgba(148, 163, 184, 0.6);
  stroke-width: 1.4;
}

.socket-rim {
  fill: #334155;
}

/* 拉绳开关 */
.chain-line {
  stroke: #64748b;
  stroke-width: 1.2;
}

.chain-bead {
  fill: #94a3b8;
}

/* 关灯状态（暗色模式） */
.bulb-glass {
  fill: rgba(148, 163, 184, 0.08);
  stroke: rgba(148, 163, 184, 0.38);
  stroke-width: 1.5;
  transition: all 0.3s ease;
}

.bulb-filament {
  color: #64748b;
  opacity: 0.5;
  transition: all 0.3s ease;

  .filament-coil {
    stroke: #64748b;
  }

  .filament-core {
    fill: transparent;
  }
}

.glass-glare {
  stroke: rgba(255, 255, 255, 0.2);
}

/* 现实开灯柔和光锥漫射 */
.bulb-beam {
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 180px;
  height: 260px;
  background: radial-gradient(
    ellipse at top,
    rgba(253, 224, 71, 0.22) 0%,
    rgba(250, 204, 21, 0.08) 45%,
    transparent 75%
  );
  clip-path: polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
  filter: blur(10px);
}

/* 开灯状态（亮色模式）：现实场景通电发光 */
.is-lit {
  .bulb-pendant {
    filter: drop-shadow(0 0 16px rgba(250, 204, 21, 0.8))
      drop-shadow(0 0 35px rgba(245, 158, 11, 0.45));
  }

  .socket-body {
    fill: #78716c;
  }

  .bulb-glass {
    fill: rgba(254, 240, 138, 0.88);
    stroke: #facc15;
    stroke-width: 1.8;
  }

  .bulb-filament {
    color: #b45309;
    opacity: 1;

    .filament-coil {
      stroke: #d97706;
    }

    .filament-core {
      fill: #ffffff;
      filter: drop-shadow(0 0 4px #fef08a);
    }
  }

  .glass-glare {
    stroke: rgba(255, 255, 255, 0.85);
  }

  .bulb-beam {
    opacity: 1;
  }
}
</style>
