<template>
  <div class="explore-page flex-1 flex flex-col py-6 px-4 md:px-8">
    <div class="explore-container w-full max-w-1200px mx-auto flex flex-col gap-8">
      <!-- 页面头部简介区与申请触发按钮 -->
      <header class="explore-header flex flex-col gap-2.5 sm:gap-3">
        <div class="flex items-center justify-between gap-3">
          <h1 class="text-lg sm:text-2xl font-bold m-0 tracking-tight text-[var(--text-primary)] truncate">
            探索好站
          </h1>

          <el-button
            type="primary"
            round
            size="small"
            :icon="Plus"
            class="apply-trigger-btn flex-shrink-0"
            @click="isApplyDialogOpen = true"
          >
            申请友链
          </el-button>
        </div>

        <p class="text-xs sm:text-sm text-[var(--text-muted)] m-0 leading-relaxed">
          汇聚优质独立博客、开源项目与实用站点。欢迎站长提交申请，开放互联。
        </p>
      </header>

      <!-- 本站互联信息卡片（方便对方先添加本站） -->
      <section class="site-info-box p-3.5 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] flex flex-col gap-2.5 sm:gap-3">
        <div class="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="font-bold text-xs sm:text-sm text-[var(--text-primary)]">本站信息提示</span>
            <span class="text-[11px] text-[var(--text-muted)] hidden sm:inline">（申请前建议先将本站添加到您的友链中）</span>
          </div>
          <el-button
            type="primary"
            link
            size="small"
            :icon="CopyDocument"
            class="copy-info-btn !p-0 !text-xs flex-shrink-0"
            @click="handleCopySiteInfo"
          >
            复制本站信息
          </el-button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs text-[var(--text-regular)]">
          <div class="truncate"><b>名称：</b>Jie Hub</div>
          <div class="truncate"><b>网址：</b>https://du1.ccwu.cc/</div>
          <div class="truncate"><b>图标：</b>https://du1.ccwu.cc/logo.svg</div>
          <div class="truncate"><b>简介：</b>云端聚合导航与个人精选工具站</div>
        </div>
      </section>

      <!-- 友链卡片展示墙 -->
      <section class="links-wall-section flex flex-col gap-4">
        <div class="flex items-center justify-between pb-2">
          <div class="flex items-center gap-2">
            <h2 class="text-base font-bold text-[var(--text-primary)] m-0">所有好站</h2>
            <span class="text-xs px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary-color)] font-semibold">
              {{ linkList.length }}
            </span>
          </div>
          <el-button
            size="small"
            link
            :loading="isLoading"
            :icon="Refresh"
            class="!text-xs"
            @click="fetchFriendLinks"
          >
            刷新
          </el-button>
        </div>

        <!-- 首次加载状态 -->
        <div v-if="isLoading && linkList.length === 0" class="py-16 flex flex-col items-center justify-center gap-2.5 text-[var(--text-muted)]">
          <el-icon class="is-loading" :size="22" color="var(--primary-color)">
            <Loading />
          </el-icon>
          <span class="text-xs tracking-wide">好站列表载入中...</span>
        </div>

        <!-- 空数据提示 -->
        <div v-else-if="!isLoading && linkList.length === 0" class="py-20 flex flex-col items-center justify-center gap-3 text-[var(--text-muted)] bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)]">
          <el-icon :size="32" class="opacity-40"><Compass /></el-icon>
          <p class="text-sm m-0">暂无已上架的友链，欢迎点击右上角申请成为首批入驻好站 ✨</p>
        </div>

        <!-- 卡片网格列表：移动端双列紧凑自适应，PC端四列 -->
        <div v-else class="links-grid grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <a
            v-for="item in linkList"
            :key="item.id"
            :href="item.url"
            target="_blank"
            rel="noopener noreferrer"
            class="link-card flex flex-col p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] transition-all cursor-pointer select-none relative group"
          >
            <div class="flex items-center gap-2 sm:gap-3 min-w-0">
              <!-- Logo 或备用 Favicon / 首字母头像 -->
              <div class="link-avatar-box w-7.5 h-7.5 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-[var(--border-color)] bg-[var(--bg-surface-soft)]">
                <img
                  v-if="item.logo && !failedLogos.has(item.id)"
                  :src="item.logo"
                  :alt="item.name"
                  class="w-full h-full object-cover"
                  loading="lazy"
                  @error="handleLogoError(item.id)"
                />
                <img
                  v-else-if="getDomainFavicon(item.url) && !failedFavicons.has(item.id)"
                  :src="getDomainFavicon(item.url)"
                  :alt="item.name"
                  class="w-5 h-5 sm:w-6 sm:h-6 object-contain"
                  loading="lazy"
                  @error="handleFaviconError(item.id)"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-white font-bold text-xs sm:text-sm"
                  :style="{ backgroundColor: getAvatarColor(item.name) }"
                >
                  {{ (item.name || 'J').charAt(0).toUpperCase() }}
                </div>
              </div>

              <!-- 站点标题与外链图标 -->
              <div class="flex-1 min-w-0 flex items-center justify-between gap-1">
                <h3 class="link-title font-bold text-xs sm:text-sm m-0 text-[var(--text-primary)] truncate">
                  {{ item.name }}
                </h3>
                <el-icon class="external-icon text-xs text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hidden sm:inline-flex">
                  <TopRight />
                </el-icon>
              </div>
            </div>

            <!-- 描述信息（选填兜底） -->
            <p class="link-desc text-[11px] sm:text-xs text-[var(--text-muted)] leading-relaxed m-0 mt-2 sm:mt-3 line-clamp-2 flex-1">
              {{ item.description || "站长很神秘，暂无详细介绍" }}
            </p>
          </a>
        </div>
      </section>
    </div>

    <!-- 申请友链弹窗 -->
    <el-dialog
      v-model="isApplyDialogOpen"
      title="申请互换友链"
      width="92%"
      style="max-width: 480px"
      align-center
      append-to-body
      destroy-on-close
      class="apply-dialog"
      @closed="handleDialogClosed"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        size="default"
        class="apply-form pt-1"
      >
        <el-form-item label="网站名称" prop="name">
          <el-input
            v-model.trim="form.name"
            placeholder="例如：Jie Hub"
            maxlength="40"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="网站地址" prop="url">
          <el-input
            v-model.trim="form.url"
            placeholder="必须包含协议，如：https://example.com"
          />
        </el-form-item>

        <el-form-item label="网站 Logo / 图标链接（选填）" prop="logo">
          <el-input
            v-model.trim="form.logo"
            placeholder="例如：https://example.com/logo.png"
          />
        </el-form-item>

        <el-form-item label="网站描述（选填）" prop="description">
          <el-input
            v-model.trim="form.description"
            type="textarea"
            :rows="3"
            placeholder="简短介绍您的网站特色或定位（选填）..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="联系邮箱（选填）" prop="email">
          <el-input
            v-model.trim="form.email"
            placeholder="用于接收审核结果通知（选填）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer-actions">
          <el-button
            class="dialog-action-btn"
            :disabled="isSubmitting"
            @click="isApplyDialogOpen = false"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            class="dialog-action-btn"
            :loading="isSubmitting"
            @click="handleSubmitApply"
          >
            提交申请
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import {
  Compass,
  Plus,
  Refresh,
  Loading,
  TopRight,
  CopyDocument
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { getFriendLinks, applyFriendLink } from "@/api/friendLink";

const isLoading = ref(false);
const isSubmitting = ref(false);
const isApplyDialogOpen = ref(false);
const linkList = ref([]);

const failedLogos = reactive(new Set());
const failedFavicons = reactive(new Set());

const formRef = ref(null);
const form = reactive({
  name: "",
  url: "",
  logo: "",
  description: "",
  email: ""
});

const rules = {
  name: [
    { required: true, message: "请输入网站名称", trigger: "blur" },
    { min: 2, max: 40, message: "长度在 2 到 40 个字符之间", trigger: "blur" }
  ],
  url: [
    { required: true, message: "请输入网站地址", trigger: "blur" },
    {
      validator: (_, val, cb) => {
        if (!val) {
          cb(new Error("请输入网站地址"));
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

const handleLogoError = (id) => {
  failedLogos.add(id);
};

const handleFaviconError = (id) => {
  failedFavicons.add(id);
};

const getDomainFavicon = (url) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  } catch {
    return "";
  }
};

const getAvatarColor = (name = "") => {
  const colors = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const fetchFriendLinks = async () => {
  isLoading.value = true;
  try {
    const res = await getFriendLinks();
    if (Array.isArray(res)) {
      linkList.value = res;
    }
  } catch (err) {
    ElMessage.error(err?.message || "获取友链列表失败");
  } finally {
    isLoading.value = false;
  }
};

const copyTextToClipboard = async (text) => {
  // 1. 优先使用现代 Clipboard API（安全上下文 HTTPS / localhost 下可用）
  if (navigator?.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 降级使用传统方法
    }
  }

  // 2. 传统通用降级方案（完美兼容 HTTP 局域网 IP、无安全上下文及移动端环境）
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";
    textArea.setAttribute("readonly", "");
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("复制异常:", err);
    return false;
  }
};

const handleCopySiteInfo = async () => {
  const infoText = `网站名称：Jie Hub
网站地址：https://du1.ccwu.cc/
网站图标：https://du1.ccwu.cc/logo.svg
网站描述：云端聚合导航与个人精选工具站`;
  const isSuccess = await copyTextToClipboard(infoText);
  if (isSuccess) {
    ElMessage.success("本站友链信息已成功复制到剪贴板！");
  } else {
    ElMessage.warning("复制受浏览器安全权限限制，请手动选择复制");
  }
};

const handleDialogClosed = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  form.name = "";
  form.url = "";
  form.logo = "";
  form.description = "";
  form.email = "";
};

const handleSubmitApply = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    isSubmitting.value = true;
    try {
      await applyFriendLink(form);
      ElMessage.success("申请已提交，审核通过后将展示，感谢支持！");
      isApplyDialogOpen.value = false;
      formRef.value.resetFields();
    } catch (err) {
      ElMessage.error(err?.message || "提交申请失败，请稍后重试");
    } finally {
      isSubmitting.value = false;
    }
  });
};

onMounted(() => {
  fetchFriendLinks();
});
</script>

<style lang="scss" scoped>
.explore-page {
  background-color: transparent;
}

.site-info-box {
  box-shadow: var(--card-shadow);
}

.link-card {
  box-shadow: var(--card-shadow);

  &:hover {
    transform: translateY(-3px);
    border-color: var(--primary-color);
    box-shadow: var(--card-shadow-hover);

    .link-title {
      color: var(--primary-color);
    }
  }
}
</style>

<style lang="scss">
/* 友链申请弹窗（全局生效，穿透 append-to-body） */
.el-overlay-dialog {
  display: flex;
  align-items: center;
  justify-content: center;
}

.apply-dialog {
  width: 92% !important;
  max-width: 480px !important;
  height: auto !important;
  min-height: unset !important;
  max-height: 90vh !important;
  margin: auto !important;
  align-self: center !important;
  flex: 0 0 auto !important;
  border-radius: 16px !important;
  overflow: hidden;

  .el-dialog__header {
    padding: 16px 20px 12px;
    margin-right: 0;
    border-bottom: 1px solid var(--border-color);

    .el-dialog__title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }
  }

  .el-dialog__body {
    padding: 16px 20px 8px;
    max-height: calc(82vh - 120px);
    overflow-y: auto;
  }

  .el-dialog__footer {
    padding: 12px 20px 16px;
    border-top: 1px solid var(--border-color);
  }

  .dialog-footer-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
  }

  @media (max-width: 640px) {
    width: 92% !important;
    height: auto !important;
    min-height: unset !important;
    max-height: 85vh !important;
    align-self: center !important;
    flex: 0 0 auto !important;
    border-radius: 14px !important;

    .el-dialog__header {
      padding: 14px 16px 10px;
    }

    .el-dialog__body {
      padding: 12px 16px 6px;
      max-height: 60vh;
    }

    .el-dialog__footer {
      padding: 10px 16px 14px;
    }

    .apply-form {
      .el-form-item {
        margin-bottom: 12px;

        &:last-child {
          margin-bottom: 0;
        }

        .el-form-item__label {
          padding-bottom: 4px;
          font-size: 12px;
          line-height: 1.4;
        }

        .el-input__wrapper,
        .el-textarea__inner {
          font-size: 13px;
        }
      }
    }

    .dialog-footer-actions {
      width: 100%;

      .dialog-action-btn {
        flex: 1;
        margin-left: 0 !important;
        height: 38px;
        font-size: 14px;
      }
    }
  }
}
</style>
