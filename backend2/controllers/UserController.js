const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * 用户控制器
 * 对应 Java UserController
 * 路由前缀: /users
 */
class UserController {
  
  /**
   * 功能4: user mgmt (simple)
   * 用户注册
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
   * 用户登录
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
        name: 'Peter Wang',
        default_currency: 'USD',
        is_active: true,
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
}

module.exports = new UserController(); 