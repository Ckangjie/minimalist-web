<template>
  <div id="app">
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
    <TheFooter />
    <BackToTop />
  </div>
</template>

<script setup>
import NavBar from "@/layout/NavBar.vue";
import TheFooter from "@/layout/TheFooter.vue";
import BackToTop from "@/components/BackToTop.vue";
</script>

<style lang="scss">
#app {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>
