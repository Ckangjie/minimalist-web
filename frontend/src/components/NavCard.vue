<template>
  <a
    :href="cardTargetUrl || undefined"
    target="_blank"
    rel="noopener noreferrer"
    class="nav-card flex flex-col gap-2 sm:gap-2.5 p-2.5 sm:p-4 rounded-xl border transition-transform duration-200 relative overflow-hidden select-none"
    @click="handleCardClick"
  >
    <div class="card-header flex items-center gap-2 sm:gap-3 min-w-0">
      <div class="card-icon-box w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
        <span
          v-if="item.icon"
          class="card-custom-icon text-base sm:text-lg select-none leading-none"
        >
          {{ item.icon }}
        </span>
        <span
          v-else-if="hasDownload"
          class="card-custom-icon text-base sm:text-lg select-none leading-none"
        >
          📦
        </span>
        <img
          v-else-if="!hasIconError && faviconUrl"
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

    <p class="card-desc text-[11px] sm:text-xs leading-relaxed m-0 flex-1">{{ item.desc }}</p>

    <!-- 底部操作区：统一放置在卡片底部右侧，彻底释放顶部标题空间 -->
    <div v-if="hasRepo || hasDownload" class="card-actions flex items-center justify-end gap-1.5 pt-1 mt-auto">
      <!-- GitHub 仓库跳转图标链接 -->
      <a
        v-if="hasRepo"
        :href="repoUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="card-github-btn flex items-center justify-center rounded-lg transition-all"
        title="跳转 GitHub 仓库"
        @click.stop
      >
        <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      </a>

      <!-- 纯文字下载按钮（无图标） -->
      <button
        v-if="hasDownload"
        type="button"
        class="card-download-btn flex items-center justify-center text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.8 rounded-lg flex-shrink-0 font-medium cursor-pointer"
        title="下载资源"
        @click.stop.prevent="handleDownload"
      >
        <span>下载</span>
      </button>
    </div>
  </a>
</template>

<script setup>
import { ElMessage } from "element-plus";
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

// 判断是否含有可下载资源
const hasDownload = computed(() => {
  if (props.item.downloadUrl || props.item.isZip === true || props.item.type === "zip" || props.item.downloadName) {
    return true;
  }
  const tag = (props.item.tag ?? "").toLowerCase();
  if (tag === "zip" || tag === "exe" || tag === "下载" || tag === "apk" || tag === "dmg") {
    return true;
  }
  const url = (props.item.url ?? "").toLowerCase();
  const cleanUrl = url.split("?")[0].split("#")[0];
  return (
    cleanUrl.endsWith(".zip") ||
    cleanUrl.endsWith(".exe") ||
    cleanUrl.endsWith(".apk") ||
    cleanUrl.endsWith(".dmg") ||
    cleanUrl.endsWith(".rar") ||
    cleanUrl.endsWith(".7z")
  );
});

// 计算下载文件路径
const downloadUrl = computed(() => {
  if (props.item.downloadUrl) {
    return props.item.downloadUrl;
  }
  const url = props.item.url ?? "";
  const cleanUrl = url.split("?")[0].split("#")[0].toLowerCase();
  if (
    cleanUrl.endsWith(".zip") ||
    cleanUrl.endsWith(".exe") ||
    cleanUrl.endsWith(".apk") ||
    cleanUrl.endsWith(".dmg") ||
    cleanUrl.endsWith(".rar") ||
    cleanUrl.endsWith(".7z")
  ) {
    return url;
  }
  return "";
});

// 计算仓库地址（仅当明确提供 repoUrl 或 url 指向 github 时生效）
const repoUrl = computed(() => {
  if (props.item.repoUrl) {
    return props.item.repoUrl;
  }
  const url = props.item.url ?? "";
  if (url.includes("github.com")) {
    return url;
  }
  return "";
});

// 是否展示 GitHub 仓库入口
const hasRepo = computed(() => {
  return Boolean(repoUrl.value);
});

// 卡片主跳转地址（点击卡片优先跳转仓库或项目主页，绝不触发下载）
const cardTargetUrl = computed(() => {
  if (repoUrl.value) {
    return repoUrl.value;
  }
  const rawUrl = props.item.url ?? "";
  const clean = rawUrl.split("?")[0].split("#")[0].toLowerCase();
  const isFile =
    clean.endsWith(".zip") ||
    clean.endsWith(".exe") ||
    clean.endsWith(".apk") ||
    clean.endsWith(".dmg") ||
    clean.endsWith(".rar") ||
    clean.endsWith(".7z") ||
    clean.startsWith("/resources/");
  if (isFile) {
    return "";
  }
  return rawUrl;
});

// 计算下载保存文件名
const downloadFileName = computed(() => {
  if (!hasDownload.value) return "";
  if (props.item.downloadName) {
    return props.item.downloadName;
  }
  try {
    const target = downloadUrl.value || props.item.url || "";
    const clean = target.split("?")[0].split("#")[0];
    const fileName = clean.substring(clean.lastIndexOf("/") + 1);
    if (fileName && fileName.includes(".")) {
      return decodeURIComponent(fileName);
    }
  } catch {
    // 忽略解析异常
  }
  return `${props.item.title || "resource"}`;
});

// 独立处理下载操作
const handleDownload = (event) => {
  event?.stopPropagation?.();
  event?.preventDefault?.();

  const target = downloadUrl.value;
  if (!target) {
    ElMessage.warning("未配置有效的下载资源路径");
    return;
  }

  const link = document.createElement("a");
  link.href = target;
  if (downloadFileName.value) {
    link.download = downloadFileName.value;
    link.setAttribute("download", downloadFileName.value);
  }
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  ElMessage.success(`开始下载：${props.item.title}`);
};

// 点击卡片本体：若无有效外链则阻止默认行为，绝不触发下载
const handleCardClick = (event) => {
  if (!cardTargetUrl.value) {
    event.preventDefault();
  }
};

// 提取域名并获取 Favicon
const faviconUrl = computed(() => {
  try {
    const rawUrl = repoUrl.value || props.item.url || "";
    const domain = new URL(rawUrl).hostname;
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

    .card-download-btn {
      border-color: var(--primary-color);
    }

    .card-github-btn {
      border-color: var(--primary-color);
      color: var(--text-primary);
    }
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

.card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.card-github-btn {
  width: 26px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  background-color: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-primary);
    background-color: var(--border-color);
    border-color: var(--text-muted);
    transform: scale(1.08);
  }

  &:active {
    transform: scale(0.95);
  }
}

.card-download-btn {
  color: var(--primary-color);
  background-color: var(--primary-light);
  border: 1px solid var(--border-color);
  height: 24px;
  line-height: 1;
  outline: none;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--primary-color);
    color: #ffffff;
    border-color: var(--primary-color);
    transform: scale(1.04);
  }

  &:active {
    transform: scale(0.96);
  }
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
