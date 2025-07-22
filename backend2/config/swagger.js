const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Swagger 配置选项
const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Currency Exchange API',
      version: '1.0.0',
      description: `
## 货币汇率兑换平台 API 文档

### 功能特性
- 📧 邮箱验证码注册/登录
- 💱 实时汇率查询和计算  
- 📊 历史汇率数据
- 👤 用户资料管理
- ⭐ 货币对监控列表
- 💰 汇率兑换记录

### 认证方式
使用 JWT Bearer Token 进行身份验证

### 基础URL
- 开发环境: \`http://localhost:8080/api\`
- 生产环境: \`http://47.243.102.28:8080/api\`
      `,
      contact: {
        name: 'Currency Exchange API Support',
        email: 'support@currencyfast.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:8080/api',
        description: '开发环境'
      },
      {
        url: 'http://47.243.102.28:8080/api',
        description: '生产环境'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Token (格式: Bearer <token>)'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js'),
    path.join(__dirname, '../swagger.yml')
  ]
};

// 生成 Swagger 规范
const specs = swaggerJSDoc(options);

// 尝试加载 YAML 文件（如果存在）
try {
  const yamlPath = path.join(__dirname, '../swagger.yml');
  const yamlSpec = YAML.load(yamlPath);
  if (yamlSpec) {
    // 合并 YAML 配置
    Object.assign(specs, yamlSpec);
  }
} catch (error) {
  console.log('📝 No swagger.yml found, using JSDoc configuration');
}

// Swagger UI 配置
const swaggerUiOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b82f6; }
    .swagger-ui .scheme-container { background: #f8fafc; padding: 10px; border-radius: 4px; }
  `,
  customSiteTitle: 'Currency Exchange API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2
  }
};

module.exports = {
  specs,
  swaggerUi,
  swaggerUiOptions,
  swaggerServe: swaggerUi.serve,
  swaggerSetup: swaggerUi.setup(specs, swaggerUiOptions)
}; 