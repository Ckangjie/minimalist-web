<template>
  <div class="tags-view-container h-34px bg-white border-b border-[#d8dce5] flex items-center px-3 shadow-xs flex-shrink-0 select-none overflow-hidden">
    <el-scrollbar class="w-full flex-1" view-class="flex items-center gap-1.5 h-34px">
      <router-link
        v-for="item in visitedViews"
        :key="item.path"
        :to="item.path"
        class="tag-item px-2.5 py-0.5 rounded text-xs border transition-all flex items-center gap-1.5 no-underline flex-shrink-0"
        :class="{ 'is-active': route.path === item.path }"
      >
        <span v-if="route.path === item.path" class="active-dot"></span>
        <span class="tag-title">{{ item.title }}</span>
        <!-- 关闭按钮：常驻首页不显示关闭图标 -->
        <span
          v-if="!item.affix"
          class="close-btn flex items-center justify-center rounded-full transition-all"
          title="关闭"
          @click.prevent.stop="closeTag(item)"
        >
          <el-icon :size="11"><Close /></el-icon>
        </span>
      </router-link>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Close } from "@element-plus/icons-vue";

export interface TagViewItem {
  path: string;
  title: string;
  affix?: boolean;
}

const route = useRoute();
const router = useRouter();

// 默认常驻首页控制台
const visitedViews = ref<TagViewItem[]>([
  { path: "/dashboard", title: "首页控制台", affix: true }
]);

// 添加当前路由对应的页签
const addTag = () => {
  const { path, meta } = route;
  if (!meta?.title || meta.hidden || path === "/login") return;

  const title = (meta.title as string) || "未命名";
  const isAffix = path === "/dashboard";
  const exists = visitedViews.value.some((tag) => tag.path === path);

  if (!exists) {
    visitedViews.value.push({
      path,
      title,
      affix: isAffix
    });
  }
};

// 关闭页签
const closeTag = (view: TagViewItem) => {
  if (view.affix) return;

  const idx = visitedViews.value.findIndex((tag) => tag.path === view.path);
  if (idx < 0) return;

  const isCurrentActive = route.path === view.path;
  visitedViews.value.splice(idx, 1);

  // 如果关闭的是当前激活页签，自动导航至临近页签
  if (isCurrentActive) {
    const nextTag = visitedViews.value[idx] || visitedViews.value[idx - 1] || visitedViews.value[0];
    if (nextTag) {
      router.push(nextTag.path);
    } else {
      router.push("/dashboard");
    }
  }
};

watch(
  () => route.path,
  () => {
    addTag();
  },
  { immediate: true }
);

onMounted(() => {
  addTag();
});
</script>

<style scoped>
.tags-view-container .tag-item {
  height: 24px;
  line-height: 24px;
  color: #495060;
  background: #fff;
  border-color: #d8dce5;
}

.tags-view-container .tag-item:hover {
  color: #409eff;
}

.tags-view-container .tag-item.is-active {
  background-color: #409eff;
  color: #fff;
  border-color: #409eff;
}

.tags-view-container .tag-item.is-active:hover {
  color: #fff;
}

.tags-view-container .active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  display: inline-block;
  flex-shrink: 0;
}

.close-btn {
  width: 14px;
  height: 14px;
  line-height: 14px;
  border-radius: 50%;
  text-align: center;
  margin-left: 2px;
}

.tag-item .close-btn:hover {
  background-color: #b4bccc;
  color: #fff;
}

.tag-item.is-active .close-btn:hover {
  background-color: rgba(255, 255, 255, 0.35);
  color: #fff;
}
</style>
