package com.currencyexchange.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/exchange")
@CrossOrigin(origins = "*")
public class ExchangeController {

    /**
     * 功能3: store historical exchange
     * 执行货币兑换并存储历史记录
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> performExchange(@RequestBody Map<String, Object> request) {
        String fromCurrency = (String) request.get("from");
        String toCurrency = (String) request.get("to");
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        
        // 模拟汇率
        BigDecimal rate = getSimulatedRate(fromCurrency, toCurrency);
        if (rate == null) {
            return ResponseEntity.badRequest().build();
        }
        
        BigDecimal convertedAmount = amount.multiply(rate);
        String transactionId = "TXN-" + System.currentTimeMillis();
        
        Map<String, Object> response = new HashMap<>();
        response.put("transaction_id", transactionId);
        response.put("status", "COMPLETED");
        response.put("from_currency", fromCurrency);
        response.put("to_currency", toCurrency);
        response.put("from_amount", amount);
        response.put("to_amount", convertedAmount);
        response.put("exchange_rate", rate);
        response.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取交易历史记录
     */
    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getExchangeHistory() {
        // 模拟历史记录
        List<Map<String, Object>> history = new ArrayList<>();
        
        Map<String, Object> transaction1 = new HashMap<>();
        transaction1.put("id", "TXN-1234567890");
        transaction1.put("from", "USD");
        transaction1.put("to", "EUR");
        transaction1.put("amount", 100);
        transaction1.put("converted_amount", 85.0);
        transaction1.put("rate", 0.85);
        transaction1.put("status", "COMPLETED");
        transaction1.put("timestamp", LocalDateTime.now().minusHours(2));
        
        Map<String, Object> transaction2 = new HashMap<>();
        transaction2.put("id", "TXN-1234567891");
        transaction2.put("from", "EUR");
        transaction2.put("to", "GBP");
        transaction2.put("amount", 50);
        transaction2.put("converted_amount", 43.5);
        transaction2.put("rate", 0.87);
        transaction2.put("status", "COMPLETED");
        transaction2.put("timestamp", LocalDateTime.now().minusHours(5));
        
        history.add(transaction1);
        history.add(transaction2);
        
        return ResponseEntity.ok(history);
    }

    /**
     * 获取特定交易详情
     */
    @GetMapping("/{transactionId}")
    public ResponseEntity<Map<String, Object>> getTransactionDetails(@PathVariable String transactionId) {
        Map<String, Object> transaction = new HashMap<>();
        transaction.put("id", transactionId);
        transaction.put("from", "USD");
        transaction.put("to", "EUR");
        transaction.put("amount", 100);
        transaction.put("converted_amount", 85.0);
        transaction.put("rate", 0.85);
        transaction.put("status", "COMPLETED");
        transaction.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(transaction);
    }

    private BigDecimal getSimulatedRate(String from, String to) {
        Map<String, BigDecimal> rates = new HashMap<>();
        rates.put("USD_EUR", new BigDecimal("0.8500"));
        rates.put("USD_GBP", new BigDecimal("0.7500"));
        rates.put("USD_MXN", new BigDecimal("17.9900"));
        rates.put("EUR_USD", new BigDecimal("1.1800"));
        rates.put("GBP_USD", new BigDecimal("1.3300"));
        rates.put("MXN_USD", new BigDecimal("0.0556"));
        
        return rates.get(from + "_" + to);
    }
} 