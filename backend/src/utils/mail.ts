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
    const bunRequire = (import.meta as any).require;
    if (!bunRequire) return null;
    const nodemailer = bunRequire("nodemailer");
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
    if (!transporter) return;

    await transporter.sendMail({
      from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
      to,
      subject,
      html
    });
  } catch (error) {
    console.error("邮件发送异常:", error);
  }
};
