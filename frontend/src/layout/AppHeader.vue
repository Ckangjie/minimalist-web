<template>
  <header class="navbar sticky top-0 z-100 w-full">
    <div class="navbar-inner max-w-1440px h-60px mx-auto px-4 md:px-8 flex items-center justify-between">
      <div class="flex items-center gap-6">
        <router-link to="/" class="navbar-brand flex items-center gap-2">
          <img src="/logo.svg?v=4" alt="Jie Hub Logo" class="w-8 h-8 flex-shrink-0" />
          <span class="font-bold text-lg tracking-tight">Jie Hub</span>
        </router-link>

        <!-- 桌面端三大顶级大类切换 Tabs -->
        <nav class="nav-mode-tabs hidden md:flex items-center p-1 rounded-xl" aria-label="导航模式切换">
          <button
            type="button"
            class="mode-tab-btn flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            :class="{ 'is-active': currentNavMode === 'system' }"
            @click="switchNavMode('system')"
          >
            系统导航
          </button>
          <button
            type="button"
            class="mode-tab-btn flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            :class="{ 'is-active': currentNavMode === 'bookmarks' }"
            @click="switchNavMode('bookmarks')"
          >
            <span>收藏导航</span>
            <span
              v-if="customCount > 0"
              class="tab-count-badge text-xs px-1.5 py-0.2 rounded-full font-medium"
            >
              {{ customCount }}
            </span>
          </button>
          <button
            type="button"
            class="mode-tab-btn flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            :class="{ 'is-active': currentNavMode === 'tools' }"
            @click="switchNavMode('tools')"
          >
            <span>导航工具</span>
            <span
              v-if="toolsCount > 0"
              class="tab-count-badge text-xs px-1.5 py-0.2 rounded-full font-medium"
            >
              {{ toolsCount }}
            </span>
          </button>
        </nav>
      </div>

      <!-- 移动端操作栏 -->
      <div class="flex items-center gap-3 md:hidden">
        <ThemeToggle />
        <button
          class="navbar-toggle"
          :class="{ 'is-active': isMenuOpen }"
          :aria-expanded="isMenuOpen"
          aria-controls="mobile-nav"
          aria-label="切换菜单"
          @click="toggleMenu"
        >
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
      </div>
    </div>

    <!-- 移动端左侧滑出抽屉 -->
    <Teleport to="body">
      <div
        class="mobile-menu-mask"
        :class="{ 'is-show': isMenuOpen }"
        @click="closeMenu"
      ></div>
      <aside
        id="mobile-nav"
        class="mobile-menu from-left"
        :class="{ 'is-open': isMenuOpen }"
        :aria-hidden="!isMenuOpen"
      >
        <!-- 抽屉头部：固定在顶部 -->
        <div class="mobile-menu__header flex items-center justify-between p-4 border-b flex-shrink-0">
          <router-link to="/" class="flex items-center gap-2" @click="closeMenu">
            <img src="/logo.svg" alt="Jie Hub Logo" class="w-7 h-7" />
            <span class="font-bold text-base">Jie Hub</span>
          </router-link>
          <button type="button" class="close-drawer-btn" aria-label="关闭抽屉" @click="closeMenu">
            ✕
          </button>
        </div>

        <!-- 顶部固定操作与分类标题区：不随滚动，绝不顶出视口 -->
        <div class="mobile-drawer-top p-3 pb-2 flex flex-col gap-2 flex-shrink-0 border-b">
          <!-- 移动端模式切换行（仅展示系统导航与导航工具） -->
          <div class="mobile-mode-tabs flex p-1 bg-[var(--bg-surface-soft)] rounded-xl">
            <button
              type="button"
              class="mobile-mode-btn"
              :class="{ 'is-active': currentNavMode === 'system' }"
              @click="handleMobileModeSwitch('system')"
            >
              <span>系统导航</span>
            </button>
            <button
              type="button"
              class="mobile-mode-btn"
              :class="{ 'is-active': currentNavMode === 'tools' }"
              @click="handleMobileModeSwitch('tools')"
            >
              <span>导航工具</span>
              <span v-if="toolsCount > 0" class="mode-count-tag">{{ toolsCount }}</span>
            </button>
          </div>

          <!-- 子分类标题栏（系统导航模式下固定可见） -->
          <div
            v-if="currentNavMode === 'system'"
            class="px-1 pt-1 text-xs font-semibold text-muted flex items-center justify-between select-none"
          >
            <span>系统导航分类</span>
            <span class="text-[11px] opacity-60">{{ mobileNavItems.length }} 个分类</span>
          </div>
        </div>

        <!-- 独立滚动区域：仅内部子分类列表滚动 -->
        <nav class="mobile-menu__nav p-3 flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto">
          <!-- 导航工具模式提示（工具模式不显示侧栏层级，直接导向视图） -->
          <div
            v-if="currentNavMode === 'tools'"
            class="mobile-tools-prompt p-3 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] flex flex-col gap-2"
          >
            <div class="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
              <span>🧰</span>
              <span>自研导航工具</span>
            </div>
            <p class="text-[11px] text-[var(--text-muted)] leading-relaxed m-0">
              包含自研离线资源包（支持直接下载）与开源项目仓库。
            </p>
            <button
              type="button"
              class="mobile-tools-confirm-btn w-full py-1.5 rounded-lg text-xs font-semibold text-white bg-[var(--primary-color)] border-none cursor-pointer"
              @click="closeMenu"
            >
              查看全部工具 ({{ toolsCount }})
            </button>
          </div>

          <!-- 系统导航 / 收藏导航模式下的子分类列表（独立滚动项） -->
          <template v-else>
            <a
              v-for="item in mobileNavItems"
              :key="item.id"
              :href="`#category-${item.id}`"
              class="mobile-link flex items-center justify-between"
              :class="{ 'is-active': activeSection === item.id }"
              @click.prevent="scrollToCategory(item.id)"
            >
              <span class="truncate">{{ item.label }}</span>
              <span class="text-xs opacity-50">{{ item.count }}</span>
            </a>
          </template>
        </nav>

      </aside>
    </Teleport>
  </header>
</template>

<script setup>
import ThemeToggle from "@/components/ThemeToggle.vue";
import { useBookmarks } from "@/composables/useBookmarks";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const { currentNavMode, activeCategories, systemCategories, customCount, toolsCount, switchNavMode } = useBookmarks();

// 移动端切换模式：切换到工具时自动收起抽屉直接浏览
const handleMobileModeSwitch = (mode) => {
  switchNavMode(mode);
  if (mode === "tools") {
    closeMenu();
  }
};

// 移动端子分类导航根据当前模式动态跟随
const mobileNavItems = computed(() => {
  return activeCategories.value.map((cat) => ({
    id: cat.id,
    label: cat.name,
    count: cat.items?.length || 0
  }));
});

const subNavItems = computed(() => {
  return activeCategories.value.map((cat) => ({
    id: cat.id,
    label: cat.name,
    count: cat.items?.length || 0
  }));
});

const activeSection = ref(subNavItems.value[0]?.id ?? "dev-tools");

watch(
  () => activeCategories.value,
  (newVal) => {
    if (newVal?.length > 0) {
      activeSection.value = newVal[0].id;
    }
  }
);
const isMenuOpen = ref(false);

let isManualScrolling = false;
let manualScrollTimer = null;

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

// 锚点跳转（平滑滚动锁）
const scrollToCategory = (id) => {
  activeSection.value = id;
  isManualScrolling = true;

  if (manualScrollTimer) {
    clearTimeout(manualScrollTimer);
  }

  const target = document.getElementById(`category-${id}`);
  if (target) {
    const headerOffset = 70;
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }

  const unlock = () => {
    isManualScrolling = false;
    window.removeEventListener("scrollend", unlock);
  };

  if ("onscrollend" in window) {
    window.addEventListener("scrollend", unlock, { once: true });
  }
  manualScrollTimer = setTimeout(unlock, 800);

  closeMenu();
};

watch(isMenuOpen, (open) => {
  document.body.style.overflow = open ? "hidden" : "";
  document.body.classList.toggle("mobile-menu-open", open);
});

// 确定性的视口滚动监听
let ticking = false;
const handleScrollSpy = () => {
  if (isManualScrolling) return;

  if (!ticking) {
    window.requestAnimationFrame(() => {
      if (isManualScrolling) {
        ticking = false;
        return;
      }

      const items = subNavItems.value;
      if (!items.length) {
        ticking = false;
        return;
      }

      const scrollY = window.scrollY;
      const headerOffset = 90;

      if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 50) {
        activeSection.value = items[items.length - 1].id;
        ticking = false;
        return;
      }

      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const el = document.getElementById(`category-${item.id}`);
        if (el) {
          const top = el.offsetTop - headerOffset;
          if (scrollY >= top - 20) {
            activeSection.value = item.id;
            ticking = false;
            return;
          }
        }
      }

      activeSection.value = items[0].id;
      ticking = false;
    });
    ticking = true;
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScrollSpy, { passive: true });
  handleScrollSpy();
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScrollSpy);
  if (manualScrollTimer) {
    clearTimeout(manualScrollTimer);
  }
  document.body.style.overflow = "";
  document.body.classList.remove("mobile-menu-open");
});
</script>

<style lang="scss" scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background-color: var(--navbar-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);

  &-brand {
    color: var(--text-primary);
  }
}

/* 顶部两大类切换 Tab */
.nav-mode-tabs {
  background-color: var(--bg-surface-soft);
  border: 1px solid var(--border-color);

  .mode-tab-btn {
    border: none;
    background: transparent;
    color: var(--text-regular);

    &:hover {
      color: var(--text-primary);
    }

    &.is-active {
      background-color: var(--bg-surface);
      color: var(--primary-color);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }
  }

  .tab-count-badge {
    background-color: var(--primary-light);
    color: var(--primary-color);
  }
}


/* 汉堡按钮 */
.navbar-toggle {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;

  .icon-bar {
    display: block;
    width: 100%;
    height: 2px;
    background-color: var(--text-primary);
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  &.is-active {
    .icon-bar:nth-child(1) {
      transform: translateY(8px) rotate(45deg);
    }
    .icon-bar:nth-child(2) {
      opacity: 0;
    }
    .icon-bar:nth-child(3) {
      transform: translateY(-8px) rotate(-45deg);
    }
  }
}

/* 移动端抽屉 */
.mobile-menu-mask {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 998;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;

  &.is-show {
    opacity: 1;
    visibility: visible;
  }
}

.mobile-menu {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 280px;
  max-width: 80vw;
  height: 100%;
  max-height: 100vh;
  background-color: var(--bg-surface);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);

  &.from-left {
    left: 0;
    transform: translateX(-100%);
  }

  &.is-open {
    transform: translateX(0);
  }

  &__header {
    border-color: var(--border-color);
    color: var(--text-primary);
  }

  &__nav {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

.mobile-drawer-top {
  border-color: var(--border-color);
}

.close-drawer-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  outline: none;
  font-size: 18px;
  line-height: 1;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--text-primary);
  }
}

/* 移动端模式切换分段按钮 */
.mobile-mode-tabs {
  background-color: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  padding: 4px;
  border-radius: 12px;
  display: flex;
  gap: 4px;

  .mobile-mode-btn {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 500;
    padding: 7px 4px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      color: var(--text-primary);
    }

    &.is-active {
      background-color: var(--primary-color);
      color: #ffffff;
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.28);
    }

    .mode-count-tag {
      font-size: 10px;
      padding: 0 5px;
      border-radius: 8px;
      line-height: 14px;
      background-color: rgba(255, 255, 255, 0.25);
      color: #ffffff;
    }

    &:not(.is-active) .mode-count-tag {
      background-color: var(--border-color);
      color: var(--text-muted);
    }
  }
}

.mobile-tools-confirm-btn {
  transition: background-color 0.2s ease, transform 0.1s ease;

  &:hover {
    background-color: var(--primary-hover);
  }

  &:active {
    transform: scale(0.98);
  }
}

.mobile-link {
  padding: 10px 14px;
  font-size: 14px;
  color: var(--text-regular);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--bg-surface-soft);
    color: var(--primary-color);
  }

  &.is-active {
    background-color: var(--primary-light);
    color: var(--primary-color);
    font-weight: 600;
  }
}

</style>
