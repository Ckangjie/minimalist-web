<template>
  <div class="tags-view-container h-34px bg-white border-b border-[#d8dce5] flex items-center px-4 gap-2 text-xs shadow-xs flex-shrink-0">
    <router-link
      v-for="item in tagList"
      :key="item.path"
      :to="'/' + item.path"
      class="tag-item px-3 py-1 rounded text-xs border transition-all flex items-center gap-1.5 no-underline"
      :class="route.path === '/' + item.path ? 'is-active' : ''"
    >
      <span v-if="route.path === '/' + item.path" class="active-dot"></span>
      <span>{{ item.meta?.title }}</span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const tagList = computed(() => {
  const layoutRoute = router.options.routes.find((r) => r.path === "/");
  const children = layoutRoute?.children || [];
  return children.filter((c) => c.meta?.title && !c.meta?.hidden);
});
</script>

<style scoped>
.tags-view-container .tag-item {
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
}
</style>
