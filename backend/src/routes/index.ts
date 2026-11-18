import { Hono } from "hono";
import type { Bindings } from "../db";
import { getDb, schema } from "../db";
import { success } from "../utils/response";
import * as guestbookController from "../controllers/guestbookController";
import * as authController from "../controllers/authController";
import * as visitorController from "../controllers/visitorController";

const apiRouter = new Hono<{ Bindings: Bindings }>();

// 鉴权与管理员登录接口
apiRouter.post("/login", authController.login);
apiRouter.get("/getInfo", authController.getUserInfo);
apiRouter.post("/logout", authController.logout);

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

  // 本地未绑定 D1 或无数据时默认返回 'kj22'
  return success(c, {
    name: "kj22"
  });
});

// 前台公开接口（游客免登录）
apiRouter.post("/guestbook/visitor/sync", visitorController.syncVisitor);
apiRouter.get("/guestbook/list", guestbookController.getOpenList);
apiRouter.post("/guestbook", guestbookController.submitOpen);
apiRouter.post("/guestbook/submit", guestbookController.submitOpen);

// 后台访客用户管理接口
apiRouter.get("/admin/visitor/list", visitorController.getVisitorList);
apiRouter.delete("/admin/visitor/:id", visitorController.removeVisitor);
apiRouter.post("/admin/visitor/batch-delete", visitorController.batchRemoveVisitors);

// 后台管理接口（供管理端使用）
apiRouter.get("/guestbook/manage/list", guestbookController.getManageList);
apiRouter.get("/guestbook/manage/:id", guestbookController.getManageDetail);
apiRouter.put("/guestbook/manage/:id/status", guestbookController.changeStatus);
apiRouter.delete("/guestbook/manage/:id", guestbookController.removeComment);
apiRouter.post("/guestbook/manage/reply", guestbookController.replyComment);
apiRouter.put("/guestbook/manage/reply/:id", guestbookController.editReply);
apiRouter.get("/guestbook/manage/audit-logs/:id", guestbookController.getAuditLogs);

export default apiRouter;
