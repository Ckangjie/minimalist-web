<template>
  <div
    class="hanging-bulb-container"
    :class="{ 'is-lit': !isDark, 'is-pulling': isPulling }"
    :title="isDark ? '拉动灯泡开灯 (切换为亮色模式)' : '拉动灯泡关灯 (切换为暗色模式)'"
    @click="handlePull"
  >
    <!-- 从天花板垂下的电线/吊绳 -->
    <div class="bulb-wire"></div>

    <!-- 吊灯主体挂件（随点击有拉扯物理回弹） -->
    <div class="bulb-pendant">
      <!-- 复古金属螺口灯头底座 -->
      <div class="bulb-socket">
        <div class="socket-cap"></div>
        <div class="socket-rings"></div>
      </div>

      <!-- 灯泡主体与光晕层 -->
      <div class="bulb-body">
        <!-- 现实开灯漫射锥形柔光场（仅亮灯时呈现） -->
        <div class="bulb-beam"></div>

        <!-- 高保真矢量玻璃灯泡与钨丝 -->
        <svg
          class="bulb-svg"
          viewBox="0 0 60 84"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- 玻璃球外壳 -->
          <path
            d="M 18 10 C 18 10, 10 24, 10 38 C 10 52, 22 62, 30 62 C 38 62, 50 52, 50 38 C 50 24, 42 10, 42 10 Z"
            class="bulb-glass"
          />

          <!-- 内部导电支架与钨丝 -->
          <g class="bulb-filament">
            <!-- 支架电极引线 -->
            <path d="M 24 10 L 26 28 M 36 10 L 34 28" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
            <!-- 爱迪生缠绕钨丝线圈 -->
            <path
              d="M 26 28 Q 28 22, 30 28 Q 32 34, 34 28"
              class="filament-coil"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <!-- 亮灯时的核心光核 -->
            <circle cx="30" cy="28" r="3.5" class="filament-core" />
          </g>

          <!-- 玻璃表面弧形高光反射（增强立体通透质感） -->
          <path
            d="M 16 32 C 16 22, 22 16, 28 14"
            class="glass-glare"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </svg>
      </div>

      <!-- 小巧拉绳坠饰 -->
      <div class="pull-string">
        <div class="string-line"></div>
        <div class="string-bead"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from "@/composables/useTheme";
import { ref } from "vue";

const { isDark, toggleTheme } = useTheme();
const isPulling = ref(false);

const handlePull = () => {
  if (isPulling.value) return;

  isPulling.value = true;
  toggleTheme();

  // 现实拉动微回弹动效
  setTimeout(() => {
    isPulling.value = false;
  }, 320);
};
</script>

<style lang="scss" scoped>
.hanging-bulb-container {
  position: fixed;
  top: 0;
  right: clamp(18px, 4.2vw, 64px);
  z-index: 90;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transform-origin: top center;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    .bulb-pendant {
      animation: gentle-sway 2.4s ease-in-out infinite;
    }
  }

  &.is-pulling {
    transform: translateY(8px);
  }
}

/* 顶部垂下的坚韧细电线 */
.bulb-wire {
  width: 2px;
  height: clamp(60px, 8vh, 90px);
  background: linear-gradient(180deg, #475569 0%, #334155 100%);
  box-shadow: 1px 0 2px rgba(0, 0, 0, 0.2);
}

.bulb-pendant {
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-origin: top center;
  transition: filter 0.25s ease;
}

/* 金属螺口灯头 */
.bulb-socket {
  display: flex;
  flex-direction: column;
  align-items: center;

  .socket-cap {
    width: 14px;
    height: 7px;
    background: #64748b;
    border-radius: 3px 3px 0 0;
  }

  .socket-rings {
    width: 18px;
    height: 10px;
    background: repeating-linear-gradient(
      180deg,
      #94a3b8 0px,
      #94a3b8 2px,
      #475569 2px,
      #475569 4px
    );
    border-radius: 2px;
  }
}

/* 灯泡与光场 */
.bulb-body {
  position: relative;
  width: 44px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bulb-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* 关灯状态（暗色模式） */
.bulb-glass {
  fill: rgba(148, 163, 184, 0.08);
  stroke: rgba(148, 163, 184, 0.35);
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

.bulb-beam {
  position: absolute;
  top: 25px;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 240px;
  background: radial-gradient(
    ellipse at top,
    rgba(253, 224, 71, 0.2) 0%,
    rgba(250, 204, 21, 0.08) 45%,
    transparent 75%
  );
  clip-path: polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
  filter: blur(8px);
}

/* 开灯状态（亮色模式）：现实场景高光通电 */
.is-lit {
  .bulb-body {
    filter: drop-shadow(0 0 16px rgba(250, 204, 21, 0.8))
      drop-shadow(0 0 35px rgba(245, 158, 11, 0.45));
  }

  .bulb-glass {
    fill: rgba(254, 240, 138, 0.85);
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

/* 吊绳微拉线与金属坠 */
.pull-string {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -4px;

  .string-line {
    width: 1px;
    height: 14px;
    background: #64748b;
  }

  .string-bead {
    width: 5px;
    height: 7px;
    border-radius: 2px;
    background: #94a3b8;
  }
}

/* 现实微风轻微摆动 */
@keyframes gentle-sway {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(1.8deg);
  }
  75% {
    transform: rotate(-1.8deg);
  }
}
</style>
