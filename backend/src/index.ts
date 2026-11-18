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

// 确保 Cloudflare D1 数据库新表结构自动初始化（解决线上缺少 guestbook_visitor 等新表报错）
app.use("/api/*", async (c, next) => {
  const d1 = c.env?.DB ?? c.env?.minimalist_db;
  if (d1 && !isD1Initialized && typeof (d1 as any).exec === "function") {
    try {
      await (d1 as any).exec(`
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
      `);
      isD1Initialized = true;
    } catch (e) {
      console.warn("D1 表结构自动初始化异常:", e);
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
