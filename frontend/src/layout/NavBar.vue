<template>
  <header class="navbar sticky top-0 z-100 w-full transition-colors duration-300">
    <div class="navbar-inner max-w-1200px h-60px mx-auto px-4 md:px-6 flex items-center justify-between">
      <router-link to="/" class="navbar-brand flex items-center gap-2">
        <img src="/logo.svg" alt="Jie Hub Logo" class="w-8 h-8 flex-shrink-0" />
        <span class="font-bold text-lg tracking-tight">Jie Hub</span>
        <span class="navbar-badge text-xs px-2 py-0.5 rounded-full font-medium">Nav</span>
      </router-link>

      <!-- 桌面端导航（无 Emoji 图标） -->
      <nav class="navbar-nav desktop-nav hidden md:flex items-center gap-8 h-full">
        <a
          v-for="item in navItems"
          :key="item.id"
          :href="`#category-${item.id}`"
          class="nav-link flex items-center h-full"
          :class="{ 'is-active': activeSection === item.id }"
          @click.prevent="scrollToCategory(item.id)"
        >
          {{ item.label }}
        </a>

        <a
          href="https://github.com/Ckangjie/minimalist-web"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-link nav-ext-link flex items-center h-full"
        >
          GitHub
        </a>

        <!-- 无边框无阴影纯净主题切换 -->
        <ThemeToggle />
      </nav>

      <!-- 移动端操作栏 -->
      <div class="flex items-center gap-3 md:hidden">
        <!-- 移动端顶部主题切换 -->
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

        <nav class="mobile-menu__nav p-4 flex flex-col gap-2 flex-1">
          <a
            v-for="item in navItems"
            :key="item.id"
            :href="`#category-${item.id}`"
            class="mobile-link"
            :class="{ 'is-active': activeSection === item.id }"
            @click.prevent="scrollToCategory(item.id)"
          >
            {{ item.label }}
          </a>
          <a
            href="https://github.com/Ckangjie/minimalist-web"
            target="_blank"
            rel="noopener noreferrer"
            class="mobile-link"
            @click="closeMenu"
          >
            GitHub 源码
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
import { onMounted, onUnmounted, ref, watch } from "vue";

const navItems = [
  { id: "dev-tools", label: "开发工具" },
  { id: "ai-hub", label: "AI 工具" },
  { id: "design-assets", label: "设计素材" },
  { id: "media-leisure", label: "影视娱乐" }
];

const activeSection = ref("dev-tools");
const isMenuOpen = ref(false);

let isManualScrolling = false;
let manualScrollTimer = null;

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

// 锚点跳转（参考 VitePress/Docusaurus 成熟方案：平滑滚动期间加锁，杜绝中间视口频繁跳动）
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

// 确定性的视口滚动监听（rAF 节流 + 触底保护）
let ticking = false;
const handleScrollSpy = () => {
  if (isManualScrolling) return;

  if (!ticking) {
    window.requestAnimationFrame(() => {
      if (isManualScrolling) {
        ticking = false;
        return;
      }

      const scrollY = window.scrollY;
      const headerOffset = 90;

      // 触底判定：若已滚动到页面最底端，自动聚焦最后一个分类
      if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 50) {
        activeSection.value = navItems[navItems.length - 1].id;
        ticking = false;
        return;
      }

      // 从后往前查找顶部当前所在的板块
      for (let i = navItems.length - 1; i >= 0; i--) {
        const item = navItems[i];
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

      activeSection.value = navItems[0].id;
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

.nav-link {
  position: relative;
  font-size: 14px;
  color: var(--text-regular);
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  user-select: none;
  padding: 0 4px;

  &:hover {
    color: var(--primary-color);
  }

  &.is-active {
    color: var(--primary-color);
    font-weight: 600;
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

/* 移动端遮罩与从左侧滑出的抽屉 */
.mobile-menu-mask {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease, visibility 0.3s ease;

  &.is-show {
    opacity: 1;
    visibility: visible;
  }
}

.mobile-menu.from-left {
  position: fixed;
  top: 0;
  left: 0; // 从左侧滑出
  right: auto;
  bottom: 0;
  width: 280px;
  max-width: 80vw;
  background-color: var(--bg-surface);
  border-right: 1px solid var(--border-color);
  z-index: 999;
  transform: translateX(-100%); // 默认隐藏在左侧屏幕外
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;

  &.is-open {
    transform: translateX(0); // 滑入屏幕
  }

  .mobile-menu__header {
    border-color: var(--border-color);
    color: var(--text-primary);
  }

  .mobile-drawer-footer {
    border-color: var(--border-color);

    .footer-label {
      color: var(--text-regular);
    }
  }
}

.close-drawer-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
}

.mobile-link {
  color: var(--text-regular);
  font-size: 15px;
  padding: 10px 14px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover,
  &.is-active {
    background-color: var(--primary-light);
    color: var(--primary-color);
    font-weight: 600;
  }
}
</style>
