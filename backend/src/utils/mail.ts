/**
 * 邮件服务配置（对齐 D:\demo\web\push-admin-web\push-web\serve\config\index.js）
 */
export const emailConfig = {
  service: "QQ",
  host: "smtp.qq.com",
  port: 465,
  secure: true,
  auth: {
    user: "1040822172@qq.com",
    pass: "rpcytlfiinrnbaic"
  },
  from: {
    name: "Jie Hub 留言板",
    address: "1040822172@qq.com"
  }
};

let cachedTransporter: any = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;
  try {
    const dynamicRequire = (mod: string) => (new Function("m", "return require(m)"))(mod);
    const nodemailer = dynamicRequire("nodemailer");
    if (!nodemailer || typeof nodemailer.createTransport !== "function") return null;

    cachedTransporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass
      }
    });
    return cachedTransporter;
  } catch (err) {
    return null;
  }
};

/**
 * 发送邮件通知（用于有人回复留言时提醒原留言人）
 */
export const sendNotificationEmail = async (to: string, subject: string, html: string) => {
  if (!to || !to.includes("@")) return;

  try {
    const transporter = getTransporter();
    if (transporter) {
      const info = await transporter.sendMail({
        from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
        to,
        subject,
        html
      });
      console.log(`[Mail] 邮件成功发送给 ${to}, messageId: ${info.messageId}`);
      return info;
    }

    // 在 Cloudflare Workers 边缘运行环境中静默回退
    console.log(`[Mail] (Cloudflare 边缘环境) 模拟发送邮件通知至: ${to}, 主题: ${subject}`);
  } catch (error) {
    console.error(`[Mail] 发送邮件异常 (${to}):`, error);
  }
};
