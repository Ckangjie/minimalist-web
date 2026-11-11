import { Hono } from "hono";
import type { Bindings } from "../db";
import { getDb, schema } from "../db";
import { success } from "../utils/response";

const apiRouter = new Hono<{ Bindings: Bindings }>();

// 从 Cloudflare D1 数据库读取用户信息
apiRouter.get("/user", async (c) => {
  try {
    const d1 = c.env?.DB ?? c.env?.minimalist_db;
    if (d1) {
      const db = getDb(d1);
      const userList = await db.select().from(schema.users).limit(1);
      const targetUser = userList?.[0];
      if (targetUser?.username) {
        return success(c, {
          name: targetUser.username
        });
      }
    }
  } catch (error) {
    console.error("读取 D1 数据库异常:", error);
  }

  // 本地未绑定 D1 或无数据时默认返回 'kj'
  return success(c, {
    name: "kj22"
  });
});

export default apiRouter;
