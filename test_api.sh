#!/bin/bash

# Currency Exchange API 测试脚本
# 用于验证功能1（获取汇率）和功能2（计算兑换）

BASE_URL="http://localhost:8080/api"

echo "🚀 Currency Exchange API 测试开始..."
echo "======================================"

# 等待服务启动
echo "⏳ 等待服务启动（5秒）..."
sleep 5

# 测试1: 功能1 - 获取所有汇率
echo ""
echo "📊 测试1: 获取所有汇率"
echo "GET $BASE_URL/rates"
curl -s -X GET "$BASE_URL/rates" | jq . || echo "❌ 获取所有汇率失败"

# 测试2: 功能1 - 获取特定汇率
echo ""
echo "📊 测试2: 获取USD/EUR汇率"
echo "GET $BASE_URL/rates/USD/EUR"
curl -s -X GET "$BASE_URL/rates/USD/EUR" | jq . || echo "❌ 获取特定汇率失败"

# 测试3: 功能2 - 标准计算
echo ""
echo "💱 测试3: 标准兑换计算"
echo "POST $BASE_URL/rates/calculate"
curl -s -X POST "$BASE_URL/rates/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "USD",
    "to": "EUR",
    "amount": 250,
    "fee_mode": "standard"
  }' | jq . || echo "❌ 标准计算失败"

# 测试4: 功能2 - 批量计算
echo ""
echo "💱 测试4: 批量兑换计算"
echo "POST $BASE_URL/rates/calculate/batch"
curl -s -X POST "$BASE_URL/rates/calculate/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency_pairs": {
      "USD": "EUR",
      "USD": "GBP",
      "USD": "MXN"
    }
  }' | jq . || echo "❌ 批量计算失败"

# 测试5: 功能2 - 反向计算
echo ""
echo "💱 测试5: 反向兑换计算"
echo "POST $BASE_URL/rates/calculate/reverse"
curl -s -X POST "$BASE_URL/rates/calculate/reverse" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "USD",
    "to": "EUR",
    "target_amount": 100,
    "fee_mode": "standard"
  }' | jq . || echo "❌ 反向计算失败"

# 测试6: 功能2 - 汇率监控计算
echo ""
echo "📈 测试6: 汇率监控计算"
echo "POST $BASE_URL/rates/calculate/monitoring"
curl -s -X POST "$BASE_URL/rates/calculate/monitoring" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "USD",
    "to": "EUR",
    "amount": 500
  }' | jq . || echo "❌ 汇率监控计算失败"

# 测试7: 错误处理 - 无效参数
echo ""
echo "❌ 测试7: 错误处理（无效参数）"
echo "POST $BASE_URL/rates/calculate (invalid params)"
curl -s -X POST "$BASE_URL/rates/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "XXX",
    "to": "YYY",
    "amount": -100
  }' | jq . || echo "❌ 错误处理测试失败"

# 测试8: 历史汇率
echo ""
echo "📅 测试8: 历史汇率"
echo "GET $BASE_URL/rates/historical?date=2024-01-01&from=USD"
curl -s -X GET "$BASE_URL/rates/historical?date=2024-01-01&from=USD" | jq . || echo "❌ 历史汇率失败"

echo ""
echo "======================================"
echo "✅ API测试完成！"
echo ""
echo "🔗 测试结果说明："
echo "- 如果看到JSON响应，说明API正常工作"
echo "- 如果看到错误信息，请检查后端服务是否启动"
echo "- 完整API文档请查看 API_DOCUMENTATION.md"
echo ""
echo "🌐 前端访问地址：http://localhost:8081"
echo "⚙️  后端API地址：http://localhost:8080/api"
echo "🗄️  H2数据库控制台：http://localhost:8080/api/h2-console" 