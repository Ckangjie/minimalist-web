<template>
  <div class="ruoyi-layout flex h-screen overflow-hidden">
    <!-- 左侧侧边栏组件 -->
    <Sidebar :is-collapse="isCollapse" />

    <!-- 右侧主界面区 -->
    <div class="main-container flex-1 flex flex-col min-w-0 bg-[#f0f2f5] h-full overflow-hidden">
      <!-- 顶部导航栏组件 -->
      <Navbar :is-collapse="isCollapse" @toggle-collapse="toggleCollapse" />

      <!-- 多标签页 TagsView 组件 -->
      <TagsView />

      <!-- 页面主视口组件 -->
      <AppMain />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Sidebar from "./components/Sidebar.vue";
import Navbar from "./components/Navbar.vue";
import TagsView from "./components/TagsView.vue";
import AppMain from "./components/AppMain.vue";

const isCollapse = ref(false);

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};
</script>
