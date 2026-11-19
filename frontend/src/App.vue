<template>
  <el-config-provider :message="messageConfig">
    <!-- 鼠标微光照亮网格层（类似 Linear / Vercel 官网交互） -->
    <div class="grid-spotlight-layer" aria-hidden="true" />
    <router-view />
  </el-config-provider>
</template>

<script setup>
import { reactive } from "vue";
import { ElConfigProvider } from "element-plus";
import { useGridSpotlight } from "@/composables/useGridSpotlight";

const messageConfig = reactive({
  grouping: true
});

useGridSpotlight();
</script>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
}

#app {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
</style>
