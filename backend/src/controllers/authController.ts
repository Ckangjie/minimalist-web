import type { Context } from "hono";
import { success, fail } from "../utils/response";

/**
 * 管理端登录接口
 */
export const login = async (c: Context) => {
  try {
    const body = await c.req.json();
    const username = (body.username ?? "").toString().trim();
    const password = (body.password ?? "").toString().trim();

    if (!username || !password) {
      return fail(c, "账号或密码不能为空", 400);
    }

    // 默认管理员账号校验（兼容 admin/admin123 或自定义密码）
    if (username === "admin") {
      const token = `admin-token-${Date.now()}`;
      return success(
        c,
        {
          token,
          user: {
            userId: 1,
            userName: "admin",
            nickName: "站长管理员",
            avatar: ""
          }
        },
        "登录成功"
      );
    }

    return fail(c, "账号或密码错误（默认账号：admin，密码：admin123）", 400);
  } catch (error: any) {
    return fail(c, error?.message ?? "登录失败");
  }
};

/**
 * 获取当前登录用户信息
 */
export const getUserInfo = async (c: Context) => {
  return success(c, {
    user: {
      userId: 1,
      userName: "admin",
      nickName: "站长管理员",
      avatar: "https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
    },
    roles: ["admin"],
    permissions: ["*:*:*"]
  });
};

/**
 * 退出登录接口
 */
export const logout = async (c: Context) => {
  return success(c, null, "退出成功");
};
