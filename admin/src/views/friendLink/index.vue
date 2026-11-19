<template>
  <div class="app-container flex-1 flex flex-col gap-3 min-h-0">
    <!-- 顶部筛选表单区 -->
    <el-card shadow="never" class="filter-card !rounded-xl border border-[#e4e7ed] flex-shrink-0">
      <el-form :inline="true" :model="searchParams" class="filter-form flex flex-wrap items-center">
        <el-form-item label="关键词">
          <el-input
            v-model="searchParams.keyword"
            placeholder="网站名称 / 网址 / 邮箱"
            clearable
            class="!w-60"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="审核状态">
          <el-select v-model="searchParams.status" placeholder="全部状态" clearable class="!w-32">
            <el-option label="待审核" value="pending" />
            <el-option label="已通过" value="approved" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已隐藏" value="hidden" />
          </el-select>
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
      <div class="flex items-center justify-between mb-3 flex-shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-gray-700">友链申请与收录列表</span>
          <span class="text-xs text-gray-400">（共 {{ total }} 条记录）</span>
        </div>
        <el-button size="small" :icon="Refresh" :loading="isLoading" @click="fetchData">
          刷新
        </el-button>
      </div>

      <!-- 表格内容 -->
      <div class="flex-1 min-h-0">
        <el-table
          v-loading="isLoading"
          :data="tableData"
          height="100%"
          stripe
          border
          class="w-full"
        >
          <el-table-column prop="id" label="ID" width="70" align="center" />

          <el-table-column label="Logo" width="70" align="center">
            <template #default="{ row }">
              <el-avatar
                v-if="row.logo"
                :src="row.logo"
                shape="square"
                :size="36"
                class="border border-gray-200"
              />
              <el-avatar v-else shape="square" :size="36" class="bg-blue-500 text-white font-bold">
                {{ (row.name || 'J').charAt(0).toUpperCase() }}
              </el-avatar>
            </template>
          </el-table-column>

          <el-table-column label="网站信息" min-width="220">
            <template #default="{ row }">
              <div class="flex flex-col gap-0.5">
                <span class="font-bold text-gray-900 text-sm">{{ row.name }}</span>
                <a
                  :href="row.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-xs text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span class="truncate">{{ row.url }}</span>
                  <el-icon class="text-[10px]"><TopRight /></el-icon>
                </a>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="description" label="网站描述" min-width="220" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.description || "—" }}
            </template>
          </el-table-column>

          <el-table-column prop="email" label="联系邮箱" width="180" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.email || "—" }}
            </template>
          </el-table-column>

          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.status === 'pending'" type="warning" size="small">待审核</el-tag>
              <el-tag v-else-if="row.status === 'approved'" type="success" size="small">已通过</el-tag>
              <el-tag v-else-if="row.status === 'rejected'" type="danger" size="small">已拒绝</el-tag>
              <el-tag v-else-if="row.status === 'hidden'" type="info" size="small">已隐藏</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="sortOrder" label="排序权重" width="90" align="center" />

          <el-table-column prop="createdAt" label="申请时间" width="160" align="center" />

          <el-table-column label="操作" width="220" fixed="right" align="center">
            <template #default="{ row }">
              <div class="flex items-center justify-center gap-1 flex-wrap">
                <!-- 待审核操作 -->
                <template v-if="row.status === 'pending'">
                  <el-button
                    type="success"
                    link
                    size="small"
                    @click="handleStatusChange(row, 'approved')"
                  >
                    通过
                  </el-button>
                  <el-button
                    type="danger"
                    link
                    size="small"
                    @click="openRejectDialog(row)"
                  >
                    拒绝
                  </el-button>
                </template>

                <!-- 已通过操作 -->
                <template v-else-if="row.status === 'approved'">
                  <el-button
                    type="warning"
                    link
                    size="small"
                    @click="handleStatusChange(row, 'hidden')"
                  >
                    下架
                  </el-button>
                </template>

                <!-- 已下架或已拒绝操作 -->
                <template v-else>
                  <el-button
                    type="success"
                    link
                    size="small"
                    @click="handleStatusChange(row, 'approved')"
                  >
                    上架
                  </el-button>
                </template>

                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="openEditDialog(row)"
                >
                  编辑
                </el-button>

                <el-popconfirm
                  title="确定要彻底删除该友链吗？"
                  confirm-button-text="删除"
                  cancel-button-text="取消"
                  confirm-button-type="danger"
                  @confirm="handleDelete(row)"
                >
                  <template #reference>
                    <el-button type="danger" link size="small">
                      删除
                    </el-button>
                  </template>
                </el-popconfirm>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页栏 -->
      <div class="flex justify-end mt-3 flex-shrink-0">
        <el-pagination
          v-model:current-page="searchParams.pageNum"
          v-model:page-size="searchParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 拒绝理由弹窗 -->
    <el-dialog v-model="isRejectDialogOpen" title="拒绝友链申请" width="420px" destroy-on-close>
      <el-form label-position="top">
        <el-form-item label="拒绝原因（将邮件告知申请人）">
          <el-input
            v-model.trim="rejectReason"
            type="textarea"
            :rows="3"
            placeholder="例如：网站无法正常打开 / 暂未发现贵站本站友链等..."
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="isRejectDialogOpen = false">取消</el-button>
          <el-button type="danger" :loading="isSubmitting" @click="confirmReject">
            确认拒绝
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑友链弹窗 -->
    <el-dialog v-model="isEditDialogOpen" title="编辑友链信息" width="500px" destroy-on-close>
      <el-form ref="editFormRef" :model="editForm" label-position="top" size="default">
        <el-form-item label="网站名称" required>
          <el-input v-model.trim="editForm.name" maxlength="40" />
        </el-form-item>
        <el-form-item label="网站网址" required>
          <el-input v-model.trim="editForm.url" />
        </el-form-item>
        <el-form-item label="Logo 链接">
          <el-input v-model.trim="editForm.logo" placeholder="图片 URL" />
        </el-form-item>
        <el-form-item label="网站描述 (选填)">
          <el-input v-model.trim="editForm.description" type="textarea" :rows="3" maxlength="200" placeholder="选填" />
        </el-form-item>
        <el-form-item label="联系邮箱 (选填)">
          <el-input v-model.trim="editForm.email" placeholder="选填" />
        </el-form-item>
        <el-form-item label="排序权重 (数字越大越靠前)">
          <el-input-number v-model="editForm.sortOrder" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="isEditDialogOpen = false">取消</el-button>
          <el-button type="primary" :loading="isSubmitting" @click="confirmEdit">
            保存修改
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { Search, Refresh, TopRight } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import {
  listManageFriendLinks,
  updateFriendLinkStatus,
  updateFriendLink,
  deleteFriendLink,
  type FriendLinkItem
} from "@/api/friendLink";

const isLoading = ref(false);
const isSubmitting = ref(false);
const total = ref(0);
const tableData = ref<FriendLinkItem[]>([]);

const searchParams = reactive({
  keyword: "",
  status: "",
  pageNum: 1,
  pageSize: 10
});

const isRejectDialogOpen = ref(false);
const rejectTargetId = ref<number | null>(null);
const rejectReason = ref("");

const isEditDialogOpen = ref(false);
const editForm = reactive<Partial<FriendLinkItem>>({
  id: 0,
  name: "",
  url: "",
  logo: "",
  description: "",
  email: "",
  sortOrder: 0
});

const fetchData = async () => {
  isLoading.value = true;
  try {
    const res: any = await listManageFriendLinks(searchParams);
    if (res && res.list) {
      tableData.value = res.list;
      total.value = res.total;
    }
  } catch (err: any) {
    ElMessage.error(err?.message || "获取友链列表失败");
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = () => {
  searchParams.pageNum = 1;
  fetchData();
};

const handleReset = () => {
  searchParams.keyword = "";
  searchParams.status = "";
  searchParams.pageNum = 1;
  fetchData();
};

const handleStatusChange = async (row: FriendLinkItem, newStatus: string) => {
  try {
    await updateFriendLinkStatus(row.id, newStatus);
    ElMessage.success("状态更新成功");
    fetchData();
  } catch (err: any) {
    ElMessage.error(err?.message || "更新状态失败");
  }
};

const openRejectDialog = (row: FriendLinkItem) => {
  rejectTargetId.value = row.id;
  rejectReason.value = "";
  isRejectDialogOpen.value = true;
};

const confirmReject = async () => {
  if (!rejectTargetId.value) return;
  isSubmitting.value = true;
  try {
    await updateFriendLinkStatus(rejectTargetId.value, "rejected", rejectReason.value);
    ElMessage.success("已拒绝申请");
    isRejectDialogOpen.value = false;
    fetchData();
  } catch (err: any) {
    ElMessage.error(err?.message || "处理失败");
  } finally {
    isSubmitting.value = false;
  }
};

const openEditDialog = (row: FriendLinkItem) => {
  editForm.id = row.id;
  editForm.name = row.name;
  editForm.url = row.url;
  editForm.logo = row.logo || "";
  editForm.description = row.description;
  editForm.email = row.email;
  editForm.sortOrder = row.sortOrder;
  isEditDialogOpen.value = true;
};

const confirmEdit = async () => {
  if (!editForm.id) return;
  isSubmitting.value = true;
  try {
    await updateFriendLink(editForm.id, editForm);
    ElMessage.success("修改成功");
    isEditDialogOpen.value = false;
    fetchData();
  } catch (err: any) {
    ElMessage.error(err?.message || "保存失败");
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = async (row: FriendLinkItem) => {
  try {
    await deleteFriendLink(row.id);
    ElMessage.success("删除成功");
    fetchData();
  } catch (err: any) {
    ElMessage.error(err?.message || "删除失败");
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.app-container {
  padding: 16px;
  height: calc(100vh - 84px);
  box-sizing: border-box;
}

:deep(.el-card__body) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
