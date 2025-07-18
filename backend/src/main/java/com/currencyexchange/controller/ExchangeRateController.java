package com.currencyexchange.controller;

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
public class ExchangeRateController {

    /**
     * 功能1: get source currency rates
     * 获取当前汇率信息
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getCurrentRates() {
        Map<String, Object> response = new HashMap<>();
        
        // 模拟汇率数据
        Map<String, BigDecimal> rates = new HashMap<>();
        rates.put("USD_EUR", new BigDecimal("0.8500"));
        rates.put("USD_GBP", new BigDecimal("0.7500"));
        rates.put("USD_JPY", new BigDecimal("110.0000"));
        rates.put("USD_CNY", new BigDecimal("6.4500"));
        rates.put("USD_KRW", new BigDecimal("1180.0000"));
        rates.put("USD_MXN", new BigDecimal("17.9900"));
        rates.put("EUR_USD", new BigDecimal("1.1800"));
        rates.put("GBP_USD", new BigDecimal("1.3300"));
        rates.put("JPY_USD", new BigDecimal("0.0091"));
        rates.put("CNY_USD", new BigDecimal("0.1550"));
        rates.put("KRW_USD", new BigDecimal("0.0009"));
        rates.put("MXN_USD", new BigDecimal("0.0556"));
        
        response.put("rates", rates);
        response.put("last_updated", LocalDateTime.now());
        response.put("source", "External API Provider");
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取特定货币对的汇率
     */
    @GetMapping("/{from}/{to}")
    public ResponseEntity<Map<String, Object>> getSpecificRate(
            @PathVariable String from, 
            @PathVariable String to) {
        
        String pairKey = from.toUpperCase() + "_" + to.toUpperCase();
        BigDecimal rate = getSimulatedRate(from.toUpperCase(), to.toUpperCase());
        
        if (rate == null) {
            return ResponseEntity.notFound().build();
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("from", from.toUpperCase());
        response.put("to", to.toUpperCase());
        response.put("rate", rate);
        response.put("last_updated", LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 功能2: calculate currency exchange
     * 计算货币兑换
     */
    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateExchange(@RequestBody Map<String, Object> request) {
        String fromCurrency = (String) request.get("from");
        String toCurrency = (String) request.get("to");
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        
        BigDecimal rate = getSimulatedRate(fromCurrency, toCurrency);
        if (rate == null) {
            return ResponseEntity.badRequest().build();
        }
        
        BigDecimal convertedAmount = amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal fee = amount.multiply(new BigDecimal("0.01")).setScale(2, RoundingMode.HALF_UP); // 1% fee
        
        Map<String, Object> response = new HashMap<>();
        response.put("from_currency", fromCurrency);
        response.put("to_currency", toCurrency);
        response.put("from_amount", amount);
        response.put("to_amount", convertedAmount);
        response.put("exchange_rate", rate);
        response.put("fee", fee);
        response.put("total_cost", amount.add(fee));
        response.put("calculated_at", LocalDateTime.now());
        
        return ResponseEntity.ok(response);
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
        
        BigDecimal rate = getSimulatedRate(fromCurrency, toCurrency);
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
     * 模拟获取汇率数据
     */
    private BigDecimal getSimulatedRate(String from, String to) {
        Map<String, BigDecimal> rates = new HashMap<>();
        rates.put("USD_EUR", new BigDecimal("0.8500"));
        rates.put("USD_GBP", new BigDecimal("0.7500"));
        rates.put("USD_JPY", new BigDecimal("110.0000"));
        rates.put("USD_CNY", new BigDecimal("6.4500"));
        rates.put("USD_KRW", new BigDecimal("1180.0000"));
        rates.put("USD_MXN", new BigDecimal("17.9900"));
        rates.put("EUR_USD", new BigDecimal("1.1800"));
        rates.put("GBP_USD", new BigDecimal("1.3300"));
        rates.put("JPY_USD", new BigDecimal("0.0091"));
        rates.put("CNY_USD", new BigDecimal("0.1550"));
        rates.put("KRW_USD", new BigDecimal("0.0009"));
        rates.put("MXN_USD", new BigDecimal("0.0556"));
        
        String key = from + "_" + to;
        return rates.get(key);
    }
} 