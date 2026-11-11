import { Hono } from "hono";
import { cors } from "hono/cors";
import apiRouter from "./routes";
import type { Bindings } from "./db";

const app = new Hono<{ Bindings: Bindings }>();

// 跨域处理与安全头
app.use(
  "/api/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  })
);

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
