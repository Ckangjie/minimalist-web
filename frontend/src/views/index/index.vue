<template>
  <div class="page-container hub-layout min-h-screen flex flex-col transition-colors duration-300">
    <!-- 粘性顶部导航栏 -->
    <NavBar />

    <main class="hub-main flex-1 w-full max-w-1200px mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
      <!-- 聚合搜索区 -->
      <section class="search-section w-full pt-2 pb-1">
        <SearchBar v-model="searchKeyword" />
      </section>

      <!-- 搜索状态与实时统计反馈 -->
      <section v-if="hasActiveSearch" class="search-feedback-section p-3 rounded-lg border">
        <div class="search-feedback-header flex items-center justify-between text-sm">
          <span>
            搜索 "<b>{{ searchKeyword }}</b>" 共有 <b>{{ totalMatchCount }}</b> 个匹配项
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
          :key="cat.id"
          class="category-group flex flex-col gap-4"
        >
          <div class="category-header flex flex-col gap-1">
            <div class="category-info flex items-center gap-2">
              <h2 class="category-title text-lg font-bold m-0">{{ cat.name }}</h2>
              <el-tag size="small" type="info" round class="category-tag">
                {{ cat.items.length }}
              </el-tag>
            </div>
            <p class="category-desc text-xs m-0">{{ cat.description }}</p>
          </div>

          <!-- UnoCSS 响应式网格切块：移动端双列精致布局，大屏自适应多列 -->
          <div class="cards-grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <NavCard
              v-for="item in cat.items"
              :key="item.id"
              :item="item"
            />
          </div>
        </section>
      </div>

      <!-- 空结果提示 -->
      <section v-else class="empty-state flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-dashed gap-4">
        <div class="text-4xl">🔎</div>
        <p class="empty-text text-sm m-0">未找到与 "{{ searchKeyword }}" 相关的导航站点</p>
        <el-button type="primary" @click="clearSearch">
          重置并查看全部书签
        </el-button>
      </section>
    </main>

    <!-- 页脚与回到顶部 -->
    <TheFooter />
    <BackToTop />
  </div>
</template>

<script setup>
import { getUserInfo } from "@/api/user";
import BackToTop from "@/components/BackToTop.vue";
import NavCard from "@/components/NavCard.vue";
import SearchBar from "@/components/SearchBar.vue";
import { DEFAULT_NAV_CATEGORIES } from "@/config/navData";
import NavBar from "@/layout/NavBar.vue";
import TheFooter from "@/layout/TheFooter.vue";
import { computed, onMounted, ref } from "vue";

const USER_NAME_STORAGE_KEY = "cached_user_name";

const searchKeyword = ref("");
const userName = ref(localStorage.getItem(USER_NAME_STORAGE_KEY) ?? "");

// 派生搜索过滤后的分类展示数据
const displayCategories = computed(() => {
  const query = searchKeyword.value.trim().toLowerCase();
  if (!query) {
    return DEFAULT_NAV_CATEGORIES;
  }

  return DEFAULT_NAV_CATEGORIES
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

// 异步拉取后端用户信息（云端 D1 数据库集成）
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

onMounted(() => {
  loadUserInfo();
});
</script>

<style lang="scss" scoped>
.hub-layout {
  background-color: var(--bg-page);
}

.search-feedback-section {
  background-color: var(--primary-light);
  border-color: var(--border-color);
  color: var(--text-primary);
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
