# Minimalist Web

基于 **Vue 3 (Vite)** 前端与 **Bun + Hono + Drizzle ORM** 后端的全栈工程，原生适配部署至 **Cloudflare 全生态**（Pages + Workers + D1 + KV）。

## 架构拓扑与部署方案

本项目参考 [Cloudflare 全生态实操指南](d:\Users\10408\OneDrive\Desktop\cloudflare-guide-summary.md) 实现：

```mermaid
flowchart TD
    User([访客 / 客户端]) --> CF_Edge[Cloudflare 边缘网络: du1.ccwu.cc]
    
    subgraph Routing[边缘路由分发]
        CF_Edge -->|/ (静态页面与路由)| Pages[Cloudflare Pages - Frontend]
        CF_Edge -->|/api/* (边缘计算)| Worker[Cloudflare Workers - Backend]
    end

    subgraph Storage[边缘数据与缓存]
        Worker --> D1[(Cloudflare D1 关系数据库)]
        Worker --> KV[(Cloudflare Workers KV 缓存)]
    end
```

- **目标域名**：`du1.ccwu.cc`
- **前端工程 (`frontend/`)**：Vue 3 + Vite 6 + SCSS，构建产物托管于 **Cloudflare Pages**。
- **后端工程 (`backend/`)**：Bun + Hono + Drizzle ORM，通过 **Cloudflare Workers** 边缘运行，绑定 **D1** (SQLite 数据库) 与 **KV** (会话缓存)。

---

## 目录结构

```text
minimalist-web/
├── frontend/                     # 前端工程 (Vue 3 + Vite)
│   ├── public/
│   │   ├── _redirects            # Cloudflare Pages SPA 路由重定向配置
│   │   └── favicon.ico
│   ├── src/
│   │   ├── views/index/index.vue # 边缘数据交互展示页 (D1 列表与提交)
│   │   ├── layout/               # 布局组件
│   │   ├── router/               # 页面路由
│   │   └── main.js
│   ├── vite.config.js            # Vite 配置 (开发代理转发至后端边缘端口)
│   └── package.json
├── backend/                      # 后端工程 (Bun + Hono + Drizzle)
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts          # D1 数据库实例封装 (drizzle-orm/d1)
│   │   │   ├── schema.ts         # Drizzle 表结构定义
│   │   │   └── init.sql          # D1 初始化建表 SQL
│   │   ├── routes/
│   │   │   └── index.ts          # /api/users 与 /api/register 接口
│   │   ├── utils/
│   │   │   └── response.ts       # 统一响应封装
│   │   └── index.ts              # Hono 入口 (跨域与路由挂载)
│   ├── wrangler.toml             # Cloudflare Workers 部署与 D1/KV 绑定配置
│   ├── drizzle.config.ts         # Drizzle 迁移配置
│   └── package.json
└── package.json                  # 全局多工程快捷管理命令
```

---

## 本地开发调试

### 1. 启动后端

```bash
cd backend
bun install

# 模式 A：使用 Wrangler 本地模拟 Cloudflare 边缘环境与 D1/KV (推荐，默认监听 8787)
bun run dev:wrangler

# 模式 B：使用 Bun 直接热重载运行 (监听 3000)
bun run dev
```

### 2. 启动前端

```bash
cd frontend
pnpm install
pnpm run dev
```

前端开发服务器将自动代理 `/api` 流量到后端。

---

## Cloudflare 生产部署流程

### 步骤一：创建 Cloudflare D1 数据库与 KV 命名空间

进入 `backend/` 目录：

```bash
# 1. 登录 Cloudflare
npx wrangler login

# 2. 创建 D1 数据库
npx wrangler d1 create minimalist-db
# 执行后复制输出中的 database_id，填入 backend/wrangler.toml 的 [[d1_databases]] 中

# 3. 初始化 D1 表结构
npx wrangler d1 execute minimalist-db --remote --file=./src/db/init.sql

# 4. 创建 KV 命名空间
npx wrangler kv:namespace create minimalist-kv
# 执行后复制输出中的 id，填入 backend/wrangler.toml 的 [[kv_namespaces]] 中
```

### 步骤二：部署后端至 Cloudflare Workers

在 `backend/` 目录执行：

```bash
npx wrangler deploy
```

Worker 将自动绑定边缘路由：`du1.ccwu.cc/api/*`。

### 步骤三：部署前端至 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)，进入 **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**。
2. 选择本仓库 `minimalist-web`。
3. 填写构建参数：
   - **Root directory**：`frontend`
   - **Framework preset**：`Vite`
   - **Build command**：`pnpm run build`
   - **Build output directory**：`dist`
4. 点击 **Save and Deploy**。
5. 部署完成后，在 Pages 项目的 **Custom domains** 中添加自定义域名 `du1.ccwu.cc`。
