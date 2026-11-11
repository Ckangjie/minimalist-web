# AGENTS.md

## AI 快速执行摘要

- 先查真实调用链，再修改代码。
- 优先采用最小可行修改，只解决当前问题。
- 新增依赖、公共抽象、中间件或全局配置前，先确认确有必要。
- 默认保留 Bun 安装脚本、PM2 生产进程配置和日志目录；鉴权、上传接口、缓存、队列或复杂工具函数库按需添加。
- API 返回保持统一的 `{ code, message, data }` 结构。
- 代码改动尽量运行 TypeScript 或启动校验；文档改动通常做 diff 检查即可。
- 任务完成后必须自review，并在回复中说明自查结果。

## AI 工作原则

- 修改前先阅读当前文件、路由、controller、service、db/schema 和调用方，确认真实影响范围后再动手。
- 优先遵循 route-controller-service-db 的分层结构，不把业务逻辑堆到路由文件里。
- 不顺手重构、不扩展无关需求、不改变既有架构。
- 保护现有改动：不要回滚、删除或格式化与任务无关的文件，除非用户明确要求。
- 搜索和排查必须控制范围，优先查目标实体、路由入口和必要公共工具，不扫描 `node_modules`、`dist`、`drizzle` 等无关目录。
- 新增依赖前必须确认当前项目没有已有替代方案；能用 Bun/Hono/Drizzle 原生能力解决的小需求，不急着引入库。
- 公共工具、中间件、数据库封装只在出现真实复用或跨模块需求时新增。
- 修改后按影响范围做校验；后端代码优先运行 `bun x tsc --noEmit`，必要时启动服务并测试接口。
- 每次任务完成后必须做一次自review，检查改动范围、潜在回归、是否满足用户最新要求，并在最终回复中简要说明。
- 回复保持简洁，说明改了什么、为什么改、是否校验；不要输出与任务无关的长篇解释。

## 项目说明

本项目是基于 Bun + Hono + Drizzle ORM + SQLite 的轻量 API 服务。默认保留可运行的基础服务、分层目录、SQLite/Drizzle 配置、静态资源目录、Bun 安装脚本和 PM2 生产进程配置。

项目遵循“先轻量起步，部署必需项默认就绪，业务能力按需扩展”的原则。PM2 配置和日志目录属于初始化必需项；鉴权、上传接口、缓存、队列、复杂日志系统或大量默认工具函数只有业务真实需要时再添加。

## 技术栈

- Bun
- Hono
- TypeScript
- Drizzle ORM
- SQLite
- PM2

## 服务访问

- 默认监听 `0.0.0.0`，确保服务启动后可通过本机 IP 访问。
- 如需调整监听地址，修改 `.env` 中的 `HOST`，但不要无意改回仅监听 `localhost`。

## 包管理

- 优先使用 `bun install` 和 `bun run`。
- 不使用 `npm`、`yarn` 或 `pnpm` 安装本项目依赖。
- 新增依赖前先确认是否真的需要，以及当前项目是否已有更轻的替代方案。
- 不要删除或随意重建锁文件。

## 目录规范

- `src/index.ts`：应用入口，初始化 Hono、挂载 API 路由和静态资源。
- `src/routes/`：路由注册，只做路径和 controller 方法绑定。
- `src/controllers/`：控制器层，解析请求参数、调用 service、组装响应。
- `src/services/`：服务层，承载业务逻辑和 Drizzle 查询。
- `src/db/`：数据库连接、schema 和轻量初始化。
- `src/utils/`：公共工具。不要一开始生成一堆默认工具函数；确实复用时再沉淀。
- `src/middlewares/`：中间件。需要鉴权、日志、限流等横切逻辑时再添加。
- `public/`：静态资源。
- `uploads/`：上传暂存目录；没有上传需求时只保留占位。
- `logs/`：PM2 日志目录，默认保留占位。
- `pm2.config.cjs`：生产进程配置，通过 Bun 解释 TypeScript 入口文件。
- `install-bun.sh` / `install-bun.ps1`：Linux/macOS 和 Windows 的 Bun 安装脚本。

## 默认生成的部署项

- 默认生成 PM2 配置。
- 默认生成 Bun 安装脚本。
- 默认生成 PM2 日志目录。

## 默认不做的事

- 不默认生成登录鉴权、token、cookie 示例。
- 不默认生成上传接口。
- 不默认生成示例业务接口文件，例如 `/api/items`。
- 不默认生成缓存、队列、任务调度。
- 不默认生成大量工具函数。
- 不默认生成 ESLint、Prettier、Husky、lint-staged。

## API 规范

- 接口统一返回 `{ code, message, data }`。
- 成功响应使用 `success(c, data, message)`。
- 失败响应使用 `fail(c, message, code)`。
- controller 负责参数校验和异常转换。
- service 不直接操作 Hono `Context`。
- 数据库字段命名在 SQLite 中使用下划线（snake_case），Drizzle 已配置 casing: "snake_case"，TypeScript 代码与 API 返回默认自动映射为小驼峰（camelCase）。

## 修改与验证

- 修改前先阅读目标实体的 route、controller、service、schema 和调用方。
- 只实现当前需求，不顺手扩展无关功能。
- 不回滚用户已有改动，除非用户明确要求。
- 代码改动后尽量运行：

```bash
bun x tsc --noEmit
```

需要接口验证时，启动服务：

```bash
bun run dev
```

## AI 协作要求

- 完成任务后必须自review，检查改动范围、潜在回归、是否满足用户最新要求，并在回复中简要说明。
- 最终回复保持简洁，说明改了什么、是否验证、是否存在未完成项。
