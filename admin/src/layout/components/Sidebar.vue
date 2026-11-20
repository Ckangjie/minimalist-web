<template>
  <aside
    class="sidebar-container flex flex-col flex-shrink-0 transition-all duration-300 h-full overflow-hidden"
    :style="{ width: isCollapse ? '64px' : '210px' }"
  >
    <!-- 顶部 Logo 标识（无独立背景色，与侧边栏融为一体） -->
    <div class="logo-box h-50px flex items-center px-4 gap-2.5 flex-shrink-0 overflow-hidden">
      <!-- Jie Hub + Code 专属 SVG Logo -->
      <img
        src="/logo.svg"
        alt="logo"
        class="w-6 h-6 flex-shrink-0"
      />
      <span
        v-show="!isCollapse"
        class="logo-title font-bold text-sm tracking-wide text-white whitespace-nowrap overflow-hidden text-ellipsis"
      >
        {{ appTitle }}
      </span>
    </div>

    <!-- 侧边栏菜单（直接根据路由动态结构渲染） -->
    <el-scrollbar class="flex-1">
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        class="sidebar-menu border-none"
        router
      >
        <template v-for="menu in menuGroups" :key="menu.title || menu.path">
          <!-- 单独一级菜单（如首页控制台） -->
          <el-menu-item v-if="!menu.isGroup" :index="'/' + menu.path">
            <el-icon><component :is="iconMap[menu.icon] || House" /></el-icon>
            <template #title>{{ menu.title }}</template>
          </el-menu-item>

          <!-- 分组折叠菜单（如留言板管理） -->
          <el-sub-menu v-else :index="menu.title">
            <template #title>
              <el-icon><component :is="iconMap[menu.icon] || ChatDotRound" /></el-icon>
              <span>{{ menu.title }}</span>
            </template>
            <el-menu-item
              v-for="sub in menu.children"
              :key="sub.path"
              :index="'/' + sub.path"
            >
              <el-icon><component :is="iconMap[sub.icon] || Document" /></el-icon>
              <template #title>{{ sub.title }}</template>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-scrollbar>
  </aside>
</template>

<script setup lang="ts">
import { ChatDotRound, Document, Grid, House, Link, User } from "@element-plus/icons-vue";
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

defineProps<{
  isCollapse: boolean;
}>();

const route = useRoute();
const router = useRouter();

const appTitle = (import.meta.env.VITE_APP_TITLE as string);

const iconMap: Record<string, any> = {
  House,
  ChatDotRound,
  Document,
  User,
  Link,
  Grid
};

const activeMenu = computed(() => route.path);

const menuGroups = computed(() => {
  const layoutRoute = router.options.routes.find((r) => r.path === "/");
  const children = (layoutRoute?.children || []).filter((c) => c.meta?.title && !c.meta?.hidden);

  const groups: any[] = [];
  const groupMap: Record<string, any> = {};

  children.forEach((item) => {
    const parentTitle = item.meta?.parentTitle as string | undefined;
    const parentIcon = item.meta?.parentIcon as string | undefined;
    if (parentTitle) {
      if (!groupMap[parentTitle]) {
        groupMap[parentTitle] = {
          isGroup: true,
          title: parentTitle,
          icon: parentIcon || "ChatDotRound",
          children: []
        };
        groups.push(groupMap[parentTitle]);
      }
      groupMap[parentTitle].children.push({
        path: item.path,
        title: item.meta?.title as string,
        icon: item.meta?.icon as string
      });
    } else {
      groups.push({
        isGroup: false,
        path: item.path,
        title: item.meta?.title as string,
        icon: item.meta?.icon as string
      });
    }
  });

  return groups;
});
</script>

<style scoped>
.sidebar-container {
  background-color: #304156;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #263445 !important;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  background-color: #1f2d3d !important;
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item:hover) {
  background-color: #001528 !important;
}
</style>
