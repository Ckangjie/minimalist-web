<template>
  <div class="dashboard-container flex flex-col gap-4">
    <!-- 欢迎卡片 -->
    <el-card shadow="never" class="!rounded-xl border border-[#e4e7ed]">
      <div class="flex items-center gap-4">
        <el-avatar :size="54" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
        <div>
          <h2 class="text-lg font-bold text-[#303133] m-0">早安，管理员！祝您今天工作愉快</h2>
          <p class="text-xs text-[#909399] mt-1 m-0">Jie Hub 若依管理系统 · 全站留言板统一运营与审核控制台</p>
        </div>
      </div>
    </el-card>

    <!-- 核心指标面板（包含留言数据与访客用户情况统计） -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <el-card shadow="hover" class="!rounded-xl border border-[#e4e7ed]">
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-xs text-[#909399]">全部留言总数</span>
            <span class="text-2xl font-bold text-[#303133] mt-2">{{ stats.total }}</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-[#ecf5ff] text-[#409eff] flex items-center justify-center text-2xl">
            💬
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="!rounded-xl border border-[#e4e7ed]">
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-xs text-[#909399]">待审核留言</span>
            <span class="text-2xl font-bold text-[#e6a23c] mt-2">{{ stats.pending }}</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-[#fdf6ec] text-[#e6a23c] flex items-center justify-center text-2xl">
            ⏳
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="!rounded-xl border border-[#e4e7ed]">
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-xs text-[#909399]">已公开展示留言</span>
            <span class="text-2xl font-bold text-[#67c23a] mt-2">{{ stats.approved }}</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-[#f0f9eb] text-[#67c23a] flex items-center justify-center text-2xl">
            ✅
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="!rounded-xl border border-[#e4e7ed]">
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-xs text-[#909399]">访客用户总数</span>
            <span class="text-2xl font-bold text-[#409eff] mt-2">{{ visitorStats.total }}</span>
          </div>
          <div class="w-12 h-12 rounded-xl bg-[#e6f7ff] text-[#1890ff] flex items-center justify-center text-2xl">
            👥
          </div>
        </div>
      </el-card>
    </div>

    <!-- 访客用户情况统计卡片 -->
    <el-card shadow="never" class="!rounded-xl border border-[#e4e7ed]">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-[#303133]">访问用户情况统计</span>
            <el-tag size="small" type="info">共 {{ visitorStats.total }} 位唯一设备访客</el-tag>
          </div>
          <el-button type="primary" link size="small" @click="router.push('/visitor')">
            查看全部访客明细 →
          </el-button>
        </div>
      </template>

      <el-table
        :data="visitorStats.recentList"
        stripe
        size="small"
        class="w-full"
        v-loading="isVisitorLoading"
        empty-text="暂无访问用户记录"
      >
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="nickname" label="访客昵称" min-width="140">
          <template #default="{ row }">
            <div class="flex items-center gap-1.5 font-semibold text-[#303133]">
              <span class="w-2 h-2 rounded-full bg-[#409eff]"></span>
              <span>{{ row.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="uuid" label="设备唯一识别码 (UUID)" min-width="180">
          <template #default="{ row }">
            <el-tooltip :content="row.uuid" placement="top">
              <span class="font-mono text-xs text-[#606266] bg-[#f4f4f5] px-2 py-0.5 rounded">
                {{ row.uuid?.substring(0, 16) }}...
              </span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="email" label="通知邮箱" min-width="160">
          <template #default="{ row }">
            <span v-if="row.email" class="text-xs text-[#409eff]">{{ row.email }}</span>
            <span v-else class="text-xs text-[#c0c4cc]">未绑定</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="首次访问时间" min-width="160" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" size="small" type="success">正常</el-tag>
            <el-tag v-else size="small" type="danger">禁用</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 快捷功能与产品架构说明 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <el-card shadow="never" class="!rounded-xl border border-[#e4e7ed]">
        <template #header>
          <span class="text-sm font-bold text-[#303133]">快捷入口</span>
        </template>
        <div class="flex flex-wrap gap-3">
          <el-button @click="router.push('/guestbook')">
            查看全部留言
          </el-button>
          <el-button type="primary" plain @click="router.push('/visitor')">
            管理访客用户
          </el-button>
        </div>
      </el-card>

      <el-card shadow="never" class="!rounded-xl border border-[#e4e7ed]">
        <template #header>
          <span class="text-sm font-bold text-[#303133]">技术架构与环境说明</span>
        </template>
        <div class="text-xs text-[#606266] leading-relaxed flex flex-col gap-2">
          <div><b>前端管理系统</b>：Vue 3.5 + TypeScript + Vite + UnoCSS + Element Plus</div>
          <div><b>后台服务端</b>：Bun + Hono + Drizzle ORM（兼容 Cloudflare D1 与 SQLite）</div>
          <div><b>访客与留言治理</b>：浏览器唯一 UUID 标识、留言审核、防 XSS 过滤与 QQ 邮件通知</div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { listManageComments } from "@/api/guestbook";
import { getVisitorList } from "@/api/visitor";

const router = useRouter();

const stats = reactive({
  total: 0,
  pending: 0,
  approved: 0,
  hiddenOrRejected: 0
});

const visitorStats = reactive({
  total: 0,
  recentList: [] as any[]
});

const isVisitorLoading = ref(false);

const fetchStats = async () => {
  try {
    const allRes = await listManageComments({ pageNum: 1, pageSize: 100 });
    const list = allRes?.list ?? [];
    stats.total = allRes?.total ?? 0;
    stats.pending = list.filter((item: any) => item.status === "pending").length;
    stats.approved = list.filter((item: any) => item.status === "approved").length;
    stats.hiddenOrRejected = list.filter((item: any) => item.status === "hidden" || item.status === "rejected").length;
  } catch (error) {
    console.error("加载留言统计失败:", error);
  }
};

const fetchVisitorStats = async () => {
  isVisitorLoading.value = true;
  try {
    const res = await getVisitorList({ pageNum: 1, pageSize: 5 });
    visitorStats.total = res?.total ?? 0;
    visitorStats.recentList = res?.list ?? [];
  } catch (error) {
    console.error("加载访客统计失败:", error);
  } finally {
    isVisitorLoading.value = false;
  }
};

onMounted(() => {
  fetchStats();
  fetchVisitorStats();
});
</script>
