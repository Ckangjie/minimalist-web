<template>
  <div class="app-container flex-1 flex gap-3 min-h-0">
    <!-- 左栏：分类列表 -->
    <el-card shadow="never" class="category-card !rounded-xl border border-[#e4e7ed] flex flex-col min-h-0" style="width: 320px; flex-shrink: 0;">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-bold text-sm">导航分类</span>
          <el-button type="primary" plain :icon="Plus" @click="openAddCategory">新增分类</el-button>
        </div>
      </template>
      <div v-loading="isCatLoading" class="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <div
          v-for="cat in categories"
          :key="cat.id"
          class="category-item flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer mb-1 transition-all"
          :class="{ 'is-active': selectedCatId === cat.id }"
          @click="selectCategory(cat)"
        >
          <div class="min-w-0">
            <div class="text-sm font-medium truncate">{{ cat.name }}</div>
            <div class="text-xs text-gray-400 truncate">{{ cat.slug }}</div>
          </div>
          <div class="flex items-center gap-1 flex-shrink-0 ml-2">
            <el-tag type="info" class="!text-xs">{{ cat.itemCount ?? 0 }}</el-tag>
            <el-button link type="primary" :icon="Edit" @click.stop="openEditCategory(cat)" />
            <el-popconfirm
              title="确定删除该分类及其全部条目？"
              confirm-button-text="删除"
              cancel-button-text="取消"
              confirm-button-type="danger"
              @confirm="handleDeleteCategory(cat)"
            >
              <template #reference>
                <el-button link type="danger" :icon="Delete" @click.stop />
              </template>
            </el-popconfirm>
          </div>
        </div>
        <div v-if="!isCatLoading && categories.length === 0" class="flex-1 flex items-center justify-center">
          <el-empty description="暂无分类" :image-size="60" class="compact-empty" />
        </div>
      </div>
    </el-card>

    <!-- 右栏：条目列表 -->
    <div class="flex-1 flex flex-col gap-3 min-h-0">
      <!-- 顶部筛选表单区 -->
      <el-card shadow="never" class="filter-card !rounded-xl border border-[#e4e7ed] flex-shrink-0">
        <el-form :inline="true" class="filter-form flex flex-wrap items-center">
          <el-form-item label="关键词">
            <el-input
              v-model="itemKeyword"
              placeholder="搜索标题 / 链接 / slug"
              clearable
              class="!w-60"
              @keyup.enter="handleSearchItem"
              @clear="handleSearchItem"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :icon="Search" :loading="isItemLoading" @click="handleSearchItem">
              搜索
            </el-button>
            <el-button :icon="Refresh" @click="handleResetItem">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 数据表格卡片 -->
      <el-card shadow="never" class="table-card !rounded-xl border border-[#e4e7ed] flex-1 flex flex-col min-h-0">
        <div class="flex items-center justify-between mb-3 flex-shrink-0">
          <div class="flex items-center gap-2">
            <el-button
              type="primary"
              plain
              :icon="Plus"
              :disabled="!selectedCatId"
              @click="openAddItem"
            >
              新增条目
            </el-button>
            <el-button
              type="danger"
              plain
              :icon="Delete"
              :loading="isBatchDeleting"
              :disabled="selectedIds.length === 0"
              @click="handleBatchDelete"
            >
              批量删除 ({{ selectedIds.length }})
            </el-button>
            <el-button
              type="warning"
              plain
              :icon="Upload"
              @click="isImportDialogOpen = true"
            >
              批量导入
            </el-button>
            <el-button
              type="primary"
              plain
              :icon="Refresh"
              :loading="isItemLoading"
              :disabled="!selectedCatId"
              @click="fetchItems()"
            >
              刷新数据
            </el-button>
            <span class="text-xs text-gray-400">（共 {{ itemTotal }} 条记录）</span>
          </div>
        </div>

        <div v-if="!selectedCatId" class="flex-1 flex flex-col items-center justify-center">
          <el-empty description="请点击左侧分类查看其导航条目" :image-size="70" class="compact-empty">
            <el-button
              type="warning"
              plain
              :icon="Upload"
              @click="isImportDialogOpen = true"
            >
              批量导入导航数据
            </el-button>
          </el-empty>
        </div>

        <div v-else class="flex-1 min-h-0 flex flex-col">
          <!-- 表格内容 -->
          <div class="flex-1 min-h-0">
            <el-table
              v-loading="isItemLoading"
              :data="items"
              height="100%"
              stripe
              border
              class="w-full"
              @selection-change="handleSelectionChange"
            >
              <el-table-column type="selection" width="48" align="center" />
              <el-table-column prop="sortOrder" label="排序" width="60" align="center" />
              <el-table-column label="标题 / 标识" min-width="150">
                <template #default="{ row }">
                  <div class="font-medium text-sm">{{ row.title }}</div>
                  <div class="text-xs text-gray-400">{{ row.slug }}</div>
                </template>
              </el-table-column>
              <el-table-column label="链接" min-width="200">
                <template #default="{ row }">
                  <a :href="row.url" target="_blank" rel="noopener" class="text-xs text-blue-600 hover:underline truncate block max-w-xs">
                    {{ row.url }}
                  </a>
                </template>
              </el-table-column>
              <el-table-column prop="desc" label="描述" min-width="180" show-overflow-tooltip>
                <template #default="{ row }">{{ row.desc || '—' }}</template>
              </el-table-column>
              <el-table-column prop="tag" label="标签" width="80" align="center">
                <template #default="{ row }">
                  <el-tag v-if="row.tag">{{ row.tag }}</el-tag>
                  <span v-else class="text-gray-400">—</span>
                </template>
              </el-table-column>
              <el-table-column label="可见" width="70" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.isVisible ? 'success' : 'info'">{{ row.isVisible ? '显示' : '隐藏' }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button type="primary" link @click="openEditItem(row)">编辑</el-button>
                  <el-popconfirm
                    title="确定删除该条目？"
                    confirm-button-text="删除"
                    cancel-button-text="取消"
                    confirm-button-type="danger"
                    @confirm="handleDeleteItem(row)"
                  >
                    <template #reference>
                      <el-button type="danger" link>删除</el-button>
                    </template>
                  </el-popconfirm>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 条目分页栏 -->
          <div class="flex justify-end mt-3 flex-shrink-0">
            <el-pagination
              v-model:current-page="itemPage"
              v-model:page-size="itemPageSize"
              :total="itemTotal"
              :page-sizes="[10, 20, 50]"
              background
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleItemSizeChange"
              @current-change="handleItemCurrentChange"
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 分类编辑弹窗 -->
    <el-dialog
      v-model="isCatDialogOpen"
      :title="catDialogTitle"
      width="460px"
      destroy-on-close
      @closed="catFormRef?.resetFields()"
    >
      <el-form ref="catFormRef" :model="catForm" :rules="catRules" label-position="top">
        <el-form-item label="分类标识 (slug)" prop="slug">
          <el-input v-model.trim="catForm.slug" placeholder="英文连字符格式，如：dev-tools" maxlength="50" />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model.trim="catForm.name" maxlength="30" placeholder="如：开发工具" />
        </el-form-item>
        <el-form-item label="分类描述 (选填)">
          <el-input v-model.trim="catForm.description" type="textarea" :rows="2" maxlength="100" placeholder="简短描述该分类" />
        </el-form-item>
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="排序权重 (越大越靠前)">
            <el-input-number v-model="catForm.sortOrder" :min="0" :max="999" class="!w-full" />
          </el-form-item>
          <el-form-item label="是否可见">
            <el-switch v-model="catForm.isVisible" active-text="显示" inactive-text="隐藏" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="isCatDialogOpen = false">取消</el-button>
          <el-button type="primary" :loading="isSubmitting" @click="confirmSaveCategory">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 条目编辑弹窗 -->
    <el-dialog
      v-model="isItemDialogOpen"
      :title="itemDialogTitle"
      width="520px"
      destroy-on-close
      @closed="itemFormRef?.resetFields()"
    >
      <el-form ref="itemFormRef" :model="itemForm" :rules="itemRules" label-position="top">
        <el-form-item label="所属分类" prop="categoryId">
          <el-select v-model="itemForm.categoryId" placeholder="请选择所属分类" class="!w-full">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="条目标识 (slug)" prop="slug">
          <el-input v-model.trim="itemForm.slug" placeholder="英文连字符格式，如：github" maxlength="50" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model.trim="itemForm.title" maxlength="50" placeholder="如：GitHub" />
        </el-form-item>
        <el-form-item label="链接地址" prop="url">
          <el-input v-model.trim="itemForm.url" placeholder="必须以 https 或 http 开头" />
        </el-form-item>
        <el-form-item label="描述 (选填)">
          <el-input v-model.trim="itemForm.desc" type="textarea" :rows="2" maxlength="200" />
        </el-form-item>
        <el-form-item label="标签 (选填)">
          <el-input v-model.trim="itemForm.tag" maxlength="10" placeholder="如：代码" />
        </el-form-item>
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="排序权重">
            <el-input-number v-model="itemForm.sortOrder" :min="0" :max="999" class="!w-full" />
          </el-form-item>
          <el-form-item label="是否可见">
            <el-switch v-model="itemForm.isVisible" active-text="显示" inactive-text="隐藏" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="isItemDialogOpen = false">取消</el-button>
          <el-button type="primary" :loading="isSubmitting" @click="confirmSaveItem">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog v-model="isImportDialogOpen" title="批量导入导航数据" width="680px" destroy-on-close>
      <div class="flex flex-col gap-3">
        <el-alert type="info" show-icon :closable="false">
          <template #title>
            粘贴标准的导航分类 JSON 数组（含 id/slug、name、items 等字段），或上传 JSON 文件。对已存在 slug 的分类/条目执行更新，新 slug 自动插入。
          </template>
        </el-alert>
        <div class="flex items-center gap-2">
          <el-button :icon="Upload" @click="triggerFileInput">上传 JSON 文件</el-button>
          <el-button @click="loadExampleJson">填入示例模板</el-button>
          <span class="text-xs text-gray-400">或在下方直接粘贴 JSON</span>
          <input ref="fileInputRef" type="file" accept=".json" style="display:none" @change="handleFileSelected" />
        </div>
        <el-input
          v-model="importJson"
          type="textarea"
          :rows="12"
          placeholder='[{"id":"dev-tools","name":"开发工具","description":"...","items":[{"id":"github","title":"GitHub","url":"https://github.com","desc":"...","tag":"代码"}]}]'
          class="font-mono text-xs"
        />
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="isImportDialogOpen = false">取消</el-button>
          <el-button type="primary" :loading="isImporting" @click="confirmImport">开始导入</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRef, onMounted, nextTick } from "vue";
import { Search, Refresh, Plus, Edit, Delete, Upload } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from "element-plus";
import {
  listNavCategories, createNavCategory, updateNavCategory, deleteNavCategory,
  getNavItems, createNavItem, updateNavItem, deleteNavItem, batchDeleteNavItems, batchImportNav,
  type NavCategory, type NavItem
} from "@/api/nav";
import { usePagination } from "@/hooks/usePagination";

// 分类列表
const isCatLoading = ref(false);
const categories = ref<NavCategory[]>([]);

// 选中分类
const selectedCatId = ref<number | null>(null);

// 条目列表与分页（使用公共 usePagination hook）
const {
  isLoading: isItemLoading,
  tableData: items,
  total: itemTotal,
  pageNum: itemPage,
  pageSize: itemPageSize,
  searchParams: itemSearchParams,
  fetchData: fetchItems,
  handleSearch: handleSearchItem,
  handleReset: handleResetItem,
  handlePageChange: handleItemCurrentChange,
  handleSizeChange: handleItemSizeChange,
  handleDeleteRefresh: handleItemDeleteRefresh
} = usePagination<NavItem>({
  immediate: false,
  defaultParams: {
    keyword: ""
  },
  fetchApi: async (params) => {
    if (!selectedCatId.value) return { list: [], total: 0 };
    return getNavItems(selectedCatId.value, {
      keyword: params.keyword,
      pageNum: params.pageNum,
      pageSize: params.pageSize
    });
  },
  errorMessage: "获取条目失败"
});

const itemKeyword = toRef(itemSearchParams, "keyword");
const selectedIds = ref<number[]>([]);
const isBatchDeleting = ref(false);

const isSubmitting = ref(false);

// 分类弹窗
const isCatDialogOpen = ref(false);
const catDialogTitle = ref("新增分类");
const catFormRef = ref<FormInstance>();
const catForm = reactive<Partial<NavCategory>>({
  id: 0, slug: "", name: "", description: "", sortOrder: 0, isVisible: true
});
const catRules: FormRules = {
  slug: [
    { required: true, message: "请输入分类标识", trigger: "blur" },
    { pattern: /^[a-zA-Z0-9-]+$/, message: "只允许字母、数字和连字符", trigger: "blur" }
  ],
  name: [{ required: true, message: "请输入分类名称", trigger: "blur" }]
};

// 条目弹窗
const isItemDialogOpen = ref(false);
const itemDialogTitle = ref("新增条目");
const itemFormRef = ref<FormInstance>();
let originalItemCategoryId: number | undefined;
const itemForm = reactive<Partial<NavItem>>({
  id: 0, categoryId: 0, slug: "", title: "", url: "", desc: "", tag: "", sortOrder: 0, isVisible: true
});
const itemRules: FormRules = {
  categoryId: [{ required: true, message: "请选择所属分类", trigger: "change" }],
  slug: [
    { required: true, message: "请输入条目标识", trigger: "blur" },
    { pattern: /^[a-zA-Z0-9-]+$/, message: "只允许字母、数字和连字符", trigger: "blur" }
  ],
  title: [{ required: true, message: "请输入标题", trigger: "blur" }],
  url: [
    { required: true, message: "请输入链接", trigger: "blur" },
    { pattern: /^https?:\/\/.+/i, message: "链接必须以 http:// 或 https:// 开头", trigger: "blur" }
  ]
};

// 批量导入
const isImportDialogOpen = ref(false);
const isImporting = ref(false);
const importJson = ref("");
const fileInputRef = ref<HTMLInputElement>();

const fetchCategories = async ({ refreshItems = false } = {}) => {
  isCatLoading.value = true;
  try {
    const res: any = await listNavCategories({
      pageNum: 1,
      pageSize: 1000
    });
    if (res?.list) {
      categories.value = res.list;

      const targetCat = categories.value.find((cat) => cat.id === selectedCatId.value) ?? categories.value[0];
      if (!targetCat) {
        selectedCatId.value = null;
        items.value = [];
        itemTotal.value = 0;
        selectedIds.value = [];
      } else if (targetCat.id !== selectedCatId.value || refreshItems) {
        await selectCategory(targetCat);
      }
    }
  } catch (err: any) {
    ElMessage.error(err?.message || "获取分类列表失败");
  } finally {
    isCatLoading.value = false;
  }
};

const selectCategory = async (cat: NavCategory) => {
  if (selectedCatId.value !== cat.id) {
    selectedCatId.value = cat.id;
    itemPage.value = 1;
    itemKeyword.value = "";
    selectedIds.value = [];
  }
  await fetchItems();
};

// 分类操作
const openAddCategory = () => {
  Object.assign(catForm, { id: 0, slug: "", name: "", description: "", sortOrder: 0, isVisible: true });
  catDialogTitle.value = "新增分类";
  isCatDialogOpen.value = true;
  nextTick(() => catFormRef.value?.clearValidate());
};

const openEditCategory = (cat: NavCategory) => {
  Object.assign(catForm, { ...cat });
  catDialogTitle.value = "编辑分类";
  isCatDialogOpen.value = true;
  nextTick(() => catFormRef.value?.clearValidate());
};

const confirmSaveCategory = async () => {
  if (!catFormRef.value) return;
  await catFormRef.value.validate(async (valid) => {
    if (!valid) return;
    isSubmitting.value = true;
    try {
      if (catForm.id) {
        await updateNavCategory(catForm.id, catForm);
        ElMessage.success("修改成功");
      } else {
        await createNavCategory(catForm);
        ElMessage.success("新增分类成功");
      }
      isCatDialogOpen.value = false;
      fetchCategories();
    } catch (err: any) {
      ElMessage.error(err?.message || "保存失败");
    } finally {
      isSubmitting.value = false;
    }
  });
};

const handleDeleteCategory = async (cat: NavCategory) => {
  try {
    await deleteNavCategory(cat.id);
    ElMessage.success("删除成功");
    fetchCategories();
  } catch (err: any) {
    ElMessage.error(err?.message || "删除失败");
  }
};

// 条目操作
const openAddItem = () => {
  Object.assign(itemForm, { id: 0, categoryId: selectedCatId.value, slug: "", title: "", url: "", desc: "", tag: "", sortOrder: 0, isVisible: true });
  itemDialogTitle.value = "新增条目";
  isItemDialogOpen.value = true;
  nextTick(() => itemFormRef.value?.clearValidate());
};

const openEditItem = (row: NavItem) => {
  originalItemCategoryId = row.categoryId;
  Object.assign(itemForm, { ...row });
  itemDialogTitle.value = "编辑条目";
  isItemDialogOpen.value = true;
  nextTick(() => itemFormRef.value?.clearValidate());
};

const confirmSaveItem = async () => {
  if (!itemFormRef.value) return;
  await itemFormRef.value.validate(async (valid) => {
    if (!valid) return;
    isSubmitting.value = true;
    try {
      const categoryId = itemForm.categoryId;
      const moved = Boolean(itemForm.id) && categoryId !== originalItemCategoryId;
      if (itemForm.id) {
        await updateNavItem(itemForm.id, itemForm);
        ElMessage.success("修改成功");
      } else {
        await createNavItem(itemForm);
        const category = categories.value.find((cat) => cat.id === categoryId);
        if (category) category.itemCount = (category.itemCount ?? 0) + 1;
        ElMessage.success("新增成功");
      }
      isItemDialogOpen.value = false;
      if (moved && selectedCatId.value === originalItemCategoryId) {
        await handleItemDeleteRefresh();
      } else if (selectedCatId.value === categoryId) {
        await fetchItems();
      }
      if (moved) await fetchCategories();
    } catch (err: any) {
      ElMessage.error(err?.message || "保存失败");
    } finally {
      isSubmitting.value = false;
    }
  });
};

const handleDeleteItem = async (row: NavItem) => {
  try {
    await deleteNavItem(row.id);
    ElMessage.success("删除成功");
    selectedIds.value = selectedIds.value.filter((id) => id !== row.id);
    await handleItemDeleteRefresh();
    fetchCategories();
  } catch (err: any) {
    ElMessage.error(err?.message || "删除失败");
  }
};

const handleSelectionChange = (selection: NavItem[]) => {
  selectedIds.value = selection.map((item) => item.id);
};

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0 || isBatchDeleting.value) return;

  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的 ${selectedIds.value.length} 个导航条目吗？`,
      "批量删除确认",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning",
        confirmButtonClass: "el-button--danger"
      }
    );

    const deleteCount = selectedIds.value.length;
    isBatchDeleting.value = true;
    const res: any = await batchDeleteNavItems(selectedIds.value);
    ElMessage.success(res?.message ?? `成功删除 ${selectedIds.value.length} 个条目`);

    selectedIds.value = [];
    await handleItemDeleteRefresh(deleteCount);
    fetchCategories();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error(error?.message ?? "批量删除失败");
    }
  } finally {
    isBatchDeleting.value = false;
  }
};

const loadExampleJson = () => {
  const example = [
    {
      id: "dev-tools",
      name: "开发工具",
      description: "代码托管、边缘云、研发调试与文档规范",
      items: [
        {
          id: "github",
          title: "GitHub",
          url: "https://github.com",
          desc: "全球最大的开源代码托管与协作平台",
          tag: "代码"
        }
      ]
    }
  ];
  importJson.value = JSON.stringify(example, null, 2);
};

// 批量导入
const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
    fileInputRef.value.click();
  }
};

const handleFileSelected = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  try {
    importJson.value = await file.text();
  } catch {
    ElMessage.error("读取文件失败");
  }
};

const confirmImport = async () => {
  const raw = importJson.value.trim();
  if (!raw) {
    ElMessage.warning("请粘贴或上传 JSON 数据");
    return;
  }
  let parsed: any[];
  try {
    parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("需要数组格式");
  } catch (e: any) {
    ElMessage.error("JSON 格式错误：" + e.message);
    return;
  }
  isImporting.value = true;
  try {
    const res: any = await batchImportNav(parsed);
    ElMessage.success(res?.message || `导入成功！共处理 ${parsed.length} 个分类`);
    isImportDialogOpen.value = false;
    importJson.value = "";
    await fetchCategories({ refreshItems: true });
  } catch (err: any) {
    ElMessage.error(err?.message || "导入失败");
  } finally {
    isImporting.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
.app-container {
  height: 100%;
}

.category-card :deep(.el-card__body),
.table-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
  min-height: 0;
}

.category-item {
  border: 1px solid transparent;
}

.category-item:hover {
  background-color: #f5f7fa;
}

.category-item.is-active {
  background-color: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
}

:deep(.compact-empty) {
  padding: 12px 0;
}

:deep(.compact-empty .el-empty__description) {
  margin-top: 8px;
}

:deep(.compact-empty .el-empty__description p) {
  font-size: 13px;
  color: #909399;
}

:deep(.compact-empty .el-empty__bottom) {
  margin-top: 10px;
}
</style>
