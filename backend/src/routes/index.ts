import { Hono } from "hono";
import { desc } from "drizzle-orm";
import type { Bindings } from "../db";
import { getDb, schema } from "../db";
import { success, fail } from "../utils/response";

const apiRouter = new Hono<{ Bindings: Bindings }>();

// 健康检查接口
apiRouter.get("/health", (c) => {
  return success(c, {
    status: "ok",
    domain: "du1.ccwu.cc",
    timestamp: new Date().toISOString()
  });
});

// 获取用户列表 (Cloudflare D1 驱动)
apiRouter.get("/users", async (c) => {
  try {
    if (!c.env?.DB) {
      return success(c, [], "Cloudflare D1 数据库尚未绑定或本地空响应");
    }
    const db = getDb(c.env.DB);
    const results = await db.select().from(schema.users).orderBy(desc(schema.users.id)).limit(20);
    return success(c, results);
  } catch (error: any) {
    return fail(c, error?.message ?? "获取用户列表异常", 500);
  }
});

// 提交注册数据 (Cloudflare D1 入库 + KV 缓存)
apiRouter.post("/register", async (c) => {
  try {
    if (!c.env?.DB) {
      return fail(c, "Cloudflare D1 数据库未绑定，请配置 DB 资源", 500);
    }
    const body = await c.req.json<{ username?: string; email?: string }>();
    const username = body?.username?.trim();
    const email = body?.email?.trim();

    if (!username || !email) {
      return fail(c, "用户名和邮箱不能为空", 400);
    }

    const db = getDb(c.env.DB);
    await db.insert(schema.users).values({ username, email });

    // 写入 Cloudflare KV 会话缓存（1 小时有效期）
    if (c.env?.KV) {
      await c.env.KV.put(`user:${email}`, username, { expirationTtl: 3600 });
    }

    return success(c, null, "注册成功");
  } catch (error: any) {
    return fail(c, error?.message ?? "注册失败", 500);
  }
});

export default apiRouter;
