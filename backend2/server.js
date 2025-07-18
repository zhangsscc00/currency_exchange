require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const compression = require('compression');

// 导入中间件
const corsMiddleware = require('./middleware/cors');
const { helmet, rateLimit } = require('./middleware/security');

// 导入路由
const apiRoutes = require('./routes/index');

// 导入数据库
const db = require('./models');

/**
 * Currency Exchange Backend (Node.js)
 * 对应 Java CurrencyExchangeApplication
 * 
 * 配置与 Java 后端完全一致：
 * - 端口: 8080
 * - 上下文路径: /api
 * - CORS 设置
 * - 安全配置
 */

class CurrencyExchangeServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 8080;
    this.apiPrefix = process.env.API_PREFIX || '/api';
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeDatabase();
    this.initializeErrorHandling();
  }

  /**
   * 初始化中间件
   * 对应 Java 的各种配置注解和过滤器
   */
  initializeMiddlewares() {
    // 请求日志 (对应 Java 的 Logback 配置)
    if (process.env.NODE_ENV !== 'test') {
      this.app.use(morgan('combined'));
    }

    // 安全头设置 (对应 Java SecurityConfig)
    this.app.use(helmet);

    // CORS 配置 (对应 Java WebConfig)
    this.app.use(corsMiddleware);

    // 压缩响应
    this.app.use(compression());

    // 解析请求体
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 速率限制 (对应 Java 的安全配置)
    this.app.use(rateLimit);

    // 请求时间戳
    this.app.use((req, res, next) => {
      req.startTime = Date.now();
      next();
    });
  }

  /**
   * 初始化路由
   * 对应 Java 的 @RequestMapping 注解
   */
  initializeRoutes() {
    // 健康检查端点 (在 /api 前缀之外)
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'Currency Exchange API (Node.js)',
        version: '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    });

    // 根路径重定向
    this.app.get('/', (req, res) => {
      res.redirect(this.apiPrefix);
    });

    // API 路由 (对应 Java 的 context-path: /api)
    this.app.use(this.apiPrefix, apiRoutes);

    // 404 处理
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
        suggestion: `Try ${this.apiPrefix} for available endpoints`
      });
    });
  }

  /**
   * 初始化数据库连接
   * 对应 Java 的 @EnableJPA 和数据源配置
   */
  async initializeDatabase() {
    try {
      // 首先尝试创建数据库（如果不存在）
      await this.createDatabaseIfNotExists();
      
      // 测试数据库连接
      await db.sequelize.authenticate();
      console.log('✅ Database connection established successfully.');

      // 在开发环境中同步数据库表结构
      if (process.env.NODE_ENV === 'development') {
        await db.sequelize.sync({ alter: true });
        console.log('✅ Database tables synchronized.');
        
        // 插入基础数据
        await this.seedBasicData();
      }
    } catch (error) {
      console.error('❌ Unable to connect to database:', error);
      // 在生产环境中，数据库连接失败应该终止应用
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
  }

  /**
   * 自动创建数据库（如果不存在）
   * 对应 MySQL 初始化脚本的数据库创建部分
   */
  async createDatabaseIfNotExists() {
    const { Sequelize } = require('sequelize');
    
    // 获取数据库配置
    const config = require('./config/database')[process.env.NODE_ENV || 'development'];
    const databaseName = config.database;
    
    // 创建临时连接（不指定数据库）
    const tempSequelize = new Sequelize('', config.username, config.password, {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: false
    });

    try {
      // 测试MySQL服务器连接
      await tempSequelize.authenticate();
      console.log('✅ MySQL server connection successful.');
      
      // 创建数据库（如果不存在）
      await tempSequelize.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      console.log(`✅ Database '${databaseName}' created or already exists.`);
      
    } catch (error) {
      console.error('❌ Failed to create database:', error.message);
      throw error;
    } finally {
      // 关闭临时连接
      await tempSequelize.close();
    }
  }

  /**
   * 插入基础数据
   * 对应 MySQL 初始化脚本中的基础数据
   */
  async seedBasicData() {
    try {
      const { Currency, User } = db;

      // 插入常用货币 (对应 mysql_init.sql)
      const currencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
        { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
        { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
        { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
        { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
        { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
        { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
        { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
        { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
        { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
        { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
        { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
        { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
        { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
        { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
        { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
        { code: 'TRY', name: 'Turkish Lira', symbol: '₺' }
      ];

      for (const currencyData of currencies) {
        await Currency.findOrCreate({
          where: { code: currencyData.code },
          defaults: currencyData
        });
      }

      // 插入测试用户 (对应 mysql_init.sql)
      await User.findOrCreate({
        where: { email: 'test@example.com' },
        defaults: {
          name: 'Test User',
          email: 'test@example.com',
          default_currency: 'USD'
        }
      });

      await User.findOrCreate({
        where: { email: 'admin@example.com' },
        defaults: {
          name: 'Admin User',
          email: 'admin@example.com',
          default_currency: 'USD'
        }
      });

      console.log('✅ Basic data seeded successfully.');
    } catch (error) {
      console.warn('⚠️ Error seeding basic data:', error.message);
    }
  }

  /**
   * 初始化错误处理
   * 对应 Java 的 @ControllerAdvice 异常处理
   */
  initializeErrorHandling() {
    // 全局错误处理中间件
    this.app.use((error, req, res, next) => {
      const statusCode = error.statusCode || 500;
      const message = error.message || 'Internal Server Error';
      
      console.error('Global Error Handler:', {
        error: message,
        statusCode,
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      });

      res.status(statusCode).json({
        error: statusCode >= 500 ? 'Internal Server Error' : message,
        message: statusCode >= 500 ? 'An unexpected error occurred' : message,
        timestamp: new Date().toISOString(),
        path: req.originalUrl
      });
    });

    // 处理未捕获的 Promise 拒绝
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // 处理未捕获的异常
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      // 在生产环境中优雅关闭服务器
      if (process.env.NODE_ENV === 'production') {
        this.gracefulShutdown();
      }
    });
  }

  /**
   * 启动服务器
   * 对应 Java SpringBootApplication.run()
   */
  start() {
    this.server = this.app.listen(this.port, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 Currency Exchange Server (Node.js) Started');
      console.log('='.repeat(60));
      console.log(`🌐 Server running on: http://localhost:${this.port}`);
      console.log(`📡 API endpoint: http://localhost:${this.port}${this.apiPrefix}`);
      console.log(`🏥 Health check: http://localhost:${this.port}/health`);
      console.log(`🧪 Test endpoint: http://localhost:${this.port}${this.apiPrefix}/rates/test`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Process ID: ${process.pid}`);
      console.log('='.repeat(60));
      
      // 显示可用的端点
      console.log('\n📋 Available API endpoints:');
      console.log(`   GET  ${this.apiPrefix}/rates              - Get exchange rates`);
      console.log(`   GET  ${this.apiPrefix}/rates/test         - Test connection`);
      console.log(`   POST ${this.apiPrefix}/rates/calculate    - Calculate exchange`);
      console.log(`   GET  ${this.apiPrefix}/currencies         - Get currencies`);
      console.log(`   POST ${this.apiPrefix}/exchange          - Perform exchange`);
      console.log(`   GET  ${this.apiPrefix}/watchlist         - Get watchlist`);
      console.log(`   POST ${this.apiPrefix}/users/register    - Register user`);
      console.log(`   POST ${this.apiPrefix}/users/login       - Login user`);
      console.log('\n✨ Server ready to handle requests!\n');
    });

    // 优雅关闭处理
    process.on('SIGTERM', () => this.gracefulShutdown());
    process.on('SIGINT', () => this.gracefulShutdown());
  }

  /**
   * 优雅关闭服务器
   */
  gracefulShutdown() {
    console.log('\n🔄 Received shutdown signal, starting graceful shutdown...');
    
    this.server.close(async () => {
      console.log('📴 HTTP server closed.');
      
      try {
        await db.sequelize.close();
        console.log('🗄️ Database connection closed.');
      } catch (error) {
        console.error('❌ Error closing database connection:', error);
      }
      
      console.log('✅ Graceful shutdown completed.');
      process.exit(0);
    });

    // 强制关闭超时
    setTimeout(() => {
      console.log('⏰ Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  }
}

// 启动服务器
if (require.main === module) {
  const server = new CurrencyExchangeServer();
  server.start();
}

module.exports = CurrencyExchangeServer; 