<template>
  <el-config-provider :message="messageConfig">
    <router-view />
  </el-config-provider>
</template>

<script setup>
import { reactive } from "vue";
import { ElConfigProvider } from "element-plus";

const messageConfig = reactive({
  grouping: true
});
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
