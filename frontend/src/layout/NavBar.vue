<template>
  <header class="navbar sticky top-0 z-100 w-full transition-colors duration-300">
    <div class="navbar-inner max-w-1440px h-60px mx-auto px-4 md:px-8 flex items-center justify-between">
      <div class="flex items-center gap-6">
        <router-link to="/" class="navbar-brand flex items-center gap-2">
          <img src="/logo.svg" alt="Jie Hub Logo" class="w-8 h-8 flex-shrink-0" />
          <span class="font-bold text-lg tracking-tight">Jie Hub</span>
          <span class="navbar-badge text-xs px-2 py-0.5 rounded-full font-medium">Nav</span>
        </router-link>

        <!-- 桌面端两大顶级大类切换 Tabs -->
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
        <div class="mobile-menu__header flex items-center justify-between p-4 border-b">
          <router-link to="/" class="flex items-center gap-2" @click="closeMenu">
            <img src="/logo.svg" alt="Jie Hub Logo" class="w-7 h-7" />
            <span class="font-bold text-base">Jie Hub</span>
          </router-link>
          <button type="button" class="close-drawer-btn" aria-label="关闭抽屉" @click="closeMenu">
            ✕
          </button>
        </div>

        <!-- 移动端子分类导航（仅展示系统导航） -->
        <nav class="mobile-menu__nav p-3 flex flex-col gap-1.5 flex-1 overflow-y-auto">
          <div class="px-2 py-1 text-xs font-semibold text-muted">
            系统导航
          </div>
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
        </nav>

        <!-- 移动端抽屉底部主题外观切换行 -->
        <div class="mobile-drawer-footer p-4 border-t flex items-center justify-between">
          <span class="text-sm font-medium footer-label">外观模式</span>
          <ThemeToggle />
        </div>
      </aside>
    </Teleport>
  </header>
</template>

<script setup>
import ThemeToggle from "@/components/ThemeToggle.vue";
import { useBookmarks } from "@/composables/useBookmarks";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const { currentNavMode, activeCategories, systemCategories, customCount, switchNavMode } = useBookmarks();

// 移动端专用：固定仅展示系统导航的子分类
const mobileNavItems = computed(() => {
  return systemCategories.map((cat) => ({
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
});
</script>

<style lang="scss" scoped>
.navbar {
  background-color: var(--navbar-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);

  &-brand {
    color: var(--text-primary);
  }

  &-badge {
    background: var(--primary-light);
    color: var(--primary-color);
    border: 1px solid var(--border-color);
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
  background-color: var(--bg-surface);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  z-index: 999;
  display: flex;
  flex-direction: column;
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
}

.close-drawer-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px 8px;

  &:hover {
    color: var(--text-primary);
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

.mobile-drawer-footer {
  border-color: var(--border-color);

  .footer-label {
    color: var(--text-muted);
  }
}
</style>
