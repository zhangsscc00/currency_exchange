const cors = require('cors');

/**
 * CORS 配置中间件
 * 对应 Java WebConfig 的 CORS 设置
 */
const corsOptions = {
  // 允许的来源 - 与 Java 配置保持一致
  origin: function (origin, callback) {
    const allowedOrigins = (process.env.CORS_ORIGINS || 
      'http://localhost:3030,http://localhost:8081,http://127.0.0.1:3030,http://127.0.0.1:8081')
      .split(',')
      .map(url => url.trim());
    
    // 允许没有 origin 的请求（比如移动应用或 Postman）
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS policy'));
    }
  },
  
  // 允许的方法 - 与 Java 配置保持一致
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  
  // 允许的请求头
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token'
  ],
  
  // 是否允许发送 cookies - 与 Java 配置保持一致 (false)
  credentials: false,
  
  // 预检请求缓存时间 - 与 Java 配置保持一致 (3600秒)
  maxAge: 3600,
  
  // 是否通过预检请求
  preflightContinue: false,
  
  // 预检请求的状态码
  optionsSuccessStatus: 204
};

module.exports = cors(corsOptions); 