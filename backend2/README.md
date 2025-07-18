# Currency Exchange Backend (Node.js)

## 概述

这是一个用 Node.js 重新实现的货币兑换后端 API，功能与 Java Spring Boot 版本完全一致。

## 功能特性

✅ **完全兼容前端** - 所有 API 端点与 Java 版本保持一致  
✅ **实时汇率获取** - 集成外部汇率 API 服务  
✅ **精确计算引擎** - 支持复杂的货币兑换计算  
✅ **用户管理** - 注册、登录、个人资料管理  
✅ **交易历史** - 完整的兑换记录追踪  
✅ **监控列表** - 汇率监控和警报功能  
✅ **安全配置** - CORS、速率限制、JWT 认证  
✅ **数据库支持** - MySQL 数据库集成  

## 技术栈

- **框架**: Express.js
- **数据库**: MySQL + Sequelize ORM
- **认证**: JWT (JSON Web Tokens)
- **安全**: Helmet, CORS, Rate Limiting
- **外部 API**: ExchangeRate-API
- **日志**: Morgan
- **环境配置**: dotenv

## 快速开始

### 1. 安装依赖

```bash
cd backend2
npm install
```

### 2. 环境配置

创建 `.env` 文件配置数据库和其他设置：
```env
# 服务器配置
NODE_ENV=development
PORT=8080
API_PREFIX=/api

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=currency_exchange
DB_USER=root
DB_PASSWORD=your_password_here

# JWT 密钥
JWT_SECRET=your-secret-key-here
```

### 3. 数据库设置

**仅支持 MySQL 数据库**  
确保 MySQL 服务正在运行，Node.js 后端会自动：
- 创建 `currency_exchange` 数据库（如果不存在）
- 同步所有表结构
- 插入基础货币和测试数据

### 4. 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务器将在 http://localhost:8080 启动

## API 端点

### 汇率相关 (`/api/rates`)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/rates/test` | 测试连接 |
| GET | `/api/rates` | 获取所有汇率 |
| GET | `/api/rates/{from}/{to}` | 获取特定汇率 |
| POST | `/api/rates/calculate` | 计算货币兑换 |
| POST | `/api/rates/calculate/batch` | 批量计算 |
| POST | `/api/rates/reserve` | 预留汇率 |
| GET | `/api/rates/historical` | 历史汇率 |

### 用户管理 (`/api/users`)

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/users/register` | 用户注册 |
| POST | `/api/users/login` | 用户登录 |
| GET | `/api/users/profile` | 获取用户信息 |
| PUT | `/api/users/profile` | 更新用户信息 |
| GET | `/api/users/stats` | 用户统计 |

### 货币管理 (`/api/currencies`)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/currencies` | 获取所有货币 |
| GET | `/api/currencies/{code}` | 获取特定货币 |
| POST | `/api/currencies` | 添加货币 |
| PUT | `/api/currencies/{id}` | 更新货币 |
| DELETE | `/api/currencies/{id}` | 删除货币 |

### 兑换交易 (`/api/exchange`)

| 方法 | 端点 | 描述 |
|------|------|------|
| POST | `/api/exchange` | 执行兑换 |
| GET | `/api/exchange/history` | 交易历史 |
| GET | `/api/exchange/{id}` | 交易详情 |

### 监控列表 (`/api/watchlist`)

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/watchlist` | 获取监控列表 |
| POST | `/api/watchlist` | 添加监控 |
| DELETE | `/api/watchlist/{id}` | 删除监控 |
| GET | `/api/watchlist/alerts` | 获取警报 |
| POST | `/api/watchlist/alerts` | 设置警报 |

## 使用示例

### 获取汇率

```bash
curl http://localhost:8080/api/rates
```

### 计算兑换

```bash
curl -X POST http://localhost:8080/api/rates/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "from": "USD",
    "to": "EUR",
    "amount": 100
  }'
```

### 用户注册

```bash
curl -X POST http://localhost:8080/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式启动
npm run dev

# 生产模式启动
npm start

# 运行测试
npm test

# 数据库迁移
npm run db:migrate

# 数据库种子数据
npm run db:seed
```

## 项目结构

```
backend2/
├── config/             # 配置文件
│   └── database.js     # 数据库配置
├── controllers/        # 控制器
│   ├── ExchangeRateController.js
│   ├── UserController.js
│   ├── CurrencyController.js
│   ├── ExchangeController.js
│   └── WatchlistController.js
├── middleware/         # 中间件
│   ├── cors.js        # CORS 配置
│   └── security.js    # 安全中间件
├── models/            # 数据模型
│   ├── index.js       # Sequelize 初始化
│   ├── User.js        # 用户模型
│   ├── Currency.js    # 货币模型
│   ├── ExchangeRate.js # 汇率模型
│   ├── ExchangeTransaction.js # 交易模型
│   └── Watchlist.js   # 监控列表模型
├── routes/            # 路由
│   └── index.js       # 主路由文件
├── services/          # 服务层
│   ├── ExternalRateService.js # 外部汇率服务
│   └── CurrencyCalculationService.js # 计算服务
├── .env.example       # 环境变量示例
├── package.json       # 项目配置
├── server.js          # 主服务器文件
└── README.md          # 项目文档
```

## 与 Java 版本的对比

| 功能 | Java (Spring Boot) | Node.js (Express) | 状态 |
|------|-------------------|-------------------|------|
| 端口 | 8080 | 8080 | ✅ 一致 |
| API 前缀 | /api | /api | ✅ 一致 |
| CORS 配置 | WebConfig | cors middleware | ✅ 一致 |
| 汇率 API | ExternalRateService | ExternalRateService | ✅ 一致 |
| 计算服务 | CurrencyCalculationService | CurrencyCalculationService | ✅ 一致 |
| 数据库 | JPA/Hibernate | Sequelize | ✅ 功能等价 |
| 认证 | Spring Security | JWT middleware | ✅ 功能等价 |
| 所有端点 | 完全实现 | 完全实现 | ✅ 一致 |

## 环境变量说明

| 变量名 | 默认值 | 描述 |
|--------|--------|------|
| `NODE_ENV` | development | 运行环境 |
| `PORT` | 8080 | 服务器端口 |
| `API_PREFIX` | /api | API 路径前缀 |
| `DB_HOST` | localhost | 数据库主机 |
| `DB_PORT` | 3306 | 数据库端口 |
| `DB_NAME` | currency_exchange | 数据库名称 |
| `DB_USER` | root | 数据库用户 |
| `DB_PASSWORD` | - | 数据库密码 |
| `JWT_SECRET` | - | JWT 签名密钥 |
| `EXTERNAL_API_BASE_URL` | - | 外部汇率 API 地址 |

## 健康检查

服务器提供健康检查端点：

```bash
curl http://localhost:8080/health
```

响应示例：
```json
{
  "status": "UP",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "Currency Exchange API (Node.js)",
  "version": "1.0.0",
  "uptime": 3600
}
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 MySQL 服务是否运行
   - 验证数据库配置信息
   - 确认数据库用户权限

2. **端口被占用**
   - 修改 `.env` 文件中的 `PORT` 配置
   - 或终止占用端口的进程

3. **外部 API 调用失败**
   - 检查网络连接
   - 系统会自动使用备用汇率数据

### 日志查看

开发模式下，所有请求和错误都会输出到控制台。生产模式建议配置专业的日志系统。

## 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 许可证

MIT License

---

**注意**: 此项目与 Java Spring Boot 版本功能完全一致，可以作为直接替代方案使用。 