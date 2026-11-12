<template>
  <div class="page-container hub-layout min-h-screen flex flex-col transition-colors duration-300">
    <!-- 粘性顶部导航栏（两大顶级大类切换） -->
    <NavBar />

    <div class="hub-wrapper flex-1 w-full max-w-1440px mx-auto px-4 md:px-8 py-6 flex gap-8 items-start relative">
      <!-- PC 端左侧固定粘性侧边栏 (Sidebar)：展示当前大类对应的子分类 -->
      <aside class="hub-sidebar hidden md:flex flex-col w-56 flex-shrink-0 sticky top-[76px] max-h-[calc(100vh-96px)] p-3 rounded-2xl border transition-colors duration-300">
        <div class="sidebar-header pb-2 mb-2 border-b flex items-center justify-between">
          <span class="text-xs font-bold text-muted uppercase tracking-wider">
            {{ currentNavMode === 'system' ? '系统分类' : '收藏目录' }}
          </span>
          <span class="text-xs px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary-color)] font-medium">
            {{ displayCategories.length }}
          </span>
        </div>

        <!-- 侧栏分类滚动锚点列表 -->
        <nav class="sidebar-nav flex-1 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
          <a
            v-for="cat in displayCategories"
            :key="cat.id"
            :href="`#category-${cat.id}`"
            class="sidebar-item flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer"
            :class="{ 'is-active': activeSection === cat.id }"
            @click.prevent="scrollToCategory(cat.id)"
          >
            <span class="truncate flex-1 min-w-0 pr-1">{{ cat.name }}</span>
            <span class="sidebar-item-count text-[11px] opacity-60 flex-shrink-0">
              {{ cat.items.length }}
            </span>
          </a>
        </nav>
      </aside>

      <!-- 右侧主内容区 (Main Content) -->
      <main class="hub-main flex-1 min-w-0 flex flex-col gap-6">
        <!-- 聚合搜索区与轻量书签工具栏 -->
        <section class="search-section w-full flex flex-col gap-2">
          <SearchBar v-model="searchKeyword" />

          <!-- 工具栏：仅在 PC 端展示 -->
          <div class="bookmark-toolbar hidden md:flex items-center justify-between px-1 text-xs">
            <span class="text-muted text-[11px]">
              {{ currentNavMode === 'bookmarks' ? `已载入 ${customCount} 个个人本地书签` : '' }}
            </span>
            <div class="flex items-center gap-3">
              <el-tooltip
                content="快捷键：Ctrl+Shift+O 打开浏览器书签 ➔ 导出书签为 html ➔ 点击此处即可一键导入。"
                placement="top"
                :show-after="200"
              >
                <button
                  type="button"
                  class="toolbar-btn cursor-pointer flex items-center gap-1"
                  @click="triggerImport"
                >
                  <span>导入浏览器收藏夹</span>
                  <span class="help-tip-icon text-[11px] opacity-70">ⓘ</span>
                </button>
              </el-tooltip>

              <template v-if="currentNavMode === 'bookmarks' && customCount > 0">
                <span class="text-muted opacity-40">|</span>
                <button
                  type="button"
                  class="toolbar-btn text-red-400 hover:text-red-500 cursor-pointer"
                  @click="clearCustomBookmarks"
                >
                  清空收藏
                </button>
              </template>
            </div>
          </div>
        </section>

        <!-- 搜索状态与实时统计反馈 -->
        <section v-if="hasActiveSearch" class="search-feedback-section p-3 rounded-lg border">
          <div class="search-feedback-header flex items-center justify-between text-sm">
            <span>
              在当前导航中搜索 "<b>{{ searchKeyword }}</b>" 共有 <b>{{ totalMatchCount }}</b> 个匹配项
            </span>
            <el-button
              type="primary"
              link
              size="small"
              class="clear-search-btn"
              @click="clearSearch"
            >
              清空筛选
            </el-button>
          </div>
        </section>

        <!-- 导航卡片矩阵列表 -->
        <div v-if="hasResults" class="categories-container flex flex-col gap-10">
          <section
            v-for="cat in displayCategories"
            :id="`category-${cat.id}`"
            :key="`${cat.id}-${cat.items.length}`"
            class="category-group flex flex-col gap-4 scroll-mt-20"
          >
            <div class="category-header flex flex-col gap-1">
              <div class="category-info flex items-center gap-2">
                <h2 class="category-title text-base sm:text-lg font-bold m-0">{{ cat.name }}</h2>
                <el-tag size="small" type="info" round class="category-tag">
                  {{ cat.items.length }}
                </el-tag>
              </div>
              <p v-if="cat.description" class="category-desc text-xs m-0">{{ cat.description }}</p>
            </div>

            <!-- UnoCSS 响应式网格切块：移动端双列，桌面端多列自适应 -->
            <div class="cards-grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <NavCard
                v-for="item in cat.items"
                :key="item.id"
                :item="item"
              />
            </div>
          </section>
        </div>

        <!-- 收藏导航为空时的专属引导空状态（仅桌面端展示） -->
        <section
          v-else-if="currentNavMode === 'bookmarks' && !hasActiveSearch && !isMobile"
          class="empty-state flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed gap-4 text-center"
        >
          <div class="text-5xl">📂</div>
          <h3 class="text-base font-semibold m-0">暂无收藏导航数据</h3>
          <p class="empty-text text-xs max-w-400px m-0">
            按快捷键 <kbd class="px-1.5 py-0.5 rounded bg-[var(--bg-surface-soft)] border border-[var(--border-color)]">Ctrl+Shift+O</kbd> 导出浏览器书签 HTML 文件，然后点击下方按钮一键导入！
          </p>
          <el-button type="primary" round @click="triggerImport">
            立即导入浏览器书签
          </el-button>
        </section>

        <!-- 搜索无结果提示 -->
        <section v-else class="empty-state flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed gap-4">
          <div class="text-4xl">🔎</div>
          <p class="empty-text text-sm m-0">未找到与 "{{ searchKeyword }}" 相关的导航站点</p>
          <el-button type="primary" @click="clearSearch">
            重置并查看全部
          </el-button>
        </section>
      </main>
    </div>

    <!-- 页脚与回到顶部 -->
    <TheFooter />
    <BackToTop />

    <!-- 右上角悬挂拟物开关灯泡（现实场景开/关灯交互） -->
    <HangingBulb />

    <!-- 隐藏的本地文件输入器 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".html,.htm"
      style="display: none"
      @change="handleFileSelected"
    />
  </div>
</template>

<script setup>
import { getUserInfo } from "@/api/user";
import BackToTop from "@/components/BackToTop.vue";
import HangingBulb from "@/components/HangingBulb.vue";
import NavCard from "@/components/NavCard.vue";
import SearchBar from "@/components/SearchBar.vue";
import { useBookmarks } from "@/composables/useBookmarks";
import NavBar from "@/layout/NavBar.vue";
import TheFooter from "@/layout/TheFooter.vue";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const USER_NAME_STORAGE_KEY = "cached_user_name";

const {
  currentNavMode,
  activeCategories,
  systemCategories,
  customCount,
  importFromFile,
  clearCustomBookmarks
} = useBookmarks();

const searchKeyword = ref("");
const userName = ref(localStorage.getItem(USER_NAME_STORAGE_KEY) ?? "");
const fileInputRef = ref(null);
const activeSection = ref("");
const isMobile = ref(false);

const updateIsMobile = () => {
  if (typeof window !== "undefined") {
    isMobile.value = window.innerWidth < 768;
  }
};

// 派生搜索过滤后的分类展示数据（移动端固定仅展示系统导航）
const displayCategories = computed(() => {
  const query = searchKeyword.value.trim().toLowerCase();
  const base = isMobile.value ? systemCategories : activeCategories.value;
  if (!query) {
    return base;
  }

  return base
    .map((cat) => {
      const filtered = cat.items.filter((item) => {
        return (
          item.title?.toLowerCase().includes(query) ||
          item.desc?.toLowerCase().includes(query) ||
          item.tag?.toLowerCase().includes(query) ||
          item.url?.toLowerCase().includes(query)
        );
      });
      return {
        ...cat,
        items: filtered
      };
    })
    .filter((cat) => cat.items.length > 0);
});

// 是否处于搜索中状态
const hasActiveSearch = computed(() => {
  return searchKeyword.value.trim().length > 0;
});

// 匹配的总数
const totalMatchCount = computed(() => {
  return displayCategories.value.reduce((total, cat) => total + cat.items.length, 0);
});

// 是否有展示结果
const hasResults = computed(() => {
  return totalMatchCount.value > 0;
});

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = "";
};

const triggerImport = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
    fileInputRef.value.click();
  }
};

const handleFileSelected = (event) => {
  const file = event.target.files?.[0];
  if (file) {
    importFromFile(file);
  }
};

// 侧边栏平滑锚点跳转
let isManualScrolling = false;
let manualScrollTimer = null;

const scrollToCategory = (id) => {
  activeSection.value = id;
  isManualScrolling = true;

  if (manualScrollTimer) {
    clearTimeout(manualScrollTimer);
  }

  const target = document.getElementById(`category-${id}`);
  if (target) {
    const headerOffset = 80;
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }

  const unlock = () => {
    isManualScrolling = false;
    window.removeEventListener("scrollend", unlock);
  };

  if ("onscrollend" in window) {
    window.addEventListener("scrollend", unlock, { once: true });
  }
  manualScrollTimer = setTimeout(unlock, 800);
};

// 视口滚动监听与侧边栏高亮联动
let ticking = false;
const handleScrollSpy = () => {
  if (isManualScrolling) return;

  if (!ticking) {
    window.requestAnimationFrame(() => {
      if (isManualScrolling) {
        ticking = false;
        return;
      }

      const cats = displayCategories.value;
      if (!cats.length) {
        ticking = false;
        return;
      }

      const scrollY = window.scrollY;
      const headerOffset = 90;

      if (window.innerHeight + scrollY >= document.documentElement.scrollHeight - 50) {
        activeSection.value = cats[cats.length - 1].id;
        ticking = false;
        return;
      }

      for (let i = cats.length - 1; i >= 0; i--) {
        const cat = cats[i];
        const el = document.getElementById(`category-${cat.id}`);
        if (el) {
          const top = el.offsetTop - headerOffset;
          if (scrollY >= top - 20) {
            activeSection.value = cat.id;
            ticking = false;
            return;
          }
        }
      }

      activeSection.value = cats[0].id;
      ticking = false;
    });
    ticking = true;
  }
};

// 异步拉取后端用户信息
const loadUserInfo = async () => {
  try {
    const data = await getUserInfo();
    if (data?.name) {
      userName.value = data.name;
      localStorage.setItem(USER_NAME_STORAGE_KEY, data.name);
    }
  } catch (error) {
    console.error("获取用户信息异常:", error);
  }
};

watch(
  () => displayCategories.value,
  (newVal) => {
    if (newVal.length > 0 && !activeSection.value) {
      activeSection.value = newVal[0].id;
    }
  },
  { immediate: true }
);

onMounted(() => {
  updateIsMobile();
  window.addEventListener("resize", updateIsMobile);
  window.addEventListener("scroll", handleScrollSpy, { passive: true });
  handleScrollSpy();
  loadUserInfo();
});

onUnmounted(() => {
  window.removeEventListener("resize", updateIsMobile);
  window.removeEventListener("scroll", handleScrollSpy);
  if (manualScrollTimer) {
    clearTimeout(manualScrollTimer);
  }
});
</script>

<style lang="scss" scoped>
.hub-layout {
  background-color: var(--bg-page);
}

/* 侧边栏样式 */
.hub-sidebar {
  background-color: var(--bg-surface);
  border-color: var(--border-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);

  .sidebar-header {
    border-color: var(--border-color);
  }

  .sidebar-item {
    color: var(--text-regular);
    text-decoration: none;

    &:hover {
      background-color: var(--bg-surface-soft);
      color: var(--primary-color);
    }

    &.is-active {
      background-color: var(--primary-light);
      color: var(--primary-color);
      font-weight: 600;

      .sidebar-item-count {
        opacity: 0.9;
        font-weight: 700;
      }
    }
  }
}

.search-feedback-section {
  background-color: var(--primary-light);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.bookmark-toolbar {
  color: var(--text-muted);

  .toolbar-btn {
    background: transparent;
    border: none;
    padding: 2px 4px;
    font-size: 12px;
    color: var(--text-muted);
    transition: color 0.2s ease;

    &:hover {
      color: var(--primary-color);
    }
  }
}

.category-title {
  color: var(--text-primary);
}

.category-desc {
  color: var(--text-muted);
}

.empty-state {
  background-color: var(--bg-surface);
  border-color: var(--border-color);

  .empty-text {
    color: var(--text-muted);
  }
}

@media (max-width: 768px) {
  .hero-title {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
