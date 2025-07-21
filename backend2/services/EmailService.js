const nodemailer = require('nodemailer');

/**
 * 邮件服务
 * 使用126邮箱SMTP服务发送验证码
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  /**
   * 初始化邮件传输器
   */
  initTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.126.com',
        port: 465,
        secure: true, // 使用SSL
        auth: {
          user: process.env.EMAIL_USER || 'zhangsscc99@126.com',
          pass: process.env.EMAIL_PASS || 'FWaA7J5d2UFdfECZ'
        }
      });

      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error);
    }
  }

  /**
   * 生成6位数字验证码
   */
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 发送验证码邮件
   * @param {string} email - 收件人邮箱
   * @param {string} code - 验证码
   * @param {string} type - 验证码类型 (register/login/reset)
   */
  async sendVerificationCode(email, code, type = 'register') {
    try {
      if (!this.transporter) {
        console.error('❌ Email transporter not initialized');
        return false;
      }

      const typeText = {
        register: '注册',
        login: '登录',
        reset: '重置密码'
      }[type] || '验证';

      const mailOptions = {
        from: process.env.EMAIL_USER || 'zhangsscc99@126.com',
        to: email,
        subject: `货币兑换系统 - ${typeText}验证码`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">货币兑换系统</h2>
            <p>您好！</p>
            <p>您的${typeText}验证码是：</p>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
            </div>
            <p>验证码有效期为5分钟，请尽快使用。</p>
            <p>如果这不是您的操作，请忽略此邮件。</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">此邮件由系统自动发送，请勿回复。</p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${email}:`, result.messageId);
      return true;

    } catch (error) {
      console.error('❌ Email send failed:', error);
      return false;
    }
  }

  /**
   * 测试邮件服务连接
   */
  async testConnection() {
    try {
      if (!this.transporter) {
        return { success: false, error: 'Transporter not initialized' };
      }

      await this.transporter.verify();
      return { success: true, message: 'Email service connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService(); 