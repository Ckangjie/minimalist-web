<template>
  <a
    :href="item.url"
    target="_blank"
    rel="noopener noreferrer"
    class="nav-card flex flex-col gap-2 sm:gap-2.5 p-2.5 sm:p-4 rounded-xl border transition-transform duration-200 relative overflow-hidden select-none"
  >
    <div class="card-header flex items-center gap-2 sm:gap-3 min-w-0">
      <div class="card-icon-box w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
        <img
          v-if="!hasIconError"
          :src="faviconUrl"
          :alt="item.title"
          class="card-favicon w-5 h-5 sm:w-6 sm:h-6 object-contain block"
          loading="lazy"
          @error="handleIconError"
        />
        <div
          v-else
          class="card-letter-avatar w-full h-full flex items-center justify-center text-white font-bold text-xs sm:text-base select-none"
          :style="{ backgroundColor: avatarBgColor }"
        >
          {{ firstLetter }}
        </div>
      </div>

      <div class="card-title-group flex-1 min-w-0 flex items-center gap-1 sm:gap-1.5">
        <span class="card-title font-semibold text-xs sm:text-sm truncate">{{ item.title }}</span>
        <span v-if="item.tag" class="card-tag text-[10px] sm:text-xs px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded flex-shrink-0 max-w-14 sm:max-w-none truncate">
          {{ item.tag }}
        </span>
      </div>
    </div>

    <p class="card-desc text-[11px] sm:text-xs leading-relaxed m-0">{{ item.desc }}</p>
  </a>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
});

const hasIconError = ref(false);

const handleIconError = () => {
  hasIconError.value = true;
};

// 提取域名并获取 Favicon
const faviconUrl = computed(() => {
  try {
    const domain = new URL(props.item.url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  } catch {
    return "";
  }
});

// 首字母提取
const firstLetter = computed(() => {
  return (props.item.title?.trim()?.[0] ?? "J").toUpperCase();
});

// 根据标题哈希生成确定性的头像背景色
const avatarBgColor = computed(() => {
  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#6366f1"
  ];
  let hash = 0;
  const str = props.item.title ?? "";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
});
</script>

<style lang="scss" scoped>
.nav-card {
  background-color: var(--bg-card);
  border-color: var(--border-color);
  box-shadow: var(--card-shadow);

  &:hover {
    transform: translateY(-3px);
    border-color: var(--primary-color);
    box-shadow: var(--card-shadow-hover);
  }

  &:active {
    transform: scale(0.98);
  }
}

.card-icon-box {
  background-color: var(--bg-surface-soft);
}

.card-title {
  color: var(--text-primary);
}

.card-tag {
  color: var(--text-muted);
  background-color: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
}

.card-desc {
  color: var(--text-regular);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}
</style>
