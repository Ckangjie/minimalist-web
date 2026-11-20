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
            <el-option v-for="option in moderationStatusOptions" :key="option.value" v-bind="option" />
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
          <el-button
            type="primary"
            plain
            :icon="Plus"
            @click="openAddDialog"
          >
            新增友链
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
          <span class="text-xs text-gray-400">（共 {{ total }} 条记录）</span>
        </div>
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
              <el-tag v-if="row.status === 'pending'" type="warning">待审核</el-tag>
              <el-tag v-else-if="row.status === 'approved'" type="success">已通过</el-tag>
              <el-tag v-else-if="row.status === 'rejected'" type="danger">已拒绝</el-tag>
              <el-tag v-else-if="row.status === 'hidden'" type="info">已隐藏</el-tag>
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
                    @click="handleStatusChange(row, 'approved')"
                  >
                    通过
                  </el-button>
                  <el-button
                    type="danger"
                    link
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
                    @click="handleStatusChange(row, 'approved')"
                  >
                    上架
                  </el-button>
                </template>

                <el-button
                  type="primary"
                  link
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
                    <el-button type="danger" link>
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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
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

    <!-- 新增 / 编辑友链弹窗 -->
    <el-dialog
      v-model="isEditDialogOpen"
      :title="dialogTitle"
      width="500px"
      destroy-on-close
      @closed="handleDialogClosed"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="formRules"
        label-position="top"
      >
        <el-form-item label="网站名称" prop="name">
          <el-input v-model.trim="editForm.name" maxlength="40" placeholder="例如：Jie Hub" />
        </el-form-item>
        <el-form-item label="网站网址" prop="url">
          <el-input v-model.trim="editForm.url" placeholder="必须包含协议，如：https://example.com" />
        </el-form-item>
        <el-form-item label="Logo 链接 (选填)" prop="logo">
          <el-input v-model.trim="editForm.logo" placeholder="图片 URL，例如：https://example.com/logo.png" />
        </el-form-item>
        <el-form-item label="网站描述 (选填)" prop="description">
          <el-input v-model.trim="editForm.description" type="textarea" :rows="3" maxlength="200" placeholder="简短介绍站点特色（选填）" />
        </el-form-item>
        <el-form-item label="联系邮箱 (选填)" prop="email">
          <el-input v-model.trim="editForm.email" placeholder="用于通知审核结果（选填）" />
        </el-form-item>
        <div class="grid grid-cols-2 gap-4">
          <el-form-item label="审核状态" prop="status">
            <el-select v-model="editForm.status" class="w-full">
              <el-option v-for="option in editStatusOptions" :key="option.value" v-bind="option" />
            </el-select>
          </el-form-item>
          <el-form-item label="排序权重 (数字越大越靠前)" prop="sortOrder">
            <el-input-number v-model="editForm.sortOrder" :min="0" :max="999" class="!w-full" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="isEditDialogOpen = false">取消</el-button>
          <el-button type="primary" :loading="isSubmitting" @click="confirmSave">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from "vue";
import { Search, Refresh, TopRight, Plus } from "@element-plus/icons-vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import {
  listManageFriendLinks,
  updateFriendLinkStatus,
  updateFriendLink,
  createFriendLink,
  deleteFriendLink,
  type FriendLinkItem
} from "@/api/friendLink";
import { usePagination } from "@/hooks/usePagination";
import { moderationStatusOptions } from "@/constants/moderation";

const editStatusOptions = [
  { label: "已通过 (展示)", value: "approved" },
  ...moderationStatusOptions.filter((option) => option.value !== "approved")
];

const isSubmitting = ref(false);

const {
  isLoading,
  tableData,
  total,
  searchParams,
  fetchData,
  handleSearch,
  handleReset,
  handleSizeChange,
  handleCurrentChange,
  handleDeleteRefresh
} = usePagination<FriendLinkItem>({
  fetchApi: listManageFriendLinks,
  defaultParams: {
    keyword: "",
    status: ""
  },
  errorMessage: "获取友链列表失败"
});

const isRejectDialogOpen = ref(false);
const rejectTargetId = ref<number | null>(null);
const rejectReason = ref("");

const isEditDialogOpen = ref(false);
const dialogTitle = ref("新增友链");
const editFormRef = ref<FormInstance>();
const editForm = reactive<Partial<FriendLinkItem>>({
  id: 0,
  name: "",
  url: "",
  logo: "",
  description: "",
  email: "",
  sortOrder: 0,
  status: "approved"
});

const formRules: FormRules = {
  name: [
    { required: true, message: "请输入网站名称", trigger: "blur" },
    { min: 2, max: 40, message: "长度在 2 到 40 个字符之间", trigger: "blur" }
  ],
  url: [
    { required: true, message: "请输入网站网址", trigger: "blur" },
    {
      validator: (_, val, cb) => {
        if (!val) {
          cb(new Error("请输入网站网址"));
        } else if (!/^https?:\/\/.+/i.test(val)) {
          cb(new Error("网址必须以 http:// 或 https:// 开头"));
        } else {
          cb();
        }
      },
      trigger: "blur"
    }
  ],
  description: [
    { max: 200, message: "描述不能超过 200 个字符", trigger: "blur" }
  ],
  email: [
    {
      validator: (_, val, cb) => {
        if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          cb(new Error("邮箱格式不正确"));
        } else {
          cb();
        }
      },
      trigger: "blur"
    }
  ]
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

const openAddDialog = () => {
  editForm.id = 0;
  editForm.name = "";
  editForm.url = "";
  editForm.logo = "";
  editForm.description = "";
  editForm.email = "";
  editForm.sortOrder = 0;
  editForm.status = "approved";
  dialogTitle.value = "新增友链";
  isEditDialogOpen.value = true;
  nextTick(() => {
    editFormRef.value?.clearValidate();
  });
};

const openEditDialog = (row: FriendLinkItem) => {
  editForm.id = row.id;
  editForm.name = row.name;
  editForm.url = row.url;
  editForm.logo = row.logo || "";
  editForm.description = row.description || "";
  editForm.email = row.email || "";
  editForm.sortOrder = row.sortOrder ?? 0;
  editForm.status = row.status ?? "approved";
  dialogTitle.value = "编辑友链信息";
  isEditDialogOpen.value = true;
  nextTick(() => {
    editFormRef.value?.clearValidate();
  });
};

const handleDialogClosed = () => {
  editFormRef.value?.resetFields();
};

const confirmSave = async () => {
  if (!editFormRef.value) return;
  await editFormRef.value.validate(async (valid) => {
    if (!valid) return;
    isSubmitting.value = true;
    try {
      if (editForm.id) {
        await updateFriendLink(editForm.id, editForm);
        ElMessage.success("修改成功");
      } else {
        await createFriendLink(editForm);
        ElMessage.success("新增友链成功");
      }
      isEditDialogOpen.value = false;
      fetchData();
    } catch (err: any) {
      ElMessage.error(err?.message || "保存失败");
    } finally {
      isSubmitting.value = false;
    }
  });
};

const handleDelete = async (row: FriendLinkItem) => {
  try {
    await deleteFriendLink(row.id);
    ElMessage.success("删除成功");
    handleDeleteRefresh();
  } catch (err: any) {
    ElMessage.error(err?.message || "删除失败");
  }
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
</style>
