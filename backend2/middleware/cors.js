const cors = require('cors');

/**
 * CORS 配置中间件
 * 临时配置：允许所有来源（用于虚拟机环境）
 */
const corsOptions = {
  // 临时允许所有来源
  origin: '*',
  
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