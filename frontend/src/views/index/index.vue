<template>
  <section class="cf-container">
    <header class="hero-header">
      <span class="badge">Cloudflare 全栈边缘架构</span>
      <h1 class="title">Minimalist Web</h1>
      <p class="subtitle">运行在 Cloudflare 边缘网络的 Vue3 + Bun + Hono + D1 现代化全栈应用</p>
      <div class="domain-pill">
        <span class="pulse-dot"></span>
        <span>绑定域名：du1.ccwu.cc</span>
      </div>
    </header>

    <div class="content-grid">
      <!-- 注册表单卡片 -->
      <article class="card form-card">
        <h2 class="card-title">边缘数据写入 (D1 + KV)</h2>
        <p class="card-desc">提交数据将通过 Workers 边缘节点写入 D1 关系型数据库，并同步至 Workers KV 缓存。</p>

        <form class="register-form" @submit.prevent="handleSubmit">
          <div class="form-item">
            <label for="username">用户名</label>
            <input
              id="username"
              v-model.trim="formData.username"
              type="text"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div class="form-item">
            <label for="email">电子邮箱</label>
            <input
              id="email"
              v-model.trim="formData.email"
              type="email"
              placeholder="例如：user@du1.ccwu.cc"
              required
            />
          </div>

          <button
            type="submit"
            class="submit-button"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? "正在提交..." : "注册并写入边缘 D1" }}
          </button>
        </form>

        <p v-if="tipMessage" class="feedback-msg" :class="{ 'is-error': hasError }">
          {{ tipMessage }}
        </p>
      </article>

      <!-- 数据列表卡片 -->
      <article class="card list-card">
        <div class="card-header-bar">
          <h2 class="card-title">D1 数据列表 (最近 20 条)</h2>
          <button
            type="button"
            class="refresh-btn"
            :disabled="isLoading"
            @click="loadUsers"
          >
            {{ isLoading ? "刷新中..." : "刷新列表" }}
          </button>
        </div>

        <div v-if="isLoading" class="state-container">
          <div class="spinner"></div>
          <p>正在读取 Cloudflare D1 边缘数据...</p>
        </div>

        <div v-else-if="isEmpty" class="state-container empty">
          <p>暂无数据记录，欢迎在左侧提交第一条数据！</p>
        </div>

        <ul v-else class="user-list">
          <li v-for="user in userList" :key="user.id" class="user-item">
            <div class="user-meta">
              <span class="user-name">{{ user.username }}</span>
              <span class="user-email">{{ user.email }}</span>
            </div>
            <time class="user-time">{{ user.createdAt ?? "刚刚" }}</time>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";

// 响应式表单数据
const formData = reactive({
  username: "",
  email: ""
});

// 用户列表与状态标识
const userList = ref([]);
const isSubmitting = ref(false);
const isLoading = ref(false);
const hasError = ref(false);
const tipMessage = ref("");

// 纯派生状态
const isEmpty = computed(() => (userList.value?.length ?? 0) === 0);

// 获取用户列表 (相对路径 /api，天然同源无跨域)
const loadUsers = async () => {
  isLoading.value = true;
  try {
    const res = await fetch("/api/users");
    const json = await res.json();
    if (json?.code === 200) {
      userList.value = json?.data ?? [];
    }
  } catch (error) {
    console.error("加载用户数据失败:", error);
  } finally {
    isLoading.value = false;
  }
};

// 提交注册表单
const handleSubmit = async () => {
  if (!formData.username || !formData.email) {
    return;
  }

  isSubmitting.value = true;
  hasError.value = false;
  tipMessage.value = "";

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const json = await res.json();

    if (json?.code === 200) {
      tipMessage.value = "注册成功！数据已入库 D1 并缓存至 KV";
      formData.username = "";
      formData.email = "";
      await loadUsers();
    } else {
      hasError.value = true;
      tipMessage.value = json?.message ?? "注册失败，请检查网络或后端配置";
    }
  } catch (error) {
    hasError.value = true;
    tipMessage.value = "请求异常，请确认后端服务已启动";
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<style lang="scss" scoped>
.cf-container {
  box-sizing: border-box;
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px 80px;
}

.hero-header {
  text-align: center;
  margin-bottom: 36px;

  .badge {
    display: inline-block;
    padding: 4px 12px;
    font-size: 13px;
    font-weight: 600;
    color: #f6821f; // Cloudflare Orange
    background-color: rgba(246, 130, 31, 0.1);
    border-radius: 999px;
    margin-bottom: 12px;
  }

  .title {
    font-size: clamp(28px, 5vw, 42px);
    font-weight: 800;
    color: #1a1a1a;
    letter-spacing: -0.5px;
    margin-bottom: 8px;
  }

  .subtitle {
    font-size: 15px;
    color: #666;
    margin-bottom: 16px;
  }

  .domain-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #2b3a4a;
    background: #f0f4f8;
    padding: 6px 16px;
    border-radius: 20px;

    .pulse-dot {
      width: 8px;
      height: 8px;
      background-color: #10b981;
      border-radius: 50%;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
    }
  }
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.card {
  box-sizing: border-box;
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid #ebeef5;

  .card-title {
    font-size: 18px;
    font-weight: 700;
    color: #222;
    margin-bottom: 8px;
  }

  .card-desc {
    font-size: 13px;
    color: #777;
    margin-bottom: 20px;
    line-height: 1.5;
  }
}

.card-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .card-title {
    margin-bottom: 0;
  }

  .refresh-btn {
    border: none;
    background: transparent;
    color: #3b82f6;
    font-size: 13px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;

    &:hover {
      background: #eff6ff;
    }

    &:disabled {
      color: #aaa;
      cursor: not-allowed;
    }
  }
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    label {
      font-size: 13px;
      font-weight: 600;
      color: #444;
    }

    input {
      box-sizing: border-box;
      width: 100%;
      padding: 10px 14px;
      font-size: 14px;
      border: 1px solid #dcdfe6;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.2s;

      &:focus {
        border-color: #f6821f;
      }
    }
  }

  .submit-button {
    box-sizing: border-box;
    width: 100%;
    padding: 12px;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
    background: #f6821f;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s, opacity 0.2s;

    &:hover:not(:disabled) {
      background: #e67312;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.feedback-msg {
  margin-top: 14px;
  font-size: 13px;
  color: #10b981;

  &.is-error {
    color: #ef4444;
  }
}

.state-container {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #888;
  font-size: 14px;

  .spinner {
    width: 24px;
    height: 24px;
    border: 3px solid #f0f0f0;
    border-top-color: #f6821f;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .user-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    background: #f9fafb;
    border-radius: 8px;
    min-width: 0;

    .user-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;

      .user-name {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .user-email {
        font-size: 12px;
        color: #888;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .user-time {
      font-size: 12px;
      color: #aaa;
      flex-shrink: 0;
      margin-left: 12px;
    }
  }
}
</style>
