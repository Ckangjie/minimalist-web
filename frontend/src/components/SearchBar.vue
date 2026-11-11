<template>
  <div class="search-container w-full max-w-760px mx-auto flex flex-col gap-2">
    <!-- 一体化现代化搜索框：告别生硬的表格输入框，采用精致聚合中枢设计 -->
    <div class="search-bar-unified flex items-center w-full px-3 py-1.5 rounded-xl border transition-all duration-200">
      <!-- 前置查询通道选择（基于 Element Plus Dropdown 定制的高端微交互） -->
      <el-dropdown
        trigger="click"
        placement="bottom-start"
        popper-class="channel-dropdown-popper"
        @command="handleEngineSelect"
      >
        <button
          type="button"
          class="channel-trigger flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer select-none transition-colors duration-200"
          aria-label="切换搜索引擎通道"
        >
          <span class="channel-name text-sm font-medium">{{ currentEngine.name }}</span>
          <svg class="chevron-icon w-3.5 h-3.5 transition-transform duration-200" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <template #dropdown>
          <el-dropdown-menu class="channel-menu">
            <el-dropdown-item
              v-for="engine in SEARCH_ENGINES"
              :key="engine.id"
              :command="engine.id"
              class="channel-menu-item flex items-center justify-between"
              :class="{ 'is-active': activeEngineId === engine.id }"
            >
              <div class="flex items-center gap-2">
                <span class="text-sm">{{ engine.icon }}</span>
                <span class="text-sm font-medium">{{ engine.name }}</span>
              </div>
              <span v-if="activeEngineId === engine.id" class="check-icon text-xs font-bold">✓</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 竖向微细分割线 -->
      <div class="channel-divider h-5 w-1px mx-2 flex-shrink-0"></div>

      <!-- 输入框主体 -->
      <div class="search-input-field flex-1 flex items-center min-w-0 pr-1">
        <span class="search-icon mr-2 text-sm select-none opacity-60">🔍</span>
        <input
          ref="inputRef"
          v-model="internalKeyword"
          type="text"
          class="main-search-input flex-1 min-w-0 bg-transparent border-none outline-none text-sm"
          :placeholder="currentPlaceholder"
          @keydown.enter="handleSearch"
        />
        <button
          v-if="hasKeyword"
          type="button"
          class="clear-input-btn w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs cursor-pointer transition-colors duration-200"
          aria-label="清空输入"
          @click="handleClear"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- 实时过滤状态提示（仅在站内筛选且有输入时展示） -->
    <div v-if="isSiteSearch && hasKeyword" class="search-tips px-2 text-xs">
      <span class="tip-active font-medium">
        ✨ 正在实时过滤站内导航
      </span>
    </div>
  </div>
</template>

<script setup>
import { SEARCH_ENGINES } from "@/config/navData";
import { computed, nextTick, ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  }
});

const emit = defineEmits(["update:modelValue"]);

const activeEngineId = ref("site");
const internalKeyword = ref(props.modelValue);
const inputRef = ref(null);

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== internalKeyword.value) {
      internalKeyword.value = newVal;
    }
  }
);

watch(internalKeyword, (val) => {
  if (activeEngineId.value === "site") {
    emit("update:modelValue", val);
  }
});

const hasKeyword = computed(() => {
  return (internalKeyword.value ?? "").trim().length > 0;
});

const isSiteSearch = computed(() => {
  return activeEngineId.value === "site";
});

const currentEngine = computed(() => {
  return SEARCH_ENGINES.find((e) => e.id === activeEngineId.value) ?? SEARCH_ENGINES[0];
});

const currentPlaceholder = computed(() => {
  if (isSiteSearch.value) {
    return currentEngine.value?.placeholder ?? "输入关键词实时过滤导航书签...";
  }
  return `在 ${currentEngine.value.name} 中搜索...`;
});

const handleEngineSelect = (id) => {
  activeEngineId.value = id;
  if (id === "site") {
    emit("update:modelValue", internalKeyword.value);
  }
  nextTick(() => {
    inputRef.value?.focus();
  });
};

const handleClear = () => {
  internalKeyword.value = "";
  emit("update:modelValue", "");
  inputRef.value?.focus();
};

const handleSearch = () => {
  const query = (internalKeyword.value ?? "").trim();
  if (!query) {
    inputRef.value?.focus();
    return;
  }

  if (isSiteSearch.value) {
    emit("update:modelValue", query);
  } else if (currentEngine.value?.url) {
    const targetUrl = `${currentEngine.value.url}${encodeURIComponent(query)}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  }
};
</script>

<style lang="scss" scoped>
.search-bar-unified {
  height: 50px;
  background-color: var(--bg-surface);
  border-color: var(--border-color);
  box-shadow: var(--card-shadow);

  &:hover {
    border-color: var(--primary-color);
  }

  &:focus-within {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-light), 0 4px 16px rgba(59, 130, 246, 0.12);
  }
}

.channel-trigger {
  background: transparent;
  border: none;
  color: var(--text-primary);

  &:hover {
    background-color: var(--bg-surface-soft);
    color: var(--primary-color);
  }

  .chevron-icon {
    color: var(--text-muted);
  }
}

.channel-divider {
  background-color: var(--border-color);
}

.main-search-input {
  color: var(--text-primary);
  font-size: 15px;

  &::placeholder {
    color: var(--text-muted);
  }
}

.clear-input-btn {
  background-color: var(--bg-surface-soft);
  color: var(--text-muted);
  border: none;

  &:hover {
    background-color: var(--border-color);
    color: var(--text-primary);
  }
}

.text-muted {
  color: var(--text-muted);
}

.tip-active {
  color: var(--primary-color);
}
</style>

<style lang="scss">
/* 全局覆盖通道下拉弹层样式，适配亮/暗主题 */
.channel-dropdown-popper {
  border-radius: 12px !important;
  background-color: var(--bg-surface) !important;
  border: 1px solid var(--border-color) !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15) !important;
  padding: 4px !important;

  .el-dropdown-menu {
    background-color: transparent !important;
    padding: 0 !important;
  }

  .channel-menu-item {
    border-radius: 8px !important;
    padding: 9px 14px !important;
    margin: 2px 0 !important;
    color: var(--text-regular) !important;
    transition: all 0.15s ease !important;

    &:hover,
    &:focus {
      background-color: var(--primary-light) !important;
      color: var(--primary-color) !important;
    }

    &.is-active {
      background-color: var(--primary-light) !important;
      color: var(--primary-color) !important;
      font-weight: 600 !important;

      .check-icon {
        color: var(--primary-color);
      }
    }
  }

  .el-popper__arrow::before {
    background-color: var(--bg-surface) !important;
    border-color: var(--border-color) !important;
  }
}
</style>
