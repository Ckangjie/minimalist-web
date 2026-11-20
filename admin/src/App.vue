<template>
  <el-config-provider :message="messageConfig" size="default">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { ElConfigProvider } from "element-plus";

const messageConfig = reactive({
  grouping: true
});
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
</style>
