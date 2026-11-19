<template>
  <div class="app-container flex-1 flex flex-col gap-3 min-h-0">
    <!-- 若依经典筛选表单区 -->
    <el-card shadow="never" class="filter-card !rounded-xl border border-[#e4e7ed] flex-shrink-0">
      <el-form :inline="true" :model="searchParams" class="filter-form flex flex-wrap items-center">
        <el-form-item label="关键词">
          <el-input
            v-model="searchParams.keyword"
            placeholder="支持内容/昵称向量语义检索"
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

        <el-form-item label="留言层级">
          <el-select v-model="searchParams.level" placeholder="全部层级" clearable class="!w-28">
            <el-option label="一级留言" :value="1" />
            <el-option label="二级回复" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item label="发布身份">
          <el-select v-model="searchParams.authorType" placeholder="全部身份" clearable class="!w-28">
            <el-option label="游客" value="visitor" />
            <el-option label="站长" value="admin" />
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

    <!-- 若依经典数据表格卡片 -->
    <el-card shadow="never" class="table-card !rounded-xl border border-[#e4e7ed] flex-1 flex flex-col min-h-0">
      <!-- 按钮工具栏 -->
      <div class="flex items-center justify-between mb-3 flex-shrink-0">
        <div class="flex items-center gap-2">
          <el-button
            type="primary"
            plain
            size="small"
            :icon="Refresh"
            :loading="isLoading"
            @click="fetchData"
          >
            刷新数据
          </el-button>
          <span class="text-xs text-[#909399]">共查询到 {{ totalCount }} 条留言记录</span>
        </div>
      </div>

      <div class="table-wrapper flex-1 min-h-0">
        <el-table
          v-loading="isLoading"
          :data="tableData"
          border
          stripe
          height="100%"
          style="width: 100%"
          class="ruoyi-table"
        >
        <el-table-column prop="id" label="ID" width="70" align="center" />

        <el-table-column label="层级" width="95" align="center">
          <template #default="{ row }">
            <el-tag :type="row.level === 1 ? 'primary' : 'success'" size="small">
              {{ row.level === 1 ? "一级留言" : "二级回复" }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="发布用户" min-width="160">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-avatar
                v-if="row.avatar"
                :size="28"
                :src="row.avatar"
                shape="circle"
                class="flex-shrink-0 border border-[#e4e7ed] bg-[#f8fafc]"
              />
              <el-avatar
                v-else
                :size="28"
                shape="circle"
                :class="row.authorType === 'admin' ? 'bg-[#f56c6c]' : 'bg-[#409eff]'"
                class="flex-shrink-0 text-white font-bold text-xs"
              >
                {{ row.nickname?.charAt(0) || "访" }}
              </el-avatar>
              <div class="flex items-center gap-1.5 flex-wrap min-w-0">
                <span class="font-medium text-xs text-[#303133] truncate">{{ row.nickname }}</span>
                <el-tag v-if="row.authorType === 'admin'" type="danger" size="small" effect="dark">
                  站长
                </el-tag>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="留言内容" min-width="260">
          <template #default="{ row }">
            <div class="text-xs text-[#303133] leading-relaxed whitespace-pre-wrap break-words py-1">
              <el-tag v-if="row.level === 2 && row.rootId" size="small" type="info" class="mr-1">
                楼 #{{ row.rootId }}
              </el-tag>
              {{ row.content }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="审核状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="提交时间" width="160" align="center" />

        <el-table-column label="审核记录" width="160">
          <template #default="{ row }">
            <div v-if="row.reviewedAt" class="text-[11px] text-[#606266] flex flex-col">
              <span>{{ row.reviewedAt }}</span>
              <span class="text-[#909399]">审核人ID: {{ row.reviewedBy ?? 1 }}</span>
            </div>
            <span v-else class="text-[11px] text-[#909399]">未审核</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="260" fixed="right" align="center">
          <template #default="{ row }">
            <div class="flex items-center justify-center gap-1 flex-wrap">
              <!-- 待审核：通过 / 拒绝 -->
              <template v-if="row.status === 'pending'">
                <el-button
                  type="success"
                  link
                  size="small"
                  @click="handleQuickStatus(row, 'approve')"
                >
                  通过
                </el-button>
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="openStatusDialog(row, 'reject')"
                >
                  拒绝
                </el-button>
              </template>

              <!-- 已通过：回复 / 隐藏 -->
              <template v-else-if="row.status === 'approved'">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="openReplyDialog(row)"
                >
                  回复
                </el-button>
                <el-button
                  type="warning"
                  link
                  size="small"
                  @click="openStatusDialog(row, 'hide')"
                >
                  隐藏
                </el-button>
              </template>

              <!-- 已拒绝：重新通过 -->
              <template v-else-if="row.status === 'rejected'">
                <el-button
                  type="success"
                  link
                  size="small"
                  @click="handleQuickStatus(row, 'approve')"
                >
                  重新通过
                </el-button>
              </template>

              <!-- 已隐藏：恢复公开 -->
              <template v-else-if="row.status === 'hidden'">
                <el-button
                  type="success"
                  link
                  size="small"
                  @click="handleQuickStatus(row, 'restore')"
                >
                  恢复展示
                </el-button>
              </template>

              <!-- 站长本人发布的回复支持编辑 -->
              <el-button
                v-if="row.authorType === 'admin'"
                type="info"
                link
                size="small"
                @click="openEditDialog(row)"
              >
                编辑
              </el-button>

              <!-- 针对有回复内容的一级留言或二级回复展示详情按钮 -->
              <el-button
                v-if="(row.replyCount && row.replyCount > 0) || row.level === 2"
                type="primary"
                link
                size="small"
                @click="openDetailDrawer(row)"
              >
                详情
              </el-button>

              <!-- 软删除 -->
              <el-popconfirm
                title="确定删除该条留言？删除后前台彻底不可见。"
                confirm-button-text="删除"
                cancel-button-text="取消"
                confirm-button-type="danger"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button type="danger" link size="small">删除</el-button>
                </template>
              </el-popconfirm>
            </div>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <!-- 若依分页栏（始终固定在底部） -->
      <div class="pagination-container flex justify-end pt-3 mt-auto flex-shrink-0 border-t border-[#f0f2f5]">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalCount"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 审核状态备注弹窗 -->
    <el-dialog
      v-model="isStatusDialogVisible"
      :title="statusDialogTitle"
      width="440px"
      destroy-on-close
    >
      <div class="flex flex-col gap-3">
        <p class="text-xs text-[#606266] m-0">
          您正在对留言 <b>#{{ currentActiveRow?.id }}</b> 执行 <b>{{ statusActionLabel }}</b> 操作。
        </p>
        <el-input
          v-model="statusRemark"
          type="textarea"
          rows="3"
          placeholder="请输入操作说明或审核备注（可选，仅后台留痕可见）"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isStatusDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="isSubmitting"
            @click="submitStatusChange"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 站长回复弹窗 -->
    <el-dialog
      v-model="isReplyDialogVisible"
      title="站长回复"
      width="500px"
      destroy-on-close
    >
      <div class="flex flex-col gap-3">
        <div class="p-3 rounded bg-[#f4f4f5] text-xs text-[#606266] flex flex-col gap-1.5">
          <div class="font-bold text-[#303133]">
            回复目标：#{{ currentActiveRow?.id }} ({{ currentActiveRow?.nickname }})
          </div>
          <div class="line-clamp-2 text-[#909399] leading-relaxed">{{ currentActiveRow?.content }}</div>
        </div>

        <div>
          <label class="block text-xs text-[#606266] mb-1">
            回复内容 <span class="text-red-500">*</span> (5–500字，标识为「站长」回复，直接公开)
          </label>
          <el-input
            v-model="replyContent"
            type="textarea"
            rows="4"
            maxlength="500"
            show-word-limit
            placeholder="请输入站长回复内容..."
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isReplyDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :disabled="!canSubmitReply"
            :loading="isSubmitting"
            @click="submitAdminReply"
          >
            发布回复
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑站长回复弹窗 -->
    <el-dialog
      v-model="isEditDialogVisible"
      title="编辑站长回复"
      width="500px"
      destroy-on-close
    >
      <div class="flex flex-col gap-3">
        <el-input
          v-model="editContent"
          type="textarea"
          rows="4"
          maxlength="500"
          show-word-limit
          placeholder="修改站长回复内容..."
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="isEditDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :disabled="!canSubmitEdit"
            :loading="isSubmitting"
            @click="submitEditReply"
          >
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 留言与具体回复详情抽屉 -->
    <el-drawer
      v-model="isDetailDrawerVisible"
      :title="detailData?.level === 2 ? `二级回复详情 (ID: #${detailData?.id ?? ''})` : `留言详情 (ID: #${detailData?.id ?? ''})`"
      size="560px"
      destroy-on-close
    >
      <div v-loading="isLoadingDetail" class="flex flex-col gap-4 text-xs">
        <!-- 所属一级主楼信息（针对二级回复时呈现） -->
        <div v-if="detailData?.level === 2 && detailData?.rootComment" class="p-3 rounded-xl bg-[#eef4fe] border border-[#d0e0fb] flex flex-col gap-1.5">
          <div class="flex items-center gap-1.5 text-[11px] text-[#606266]">
            <el-tag size="small" type="primary">所属一级主留言 #{{ detailData.rootComment.id }}</el-tag>
            <span class="font-bold text-[#303133]">{{ detailData.rootComment.nickname }}</span>
            <span class="text-[#909399]">{{ detailData.rootComment.createdAt }}</span>
          </div>
          <div class="text-[#303133] text-xs line-clamp-2 pl-1">
            {{ detailData.rootComment.content }}
          </div>
        </div>

        <!-- 当前查看留言/回复详情卡片 -->
        <div class="p-4 rounded-xl bg-[#f8f9fb] border border-[#e4e7ed] flex flex-col gap-2.5">
          <div class="flex items-center justify-between pb-2 border-b border-[#e4e7ed]">
            <div class="flex items-center gap-2.5">
              <el-avatar
                v-if="detailData?.avatar"
                :size="34"
                :src="detailData.avatar"
                shape="circle"
                class="border border-[#e4e7ed] bg-white flex-shrink-0"
              />
              <el-avatar
                v-else
                :size="34"
                shape="circle"
                :class="detailData?.authorType === 'admin' ? 'bg-[#f56c6c]' : 'bg-[#409eff]'"
                class="text-white font-bold text-xs flex-shrink-0"
              >
                {{ detailData?.nickname?.charAt(0) || "访" }}
              </el-avatar>
              <div class="flex flex-col">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-bold text-[#303133] text-sm">{{ detailData?.nickname }}</span>
                  <el-tag size="small" :type="detailData?.level === 1 ? 'primary' : 'success'">
                    {{ detailData?.level === 1 ? "一级留言" : "二级回复" }}
                  </el-tag>
                  <el-tag v-if="detailData?.authorType === 'admin'" type="danger" size="small" effect="dark">
                    站长
                  </el-tag>
                  <el-tag :type="getStatusTagType(detailData?.status)" size="small">
                    {{ getStatusLabel(detailData?.status) }}
                  </el-tag>
                </div>
                <span class="text-[11px] text-[#909399] mt-0.5">{{ detailData?.createdAt }}</span>
              </div>
            </div>
            <div v-if="detailData?.email" class="text-[11px] text-[#409eff]">
              {{ detailData.email }}
            </div>
          </div>

          <div class="text-[#303133] text-sm leading-relaxed whitespace-pre-wrap break-words py-1">
            {{ detailData?.content }}
          </div>
        </div>

        <!-- 回复列表部分 -->
        <div class="flex flex-col gap-2.5 pt-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-[#303133] text-sm">
              {{ detailData?.level === 2 ? "同楼互动回复列表" : "子回复列表" }} ({{ detailData?.replies?.length ?? 0 }})
            </span>
          </div>

          <div v-if="!detailData?.replies || detailData.replies.length === 0" class="text-center text-[#909399] py-8">
            暂无回复内容
          </div>

          <div v-else class="flex flex-col gap-3">
            <div
              v-for="reply in detailData.replies"
              :key="reply.id"
              class="p-3.5 rounded-xl border bg-white flex flex-col gap-2 shadow-sm transition-all"
              :class="reply.id === detailData?.id ? 'border-[#409eff] bg-[#f0f7ff]' : 'border-[#ebeef5]'"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <el-avatar
                    v-if="reply.avatar"
                    :size="26"
                    :src="reply.avatar"
                    shape="circle"
                    class="border border-[#e4e7ed] bg-[#f8fafc] flex-shrink-0"
                  />
                  <el-avatar
                    v-else
                    :size="26"
                    shape="circle"
                    :class="reply.authorType === 'admin' ? 'bg-[#f56c6c]' : 'bg-[#8b5cf6]'"
                    class="text-white font-bold text-[10px] flex-shrink-0"
                  >
                    {{ reply.nickname?.charAt(0) || "访" }}
                  </el-avatar>
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="font-bold text-[#303133]">{{ reply.nickname }}</span>
                    <el-tag v-if="reply.id === detailData?.id" size="small" type="primary" effect="dark">
                      当前项
                    </el-tag>
                    <el-tag v-if="reply.authorType === 'admin'" type="danger" size="small" effect="dark">
                      站长
                    </el-tag>
                    <span v-if="reply.replyToNickname" class="text-[#909399]">
                      回复 <span class="font-semibold text-[#409eff]">@{{ reply.replyToNickname }}</span>
                    </span>
                  </div>
                </div>
                <el-tag :type="getStatusTagType(reply.status)" size="small">
                  {{ getStatusLabel(reply.status) }}
                </el-tag>
              </div>

              <div class="text-[#303133] text-xs leading-relaxed whitespace-pre-wrap break-words pl-8">
                {{ reply.content }}
              </div>

              <div class="flex items-center justify-between pl-8 pt-1 text-[11px] text-[#909399]">
                <span>{{ reply.createdAt }}</span>
                <span>#{{ reply.id }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import { Search, Refresh } from "@element-plus/icons-vue";
import {
  listManageComments,
  updateCommentStatus,
  deleteComment,
  adminReply,
  updateAdminReply,
  getManageDetail,
  type GuestbookComment
} from "@/api/guestbook";

const route = useRoute();

// 表格与状态
const isLoading = ref(false);
const isSubmitting = ref(false);
const tableData = ref<GuestbookComment[]>([]);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 查询过滤条件
const searchParams = reactive({
  keyword: "",
  status: (route.query.status as string) || "",
  level: "" as string | number,
  authorType: ""
});

// 状态审核弹窗
const isStatusDialogVisible = ref(false);
const currentActiveRow = ref<GuestbookComment | null>(null);
const currentStatusAction = ref<"approve" | "reject" | "hide" | "restore">("approve");
const statusRemark = ref("");

// 站长回复弹窗
const isReplyDialogVisible = ref(false);
const replyContent = ref("");

// 编辑回复弹窗
const isEditDialogVisible = ref(false);
const editContent = ref("");

// 留言详情与回复抽屉
const isDetailDrawerVisible = ref(false);
const isLoadingDetail = ref(false);
const detailData = ref<any>(null);

// 派生校验与文本
const canSubmitReply = computed(() => {
  const len = replyContent.value.trim().length;
  return len >= 5 && len <= 500;
});

const canSubmitEdit = computed(() => {
  const len = editContent.value.trim().length;
  return len >= 5 && len <= 500;
});

const statusActionLabel = computed(() => {
  const map: Record<string, string> = {
    approve: "通过",
    reject: "拒绝",
    hide: "隐藏",
    restore: "恢复展示"
  };
  return map[currentStatusAction.value] ?? currentStatusAction.value;
});

const statusDialogTitle = computed(() => {
  return `确认${statusActionLabel.value}`;
});

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: "待审核",
    approved: "已通过",
    rejected: "已拒绝",
    hidden: "已隐藏"
  };
  return map[status] ?? status;
};

const getStatusTagType = (status: string) => {
  const map: Record<string, "warning" | "success" | "danger" | "info"> = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
    hidden: "info"
  };
  return map[status] ?? "info";
};

// 获取列表数据
const fetchData = async () => {
  isLoading.value = true;
  try {
    const res = await listManageComments({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchParams.keyword.trim(),
      status: searchParams.status,
      level: searchParams.level,
      authorType: searchParams.authorType
    });
    tableData.value = res?.list ?? [];
    totalCount.value = res?.total ?? 0;
  } catch (error: any) {
    ElMessage.error(error?.message ?? "获取留言列表失败");
  } finally {
    isLoading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};

const handleReset = () => {
  searchParams.keyword = "";
  searchParams.status = "";
  searchParams.level = "";
  searchParams.authorType = "";
  currentPage.value = 1;
  fetchData();
};

// 快捷直接操作（不需要写备注）
const handleQuickStatus = async (
  row: GuestbookComment,
  action: "approve" | "restore"
) => {
  try {
    await updateCommentStatus(row.id, action);
    ElMessage.success("操作成功");
    fetchData();
  } catch (error: any) {
    ElMessage.error(error?.message ?? "操作失败");
  }
};

// 打开带备注的状态弹窗（如拒绝/隐藏）
const openStatusDialog = (
  row: GuestbookComment,
  action: "approve" | "reject" | "hide" | "restore"
) => {
  currentActiveRow.value = row;
  currentStatusAction.value = action;
  statusRemark.value = "";
  isStatusDialogVisible.value = true;
};

const submitStatusChange = async () => {
  if (!currentActiveRow.value) return;
  isSubmitting.value = true;
  try {
    await updateCommentStatus(
      currentActiveRow.value.id,
      currentStatusAction.value,
      statusRemark.value.trim()
    );
    ElMessage.success("操作成功");
    isStatusDialogVisible.value = false;
    fetchData();
  } catch (error: any) {
    ElMessage.error(error?.message ?? "操作失败");
  } finally {
    isSubmitting.value = false;
  }
};

// 软删除
const handleDelete = async (row: GuestbookComment) => {
  try {
    await deleteComment(row.id);
    ElMessage.success("删除成功");
    fetchData();
  } catch (error: any) {
    ElMessage.error(error?.message ?? "删除失败");
  }
};

// 站长回复
const openReplyDialog = (row: GuestbookComment) => {
  currentActiveRow.value = row;
  replyContent.value = "";
  isReplyDialogVisible.value = true;
};

const submitAdminReply = async () => {
  if (!currentActiveRow.value || !canSubmitReply.value) return;
  isSubmitting.value = true;
  try {
    await adminReply(currentActiveRow.value.id, replyContent.value.trim());
    ElMessage.success("回复发布成功");
    isReplyDialogVisible.value = false;
    fetchData();
  } catch (error: any) {
    ElMessage.error(error?.message ?? "回复失败");
  } finally {
    isSubmitting.value = false;
  }
};

// 编辑站长回复
const openEditDialog = (row: GuestbookComment) => {
  currentActiveRow.value = row;
  editContent.value = row.content;
  isEditDialogVisible.value = true;
};

const submitEditReply = async () => {
  if (!currentActiveRow.value || !canSubmitEdit.value) return;
  isSubmitting.value = true;
  try {
    await updateAdminReply(currentActiveRow.value.id, editContent.value.trim());
    ElMessage.success("修改回复成功");
    isEditDialogVisible.value = false;
    fetchData();
  } catch (error: any) {
    ElMessage.error(error?.message ?? "修改失败");
  } finally {
    isSubmitting.value = false;
  }
};

// 打开留言详情与回复列表抽屉
const openDetailDrawer = async (row: GuestbookComment) => {
  detailData.value = { ...row };
  isDetailDrawerVisible.value = true;
  isLoadingDetail.value = true;
  try {
    const res = await getManageDetail(row.id);
    if (res) {
      detailData.value = res;
    }
  } catch (error: any) {
    ElMessage.error(error?.message ?? "获取详情失败");
  } finally {
    isLoadingDetail.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.app-container {
  height: 100%;
}

.filter-card :deep(.el-card__body) {
  padding: 12px 16px;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0 !important;
  margin-right: 12px;
}

.filter-form :deep(.el-form-item:last-child) {
  margin-right: 0;
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
