# backend

基于 Bun + Hono + Drizzle ORM + SQLite 的轻量 API 服务。

## 开始使用

### 安装 Bun

```bash
# Linux/macOS
./install-bun.sh

# Windows PowerShell
.\install-bun.ps1
```

### 开发启动

```bash
bun install
bun run dev
```

默认访问：

- 静态首页：http://localhost:3000
- 局域网/IP 访问：http://<本机IP>:3000

## 项目结构

```text
backend/
├── src/
│   ├── db/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── utils/
│   ├── middlewares/
│   └── index.ts
├── public/
├── uploads/
├── logs/
├── .env
├── AGENTS.md
├── drizzle.config.ts
├── pm2.config.cjs
├── install-bun.sh
├── install-bun.ps1
├── package.json
└── tsconfig.json
```

## 分层说明

- `routes`：只负责注册路由。
- `controllers`：解析请求、调用 service、返回统一响应。
- `services`：处理业务逻辑和数据库查询。
- `db`：维护 Drizzle schema、数据库连接和轻量初始化。
- `utils`：只放真实复用的公共工具。

## 生产部署

PM2 默认通过 Bun 运行 TypeScript 入口文件，配置文件为 `pm2.config.cjs`。

```bash
bun run start
bun run status
bun run logs
bun run restart
bun run stop
```

## 示例接口说明

模板默认不生成业务接口文件。`/api/items` 只是推荐的分层示例：需要新增资源接口时，可按 `src/routes/items.ts`、`src/controllers/items.ts`、`src/services/items.ts`、`src/db/schema.ts` 的链路添加，并在 `src/routes/index.ts` 中挂载到 `/items`。

## 常用命令

```bash
bun run dev
bun run start
bun run stop
bun run restart
bun run logs
bun run status
bun run typecheck
bun run db:generate
bun run db:push
```

## 导航图标字段迁移

新数据库直接使用 `src/db/init.sql`。已有数据库在切换到新版后端后，先备份，再在 `backend` 目录按环境执行一次迁移。迁移仅删除 `nav_category.icon` 和 `nav_item.icon`，保留其他列和记录。

```bash
# Bun 本地 SQLite（需已安装 sqlite3）
sqlite3 data/local.db ".read src/db/migrations/drop-nav-icons.sql"

# Wrangler 本地 D1
bun x wrangler d1 execute minimalist-db --local --file=./src/db/migrations/drop-nav-icons.sql

# 线上 D1
bun x wrangler d1 execute minimalist-db --remote --file=./src/db/migrations/drop-nav-icons.sql
```

## 按需扩展

```bash
# 参数校验
bun add zod

# 跨域
bun add @hono/cors
```

## AI 协作

项目根目录包含 `AGENTS.md`，后续让 AI 协作修改项目时应优先遵循其中的项目规范。每次任务完成后都需要做自review，并在回复中简要说明检查结果。
