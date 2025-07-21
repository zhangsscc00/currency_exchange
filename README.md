# Currency Exchange Application

一个模仿Remitly风格的移动端货币兑换应用，提供实时汇率查询、货币兑换、交易历史管理等功能。

# 注意 先看这里
怎么启动这个项目？
按照规矩，要用nodejs写后端，所以cd backend2 -> npm install -> npm run dev 可以启动nodejs的后端
启动前端: cd frontend -> npm install -> npm run serve
数据库: 安装mysql 8.0
把数据库密码配置成wyt!!010611ABC


# 用 nohup 后台运行，端口可自定义（如 8080）
nohup serve -s dist -l 3030 > frontend.log 2>&1 &
nohup serve -s dist -l 3030 > /var/log/frontend.log 2>&1 &
nohup npm start > backend.log 2>&1 &
nohup npm start > /var/log/backend.log 2>&1 &


# sql虚拟机上面怎么配置

1 先安装mysql 8.0
winget --version

2 配置mysql环境变量
先打开资源管理器 找C盘
找program files 点进去
找mysql文件夹
找server 8.0文件夹
找bin文件夹
然后把路径复制

windows搜索栏打开 搜索环境变量 点击编辑环境变量的地方
然后在系统变量里面 找到path 编辑 然后new一个  粘贴刚刚复制的路径
然后ok
然后退出
就可以了

3 windows搜索栏 搜索cmd 打开
执行几条命令
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'wyt!!010611ABC';
FLUSH PRIVILEGES;
exit;

然后就完成了
正常去项目里启动前后端。


## linux deployment
#!/bin/bash

echo "🔄 更新前端部署..."

# 进入项目目录
cd ~/currency_exchange/frontend

# 拉取最新代码（如果使用git）
# git pull

# 安装依赖
npm install

# 构建生产版本
export NODE_ENV="production"
npm run build

# 备份当前版本
sudo cp -r /var/www/currency-exchange /var/www/currency-exchange.backup.$(date +%Y%m%d_%H%M%S)

# 复制新版本
sudo rm -rf /var/www/currency-exchange/*
sudo cp -r dist/* /var/www/currency-exchange/

# 重新加载Nginx
sudo systemctl reload nginx

echo "✅ 前端更新完成!"
echo "🌐 访问地址: http://47.243.102.28:3030"

# 清理旧备份（保留最近3个）
sudo ls -t /var/www/currency-exchange.backup.* 2>/dev/null | tail -n +4 | sudo xargs rm -rf
## 项目概述

本项目采用前后端分离架构：
- **前端**: Vue 3 + Element Plus，移动端优先设计，模仿Remitly的用户界面
- **后端**: Node.js + Express + MySQL数据库，提供RESTful API

## 项目结构

```
currency_exchange/
├── frontend/                 # Vue.js 前端应用
│   ├── public/              # 静态资源
│   ├── src/
│   │   ├── assets/          # 样式和静态文件
│   │   ├── components/      # 可复用组件
│   │   ├── views/           # 页面组件
│   │   ├── router/          # 路由配置
│   │   ├── store/           # Vuex状态管理
│   │   └── main.js          # 应用入口
│   └── package.json         # 前端依赖配置
├── backend2/                # Node.js 后端应用
│   ├── controllers/         # REST控制器
│   ├── models/              # 数据模型 (Sequelize)
│   ├── services/            # 业务逻辑服务
│   ├── middleware/          # 中间件
│   ├── routes/              # 路由配置
│   ├── config/              # 数据库配置
│   ├── server.js            # 应用入口
│   └── package.json         # 后端依赖配置
└── README.md                # 项目文档
```

## 八大功能模块详细说明

### 1. 📊 Get Source Currency Rates (获取源货币汇率)

**描述**: 从外部API获取实时汇率数据，支持多种货币对的汇率查询。

**技术实现**:
- **前端**: `views/Rates.vue` - 实时汇率展示页面
- **后端**: `ExchangeRateController.js` - 汇率API接口
- **API端点**: 
  - `GET /api/rates` - 获取所有当前汇率
  - `GET /api/rates/{from}/{to}` - 获取特定货币对汇率

**功能特点**:
- 实时汇率更新（每分钟）
- 支持20+种主要货币：USD, EUR, GBP, JPY, CNY, KRW, MXN等
- 汇率变化趋势显示（上涨/下跌）
- 外部汇率API集成 (ExchangeRate-API)
- 自动备用数据支持

---

### 2. 💱 Calculate Currency Exchange (计算货币兑换)

**描述**: 基于当前汇率计算货币兑换金额，包含手续费计算。

**技术实现**:
- **前端**: `views/Home.vue` - 主要的汇率计算界面
- **后端**: `CurrencyCalculationService.js` - 精确计算引擎
- **状态管理**: Vuex store中的`calculateExchange` action

**API端点**: 
- `POST /api/rates/calculate` - 标准计算
- `POST /api/rates/calculate/batch` - 批量计算
- `POST /api/rates/calculate/reverse` - 反向计算

**功能特点**:
- 实时汇率计算
- 多种费率模式（标准/快速/经济）
- 手续费计算（最低$2.99，最高$50）
- 货币选择器（模态框形式）
- 自动金额格式化
- 支持双向货币转换

---

### 3. 📝 Store Historical Exchange (存储历史汇率)

**描述**: 记录所有货币兑换交易的历史数据，便于用户查询和分析。

**技术实现**:
- **前端**: `views/History.vue` - 交易历史页面
- **后端**: 
  - `ExchangeController.js` - 交易处理
  - `ExchangeTransaction.js` - 交易模型 (Sequelize)
- **数据库**: MySQL数据库存储

**API端点**: 
- `POST /api/exchange` - 执行兑换并存储记录
- `GET /api/exchange/history` - 获取交易历史
- `GET /api/exchange/{id}` - 获取交易详情

**功能特点**:
- 完整的交易记录存储
- 交易状态跟踪（PENDING, COMPLETED, FAILED等）
- 交易参考号自动生成
- 按时间排序的历史记录展示
- 空状态友好提示

---

### 4. 👤 User Management (Simple) (用户管理-简单)

**描述**: 基础的用户注册、登录和个人信息管理功能。

**技术实现**:
- **前端**: `views/Profile.vue` - 用户资料页面
- **后端**: 
  - `UserController.js` - 用户API
  - `User.js` - 用户模型 (Sequelize)
- **安全**: JWT认证 + bcrypt密码加密

**API端点**:
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息
- `GET /api/users/stats` - 用户统计

**功能特点**:
- 用户注册和登录
- JWT Token认证
- 个人信息管理
- 默认货币设置
- 用户统计信息展示
- 账户设置（通知开关等）

---

### 5. 👁️ Watchlist (For Each User) (用户观察列表)

**描述**: 每个用户可以添加关注的货币对，跟踪特定汇率变化。

**技术实现**:
- **前端**: `views/Watchlist.vue` - 观察列表管理页面
- **后端**: 
  - `WatchlistController.js` - 观察列表API
  - `Watchlist.js` - 观察列表模型 (Sequelize)
- **关系**: 用户与观察列表一对多关系

**API端点**:
- `GET /api/watchlist` - 获取用户观察列表
- `POST /api/watchlist` - 添加货币对到观察列表
- `DELETE /api/watchlist/{id}` - 移除观察项

**功能特点**:
- 个性化货币对关注
- 实时汇率显示
- 快速添加/移除功能
- 货币对选择器
- 空状态友好设计
- 搜索和分页功能

---

### 6. 💰 Currency Management (Simple) (货币管理-简单)

**描述**: 系统支持的货币管理，包括货币信息的增删改查。

**技术实现**:
- **前端**: 集成在各个组件中的货币选择器
- **后端**: 
  - `CurrencyController.js` - 货币管理API
  - `Currency.js` - 货币模型 (Sequelize)
- **数据**: 自动插入20种主要货币数据

**API端点**:
- `GET /api/currencies` - 获取所有货币
- `GET /api/currencies/{code}` - 获取特定货币
- `POST /api/currencies` - 添加新货币（管理员）
- `PUT /api/currencies/{id}` - 更新货币信息
- `DELETE /api/currencies/{id}` - 删除货币

**功能特点**:
- 20+种主要货币支持
- 货币代码、名称、符号管理
- 货币状态控制（启用/禁用）
- 管理员级别的货币配置
- 标准化货币信息格式
- 自动基础数据初始化

---

### 7. 📈 Rate Change Watch (汇率变化监控)

**描述**: 监控汇率变化并向用户发送警报通知。

**技术实现**:
- **前端**: `views/Watchlist.vue` 中的alerts功能
- **后端**: `WatchlistController.js` 中的alerts方法
- **监控**: 实时汇率变化检测

**API端点**:
- `GET /api/watchlist/alerts` - 获取汇率变化警报
- `POST /api/watchlist/alerts` - 设置汇率警报

**功能特点**:
- 汇率变化百分比计算
- 用户自定义警报阈值
- 实时变化通知
- 历史变化记录
- 警报状态管理

---

### 8. ⏰ Reserve Currency Rate (For Limited Time) (限时汇率预留)

**描述**: 允许用户在特定时间内锁定汇率，确保交易时使用预留的汇率。

**技术实现**:
- **前端**: `views/Exchange.vue` - 确认交易页面
- **后端**: `ExchangeRateController.js` 中的 `reserveRate` 方法
- **存储**: 预留汇率记录和有效期管理

**API端点**: `POST /api/rates/reserve` - 预留指定汇率

**功能特点**:
- 15分钟汇率锁定
- 预留ID跟踪
- 有效期倒计时
- 预留汇率确认机制
- 超时自动释放

## 页面布局设计

### 移动端导航结构
```
底部导航栏（Fixed）
├── 🏠 Home (主页) - 货币兑换主界面
├── 📊 Rates (汇率) - 实时汇率列表
├── 📋 History (历史) - 交易历史记录
├── 👁️ Watch (观察) - 用户观察列表
└── 👤 Profile (个人) - 用户资料和设置
```

### 主要页面功能映射

| 页面 | 主要功能模块 | 次要功能 |
|------|-------------|----------|
| Home | 功能2: 计算货币兑换 | 功能1: 获取汇率 |
| Rates | 功能1: 获取源货币汇率 | 功能7: 汇率变化监控 |
| History | 功能3: 存储历史汇率 | 交易详情查看 |
| Watchlist | 功能5: 用户观察列表 | 功能7: 汇率变化监控 |
| Profile | 功能4: 用户管理 | 用户统计和设置 |
| Exchange | 功能8: 预留汇率 | 功能3: 创建交易记录 |

## 技术栈详细信息

### 前端技术栈
- **Vue 3**: 渐进式JavaScript框架
- **Vue Router 4**: 官方路由管理器
- **Vuex 4**: 状态管理模式
- **Element Plus**: UI组件库
- **Axios**: HTTP客户端
- **移动端优化**: 响应式设计，触摸友好

### 后端技术栈
- **Node.js**: JavaScript运行环境
- **Express.js**: Web应用框架
- **Sequelize**: ORM数据库操作
- **MySQL**: 生产环境数据库
- **JWT**: 身份验证
- **bcryptjs**: 密码加密
- **Axios**: 外部API调用
- **CORS**: 跨域资源共享
- **Helmet**: 安全头设置
- **Morgan**: 请求日志
- **Rate Limiting**: API限流保护

### 开发环境要求
- **Node.js**: 16+
- **npm**: 最新版本
- **MySQL**: 8.0+

## 快速启动

### 后端启动 (Node.js)
```bash
cd backend2
npm install 
npm run dev
```
访问地址：http://localhost:8080/api

### 前端启动
```bash
cd frontend
npm install
npm run serve
```
访问地址：http://localhost:3030

### 数据库配置

#### MySQL数据库（推荐）
**自动化设置**: Node.js后端会自动创建数据库和表结构

**数据库信息**:
- 主机: `localhost`
- 端口: `3306`
- 数据库: `currency_exchange`
- 用户: `root`
- 密码: `wyt!!010611ABC`

**启动流程**:
1. 确保MySQL服务运行
2. 启动Node.js后端
3. 系统自动创建数据库
4. 自动同步表结构
5. 自动插入基础数据

## API接口文档

### 核心API端点总览

| 功能模块 | HTTP方法 | 端点 | 描述 |
|---------|---------|------|------|
| 健康检查 | GET | `/health` | 服务健康状态 |
| 连接测试 | GET | `/api/rates/test` | 后端连接测试 |
| 汇率获取 | GET | `/api/rates` | 获取所有当前汇率 |
| 特定汇率 | GET | `/api/rates/{from}/{to}` | 获取特定货币对汇率 |
| 汇率计算 | POST | `/api/rates/calculate` | 计算货币兑换 |
| 批量计算 | POST | `/api/rates/calculate/batch` | 批量计算 |
| 反向计算 | POST | `/api/rates/calculate/reverse` | 反向计算 |
| 汇率预留 | POST | `/api/rates/reserve` | 预留限时汇率 |
| 历史汇率 | GET | `/api/rates/historical` | 获取历史汇率 |
| 货币列表 | GET | `/api/currencies` | 获取货币列表 |
| 特定货币 | GET | `/api/currencies/{code}` | 获取特定货币 |
| 用户注册 | POST | `/api/users/register` | 用户注册 |
| 用户登录 | POST | `/api/users/login` | 用户登录 |
| 用户资料 | GET | `/api/users/profile` | 获取用户信息 |
| 用户统计 | GET | `/api/users/stats` | 用户统计 |
| 交易执行 | POST | `/api/exchange` | 执行货币兑换 |
| 交易历史 | GET | `/api/exchange/history` | 获取交易记录 |
| 交易详情 | GET | `/api/exchange/{id}` | 获取交易详情 |
| 观察列表 | GET | `/api/watchlist` | 获取用户观察列表 |
| 添加观察 | POST | `/api/watchlist` | 添加货币对 |
| 删除观察 | DELETE | `/api/watchlist/{id}` | 删除观察项 |
| 汇率警报 | GET | `/api/watchlist/alerts` | 获取汇率变化警报 |
| 设置警报 | POST | `/api/watchlist/alerts` | 设置汇率警报 |

### 外部API集成
- **汇率数据源**: ExchangeRate-API (https://api.exchangerate-api.com)
- **备用机制**: 本地备用汇率数据
- **更新频率**: 实时获取
- **支持货币**: 20+种主要货币

## 部署说明

### 生产环境配置
1. ✅ 使用MySQL数据库（已完成）
2. 配置外部汇率API密钥
3. 设置环境变量
4. 配置HTTPS和域名
5. 设置进程管理器 (PM2)

### 环境变量配置
```env
NODE_ENV=production
PORT=8080
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_secret_key
EXTERNAL_API_KEY=your_api_key
```

### 使用PM2部署
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name currency-exchange

# 查看状态
pm2 status

# 查看日志
pm2 logs currency-exchange
```

## 后续扩展计划

1. **实时WebSocket推送**: 汇率实时更新
2. **Redis缓存**: 提高API响应速度
3. **支付集成**: 连接真实支付网关
4. **更多货币支持**: 扩展到50+种货币
5. **高级图表**: 汇率历史趋势图
6. **移动APP**: React Native/Flutter版本
7. **API限流增强**: 防止API滥用
8. **数据分析**: 用户行为分析面板
9. **微服务架构**: 拆分为多个服务
10. **容器化部署**: Docker + Kubernetes

## 贡献指南

1. Fork项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 许可证

本项目采用MIT许可证 - 详见 [LICENSE](LICENSE) 文件

---

**注意**: 这是一个演示项目，当前使用模拟数据和免费汇率API。在生产环境中建议使用付费汇率API和真实的支付系统。

前端会实时监听最新的汇率 更改汇率数据