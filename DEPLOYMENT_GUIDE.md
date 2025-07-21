# 部署指南

## 1. 前端配置

### 自动环境切换
前端已配置自动环境检测：
- **localhost访问** → 自动使用 `localhost:8080` API
- **47.243.102.28访问** → 自动使用 `47.243.102.28:8080` API

### 手动强制环境
如需强制使用生产环境，编辑 `frontend/src/config/env.js`：
```javascript
export const FORCE_ENV = 'production' // 强制使用生产环境
```

### 修改生产环境API地址
编辑 `frontend/src/config/api.js`：
```javascript
production: {
  baseURL: 'http://47.243.102.28:8080',  // 修改为你的服务器地址
  timeout: 10000
}
```

## 2. 后端配置

### 环境变量设置
1. 复制配置文件：
```bash
cd backend2
cp deploy.env .env
```

2. 编辑 `.env` 文件，修改以下配置：
```env
# 数据库配置
DB_HOST=47.243.102.28
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# 邮件配置
EMAIL_USER=your_126_email@126.com
EMAIL_PASS=your_email_password

# JWT密钥（生产环境请改为复杂密钥）
JWT_SECRET=your-super-secret-jwt-key
```

### 数据库配置
确保MySQL数据库在 `47.243.102.28` 上运行并可访问：
1. 数据库名：`currency_exchange`
2. 端口：`3306`
3. 字符集：`utf8mb4`

### CORS配置
后端已配置允许从你的前端域名访问：
```env
CORS_ORIGIN=http://47.243.102.28:3030
```

## 3. 部署步骤

### 前端部署
```bash
cd frontend
npm install
npm run build
# 将 dist/ 目录部署到 47.243.102.28:3030
```

### 后端部署
```bash
cd backend2
npm install
cp deploy.env .env
# 编辑 .env 文件配置实际的数据库和邮件信息
node server.js
```

## 4. 验证部署

### 检查服务状态
1. 后端健康检查：`http://47.243.102.28:8080/health`
2. 前端页面访问：`http://47.243.102.28:3030`
3. API测试：`http://47.243.102.28:8080/api/rates/test`

### 功能测试
1. 用户注册/登录
2. 邮箱验证码发送
3. 汇率数据获取
4. 页面响应式布局

## 5. 常见问题

### API调用失败
- 检查 CORS 配置
- 确认服务器防火墙设置
- 验证后端服务是否运行在8080端口

### 数据库连接失败
- 检查MySQL服务状态
- 验证数据库连接信息
- 确认数据库权限设置

### 邮箱验证码不发送
- 检查126邮箱SMTP设置
- 验证邮箱密码（可能需要应用专用密码）
- 查看后端日志确认错误信息

## 6. 监控和日志

### 查看后端日志
```bash
# 实时查看日志
tail -f backend2/logs/app.log

# 或使用PM2管理
pm2 logs currency-exchange
```

### 性能监控
建议使用PM2进行进程管理：
```bash
npm install -g pm2
pm2 start backend2/server.js --name currency-exchange
pm2 monitor
```

## 7. 安全建议

1. **更改默认密码**：修改数据库密码和JWT密钥
2. **HTTPS配置**：生产环境建议使用HTTPS
3. **防火墙设置**：只开放必要端口
4. **定期备份**：设置数据库自动备份
5. **日志审计**：定期检查访问日志 