# Currency Exchange Application

一个模仿Remitly风格的移动端货币兑换应用，提供实时汇率查询、货币兑换、交易历史管理等功能。


## 注意 先看这里
怎么启动这个项目
按照规矩，要用nodejs写后端，所以cd backend2 -> npm install -> npm run dev 可以启动nodejs的后端
启动前端: cd frontend -> npm install -> npm run serve



## 项目概述

本项目采用前后端分离架构：
- **前端**: Vue 3 + Element Plus，移动端优先设计，模仿Remitly的用户界面
- **后端**: Spring Boot 3.1.5 + JPA + H2/MySQL数据库，提供RESTful API

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
├── backend/                 # Spring Boot 后端应用
│   ├── src/main/java/
│   │   └── com/currencyexchange/
│   │       ├── entity/      # 数据实体类
│   │       ├── controller/  # REST控制器
│   │       ├── config/      # 配置类
│   │       └── CurrencyExchangeApplication.java
│   ├── src/main/resources/
│   │   └── application.yml  # 应用配置
│   └── pom.xml              # Maven依赖配置
└── README.md                # 项目文档
```

## 八大功能模块详细说明

### 1. 📊 Get Source Currency Rates (获取源货币汇率)

**描述**: 从外部API获取实时汇率数据，支持多种货币对的汇率查询。

**技术实现**:
- **前端**: `views/Rates.vue` - 实时汇率展示页面
- **后端**: `ExchangeRateController.java` - 汇率API接口
- **API端点**: 
  - `GET /api/rates` - 获取所有当前汇率
  - `GET /api/rates/{from}/{to}` - 获取特定货币对汇率

**功能特点**:
- 实时汇率更新（每分钟）
- 支持7种主要货币：USD, EUR, GBP, JPY, CNY, KRW, MXN
- 汇率变化趋势显示（上涨/下跌）
- 外部API集成准备

---

### 2. 💱 Calculate Currency Exchange (计算货币兑换)

**描述**: 基于当前汇率计算货币兑换金额，包含手续费计算。

**技术实现**:
- **前端**: `views/Home.vue` - 主要的汇率计算界面
- **后端**: `ExchangeRateController.calculateExchange()` 
- **状态管理**: Vuex store中的`calculateExchange` action

**API端点**: `POST /api/rates/calculate`

**功能特点**:
- 实时汇率计算
- 手续费计算（1%费率）
- 货币选择器（模态框形式）
- 自动金额格式化
- 支持双向货币转换

---

### 3. 📝 Store Historical Exchange (存储历史汇率)

**描述**: 记录所有货币兑换交易的历史数据，便于用户查询和分析。

**技术实现**:
- **前端**: `views/History.vue` - 交易历史页面
- **后端**: 
  - `ExchangeController.java` - 交易处理
  - `ExchangeTransaction.java` - 交易实体
- **数据库**: H2内存数据库（开发）/ MySQL数据库（生产）

**API端点**: 
- `POST /api/exchange` - 执行兑换并存储记录
- `GET /api/exchange/history` - 获取交易历史

**功能特点**:
- 完整的交易记录存储
- 交易状态跟踪（PENDING, COMPLETED, FAILED等）
- 交易参考号生成
- 按时间排序的历史记录展示
- 空状态友好提示

---

### 4. 👤 User Management (Simple) (用户管理-简单)

**描述**: 基础的用户注册、登录和个人信息管理功能。

**技术实现**:
- **前端**: `views/Profile.vue` - 用户资料页面
- **后端**: 
  - `UserController.java` - 用户API
  - `User.java` - 用户实体
- **安全**: Spring Security基础配置

**API端点**:
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/profile` - 获取用户信息
- `PUT /api/users/profile` - 更新用户信息

**功能特点**:
- 用户注册和登录
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
  - `WatchlistController.java` - 观察列表API
  - `Watchlist.java` - 观察列表实体
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

---

### 6. 💰 Currency Management (Simple) (货币管理-简单)

**描述**: 系统支持的货币管理，包括货币信息的增删改查。

**技术实现**:
- **前端**: 集成在各个组件中的货币选择器
- **后端**: 
  - `CurrencyController.java` - 货币管理API
  - `Currency.java` - 货币实体
- **数据**: 预置主要货币数据

**API端点**:
- `GET /api/currencies` - 获取所有货币
- `GET /api/currencies/{code}` - 获取特定货币
- `POST /api/currencies` - 添加新货币（管理员）
- `PUT /api/currencies/{id}` - 更新货币信息

**功能特点**:
- 7种主要货币支持
- 货币代码、名称、符号管理
- 货币状态控制（启用/禁用）
- 管理员级别的货币配置
- 标准化货币信息格式

---

### 7. 📈 Rate Change Watch (汇率变化监控)

**描述**: 监控汇率变化并向用户发送警报通知。

**技术实现**:
- **前端**: `views/Watchlist.vue` 中的alerts功能
- **后端**: `WatchlistController.getRateChangeAlerts()`
- **监控**: 定时任务检测汇率变化（预留功能）

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
- **后端**: `ExchangeRateController.reserveRate()`
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
- **Spring Boot 3.1.5**: Java企业级应用框架
- **Spring Data JPA**: 数据持久化
- **Spring Security**: 安全框架
- **H2 Database**: 内存数据库（开发环境）
- **MySQL**: 生产环境数据库（持久化存储）
- **Lombok**: 减少样板代码
- **Maven**: 项目构建工具

### 开发环境要求
- **Java**: JDK 17+
- **Node.js**: 16+
- **Maven**: 3.6+
- **npm/yarn**: 最新版本

## 快速启动

### 后端启动
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
访问地址：http://localhost:8080/api

### 前端启动
```bash
cd frontend
npm install
npm run serve
```
访问地址：http://localhost:8081

### 数据库访问

#### 开发环境（H2数据库）
H2控制台：http://localhost:8080/api/h2-console
- 用户名：sa
- 密码：(空)
- JDBC URL：jdbc:h2:mem:currencyexchange

#### 生产环境（MySQL数据库）
详细配置请参考：[MYSQL_SETUP.md](MYSQL_SETUP.md)

**快速启动**:
```bash
# 使用MySQL配置启动
mvn spring-boot:run -Dspring.profiles.active=mysql

# 生产环境
mvn spring-boot:run -Dspring.profiles.active=production
```

## API接口文档

### 核心API端点总览

| 功能模块 | HTTP方法 | 端点 | 描述 |
|---------|---------|------|------|
| 汇率获取 | GET | `/api/rates` | 获取所有当前汇率 |
| 汇率计算 | POST | `/api/rates/calculate` | 计算货币兑换 |
| 汇率预留 | POST | `/api/rates/reserve` | 预留限时汇率 |
| 货币管理 | GET | `/api/currencies` | 获取货币列表 |
| 用户注册 | POST | `/api/users/register` | 用户注册 |
| 用户登录 | POST | `/api/users/login` | 用户登录 |
| 交易执行 | POST | `/api/exchange` | 执行货币兑换 |
| 交易历史 | GET | `/api/exchange/history` | 获取交易记录 |
| 观察列表 | GET | `/api/watchlist` | 获取用户观察列表 |
| 汇率警报 | GET | `/api/watchlist/alerts` | 获取汇率变化警报 |

## 部署说明

### 生产环境配置
1. ✅ 将H2数据库更换为MySQL（已完成）
2. 配置外部汇率API密钥
3. 设置Redis缓存
4. 配置HTTPS和域名
5. 设置定时任务进行汇率更新

### Docker部署（预留）
```dockerfile
# 后续可添加Docker配置
# 支持容器化部署
```

## 后续扩展计划

1. **实时WebSocket推送**: 汇率实时更新
2. **支付集成**: 连接真实支付网关
3. **更多货币支持**: 扩展到50+种货币
4. **高级图表**: 汇率历史趋势图
5. **移动APP**: React Native/Flutter版本
6. **API限流**: 防止API滥用
7. **数据分析**: 用户行为分析面板

## 贡献指南

1. Fork项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 许可证

本项目采用MIT许可证 - 详见 [LICENSE](LICENSE) 文件

---

**注意**: 这是一个演示项目，当前使用模拟数据。在生产环境中需要连接真实的汇率API和支付系统。 

前端会实时监听最新的汇率 更改汇率数据