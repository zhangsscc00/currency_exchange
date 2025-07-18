package com.currencyexchange.controller;

import com.currencyexchange.service.ExternalRateService;
import com.currencyexchange.service.CurrencyCalculationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/rates")
@CrossOrigin(origins = "*")
@Slf4j
public class ExchangeRateController {

    @Autowired
    private ExternalRateService externalRateService;
    
    @Autowired
    private CurrencyCalculationService calculationService;

    /**
     * 测试端点 - 验证前后端连接
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testConnection() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "后端API连接正常");
        response.put("timestamp", LocalDateTime.now());
        response.put("endpoint", "/api/rates/test");
        
        return ResponseEntity.ok(response);
    }



    /**
     * 功能1: get source currency rates
     * 获取当前汇率信息
     * 
     * 上游服务：UniRateAPI
     * 数据源：欧洲央行、主要商业银行、可信金融机构
     * 更新频率：实时更新
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getCurrentRates() {
        try {
            // 调用外部汇率服务获取实时数据
            Map<String, Object> response = externalRateService.getAllCurrentRates();
            
            // 确保响应格式正确
            if (response.containsKey("rates")) {
                log.info("成功获取汇率数据: {}", response.get("rates"));
                return ResponseEntity.ok(response);
            } else {
                log.warn("外部API响应格式异常，使用备用数据");
                throw new RuntimeException("Invalid API response format");
            }
        } catch (Exception e) {
            log.error("获取汇率失败: {}", e.getMessage());
            
            // 返回备用汇率数据
            Map<String, Object> fallbackResponse = new HashMap<>();
            fallbackResponse.put("base", "USD");
            fallbackResponse.put("last_updated", LocalDateTime.now());
            fallbackResponse.put("source", "Fallback Data");
            
            Map<String, BigDecimal> rates = new HashMap<>();
            // 更新为2025年7月当前实际汇率
            rates.put("EUR", new BigDecimal("0.9100"));   // 欧元较强
            rates.put("GBP", new BigDecimal("0.7800"));   // 英镑
            rates.put("JPY", new BigDecimal("155.0000")); // 日元较弱
            rates.put("CNY", new BigDecimal("7.2500"));   // 人民币当前汇率
            rates.put("KRW", new BigDecimal("1340.0000"));// 韩元较弱
            rates.put("MXN", new BigDecimal("18.5000"));  // 墨西哥比索
            
            log.info("返回备用汇率数据，包含货币: {}", rates.keySet());
            fallbackResponse.put("rates", rates);
            
            return ResponseEntity.ok(fallbackResponse);
        }
    }

    /**
     * 获取特定货币对的汇率
     * 下游接口：为第二个功能（货币兑换计算）提供准确汇率
     */
    @GetMapping("/{from}/{to}")
    public ResponseEntity<Map<String, Object>> getSpecificRate(
            @PathVariable String from, 
            @PathVariable String to) {
        
        try {
            BigDecimal rate = externalRateService.getSpecificRate(from.toUpperCase(), to.toUpperCase());
            
            Map<String, Object> response = new HashMap<>();
            response.put("from", from.toUpperCase());
            response.put("to", to.toUpperCase());
            response.put("rate", rate);
            response.put("last_updated", LocalDateTime.now());
            response.put("source", "UniRateAPI");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unable to fetch exchange rate");
            errorResponse.put("from", from.toUpperCase());
            errorResponse.put("to", to.toUpperCase());
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(503).body(errorResponse);
        }
    }

    /**
     * 功能2: calculate currency exchange
     * 计算货币兑换 - 标准计算接口
     * 
     * 下游服务：为客户端提供精确的兑换计算
     * 上游依赖：ExternalRateService (实时汇率)
     */
    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateExchange(@RequestBody Map<String, Object> request) {
        try {
            Map<String, Object> result = calculationService.calculateExchange(request);
            
            // 检查是否有错误
            if (result.containsKey("error")) {
                return ResponseEntity.badRequest().body(result);
            }
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Calculation service unavailable");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.status(503).body(errorResponse);
        }
    }

    /**
     * 批量计算货币兑换
     */
    @PostMapping("/calculate/batch")
    public ResponseEntity<Map<String, Object>> calculateBatchExchange(@RequestBody Map<String, Object> request) {
        try {
            Map<String, Object> result = calculationService.calculateBatchExchange(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Batch calculation failed");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(503).body(errorResponse);
        }
    }

    /**
     * 反向计算 - 根据目标金额计算所需源货币
     */
    @PostMapping("/calculate/reverse")
    public ResponseEntity<Map<String, Object>> calculateReverseExchange(@RequestBody Map<String, Object> request) {
        try {
            Map<String, Object> result = calculationService.calculateReverseExchange(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Reverse calculation failed");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(503).body(errorResponse);
        }
    }

    /**
     * 汇率监控计算 - 提供波动情况下的计算
     */
    @PostMapping("/calculate/monitoring")
    public ResponseEntity<Map<String, Object>> calculateWithRateMonitoring(@RequestBody Map<String, Object> request) {
        try {
            Map<String, Object> result = calculationService.calculateWithRateMonitoring(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Rate monitoring calculation failed");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(503).body(errorResponse);
        }
    }

    /**
     * 功能8: Reserve currency rate (for a limited time)
     * 预留汇率（限时）
     */
    @PostMapping("/reserve")
    public ResponseEntity<Map<String, Object>> reserveRate(@RequestBody Map<String, Object> request) {
        String fromCurrency = (String) request.get("from");
        String toCurrency = (String) request.get("to");
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        
        BigDecimal rate = externalRateService.getSpecificRate(fromCurrency, toCurrency);
        if (rate == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // 预留汇率15分钟
        LocalDateTime validUntil = LocalDateTime.now().plusMinutes(15);
        String reservationId = "RES-" + System.currentTimeMillis();
        
        Map<String, Object> response = new HashMap<>();
        response.put("reservation_id", reservationId);
        response.put("from_currency", fromCurrency);
        response.put("to_currency", toCurrency);
        response.put("amount", amount);
        response.put("reserved_rate", rate);
        response.put("valid_until", validUntil);
        response.put("reserved_at", LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取历史汇率数据
     */
    @GetMapping("/historical")
    public ResponseEntity<Map<String, Object>> getHistoricalRates(
            @RequestParam String date,
            @RequestParam(defaultValue = "USD") String from) {
        try {
            Map<String, Object> result = externalRateService.getHistoricalRates(date, from);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unable to fetch historical rates");
            errorResponse.put("date", date);
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.status(503).body(errorResponse);
        }
    }
} 