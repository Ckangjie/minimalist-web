<template>
  <div class="guestbook-page flex-1 flex flex-col py-6 px-4 md:px-8">
    <div class="guestbook-container w-full max-w-860px mx-auto flex flex-col gap-8">
      <!-- 页面头部简介区（无卡片边框） -->
      <header class="guestbook-header flex flex-col gap-2">
        <div class="flex items-center gap-3">
          <div class="header-icon-badge flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--primary-light)] text-[var(--primary-color)] flex-shrink-0">
            <el-icon :size="22"><ChatDotRound /></el-icon>
          </div>
          <div>
            <h1 class="text-xl md:text-2xl font-bold m-0 tracking-tight text-[var(--text-primary)]">
              全站留言板
            </h1>
            <p class="text-xs md:text-sm text-[var(--text-muted)] m-0 mt-0.5 leading-relaxed">
              欢迎留下您的宝贵建议、使用反馈与交流心得。所有留言人工审核后公开展示。
            </p>
          </div>
        </div>
      </header>

      <!-- 发表新留言区（轻量扁平无卡片） -->
      <section class="comment-create-box p-4 md:p-5 rounded-2xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div
              class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
              :style="{ background: visitorUser?.avatarBg }"
            >
              {{ avatarText }}
            </div>
            <span class="text-xs text-[var(--text-muted)]">以</span>
            <span class="text-xs font-bold text-[var(--text-primary)]">{{ currentVisitorNickname }}</span>
            <span class="text-xs text-[var(--text-muted)]">身份发表</span>
          </div>
          <span class="text-xs text-[var(--text-muted)]">
            {{ rootForm.content.length }} / 200 字
          </span>
        </div>

        <el-input
          v-model.trim="rootForm.content"
          type="textarea"
          :rows="3"
          maxlength="200"
          placeholder="请畅所欲言，友好交流。换行可正常排版显示..."
          resize="none"
          :disabled="isSubmitting"
          class="guestbook-textarea"
        />

        <div class="flex items-center justify-between pt-1">
          <span class="text-[11px] text-[var(--text-muted)]">
            人工审核通过后同步显示
          </span>
          <el-button
            type="primary"
            :loading="isSubmitting"
            :disabled="!canSubmitRoot"
            @click="handleSubmitRoot"
          >
            提交留言
          </el-button>
        </div>
      </section>

      <!-- 全部留言列表区（无卡片流式布局） -->
      <section class="comment-list-section flex flex-col gap-6">
        <div class="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
          <div class="flex items-center gap-2">
            <h2 class="text-base font-bold text-[var(--text-primary)] m-0">全部留言</h2>
            <span class="text-xs px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary-color)] font-semibold">
              {{ totalCount }}
            </span>
          </div>
          <el-button
            size="small"
            link
            :loading="isLoading"
            :icon="Refresh"
            class="!text-xs"
            @click="fetchComments"
          >
            刷新
          </el-button>
        </div>

        <!-- 异常提示 -->
        <div v-if="hasError" class="py-12 text-center text-muted">
          <p class="text-sm m-0 mb-3">{{ errorMessage }}</p>
          <el-button type="primary" size="small" @click="fetchComments">重新加载</el-button>
        </div>

        <!-- 空数据提示 -->
        <div v-else-if="!isLoading && commentList.length === 0" class="py-16 text-center text-muted">
          <p class="text-sm m-0">还没有留言，欢迎成为第一个留言的人 ✨</p>
        </div>

        <!-- 留言流条目列表（彻底移除卡片，纯流式条目） -->
        <div v-else class="comment-stream flex flex-col gap-6">
          <article
            v-for="item in commentList"
            :key="item.id"
            class="comment-entry flex flex-col gap-2.5 border-b border-[var(--border-color)] last:border-b-0"
          >
            <!-- 主留言作者与信息行 -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3">
                <!-- 移动端隐藏头像，仅 PC 端展示 -->
                <div
                  class="comment-author-avatar hidden md:flex w-9 h-9 rounded-full items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm"
                  :style="{ background: item.authorType === 'admin' ? '#ef4444' : '#3b82f6' }"
                >
                  {{ item.nickname ? item.nickname.charAt(0).toUpperCase() : '访' }}
                </div>
                <div class="flex flex-col">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-bold text-[var(--text-primary)]">{{ item.nickname }}</span>
                    <span
                      v-if="item.authorType === 'admin'"
                      class="px-1.5 py-0.2 rounded text-[10px] font-bold text-white bg-red-500"
                    >
                      站长
                    </span>
                  </div>
                  <time class="text-[11px] text-[var(--text-muted)] mt-0.5">{{ item.createdAt }}</time>
                </div>
              </div>

              <!-- 回复按钮 -->
              <button
                type="button"
                class="reply-trigger-btn flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-colors border-none bg-transparent cursor-pointer py-1 px-2 rounded-md hover:bg-[var(--bg-surface-soft)]"
                @click="openReplyBox(item.id, item.id, item.nickname)"
              >
                <el-icon><ChatRound /></el-icon>
                <span>回复</span>
              </button>
            </div>

            <!-- 主留言正文（纯文本换行展示，移动端无头像无需大缩进） -->
            <div class="comment-content pl-0 md:pl-12 text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap break-words">
              {{ item.content }}
            </div>

            <!-- 抖音风格楼中楼回复区（无卡片包裹，默认折叠） -->
            <div
              v-if="item.replies && item.replies.length > 0"
              class="sub-replies-block pl-0 md:pl-12 flex flex-col gap-2"
            >
              <!-- 折叠状态：点击展开更多 -->
              <div v-if="!isRepliesExpanded(item.id)">
                <button
                  type="button"
                  class="toggle-thread-btn text-xs text-[var(--text-muted)] hover:text-[var(--primary-color)] flex items-center gap-1.5 cursor-pointer border-none bg-transparent py-1 transition-colors font-medium"
                  @click="toggleRepliesExpand(item.id)"
                >
                  <span class="opacity-40 tracking-tighter">——</span>
                  <span>展开 {{ item.replies.length }} 条回复</span>
                  <span class="text-[10px] transform transition-transform">ˇ</span>
                </button>
              </div>

              <!-- 展开状态：楼中楼列表（格式严格为 A ▸ B：xxxx，无卡片） -->
              <div v-else class="expanded-thread flex flex-col gap-3 pt-1">
                <div
                  v-for="reply in item.replies"
                  :key="reply.id"
                  class="thread-reply-row flex items-start gap-2.5 text-xs group"
                >
                  <!-- 移动端隐藏楼中楼头像，仅 PC 端展示 -->
                  <div
                    class="thread-reply-avatar hidden md:flex w-6 h-6 rounded-full items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5"
                    :style="{ background: reply.authorType === 'admin' ? '#ef4444' : '#8b5cf6' }"
                  >
                    {{ reply.nickname?.charAt(0)?.toUpperCase() || '访' }}
                  </div>

                  <div class="flex-1 min-w-0 leading-relaxed break-words">
                    <!-- A ▸ B：xxxx 抖音右三角格式展示 -->
                    <span class="font-bold text-[var(--text-primary)]">
                      {{ reply.nickname }}
                    </span>
                    <span
                      v-if="reply.authorType === 'admin'"
                      class="inline-block px-1 py-0.2 mx-1 text-[10px] font-semibold text-white bg-red-500 rounded"
                    >
                      站长
                    </span>
                    <span class="inline-flex items-center mx-1 text-[9px] text-[var(--text-muted)] select-none">▸</span>
                    <span class="font-semibold text-[var(--primary-color)]">
                      {{ reply.replyToNickname || item.nickname }}
                    </span>
                    <span class="font-bold text-[var(--text-primary)]"> ：</span>
                    <span class="text-[var(--text-primary)] whitespace-pre-wrap">{{ reply.content }}</span>

                    <!-- 行内回复与时间 -->
                    <div class="flex items-center gap-3 mt-1 text-[11px] text-[var(--text-muted)]">
                      <time>{{ reply.createdAt }}</time>
                      <button
                        type="button"
                        class="text-[11px] text-[var(--text-muted)] hover:text-[var(--primary-color)] border-none bg-transparent p-0 cursor-pointer"
                        @click="openReplyBox(item.id, reply.id, reply.nickname)"
                      >
                        回复
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 展开后的收起按钮 -->
                <div class="pt-0.5">
                  <button
                    type="button"
                    class="toggle-thread-btn text-xs text-[var(--text-muted)] hover:text-[var(--primary-color)] flex items-center gap-1.5 cursor-pointer border-none bg-transparent py-1 transition-colors font-medium"
                    @click="toggleRepliesExpand(item.id)"
                  >
                    <span class="opacity-40 tracking-tighter">——</span>
                    <span>收起</span>
                    <span class="text-[10px]">ˆ</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- 内联回复输入区（扁平嵌入，无卡片框） -->
            <div
              v-if="activeReplyRootId === item.id"
              class="inline-reply-box ml-0 md:ml-12 mt-2 p-3.5 rounded-xl bg-[var(--bg-surface-soft)] border border-[var(--border-color)] flex flex-col gap-2.5"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="text-[var(--text-muted)]">
                  回复 <span class="font-bold text-[var(--primary-color)]">@{{ activeReplyTargetNick }}</span>
                  （以 <span class="font-semibold text-[var(--text-primary)]">{{ currentVisitorNickname }}</span> 身份）
                </span>
                <span class="text-[11px] text-[var(--text-muted)]">
                  {{ replyForm.content.length }} / 200 字
                </span>
              </div>

              <el-input
                v-model.trim="replyForm.content"
                type="textarea"
                :rows="2"
                maxlength="200"
                placeholder="友善回复，真诚沟通..."
                resize="none"
                :disabled="isSubmitting"
              />

              <div class="flex items-center justify-end gap-2 pt-0.5">
                <el-button size="small" :disabled="isSubmitting" @click="cancelReplyBox">
                  取消
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  :loading="isSubmitting"
                  :disabled="!canSubmitReply"
                  @click="handleSubmitReply"
                >
                  发送回复
                </el-button>
              </div>
            </div>
          </article>
        </div>

        <!-- 底部轻量分页器 -->
        <div v-if="totalPages > 1" class="flex justify-center mt-4">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            background
            layout="prev, pager, next, jumper"
            :total="totalCount"
            @current-change="changePage"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { getOpenList, submitComment } from "@/api/guestbook";
import { useVisitorUser } from "@/composables/useVisitorUser";
import {
  ChatDotRound,
  ChatRound,
  Refresh
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { computed, onMounted, reactive, ref } from "vue";

// 游客全局用户信息（昵称固定不可修改，统一使用个人信息中配置的邮箱）
const { visitorUser, avatarText } = useVisitorUser();
const currentVisitorNickname = computed(() => visitorUser.value?.nickname || "游客");

// 状态管理
const isLoading = ref(false);
const isSubmitting = ref(false);
const hasError = ref(false);
const errorMessage = ref("");

const commentList = ref([]);
const totalCount = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 一级主留言表单
const rootForm = reactive({
  content: ""
});

// 内联二级回复状态与表单
const activeReplyRootId = ref(null);
const activeReplyTargetId = ref(null);
const activeReplyTargetNick = ref("");
const replyForm = reactive({
  content: ""
});

// 折叠展开回复集合（默认全部不展开，空 Set）
const expandedRootIds = ref(new Set());

// 校验派生（1–200 字符，有内容即可提交）
const canSubmitRoot = computed(() => {
  const cLen = rootForm.content.trim().length;
  return cLen >= 1 && cLen <= 200;
});

const canSubmitReply = computed(() => {
  const cLen = replyForm.content.trim().length;
  return cLen >= 1 && cLen <= 200;
});

const totalPages = computed(() => {
  return Math.ceil(totalCount.value / pageSize.value);
});

// 展开/折叠辅助（抖音风格楼中楼）
const isRepliesExpanded = (rootId) => {
  return expandedRootIds.value.has(rootId);
};

const toggleRepliesExpand = (rootId) => {
  const nextSet = new Set(expandedRootIds.value);
  if (nextSet.has(rootId)) {
    nextSet.delete(rootId);
  } else {
    nextSet.add(rootId);
  }
  expandedRootIds.value = nextSet;
};

// 获取公开留言数据
const fetchComments = async () => {
  isLoading.value = true;
  hasError.value = false;
  errorMessage.value = "";

  try {
    const res = await getOpenList({
      pageNum: currentPage.value,
      pageSize: pageSize.value
    });

    const rawList = res?.list ?? [];
    commentList.value = rawList
      .filter((item) => item.status === "approved" && !item.deletedAt)
      .map((item) => ({
        ...item,
        replies: (item.replies ?? []).filter((r) => r.status === "approved" && !r.deletedAt)
      }));
    totalCount.value = res?.total ?? 0;
  } catch (err) {
    hasError.value = true;
    errorMessage.value = err?.message ?? "加载公开留言失败，请重试";
  } finally {
    isLoading.value = false;
  }
};

// 提交一级主留言
const handleSubmitRoot = async () => {
  if (!canSubmitRoot.value || isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const res = await submitComment({
      nickname: currentVisitorNickname.value,
      content: rootForm.content.trim(),
      email: visitorUser.value?.email || null
    });

    ElMessage.success(res?.message ?? "留言已提交，审核通过后将公开展示");
    rootForm.content = "";
  } catch (err) {
    ElMessage.error(err?.message ?? "提交留言失败，请检查后重试");
  } finally {
    isSubmitting.value = false;
  }
};

// 打开内联回复输入框
const openReplyBox = (rootId, targetId, targetNick) => {
  activeReplyRootId.value = rootId;
  activeReplyTargetId.value = targetId;
  activeReplyTargetNick.value = targetNick;
  replyForm.content = "";
};

const cancelReplyBox = () => {
  activeReplyRootId.value = null;
  activeReplyTargetId.value = null;
  activeReplyTargetNick.value = "";
  replyForm.content = "";
};

// 提交二级回复
const handleSubmitReply = async () => {
  if (!canSubmitReply.value || isSubmitting.value || !activeReplyRootId.value) return;

  isSubmitting.value = true;
  try {
    const res = await submitComment({
      nickname: currentVisitorNickname.value,
      content: replyForm.content.trim(),
      rootId: activeReplyRootId.value,
      replyToId: activeReplyTargetId.value,
      email: visitorUser.value?.email || null
    });

    ElMessage.success(res?.message ?? "回复已提交，审核通过后将展示");
    cancelReplyBox();
  } catch (err) {
    ElMessage.error(err?.message ?? "提交回复失败，请重试");
  } finally {
    isSubmitting.value = false;
  }
};

// 切换页码
const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  fetchComments();
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {
  fetchComments();
});
</script>

<style lang="scss" scoped>
.guestbook-page {
  background-color: var(--bg-page);
}

.guestbook-textarea :deep(.el-textarea__inner) {
  background-color: var(--bg-surface);
  border-color: var(--border-color);
  color: var(--text-primary);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 13px;

  &:focus {
    border-color: var(--primary-color);
  }
}

.toggle-thread-btn {
  &:hover {
    color: var(--primary-color);
  }
}

.comment-entry {
  margin-bottom: 0;
  padding-bottom: 0;
}
</style>
