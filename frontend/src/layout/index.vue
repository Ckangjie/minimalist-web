<template>
  <div class="layout">
    <AppHeader class="header" />

    <main class="layout-main main">
      <RouterView />
    </main>

    <AppFooter class="footer" />

    <!-- 全局全站回到顶部组件（统一全局挂载一次，各路由通用） -->
    <BackToTop />

    <!-- PC 端全站拟物悬挂吊灯开关（全站各页面通用） -->
    <HangingBulb />
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import AppFooter from "./AppFooter.vue";
import AppHeader from "./AppHeader.vue";
import BackToTop from "@/components/BackToTop.vue";
import HangingBulb from "@/components/HangingBulb.vue";
</script>

<style lang="scss" scoped>
.layout {
  position: relative;
  z-index: 1;
  flex: 1;
  min-height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    position: sticky;
    top: 0;
    z-index: 100;
    flex-shrink: 0;
  }

  .footer {
    flex-shrink: 0;
  }

  .main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
}
</style>
