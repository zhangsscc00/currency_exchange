# API配置管理说明

## 概览
前端项目现在使用统一的API配置管理，支持多环境自动切换和手动配置。

## 文件结构
```
src/config/
├── api.js      # API地址和端点配置
└── env.js      # 环境检测和管理
```

## 环境配置

### 自动检测环境
- **localhost/127.0.0.1** → 开发环境 (localhost:8080)
- **47.243.102.28** → 生产环境 (47.243.102.28:8080)
- **其他** → 根据NODE_ENV决定

### 手动设置环境
如需强制使用特定环境，修改 `src/config/env.js`:
```javascript
export const FORCE_ENV = 'production' // 强制使用生产环境
```

## 快速切换API地址

### 方法1: 修改配置文件
编辑 `src/config/api.js` 中的baseURL:
```javascript
const config = {
  production: {
    baseURL: 'http://47.243.102.28:8080',  // 修改这里
    timeout: 10000
  }
}
```

### 方法2: 强制环境
编辑 `src/config/env.js`:
```javascript
export const FORCE_ENV = 'production' // 强制使用生产环境
```

## 当前API端点
- 用户登录: `/api/users/login`
- 用户注册: `/api/users/register`
- 发送验证码: `/api/users/send-email-code`
- 邮箱登录: `/api/users/email-login`
- 获取汇率: `/api/rates`

## 使用方法
在代码中使用统一的API调用:
```javascript
import { getApiUrl } from '@/config/api'

// 调用用户登录API
const response = await axios.post(getApiUrl('USER', 'LOGIN'), data)

// 调用汇率API
const response = await axios.get(getApiUrl('RATES', 'CURRENT'))
```

## 部署提示
1. **本地开发**: 自动使用localhost:8080
2. **生产部署**: 自动使用47.243.102.28:8080
3. **手动切换**: 修改FORCE_ENV变量

## 调试
开发模式下，控制台会显示当前使用的API环境信息。 