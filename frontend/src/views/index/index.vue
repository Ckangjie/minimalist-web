<template>
  <main class="home">
    <span>{{ greetingText }}</span>
  </main>
</template>

<script setup>
import { getUserInfo } from "@/api/user";
import { computed, onMounted, ref } from "vue";

const USER_NAME_STORAGE_KEY = "cached_user_name";
const userName = ref(localStorage.getItem(USER_NAME_STORAGE_KEY) ?? "");

// 纯派生问候文案，文字无多余修饰
const greetingText = computed(() => {
  return `hi -${userName.value || "kj"}`;
});

// 获取用户信息（读取后端 D1 数据，异常时保持默认 kj）
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
.home {
  box-sizing: border-box;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    font-size: 20px;
    color: #333333;
  }
}
</style>
