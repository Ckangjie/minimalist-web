<template>
  <aside
    class="sidebar-container flex flex-col flex-shrink-0 transition-all duration-300 h-full overflow-hidden"
    :style="{ width: isCollapse ? '64px' : '210px' }"
  >
    <!-- 顶部 Logo 标识（无独立背景色，与侧边栏融为一体） -->
    <div class="logo-box h-50px flex items-center px-4 gap-2.5 flex-shrink-0 overflow-hidden">
      <!-- Jie Hub + Code 专属 SVG Logo -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        fill="none"
        class="w-6 h-6 flex-shrink-0"
      >
        <defs>
          <linearGradient id="sidebar-logo-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00F2FE" />
            <stop offset="100%" stop-color="#38BDF8" />
          </linearGradient>
          <linearGradient id="sidebar-logo-j" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#38BDF8" />
            <stop offset="50%" stop-color="#6366F1" />
            <stop offset="100%" stop-color="#8B5CF6" />
          </linearGradient>
          <linearGradient id="sidebar-logo-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#8B5CF6" />
            <stop offset="100%" stop-color="#F43F5E" />
          </linearGradient>
          <filter id="sidebar-logo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#38BDF8" flood-opacity="0.3" />
          </filter>
        </defs>

        <g filter="url(#sidebar-logo-glow)">
          <!-- 左侧代码开括号 < (Code) -->
          <path
            d="M 28 26 L 12 48 L 28 70"
            stroke="url(#sidebar-logo-left)"
            stroke-width="7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- 中间大写 J 骨干与 Hub 枢纽主干 -->
          <path
            d="M 44 20 L 62 20"
            stroke="url(#sidebar-logo-j)"
            stroke-width="7"
            stroke-linecap="round"
          />
          <path
            d="M 62 20 L 62 58 C 62 70 52 80 40 80 C 33 80 30 75 32 68"
            stroke="url(#sidebar-logo-j)"
            stroke-width="7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Hub 枢纽连接纽带 / 命令行倾斜分割 -->
          <path
            d="M 70 32 L 56 66"
            stroke="url(#sidebar-logo-j)"
            stroke-width="4.5"
            stroke-linecap="round"
            opacity="0.75"
          />

          <!-- 右侧代码闭标签 > (Code) -->
          <path
            d="M 74 34 L 88 48 L 74 62"
            stroke="url(#sidebar-logo-right)"
            stroke-width="6.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

          <!-- Hub 核心网络节点光点 -->
          <circle cx="62" cy="20" r="2.5" fill="#00F2FE" />
          <circle cx="32" cy="68" r="2" fill="#8B5CF6" />
        </g>
      </svg>
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
