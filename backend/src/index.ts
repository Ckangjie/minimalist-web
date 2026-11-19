import { Hono } from "hono";
import { cors } from "hono/cors";
import apiRouter from "./routes";
import type { Bindings } from "./db";

const app = new Hono<{ Bindings: Bindings }>();

let isD1Initialized = false;

// 跨域处理与安全头
app.use(
  "/api/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);

// 确保 Cloudflare D1 数据库全量表结构自动初始化（包含留言表、审核日志表、访客表与对应索引）
app.use("/api/*", async (c, next) => {
  const d1 = c.env?.DB ?? c.env?.minimalist_db;
  if (d1 && !isD1Initialized && typeof (d1 as any).exec === "function") {
    try {
      await (d1 as any).exec(`
        -- 留言表
        CREATE TABLE IF NOT EXISTS guestbook_comment (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          root_id INTEGER,
          reply_to_id INTEGER,
          level INTEGER NOT NULL,
          nickname TEXT NOT NULL,
          content TEXT NOT NULL,
          author_type TEXT NOT NULL,
          admin_id INTEGER,
          email TEXT,
          status TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          reviewed_at TEXT,
          reviewed_by INTEGER,
          deleted_at TEXT,
          source_hash TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_root_status_time ON guestbook_comment (root_id, status, deleted_at, created_at, id);
        CREATE INDEX IF NOT EXISTS idx_status_time ON guestbook_comment (status, deleted_at, created_at, id);
        CREATE INDEX IF NOT EXISTS idx_source_time ON guestbook_comment (source_hash, created_at);

        -- 审核操作日志表
        CREATE TABLE IF NOT EXISTS guestbook_audit_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          comment_id INTEGER NOT NULL,
          operator_id INTEGER NOT NULL,
          action TEXT NOT NULL,
          before_status TEXT,
          after_status TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          remark TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_audit_comment_time ON guestbook_audit_log (comment_id, created_at);
        CREATE INDEX IF NOT EXISTS idx_audit_operator_time ON guestbook_audit_log (operator_id, created_at);

        -- 访客用户表
        CREATE TABLE IF NOT EXISTS guestbook_visitor (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          uuid TEXT NOT NULL UNIQUE,
          nickname TEXT NOT NULL,
          email TEXT,
          client_ip TEXT,
          user_agent TEXT,
          status TEXT NOT NULL DEFAULT 'active',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_visitor_uuid ON guestbook_visitor (uuid);

        -- 友情链接表
        CREATE TABLE IF NOT EXISTS friend_link (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          url TEXT NOT NULL,
          logo TEXT,
          description TEXT,
          email TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          sort_order INTEGER NOT NULL DEFAULT 0,
          reject_reason TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          reviewed_at TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_friend_link_status_sort ON friend_link (status, sort_order, created_at);
      `);
      isD1Initialized = true;
    } catch (e) {
      console.warn("D1 全量表结构自动初始化异常:", e);
    }
  }
  await next();
});

// 挂载 API 子路由
app.route("/api", apiRouter);

// 404 处理
app.notFound((c) => {
  return c.json(
    {
      code: 404,
      message: "接口不存在",
      data: null
    },
    404
  );
});

// 兼容 Bun 本地直接运行与 Cloudflare Workers 边缘计算
export default {
  port: Number(process.env.PORT || 3000),
  fetch: app.fetch
};
