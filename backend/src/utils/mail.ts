import nodemailer from "nodemailer";

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

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: emailConfig.auth.user,
    pass: emailConfig.auth.pass
  }
});

/**
 * 发送邮件通知（用于有人回复留言时提醒原留言人）
 */
export const sendNotificationEmail = async (to: string, subject: string, html: string) => {
  if (!to || !to.includes("@")) return;

  try {
    const info = await transporter.sendMail({
      from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
      to,
      subject,
      html
    });
    console.log(`[Mail] 邮件成功发送给 ${to}, messageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Mail] 发送邮件异常 (${to}):`, error);
  }
};
