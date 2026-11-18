<template>
  <footer class="footer border-t">
    <div class="footer-inner max-w-1200px mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
      <p class="footer-copy m-0">
        &copy; {{ year }} <b>Jie Hub</b> · 云端聚合导航 · Powered by Cloudflare Pages &amp; Workers
      </p>

      <!-- 在线用户与全站访客统计数据 -->
      <div class="footer-stats flex items-center gap-3 select-none">
        <div class="online-badge flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg-surface-soft)] border border-[var(--border-color)]">
          <span class="online-indicator"></span>
          <span>当前在线 <b class="text-[var(--text-primary)]">{{ stats.onlineCount }}</b> 人</span>
        </div>
        <span class="opacity-40">|</span>
        <span>累计访客 <b class="text-[var(--text-primary)]">{{ stats.totalVisitors }}</b> 人</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { reactive, onMounted, onUnmounted } from "vue";
import request from "@/utils/request";

const year = new Date().getFullYear();

const stats = reactive({
  onlineCount: 1,
  totalVisitors: 0
});

let timer = null;

const fetchOnlineStats = async () => {
  try {
    let uuid = "";
    try {
      uuid = localStorage.getItem("jie_hub_visitor_uuid") || "";
    } catch {}

    const res = await request(`/api/stats/online${uuid ? `?uuid=${encodeURIComponent(uuid)}` : ""}`);
    if (res) {
      if (typeof res.onlineCount === "number") stats.onlineCount = res.onlineCount;
      if (typeof res.totalVisitors === "number") stats.totalVisitors = res.totalVisitors;
    }
  } catch (err) {
    console.warn("获取在线统计失败:", err);
  }
};

onMounted(() => {
  fetchOnlineStats();
  // 每 30 秒轮询一次平滑更新在线数据
  timer = setInterval(fetchOnlineStats, 30000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.footer {
  background-color: var(--bg-surface);
  border-color: var(--border-color);

  &-copy {
    color: var(--text-muted);
  }
}

.online-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
  display: inline-block;
  animation: pulseGlow 2s infinite ease-in-out;
}

@keyframes pulseGlow {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.85);
  }
}
</style>
