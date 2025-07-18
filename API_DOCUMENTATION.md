# Currency Exchange API Documentation

## 概述

本文档详细描述货币兑换系统的API接口规范，重点说明**第二个功能：Calculate Currency Exchange（货币兑换计算）**的实现细节和对接方式。

### 系统架构

```
┌─────────────────┐    ┌───────────────────┐    ┌─────────────────┐
│   外部汇率API    │───▶│  功能1: 获取汇率   │───▶│ 功能2: 计算兑换  │
│  (UniRateAPI)   │    │ ExternalRateService│    │CurrencyCalculation│
└─────────────────┘    └───────────────────┘    └─────────────────┘
       上游                     中间层                    下游
```

### 服务依赖关系

- **上游服务**: UniRateAPI - 提供实时汇率数据
- **中间层**: ExternalRateService - 功能1，获取和处理汇率
- **下游服务**: CurrencyCalculationService - 功能2，执行精确计算

---

## 功能1: Get Source Currency Rates（获取源货币汇率）

### 服务说明
- **数据源**: UniRateAPI (https://unirateapi.com)
- **更新频率**: 实时更新
- **支持货币**: 593种货币（170+法币 + 420+加密货币）
- **历史数据**: 26年（1999-2025）
- **费用**: 免费使用

### API端点

#### 1.1 获取所有当前汇率
```http
GET /api/rates
```

**响应示例:**
```json
{
  "base": "USD",
  "last_updated": "2024-01-15T10:30:00",
  "source": "UniRateAPI",
  "rates": {
    "EUR": 0.8500,
    "GBP": 0.7500,
    "JPY": 110.0000,
    "CNY": 6.4500,
    "KRW": 1180.0000,
    "MXN": 17.9900
  }
}
```

#### 1.2 获取特定货币对汇率
```http
GET /api/rates/{from}/{to}
```

**参数:**
- `from`: 源货币代码 (如: USD)
- `to`: 目标货币代码 (如: EUR)

**响应示例:**
```json
{
  "from": "USD",
  "to": "EUR", 
  "rate": 0.8500,
  "last_updated": "2024-01-15T10:30:00",
  "source": "UniRateAPI"
}
```

---

## 功能2: Calculate Currency Exchange（货币兑换计算）

### 🎯 **核心功能说明**

这是系统的核心业务逻辑，负责基于实时汇率进行精确的货币兑换计算。作为下游服务，它依赖功能1提供的汇率数据。

### 🔧 **技术特性**

- **精确计算**: 使用BigDecimal确保金融级精度
- **多种费率模式**: 支持标准、快速、经济三种费率
- **智能费用计算**: 最低/最高费用限制
- **批量处理**: 支持多货币对同时计算
- **反向计算**: 根据目标金额反推源货币
- **汇率监控**: 提供波动情况分析
- **输入验证**: 严格的参数验证和错误处理

### 📊 **费率配置**

| 费率模式 | 费率 | 适用场景 | 说明 |
|---------|-----|---------|------|
| standard | 1.0% | 标准服务 | 默认费率 |
| express | 1.5% | 快速到账 | 加急处理 |
| economy | 0.5% | 经济模式 | 延时到账 |

**费用限制:**
- 最低手续费: $2.99
- 最高手续费: $50.00

---

## API接口详细规范

### 2.1 标准兑换计算

**核心接口 - 最常用**

```http
POST /api/rates/calculate
Content-Type: application/json
```

**请求参数:**
```json
{
  "from": "USD",           // 必填: 源货币代码
  "to": "EUR",             // 必填: 目标货币代码  
  "amount": 250.00,        // 必填: 兑换金额 (>0, ≤1,000,000)
  "fee_mode": "standard"   // 可选: 费率模式 [standard|express|economy]
}
```

**响应数据:**
```json
{
  "from_currency": "USD",
  "to_currency": "EUR",
  "original_amount": 250.00,
  "exchange_rate": 0.8500,
  "gross_converted_amount": 212.500000,
  "fee_mode": "standard",
  "fee_rate": 0.010,
  "fee_amount": 2.99,
  "net_converted_amount": 209.96,
  "total_cost": 252.99,
  "effective_rate": 0.8398,
  "rate_margin": 0.0102,
  "calculated_at": "2024-01-15T10:30:00",
  "calculation_version": "2.0"
}
```

**字段说明:**

| 字段 | 类型 | 说明 |
|------|------|------|
| `original_amount` | Number | 原始兑换金额 |
| `exchange_rate` | Number | 市场汇率 |
| `gross_converted_amount` | Number | 按市场汇率计算的毛兑换金额 |
| `fee_amount` | Number | 手续费金额 |
| `net_converted_amount` | Number | 扣除费用后的净兑换金额 |
| `total_cost` | Number | 总成本（原金额+手续费） |
| `effective_rate` | Number | 有效汇率（含费用） |
| `rate_margin` | Number | 汇率差价 |

### 2.2 批量计算

**用于比较多个货币对**

```http
POST /api/rates/calculate/batch
```

**请求参数:**
```json
{
  "amount": 1000.00,
  "currency_pairs": {
    "USD": "EUR",
    "USD": "GBP", 
    "USD": "JPY"
  }
}
```

**响应数据:**
```json
{
  "batch_results": {
    "USD_EUR": {
      "from_currency": "USD",
      "to_currency": "EUR",
      "net_converted_amount": 839.85,
      // ... 其他计算字段
    },
    "USD_GBP": {
      "from_currency": "USD", 
      "to_currency": "GBP",
      "net_converted_amount": 737.26,
      // ... 其他计算字段
    }
  },
  "calculated_at": "2024-01-15T10:30:00"
}
```

### 2.3 反向计算

**根据目标金额计算所需源货币**

```http
POST /api/rates/calculate/reverse
```

**请求参数:**
```json
{
  "from": "USD",
  "to": "EUR", 
  "target_amount": 100.00,    // 目标金额（想要获得的EUR数量）
  "fee_mode": "standard"
}
```

**响应数据:**
```json
{
  "required_amount": 120.48,   // 需要的USD金额
  "target_amount": 100.00,     // 目标EUR金额
  "from_currency": "USD",
  "to_currency": "EUR",
  "exchange_rate": 0.8500,
  "verification": {
    // 验证计算 - 用required_amount进行正向计算的结果
    "net_converted_amount": 100.00,
    "fee_amount": 1.20
  },
  "calculated_at": "2024-01-15T10:30:00"
}
```

### 2.4 汇率监控计算

**提供汇率波动情况下的计算结果**

```http
POST /api/rates/calculate/monitoring
```

**请求参数:**
```json
{
  "from": "USD",
  "to": "EUR",
  "amount": 1000.00
}
```

**响应数据:**
```json
{
  "current_calculation": {
    "net_converted_amount": 839.85,
    "exchange_rate": 0.8500
  },
  "optimistic_calculation": {
    "net_converted_amount": 840.69,
    "exchange_rate": 0.8509
  },
  "pessimistic_calculation": {
    "net_converted_amount": 839.01,
    "exchange_rate": 0.8491
  },
  "rate_spread": {
    "current": 0.8500,
    "high": 0.8509,
    "low": 0.8491,
    "spread_percentage": 0.1
  }
}
```

---

## 错误处理

### 错误响应格式

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "timestamp": "2024-01-15T10:30:00",
  "success": false
}
```

### 常见错误类型

| HTTP状态码 | 错误类型 | 原因 |
|-----------|---------|------|
| 400 | `Invalid parameter` | 请求参数格式错误 |
| 400 | `Amount out of range` | 金额超出允许范围 |
| 400 | `Unsupported currency` | 不支持的货币代码 |
| 503 | `Rate service unavailable` | 上游汇率服务不可用 |
| 503 | `Calculation service unavailable` | 计算服务异常 |

### 输入验证规则

**金额验证:**
- 必须为正数
- 最大值: 1,000,000
- 精度: 小数点后最多2位

**货币代码验证:**
- 3位字母代码
- 大小写不敏感
- 必须在支持列表中

**费率模式验证:**
- 允许值: `standard`, `express`, `economy`
- 默认值: `standard`

---

## 对接指南

### 1. 上游对接（获取汇率数据）

如果你需要直接对接功能1（获取汇率）：

```java
// 示例：调用汇率获取服务
@Autowired
private ExternalRateService externalRateService;

// 获取USD到EUR的汇率
BigDecimal rate = externalRateService.getSpecificRate("USD", "EUR");

// 获取所有当前汇率
Map<String, Object> allRates = externalRateService.getAllCurrentRates();
```

### 2. 下游对接（使用计算服务）

如果你需要对接功能2（计算兑换）：

```java
// 示例：调用计算服务
@Autowired  
private CurrencyCalculationService calculationService;

// 构建请求
Map<String, Object> request = Map.of(
    "from", "USD",
    "to", "EUR", 
    "amount", new BigDecimal("250.00"),
    "fee_mode", "standard"
);

// 执行计算
Map<String, Object> result = calculationService.calculateExchange(request);
```

### 3. HTTP客户端对接

```javascript
// JavaScript示例
const calculateExchange = async (from, to, amount) => {
  const response = await fetch('/api/rates/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: from,
      to: to,
      amount: amount,
      fee_mode: 'standard'
    })
  });
  
  return await response.json();
};

// 使用示例
const result = await calculateExchange('USD', 'EUR', 250);
console.log('兑换结果:', result.net_converted_amount);
```

### 4. 数据流示例

```
用户输入: 250 USD → EUR

Step 1: 调用功能1获取汇率
GET /api/rates/USD/EUR
→ rate: 0.8500

Step 2: 调用功能2计算兑换  
POST /api/rates/calculate
{
  "from": "USD",
  "to": "EUR", 
  "amount": 250,
  "fee_mode": "standard"
}

Step 3: 返回详细计算结果
{
  "net_converted_amount": 209.96,
  "fee_amount": 2.99,
  "total_cost": 252.99
}
```

---

## 性能指标

### 响应时间目标

- **功能1** (汇率获取): < 500ms
- **功能2** (兑换计算): < 200ms  
- **批量计算**: < 1000ms

### 并发能力

- 支持并发请求: 100+ QPS
- 上游API限制: 30请求/分钟
- 内置缓存机制: 60秒汇率缓存

### 可用性

- 目标可用性: 99.9%
- 故障转移: 备用汇率数据
- 监控告警: 实时错误监控

---

## 测试用例

### 功能测试

```bash
# 1. 基础计算测试
curl -X POST http://localhost:8080/api/rates/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "from": "USD",
    "to": "EUR", 
    "amount": 100,
    "fee_mode": "standard"
  }'

# 2. 批量计算测试  
curl -X POST http://localhost:8080/api/rates/calculate/batch \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency_pairs": {
      "USD": "EUR",
      "USD": "GBP"
    }
  }'

# 3. 反向计算测试
curl -X POST http://localhost:8080/api/rates/calculate/reverse \
  -H "Content-Type: application/json" \
  -d '{
    "from": "USD",
    "to": "EUR",
    "target_amount": 100
  }'
```

### 边界测试

```json
// 最小金额测试
{"from": "USD", "to": "EUR", "amount": 0.01}

// 最大金额测试  
{"from": "USD", "to": "EUR", "amount": 1000000}

// 无效货币测试
{"from": "XXX", "to": "EUR", "amount": 100}

// 缺少参数测试
{"from": "USD", "amount": 100}
```

---

## 部署配置

### 环境变量

```yaml
# application.yml
currency-exchange:
  api:
    external-api:
      base-url: https://api.unirateapi.com
      api-key: ${UNIRATE_API_KEY:}  # 可选，免费版不需要
      timeout: 5000
```

### Docker配置

```dockerfile
FROM openjdk:17-jre-slim
COPY target/currency-exchange-backend.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### 启动命令

```bash
# 开发环境
mvn spring-boot:run

# 生产环境
java -jar target/currency-exchange-backend.jar \
  --spring.profiles.active=prod \
  --server.port=8080
```

---

## 版本更新

### v2.0 (当前版本)
- ✅ 集成UniRateAPI实时数据
- ✅ 完整的费用计算逻辑
- ✅ 批量和反向计算支持
- ✅ 汇率监控功能
- ✅ 详细的错误处理

### v1.0 (初始版本)
- 基础计算功能
- 模拟汇率数据

---

## 联系支持

- **技术支持**: 提供完整的代码实现和部署支持
- **API问题**: 详细的错误日志和调试信息
- **性能优化**: 缓存策略和并发处理建议

---

**注意**: 本文档描述的是一个完整的货币兑换计算系统。功能1负责提供准确的汇率数据，功能2负责执行精确的兑换计算。两者协同工作，为用户提供可靠的货币兑换服务。 