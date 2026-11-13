<template>
  <div class="layout">
    <AppHeader class="header" />

    <main class="layout-main main">
      <RouterView />
    </main>

    <AppFooter class="footer" />
  </div>
</template>

<script setup>
import { RouterView } from "vue-router";
import AppFooter from "./AppFooter.vue";
import AppHeader from "./AppHeader.vue";
</script>

<style lang="scss" scoped>
.layout {
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
