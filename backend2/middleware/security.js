const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * 安全中间件配置
 * 对应 Java SecurityConfig 的安全设置
 */

// 基础安全头设置
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// 速率限制配置 - 防止 API 滥用
const rateLimitConfig = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // 返回速率限制信息在 `RateLimit-*` 头中
  legacyHeaders: false, // 禁用 `X-RateLimit-*` 头
  // 排除某些路径
  skip: (req) => {
    // 健康检查端点不受限制
    return req.path === '/health' || req.path === '/api/rates/test';
  }
});

// JWT 验证中间件 (可选，用于需要认证的端点)
const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    jwt.verify(token, process.env.JWT_SECRET || 'currency-exchange-jwt-secret-development-only', (err, user) => {
      if (err) {
        return res.status(403).json({
          error: 'Invalid token',
          message: 'Token verification failed'
        });
      }
      
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token is required'
    });
  }
};

// 可选的 JWT 验证中间件 (Token 存在时验证，不存在时跳过)
const optionalAuthenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET || 'currency-exchange-jwt-secret-development-only', (err, user) => {
      if (!err) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
};

module.exports = {
  helmet: helmetConfig,
  rateLimit: rateLimitConfig,
  authenticateJWT,
  optionalAuthenticateJWT
}; 