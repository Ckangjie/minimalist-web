<template>
  <div class="login-container flex items-center justify-center min-h-screen">
    <div class="login-box w-full max-w-400px p-8 rounded-xl shadow-2xl bg-white border border-[#e4e7ed] mx-4">
      <div class="login-header text-center mb-6">
        <div class="text-3xl mb-2">🛡️</div>
        <h2 class="text-xl font-bold text-[#303133] m-0">Jie Hub 统一管理系统</h2>
        <p class="text-xs text-[#909399] mt-1 m-0">若依架构风 · 全站留言板运营与审核中枢</p>
      </div>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        size="large"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model.trim="loginForm.username"
            placeholder="账号 (默认: admin)"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model.trim="loginForm.password"
            type="password"
            placeholder="密码 (默认: admin123)"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <div class="flex items-center justify-between text-xs mb-4">
          <el-checkbox v-model="isRememberMe" label="记住密码" />
          <span class="text-[#909399]">系统已内置安全防护</span>
        </div>

        <el-button
          type="primary"
          class="w-full !rounded-lg !font-bold"
          :loading="isLoading"
          @click="handleLogin"
        >
          {{ isLoading ? "登 录 中..." : "登 录" }}
        </el-button>
      </el-form>

      <div class="login-footer text-center mt-6 text-xs text-[#909399]">
        <span>测试提示：账号密码可直接使用 admin / admin123</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue";
import { login } from "@/api/auth";

const router = useRouter();
const route = useRoute();

const loginFormRef = ref<FormInstance>();
const isLoading = ref(false);
const isRememberMe = ref(true);

const loginForm = reactive({
  username: "admin",
  password: "admin123"
});

const loginRules: FormRules = {
  username: [{ required: true, message: "请输入登录账号", trigger: "blur" }],
  password: [{ required: true, message: "请输入登录密码", trigger: "blur" }]
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    await loginFormRef.value.validate();
  } catch {
    return;
  }

  isLoading.value = true;
  try {
    const res = await login({
      username: loginForm.username,
      password: loginForm.password
    });

    localStorage.setItem("admin_token", res.token);
    localStorage.setItem("admin_user", JSON.stringify(res.user));
    ElMessage.success("登录成功，欢迎回来！");

    const redirect = (route.query.redirect as string) || "/dashboard";
    router.replace(redirect);
  } catch (error: any) {
    ElMessage.error(error?.message ?? "登录失败，请检查账号密码");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // 如果已登录直接跳转
  const token = localStorage.getItem("admin_token");
  if (token) {
    router.replace("/dashboard");
  }
});
</script>

<style scoped>
.login-container {
  background: linear-gradient(135deg, #1f2d3d 0%, #2d3a4b 100%);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: "";
  position: absolute;
  top: -20%;
  left: -20%;
  width: 140%;
  height: 140%;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.08) 0%, transparent 60%);
  pointer-events: none;
}
</style>
