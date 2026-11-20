<template>
  <div class="app-container flex-1 flex flex-col gap-3 min-h-0">
    <!-- 筛选表单区 -->
    <el-card shadow="never" class="filter-card !rounded-xl border border-[#e4e7ed] flex-shrink-0">
      <el-form :inline="true" :model="searchParams" class="filter-form flex flex-wrap items-center">
        <el-form-item label="关键字">
          <el-input
            v-model="searchParams.keyword"
            placeholder="搜索昵称 / UUID / 邮箱"
            clearable
            class="!w-64"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" :loading="isLoading" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格卡片 -->
    <el-card shadow="never" class="table-card !rounded-xl border border-[#e4e7ed] flex-1 flex flex-col min-h-0">
      <!-- 按钮工具栏 -->
      <div class="flex items-center justify-between mb-3 flex-shrink-0">
        <div class="flex items-center gap-2">
          <el-button
            type="danger"
            plain
            :icon="Delete"
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            批量删除 ({{ selectedIds.length }})
          </el-button>
          <el-button
            type="primary"
            plain
            :icon="Refresh"
            :loading="isLoading"
            @click="fetchData"
          >
            刷新数据
          </el-button>
          <span class="text-xs text-[#909399]">共查询到 {{ totalCount }} 位访客用户</span>
        </div>
      </div>

      <!-- 表格主体 -->
      <div class="table-wrapper flex-1 min-h-0">
        <el-table
          v-loading="isLoading"
          :data="tableData"
          border
          stripe
          height="100%"
          style="width: 100%"
          class="ruoyi-table"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="id" label="ID" width="70" align="center" />

          <el-table-column label="头像" width="75" align="center">
            <template #default="{ row }">
              <el-avatar
                v-if="row.avatar"
                :size="36"
                :src="row.avatar"
                shape="circle"
                class="border border-[#e4e7ed] bg-[#f8fafc]"
              />
              <el-avatar
                v-else
                :size="36"
                shape="circle"
                class="bg-[#409eff] text-white font-bold text-xs"
              >
                {{ row.nickname?.charAt(0) || "访" }}
              </el-avatar>
            </template>
          </el-table-column>

          <el-table-column label="专属固定昵称" min-width="150">
            <template #default="{ row }">
              <div class="flex items-center gap-2">
                <span class="font-bold text-[#303133]">{{ row.nickname }}</span>
                <el-tag type="info" effect="plain" round>不可改</el-tag>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="用户 UUID" min-width="260">
            <template #default="{ row }">
              <div class="flex items-center gap-2 font-mono text-xs text-[#606266]">
                <span>{{ row.uuid }}</span>
                <el-link type="primary" underline="never" class="text-xs" @click="copyText(row.uuid)">
                  复制
                </el-link>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="通知邮箱" min-width="180">
            <template #default="{ row }">
              <span v-if="row.email" class="text-[#409eff]">{{ row.email }}</span>
              <span v-else class="text-[#c0c4cc]">未绑定</span>
            </template>
          </el-table-column>

          <el-table-column prop="clientIp" label="客户端 IP" width="130" align="center" />

          <el-table-column prop="createdAt" label="首次访问时间" width="165" align="center" />

          <el-table-column label="操作" width="90" align="center" fixed="right">
            <template #default="{ row }">
              <el-popconfirm
                title="确定删除此访客用户吗？"
                confirm-button-text="删除"
                cancel-button-text="取消"
                confirm-button-type="danger"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button link type="danger">
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 底部固定吸附分页器 -->
      <div class="pagination-footer flex items-center justify-end pt-3 mt-auto flex-shrink-0 border-t border-[#f0f2f5]">
        <el-pagination
          v-model:current-page="searchParams.pageNum"
          v-model:page-size="searchParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh, Delete } from "@element-plus/icons-vue";
import { getVisitorList, deleteVisitor, batchDeleteVisitors, type VisitorItem } from "@/api/visitor";
import { usePagination } from "@/hooks/usePagination";

const selectedIds = ref<number[]>([]);

const {
  isLoading,
  total: totalCount,
  tableData,
  searchParams,
  fetchData,
  handleSearch,
  handleReset,
  handleSizeChange,
  handleCurrentChange,
  handleDeleteRefresh
} = usePagination<VisitorItem>({
  fetchApi: getVisitorList,
  defaultParams: {
    keyword: ""
  },
  errorMessage: "获取访客用户列表失败"
});

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map((item) => item.id);
};

const handleDelete = async (row: any) => {
  try {
    await deleteVisitor(row.id);
    ElMessage.success("用户已删除");
    handleDeleteRefresh();
  } catch (err: any) {
    ElMessage.error(err?.message ?? "删除失败");
  }
};

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) return;

  try {
    await ElMessageBox.confirm(
      `确定要批量删除选中的 ${selectedIds.value.length} 名用户吗？`,
      "警告",
      {
        confirmButtonText: "确定删除",
        cancelButtonText: "取消",
        type: "warning"
      }
    );

    const deleteCount = selectedIds.value.length;
    await batchDeleteVisitors(selectedIds.value);
    ElMessage.success("批量删除成功");
    selectedIds.value = [];
    handleDeleteRefresh(deleteCount);
  } catch (e) {
    // 取消
  }
};

const copyText = (text: string) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  ElMessage.success("UUID 已复制到剪贴板");
};
</script>

<style scoped>
.app-container {
  height: 100%;
}

.table-card :deep(.el-card__body) {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
  min-height: 0;
}

.table-wrapper {
  overflow: hidden;
}

.ruoyi-table :deep(.el-table__header th) {
  background-color: #f8f8f9;
  color: #515a6e;
  font-weight: 600;
  font-size: 13px;
}
</style>
