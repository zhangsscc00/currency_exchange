#!/bin/bash

# 汇率API测试脚本
echo "🔍 测试汇率API..."

# 测试连接
echo "1. 测试后端连接..."
curl -s http://localhost:8080/api/rates/test | jq '.' || echo "❌ 连接测试失败"

echo ""
echo "2. 获取汇率数据..."
response=$(curl -s http://localhost:8080/api/rates)

# 解析响应
echo "$response" | jq '.'

# 检查关键汇率
echo ""
echo "3. 关键汇率检查:"
cny_rate=$(echo "$response" | jq -r '.rates.CNY // "未找到"')
mxn_rate=$(echo "$response" | jq -r '.rates.MXN // "未找到"')
eur_rate=$(echo "$response" | jq -r '.rates.EUR // "未找到"')

echo "💰 USD → CNY: $cny_rate (期望: ~7.25)"
echo "💰 USD → MXN: $mxn_rate (期望: ~18.5)" 
echo "💰 USD → EUR: $eur_rate (期望: ~0.91)"

# 验证汇率范围
if [[ "$cny_rate" == "7.2500" ]]; then
    echo "✅ CNY汇率已更新为当前值"
else
    echo "⚠️  CNY汇率可能需要检查"
fi

if [[ "$mxn_rate" == "18.5000" ]]; then
    echo "✅ MXN汇率已更新为当前值"
else
    echo "⚠️  MXN汇率可能需要检查"
fi

echo ""
echo "4. 测试外部API调用..."
echo "检查后端日志中是否有外部API调用信息" 