const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { User } = require('../models');
const EmailService = require('../services/EmailService');
const VerificationService = require('../services/VerificationService');

/**
 * 用户控制器
 * 支持邮箱和手机号两种注册登录方式
 * 路由前缀: /users
 */
class UserController {
  
  /**
   * 发送邮箱验证码
   * POST /users/send-email-code
   */
  async sendEmailCode(req, res) {
    try {
      const { email, type = 'register' } = req.body;

      // 验证邮箱格式
      const emailSchema = Joi.string().email().required();
      const { error } = emailSchema.validate(email);
      
      if (error) {
        return res.status(400).json({
          error: 'INVALID_EMAIL',
          message: '邮箱格式不正确'
        });
      }

      // 验证类型
      if (!['register', 'login', 'reset'].includes(type)) {
        return res.status(400).json({
          error: 'INVALID_TYPE',
          message: '验证码类型无效'
        });
      }

      // 检查发送频率限制
      const rateLimitCheck = VerificationService.checkRateLimit(email, type);
      if (!rateLimitCheck.canSend) {
        return res.status(429).json({
          error: 'RATE_LIMITED',
          message: rateLimitCheck.message,
          timeLeft: rateLimitCheck.timeLeft
        });
      }

      // 检查邮箱状态
      const existingUser = await User.findOne({ where: { email } });

      if (type === 'register') {
        // 注册时检查邮箱是否已存在
        if (existingUser) {
          return res.status(200).json({
            success: false,
            error: 'EMAIL_EXISTS',
            message: '该邮箱已被注册，请直接登录',
            needLogin: true
          });
        }
      }

      if (type === 'login') {
        // 登录时检查邮箱是否存在
        if (!existingUser) {
          return res.status(200).json({
            success: false,
            error: 'EMAIL_NOT_FOUND',
            message: '该邮箱尚未注册，请先注册账号',
            needRegister: true
          });
        }
      }

      // 生成验证码
      const code = EmailService.generateVerificationCode();

      // 发送邮件
      const emailResult = await EmailService.sendVerificationCode(email, code, type);
      
      if (!emailResult) {
        return res.status(500).json({
          error: 'EMAIL_SEND_FAILED',
          message: '邮件发送失败，请稍后重试'
        });
      }

      // 存储验证码
      VerificationService.storeVerificationCode(email, code, type);
      
      // 记录发送时间
      VerificationService.recordSentTime(email, type);

      res.json({
        success: true,
        message: '验证码已发送到您的邮箱',
        email: email,
        type: type,
        // 开发环境下返回验证码（生产环境删除）
        ...(process.env.NODE_ENV === 'development' && { code: code })
      });

    } catch (error) {
      console.error('Send email code error:', error);
      res.status(500).json({
        error: 'SEND_EMAIL_FAILED',
        message: '发送验证码失败',
        details: error.message
      });
    }
  }

  /**
   * 邮箱验证码登录
   * POST /users/email-login
   */
  async emailLogin(req, res) {
    try {
      const { email, code, name } = req.body;

      // 输入验证
      const schema = Joi.object({
        email: Joi.string().email().required(),
        code: Joi.string().length(6).required(),
        name: Joi.string().min(2).max(50).optional()
      });

      const { error } = schema.validate({ email, code, name });
      if (error) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: error.details[0].message
        });
      }

      // 验证验证码
      const verificationResult = VerificationService.verifyCode(email, code, 'login');
      if (!verificationResult.success) {
        return res.status(400).json({
          error: verificationResult.error,
          message: verificationResult.message,
          remainingAttempts: verificationResult.remainingAttempts
        });
      }

      // 查找或创建用户
      let user = await User.findOne({
        where: { email }
      });

      let isNewUser = false;

      if (user) {
        // 更新登录时间
        await user.update({
          last_login_at: new Date()
        });
        console.log('✅ 邮箱用户登录成功:', user.email);
      } else {
        // 创建新用户
        user = await User.create({
          email,
          name: name || '用户' + Date.now(),
          default_currency: 'USD',
          is_active: true,
          is_email_verified: true,
          last_login_at: new Date()
        });
        isNewUser = true;
        console.log('✅ 新用户自动注册成功:', user.email);
      }

      // 生成JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          loginType: 'email'
        },
        process.env.JWT_SECRET || 'currency-exchange-jwt-secret-development-only',
        { expiresIn: '7d' }
      );

      const response = {
        success: true,
        message: isNewUser ? '注册成功' : '登录成功',
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          login_type: 'email'
        },
        is_new_user: isNewUser
      };

      res.json(response);

    } catch (error) {
      console.error('Email login error:', error);
      res.status(500).json({
        error: 'EMAIL_LOGIN_FAILED',
        message: '邮箱登录失败',
        details: error.message
      });
    }
  }

  /**
   * 发送短信验证码
   * POST /users/send-sms
   */
  async sendSmsCode(req, res) {
    try {
      const { phone, type = 'register' } = req.body;

      // 验证手机号格式
      const phoneSchema = Joi.string().pattern(/^1[3-9]\d{9}$/).required();
      const { error } = phoneSchema.validate(phone);
      
      if (error) {
        return res.status(400).json({
          error: 'INVALID_PHONE',
          message: '手机号格式不正确'
        });
      }

      // 验证类型
      if (!['register', 'login', 'reset'].includes(type)) {
        return res.status(400).json({
          error: 'INVALID_TYPE',
          message: '验证码类型无效'
        });
      }

      // 检查发送频率限制
      const rateLimitCheck = VerificationService.checkRateLimit(phone, type);
      if (!rateLimitCheck.canSend) {
        return res.status(429).json({
          error: 'RATE_LIMITED',
          message: rateLimitCheck.message,
          timeLeft: rateLimitCheck.timeLeft
        });
      }

      // 注册时检查手机号是否已存在
      if (type === 'register') {
        const existingUser = await User.findOne({ where: { phone } });
        if (existingUser) {
          return res.status(409).json({
            error: 'PHONE_EXISTS',
            message: '该手机号已被注册'
          });
        }
      }

      // 登录时检查手机号是否存在
      if (type === 'login') {
        const existingUser = await User.findOne({ where: { phone } });
        if (!existingUser) {
          return res.status(404).json({
            error: 'PHONE_NOT_FOUND',
            message: '该手机号尚未注册'
          });
        }
      }

      // 生成验证码
      const code = EmailService.generateVerificationCode();

      // 发送短信（暂时使用邮件服务）
      const smsResult = await EmailService.sendVerificationCode(phone, code, type);
      
      if (!smsResult) {
        return res.status(500).json({
          error: 'SMS_SEND_FAILED',
          message: '短信发送失败，请稍后重试'
        });
      }

      // 存储验证码
      VerificationService.storeVerificationCode(phone, code, type);
      
      // 记录发送时间
      VerificationService.recordSentTime(phone, type);

      res.json({
        success: true,
        message: '验证码发送成功',
        phone: phone,
        type: type,
        // 开发环境下返回验证码（生产环境删除）
        ...(process.env.NODE_ENV === 'development' && { code: code })
      });

    } catch (error) {
      console.error('Send SMS error:', error);
      res.status(500).json({
        error: 'SEND_SMS_FAILED',
        message: '发送验证码失败',
        details: error.message
      });
    }
  }

  /**
   * 手机号注册
   * POST /users/register-phone
   */
  async registerWithPhone(req, res) {
    try {
      const { phone, code, name, password } = req.body;

      // 输入验证
      const schema = Joi.object({
        phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
        code: Joi.string().length(6).required(),
        name: Joi.string().min(2).max(50).required(),
        password: Joi.string().min(6).max(50).optional()
      });

      const { error } = schema.validate({ phone, code, name, password });
      if (error) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: error.details[0].message
        });
      }

      // 验证验证码
      const verificationResult = VerificationService.verifyCode(phone, code, 'register');
      if (!verificationResult.success) {
        return res.status(400).json({
          error: verificationResult.error,
          message: verificationResult.message,
          remainingAttempts: verificationResult.remainingAttempts
        });
      }

      // 检查手机号是否已存在
      const existingUser = await User.findOne({ where: { phone } });
      if (existingUser) {
        return res.status(409).json({
          error: 'PHONE_EXISTS',
          message: '该手机号已被注册'
        });
      }

      // 加密密码（如果提供）
      let passwordHash = null;
      if (password) {
        passwordHash = await bcrypt.hash(password, 10);
      }

      // 创建用户
      const user = await User.create({
        phone,
        name,
        password_hash: passwordHash,
        default_currency: 'USD',
        is_active: true,
        is_phone_verified: true, // 手机号已验证
        last_login_at: new Date()
      });

      // 生成JWT token
      const token = jwt.sign(
        { userId: user.id, phone: user.phone },
        process.env.JWT_SECRET || 'currency-exchange-jwt-secret-development-only',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      const response = {
        success: true,
        message: '注册成功',
        token: token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          default_currency: user.default_currency,
          is_phone_verified: user.is_phone_verified
        },
        expires_in: 86400 // 24小时
      };

      res.status(201).json(response);

    } catch (error) {
      console.error('Phone registration error:', error);
      res.status(500).json({
        error: 'REGISTRATION_FAILED',
        message: '注册失败',
        details: error.message
      });
    }
  }

  /**
   * 手机号登录
   * POST /users/login-phone
   */
  async loginWithPhone(req, res) {
    try {
      const { phone, code } = req.body;

      // 输入验证
      const schema = Joi.object({
        phone: Joi.string().pattern(/^1[3-9]\d{9}$/).required(),
        code: Joi.string().length(6).required()
      });

      const { error } = schema.validate({ phone, code });
      if (error) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: error.details[0].message
        });
      }

      // 验证验证码
      const verificationResult = VerificationService.verifyCode(phone, code, 'login');
      if (!verificationResult.success) {
        return res.status(400).json({
          error: verificationResult.error,
          message: verificationResult.message,
          remainingAttempts: verificationResult.remainingAttempts
        });
      }

      // 查找用户
      const user = await User.findOne({ 
        where: { 
          phone, 
          is_active: true 
        } 
      });

      if (!user) {
        return res.status(404).json({
          error: 'USER_NOT_FOUND',
          message: '用户不存在或已被禁用'
        });
      }

      // 更新最后登录时间
      await user.update({ 
        last_login_at: new Date(),
        is_phone_verified: true
      });

      // 生成JWT token
      const token = jwt.sign(
        { userId: user.id, phone: user.phone },
        process.env.JWT_SECRET || 'currency-exchange-jwt-secret-development-only',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      const response = {
        success: true,
        message: '登录成功',
        token: token,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          name: user.name,
          default_currency: user.default_currency,
          is_phone_verified: user.is_phone_verified,
          is_email_verified: user.is_email_verified,
          last_login_at: user.last_login_at
        },
        expires_in: 86400 // 24小时
      };

      res.json(response);

    } catch (error) {
      console.error('Phone login error:', error);
      res.status(500).json({
        error: 'LOGIN_FAILED',
        message: '登录失败',
        details: error.message
      });
    }
  }

  // 保留原有的邮箱注册登录功能
  /**
   * 邮箱用户注册 (保留原功能)
   * POST /users/register
   */
  async registerUser(req, res) {
    try {
      const { email, name, password } = req.body;
      
      // 简单验证
      if (!email || !name || !password) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Email, name and password are required'
        });
      }
      
      // 检查用户是否已存在
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          error: 'User already exists',
          message: 'A user with this email already exists'
        });
      }
      
      // 加密密码
      const passwordHash = await bcrypt.hash(password, 10);
      
      // 创建用户
      const user = await User.create({
        email,
        name,
        password_hash: passwordHash,
        default_currency: 'USD',
        is_active: true
      });
      
      const response = {
        id: user.id,
        email: user.email,
        name: user.name,
        default_currency: user.default_currency,
        created_at: user.created_at,
        is_active: user.is_active
      };
      
      res.status(201).json(response);
    } catch (error) {
      console.error('User registration error:', error);
      res.status(500).json({
        error: 'Registration failed',
        message: error.message
      });
    }
  }

  /**
   * 邮箱用户登录 (保留原功能)
   * POST /users/login
   */
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          error: 'Missing credentials',
          message: 'Email and password are required'
        });
      }
      
      // 查找用户
      const user = await User.findOne({ where: { email, is_active: true } });
      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Invalid email or password'
        });
      }
      
      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Invalid email or password'
        });
      }
      
      // 生成JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'currency-exchange-jwt-secret-development-only',
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );
      
      const response = {
        token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          default_currency: user.default_currency
        },
        expires_in: 3600 // 1 hour in seconds
      };
      
      res.json(response);
    } catch (error) {
      console.error('User login error:', error);
      res.status(500).json({
        error: 'Login failed',
        message: error.message
      });
    }
  }

  /**
   * 获取用户信息
   * GET /users/profile
   */
  async getUserProfile(req, res) {
    try {
      // 模拟用户信息，实际应用中会从JWT token获取用户ID
      const profile = {
        id: 1,
        email: 'peter.wang@example.com',
        phone: '13800138000',
        name: 'Peter Wang',
        default_currency: 'USD',
        is_active: true,
        is_phone_verified: true,
        is_email_verified: false,
        created_at: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 3个月前
        total_transactions: 15,
        total_volume: 5000.00
      };
      
      res.json(profile);
    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({
        error: 'Failed to get user profile',
        message: error.message
      });
    }
  }

  /**
   * 更新用户信息
   * PUT /users/profile
   */
  async updateUserProfile(req, res) {
    try {
      const { name, default_currency } = req.body;
      
      // 模拟更新用户信息
      const response = {
        id: 1,
        email: 'john.doe@example.com',
        name: name || 'John Doe',
        default_currency: default_currency || 'USD',
        updated_at: new Date().toISOString()
      };
      
      res.json(response);
    } catch (error) {
      console.error('Update user profile error:', error);
      res.status(500).json({
        error: 'Failed to update user profile',
        message: error.message
      });
    }
  }

  /**
   * 获取用户统计信息
   * GET /users/stats
   */
  async getUserStats(req, res) {
    try {
      const stats = {
        total_exchanges: 15,
        total_volume: 5000.00,
        favorite_currency_pair: 'USD/EUR',
        avg_transaction_size: 333.33,
        watchlist_items: 3,
        member_since: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString() // 3个月前
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        error: 'Failed to get user stats',
        message: error.message
      });
    }
  }

  /**
   * 获取验证码统计信息（管理员接口）
   * GET /users/verification-stats
   */
  async getVerificationStats(req, res) {
    try {
      const stats = VerificationService.getStats();
      res.json({
        success: true,
        stats: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get verification stats error:', error);
      res.status(500).json({
        error: 'Failed to get verification stats',
        message: error.message
      });
    }
  }
}

module.exports = new UserController(); 