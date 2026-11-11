<template>
  <header class="navbar">
    <div class="navbar-inner">
      <router-link to="/" class="navbar-brand">Brand</router-link>

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

      <nav class="navbar-nav desktop-nav">
        <router-link to="/">首页</router-link>
      </nav>
    </div>

    <Teleport to="body">
      <div
        class="mobile-menu-mask"
        :class="{ 'is-show': isMenuOpen }"
        @click="closeMenu"
      ></div>
      <aside
        id="mobile-nav"
        class="mobile-menu"
        :class="{ 'is-open': isMenuOpen }"
        :aria-hidden="!isMenuOpen"
      >
        <div class="mobile-menu__header">
          <router-link to="/" class="mobile-menu__brand" @click="closeMenu">Brand</router-link>
        </div>
        <nav class="mobile-menu__nav">
          <router-link to="/" @click="closeMenu">首页</router-link>
        </nav>
      </aside>
    </Teleport>
  </header>
</template>

<script setup>
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const closeMenu = () => {
  isMenuOpen.value = false;
};

watch(isMenuOpen, (open) => {
  document.body.style.overflow = open ? "hidden" : "";
});

onUnmounted(() => {
  document.body.style.overflow = "";
});
</script>

<style lang="scss" scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
  box-sizing: border-box;

  &-inner {
    max-width: 1200px;
    height: 60px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
  }

  &-brand {
    color: $primary-color;
    font-size: 18px;
    font-weight: 700;
    text-decoration: none;
  }

  &-nav {
    display: flex;
    gap: 24px;

    a {
      color: #303133;
      text-decoration: none;
      transition: color 0.3s;

      &:hover,
      &.router-link-active {
        color: $primary-color;
      }
    }
  }

  &-toggle {
    display: none;
    position: relative;
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 5px;
    border: 0;
    background: transparent;
    cursor: pointer;

    .icon-bar {
      display: block;
      width: 22px;
      height: 2px;
      background-color: #303133;
      border-radius: 1px;
      transition: transform 0.3s, opacity 0.2s;
    }

    &.is-active {
      .icon-bar {
        position: absolute;
      }

      .icon-bar:nth-child(1) {
        transform: rotate(45deg);
      }

      .icon-bar:nth-child(2) {
        opacity: 0;
      }

      .icon-bar:nth-child(3) {
        transform: rotate(-45deg);
      }
    }
  }
}

@media (max-width: 768px) {
  .navbar {
    &-nav.desktop-nav {
      display: none;
    }

    &-toggle {
      display: flex;
    }
  }
}
</style>

<style lang="scss">
.mobile-menu-mask {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 998;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;

  &.is-show {
    opacity: 1;
    pointer-events: auto;
  }
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  width: 280px;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  box-sizing: border-box;

  &.is-open {
    transform: translateX(0);
  }

  &__header {
    height: 60px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ebeef5;
    box-sizing: border-box;
  }

  &__brand {
    color: $primary-color;
    font-weight: 600;
    text-decoration: none;
  }

  &__nav {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-sizing: border-box;

    a {
      padding: 8px 0;
      color: #303133;
      font-size: 16px;
      text-decoration: none;
      transition: color 0.3s;

      &:hover,
      &.router-link-active {
        color: $primary-color;
      }
    }
  }
}

@media (max-width: 768px) {
  .mobile-menu-mask {
    display: block;
  }
}

@media (min-width: 769px) {
  .mobile-menu,
  .mobile-menu-mask {
    display: none !important;
  }
}
</style>
