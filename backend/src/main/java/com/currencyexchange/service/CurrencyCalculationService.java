package com.currencyexchange.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 货币兑换计算服务
 * 功能2: Calculate Currency Exchange - 精确计算货币兑换
 * 
 * 作为下游服务，接收上游汇率数据进行兑换计算
 * 上游依赖：ExternalRateService (功能1)
 * 
 * 核心职责：
 * 1. 基于实时汇率进行精确计算
 * 2. 处理手续费和费率计算
 * 3. 支持多种费率模式
 * 4. 提供详细的计算明细
 * 5. 输入验证和异常处理
 */
@Service
@Slf4j
public class CurrencyCalculationService {

    @Autowired
    private ExternalRateService externalRateService;

    // 费率配置 - 实际生产中可配置化
    private static final BigDecimal DEFAULT_FEE_RATE = new BigDecimal("0.010"); // 1%
    private static final BigDecimal EXPRESS_FEE_RATE = new BigDecimal("0.015"); // 1.5%
    private static final BigDecimal ECONOMY_FEE_RATE = new BigDecimal("0.005"); // 0.5%
    private static final BigDecimal MIN_FEE = new BigDecimal("2.99"); // 最低手续费
    private static final BigDecimal MAX_FEE = new BigDecimal("50.00"); // 最高手续费

    /**
     * 核心计算方法 - 标准兑换计算
     * 
     * @param request 兑换请求参数
     * @return 详细的兑换计算结果
     */
    public Map<String, Object> calculateExchange(Map<String, Object> request) {
        try {
            // 1. 参数提取和验证
            String fromCurrency = validateAndGetString(request, "from");
            String toCurrency = validateAndGetString(request, "to");
            BigDecimal amount = validateAndGetAmount(request, "amount");
            String feeMode = (String) request.getOrDefault("fee_mode", "standard");
            
            // 2. 获取实时汇率（调用上游服务）
            BigDecimal exchangeRate = externalRateService.getSpecificRate(fromCurrency, toCurrency);
            
            // 3. 执行详细计算
            return performDetailedCalculation(fromCurrency, toCurrency, amount, exchangeRate, feeMode);
            
        } catch (Exception e) {
            log.error("Currency calculation failed: {}", e.getMessage());
            return createErrorResponse("Calculation failed", e.getMessage());
        }
    }

    /**
     * 批量计算 - 支持多个货币对同时计算
     */
    public Map<String, Object> calculateBatchExchange(Map<String, Object> request) {
        try {
            BigDecimal amount = validateAndGetAmount(request, "amount");
            @SuppressWarnings("unchecked")
            Map<String, String> currencyPairs = (Map<String, String>) request.get("currency_pairs");
            
            Map<String, Object> results = new HashMap<>();
            
            for (Map.Entry<String, String> pair : currencyPairs.entrySet()) {
                String fromCurrency = pair.getKey();
                String toCurrency = pair.getValue();
                
                try {
                    BigDecimal exchangeRate = externalRateService.getSpecificRate(fromCurrency, toCurrency);
                    Map<String, Object> calculation = performDetailedCalculation(fromCurrency, toCurrency, amount, exchangeRate, "standard");
                    results.put(fromCurrency + "_" + toCurrency, calculation);
                } catch (Exception e) {
                    log.warn("Failed to calculate {}/{}: {}", fromCurrency, toCurrency, e.getMessage());
                    results.put(fromCurrency + "_" + toCurrency, createErrorResponse("Rate unavailable", e.getMessage()));
                }
            }
            
            return Map.of("batch_results", results, "calculated_at", LocalDateTime.now());
            
        } catch (Exception e) {
            return createErrorResponse("Batch calculation failed", e.getMessage());
        }
    }

    /**
     * 反向计算 - 根据目标金额计算需要的源货币金额
     */
    public Map<String, Object> calculateReverseExchange(Map<String, Object> request) {
        try {
            String fromCurrency = validateAndGetString(request, "from");
            String toCurrency = validateAndGetString(request, "to");
            BigDecimal targetAmount = validateAndGetAmount(request, "target_amount");
            String feeMode = (String) request.getOrDefault("fee_mode", "standard");
            
            BigDecimal exchangeRate = externalRateService.getSpecificRate(fromCurrency, toCurrency);
            BigDecimal feeRate = getFeeRate(feeMode);
            
            // 反向计算：(目标金额 / 汇率) / (1 - 费率)
            BigDecimal baseAmount = targetAmount.divide(exchangeRate, 6, RoundingMode.HALF_UP);
            BigDecimal requiredAmount = baseAmount.divide(BigDecimal.ONE.subtract(feeRate), 2, RoundingMode.HALF_UP);
            
            // 验证计算
            Map<String, Object> verification = performDetailedCalculation(fromCurrency, toCurrency, requiredAmount, exchangeRate, feeMode);
            
            Map<String, Object> result = new HashMap<>();
            result.put("required_amount", requiredAmount);
            result.put("target_amount", targetAmount);
            result.put("from_currency", fromCurrency);
            result.put("to_currency", toCurrency);
            result.put("exchange_rate", exchangeRate);
            result.put("verification", verification);
            result.put("calculated_at", LocalDateTime.now());
            
            return result;
            
        } catch (Exception e) {
            return createErrorResponse("Reverse calculation failed", e.getMessage());
        }
    }

    /**
     * 实时汇率监控计算 - 为汇率变化提供即时计算
     */
    public Map<String, Object> calculateWithRateMonitoring(Map<String, Object> request) {
        try {
            String fromCurrency = validateAndGetString(request, "from");
            String toCurrency = validateAndGetString(request, "to");
            BigDecimal amount = validateAndGetAmount(request, "amount");
            
            // 获取当前汇率
            BigDecimal currentRate = externalRateService.getSpecificRate(fromCurrency, toCurrency);
            
            // 模拟汇率波动计算
            BigDecimal rateVariation = new BigDecimal("0.001"); // 0.1%波动
            BigDecimal higherRate = currentRate.multiply(BigDecimal.ONE.add(rateVariation));
            BigDecimal lowerRate = currentRate.multiply(BigDecimal.ONE.subtract(rateVariation));
            
            Map<String, Object> result = new HashMap<>();
            result.put("current_calculation", performDetailedCalculation(fromCurrency, toCurrency, amount, currentRate, "standard"));
            result.put("optimistic_calculation", performDetailedCalculation(fromCurrency, toCurrency, amount, higherRate, "standard"));
            result.put("pessimistic_calculation", performDetailedCalculation(fromCurrency, toCurrency, amount, lowerRate, "standard"));
            result.put("rate_spread", Map.of(
                "current", currentRate,
                "high", higherRate,
                "low", lowerRate,
                "spread_percentage", rateVariation.multiply(new BigDecimal("100"))
            ));
            
            return result;
            
        } catch (Exception e) {
            return createErrorResponse("Rate monitoring calculation failed", e.getMessage());
        }
    }

    /**
     * 核心计算逻辑 - 执行详细的兑换计算
     */
    private Map<String, Object> performDetailedCalculation(String fromCurrency, String toCurrency, 
            BigDecimal amount, BigDecimal exchangeRate, String feeMode) {
        
        // 1. 基础计算
        BigDecimal grossAmount = amount.multiply(exchangeRate).setScale(6, RoundingMode.HALF_UP);
        
        // 2. 费用计算
        BigDecimal feeRate = getFeeRate(feeMode);
        BigDecimal feeAmount = calculateFee(amount, feeRate);
        
        // 3. 净兑换金额
        BigDecimal netAmount = grossAmount.subtract(feeAmount.multiply(exchangeRate)).setScale(2, RoundingMode.HALF_UP);
        
        // 4. 总成本
        BigDecimal totalCost = amount.add(feeAmount);
        
        // 5. 有效汇率（包含费用后的实际汇率）
        BigDecimal effectiveRate = netAmount.divide(amount, 6, RoundingMode.HALF_UP);
        
        // 6. 构建详细结果
        Map<String, Object> calculation = new HashMap<>();
        calculation.put("from_currency", fromCurrency);
        calculation.put("to_currency", toCurrency);
        calculation.put("original_amount", amount);
        calculation.put("exchange_rate", exchangeRate);
        calculation.put("gross_converted_amount", grossAmount);
        calculation.put("fee_mode", feeMode);
        calculation.put("fee_rate", feeRate);
        calculation.put("fee_amount", feeAmount);
        calculation.put("net_converted_amount", netAmount);
        calculation.put("total_cost", totalCost);
        calculation.put("effective_rate", effectiveRate);
        calculation.put("rate_margin", exchangeRate.subtract(effectiveRate));
        calculation.put("calculated_at", LocalDateTime.now());
        calculation.put("calculation_version", "2.0");
        
        return calculation;
    }

    /**
     * 费用计算
     */
    private BigDecimal calculateFee(BigDecimal amount, BigDecimal feeRate) {
        BigDecimal fee = amount.multiply(feeRate);
        
        // 应用最低和最高费用限制
        if (fee.compareTo(MIN_FEE) < 0) {
            fee = MIN_FEE;
        } else if (fee.compareTo(MAX_FEE) > 0) {
            fee = MAX_FEE;
        }
        
        return fee.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * 获取费率
     */
    private BigDecimal getFeeRate(String feeMode) {
        return switch (feeMode.toLowerCase()) {
            case "express" -> EXPRESS_FEE_RATE;
            case "economy" -> ECONOMY_FEE_RATE;
            default -> DEFAULT_FEE_RATE;
        };
    }

    /**
     * 参数验证
     */
    private String validateAndGetString(Map<String, Object> request, String key) {
        Object value = request.get(key);
        if (value == null || value.toString().trim().isEmpty()) {
            throw new IllegalArgumentException("Missing required parameter: " + key);
        }
        return value.toString().trim().toUpperCase();
    }

    private BigDecimal validateAndGetAmount(Map<String, Object> request, String key) {
        Object value = request.get(key);
        if (value == null) {
            throw new IllegalArgumentException("Missing required parameter: " + key);
        }
        
        try {
            BigDecimal amount = new BigDecimal(value.toString());
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("Amount must be positive");
            }
            if (amount.compareTo(new BigDecimal("1000000")) > 0) {
                throw new IllegalArgumentException("Amount exceeds maximum limit");
            }
            return amount;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid amount format: " + value);
        }
    }

    /**
     * 错误响应
     */
    private Map<String, Object> createErrorResponse(String error, String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("success", false);
        
        return errorResponse;
    }
} 