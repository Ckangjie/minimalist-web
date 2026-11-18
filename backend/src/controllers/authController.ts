import type { Context } from "hono";
import { success, fail } from "../utils/response";

const CAPTCHA_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CAPTCHA_SECRET = "jie-hub-captcha-secret-salt-2026";

/**
 * 快速哈希校验签名（不依赖第三方原生二进制，在 Workers / Bun 环境通用）
 */
function signCaptcha(code: string, exp: number): string {
  const payload = `${code.toUpperCase().trim()}:${exp}:${CAPTCHA_SECRET}`;
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c6ce57 ^ 0;
  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

/**
 * 生成矢量验证码 SVG 图片
 */
function generateCaptchaSvg(code: string): string {
  const width = 110;
  const height = 40;
  const colors = ["#409eff", "#67c23a", "#e6a23c", "#f56c6c", "#9b59b6", "#2c3e50", "#16a085"];

  // 干扰线
  let lines = "";
  for (let i = 0; i < 4; i++) {
    const x1 = Math.floor(Math.random() * width);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(Math.random() * width);
    const y2 = Math.floor(Math.random() * height);
    const stroke = colors[Math.floor(Math.random() * colors.length)];
    lines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.2" opacity="0.6"/>`;
  }

  // 干扰圆点
  let dots = "";
  for (let i = 0; i < 20; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    const fill = colors[Math.floor(Math.random() * colors.length)];
    dots += `<circle cx="${cx}" cy="${cy}" r="1" fill="${fill}" opacity="0.5"/>`;
  }

  // 字符绘制
  let textElements = "";
  const spacing = width / (code.length + 0.8);
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const x = Math.floor((i + 0.4) * spacing + 6);
    const y = Math.floor(26 + (Math.random() - 0.5) * 6);
    const rotate = Math.floor((Math.random() - 0.5) * 30);
    const color = colors[Math.floor(Math.random() * colors.length)];
    textElements += `<text x="${x}" y="${y}" fill="${color}" font-size="22" font-weight="bold" font-family="Arial, sans-serif" transform="rotate(${rotate}, ${x}, ${y})">${char}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:#f4f6f8;border-radius:4px;user-select:none;">${lines}${dots}${textElements}</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * 获取图片验证码接口
 */
export const getCaptchaImage = async (c: Context) => {
  try {
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
    }

    const exp = Date.now() + 5 * 60 * 1000; // 5分钟有效期
    const sig = signCaptcha(code, exp);
    const uuid = `${exp}.${sig}`;
    const img = generateCaptchaSvg(code);

    return success(c, {
      uuid,
      img,
      captchaEnabled: true
    });
  } catch (error: any) {
    return fail(c, error?.message ?? "获取验证码失败");
  }
};

/**
 * 管理端登录接口
 */
export const login = async (c: Context) => {
  try {
    const body = await c.req.json();
    const username = (body.username ?? "").toString().trim();
    const password = (body.password ?? "").toString().trim();
    const code = (body.code ?? "").toString().trim();
    const uuid = (body.uuid ?? "").toString().trim();

    if (!username || !password) {
      return fail(c, "账号或密码不能为空", 400);
    }

    if (!code) {
      return fail(c, "验证码不能为空", 400);
    }

    // 验证码有效性校验
    const [expStr, sig] = uuid.split(".");
    if (!expStr || !sig) {
      return fail(c, "验证码已失效，请重新获取", 400);
    }

    const exp = Number(expStr);
    if (isNaN(exp) || Date.now() > exp) {
      return fail(c, "验证码已过期，请点击刷新", 400);
    }

    const expectedSig = signCaptcha(code, exp);
    if (sig !== expectedSig) {
      return fail(c, "验证码错误", 400);
    }

    // 管理员账号与密码校验
    if (username === "admin" && password === "@Ckj123456") {
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

    return fail(c, "账号或密码错误", 400);
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
