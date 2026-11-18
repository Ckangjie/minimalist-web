<template>
  <header class="navbar h-50px bg-white border-b border-[#e6ebf5] flex items-center justify-between px-4 sticky top-0 z-40 shadow-sm flex-shrink-0">
    <!-- 左侧折叠按钮与动态面包屑（直接读取路由 meta 定义） -->
    <div class="flex items-center gap-3">
      <el-icon
        class="hamburger cursor-pointer text-[#5a5e66] hover:text-[#409eff] text-lg"
        @click="emit('toggleCollapse')"
      >
        <component :is="isCollapse ? Expand : Fold" />
      </el-icon>

      <el-breadcrumb separator="/" class="text-xs">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="breadcrumbs.parent">{{ breadcrumbs.parent }}</el-breadcrumb-item>
        <el-breadcrumb-item v-if="breadcrumbs.current && route.path !== '/dashboard'">
          {{ breadcrumbs.current }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧用户下拉（已移除前台入口） -->
    <div class="flex items-center gap-4 text-xs">
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-avatar-wrapper flex items-center gap-2 cursor-pointer">
          <el-avatar :size="30" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          <span class="text-xs text-[#606266] font-medium hidden sm:inline">{{ userInfo.nickName || '管理员' }}</span>
          <el-icon class="text-xs text-[#909399]"><CaretBottom /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { Fold, Expand, CaretBottom } from "@element-plus/icons-vue";

defineProps<{
  isCollapse: boolean;
}>();

const emit = defineEmits<{
  (e: "toggleCollapse"): void;
}>();

const route = useRoute();
const router = useRouter();

const userInfo = ref<{ nickName?: string; userName?: string }>({
  nickName: "站长管理员",
  userName: "admin"
});

// 动态读取路由元信息生成面包屑
const breadcrumbs = computed(() => {
  return {
    parent: (route.meta?.parentTitle as string) || "",
    current: (route.meta?.title as string) || ""
  };
});

const handleCommand = (command: string) => {
  if (command === "logout") {
    ElMessageBox.confirm("确定要退出当前管理后台系统吗？", "提示", {
      confirmButtonText: "确定退出",
      cancelButtonText: "取消",
      type: "warning"
    }).then(() => {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      ElMessage.success("已成功退出登录");
      router.push("/login");
    }).catch(() => {});
  } else if (command === "profile") {
    ElMessage.info("当前登录管理员：admin（最高站长权限）");
  }
};

onMounted(() => {
  const savedUser = localStorage.getItem("admin_user");
  if (savedUser) {
    try {
      userInfo.value = JSON.parse(savedUser);
    } catch {}
  }
});
</script>
