<template>
  <main class="home">
    <span>{{ greetingText }}</span>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const userName = ref("");

// 纯派生问候文案，文字无多余修饰
const greetingText = computed(() => {
  return `你好 -${userName.value || "kj"}`;
});

// 获取用户信息（读取后端 D1 数据，异常时保持默认 kj）
const loadUserInfo = async () => {
  try {
    const res = await fetch("/api/user");
    const json = await res.json();
    if (json?.code === 200 && json?.data?.name) {
      userName.value = json.data.name;
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
