package com.currencyexchange.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/watchlist")
@CrossOrigin(origins = "*")
public class WatchlistController {

    /**
     * 功能5: watchlist (for each user)
     * 获取用户的观察列表
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getUserWatchlist() {
        // 模拟用户观察列表数据
        List<Map<String, Object>> watchlist = new ArrayList<>();
        
        Map<String, Object> item1 = new HashMap<>();
        item1.put("id", 1);
        item1.put("from", "USD");
        item1.put("to", "EUR");
        item1.put("current_rate", 0.85);
        item1.put("added_at", LocalDateTime.now().minusDays(2));
        
        Map<String, Object> item2 = new HashMap<>();
        item2.put("id", 2);
        item2.put("from", "GBP");
        item2.put("to", "USD");
        item2.put("current_rate", 1.33);
        item2.put("added_at", LocalDateTime.now().minusDays(1));
        
        watchlist.add(item1);
        watchlist.add(item2);
        
        return ResponseEntity.ok(watchlist);
    }

    /**
     * 添加货币对到观察列表
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> addToWatchlist(@RequestBody Map<String, Object> request) {
        String fromCurrency = (String) request.get("from");
        String toCurrency = (String) request.get("to");
        
        Map<String, Object> watchlistItem = new HashMap<>();
        watchlistItem.put("id", System.currentTimeMillis());
        watchlistItem.put("from", fromCurrency);
        watchlistItem.put("to", toCurrency);
        watchlistItem.put("added_at", LocalDateTime.now());
        
        return ResponseEntity.ok(watchlistItem);
    }

    /**
     * 从观察列表中删除货币对
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromWatchlist(@PathVariable Long id) {
        // 在实际应用中，这里会从数据库删除记录
        return ResponseEntity.ok().build();
    }

    /**
     * 功能7: Rate change watch
     * 获取汇率变化通知
     */
    @GetMapping("/alerts")
    public ResponseEntity<List<Map<String, Object>>> getRateChangeAlerts() {
        List<Map<String, Object>> alerts = new ArrayList<>();
        
        Map<String, Object> alert1 = new HashMap<>();
        alert1.put("id", 1);
        alert1.put("from", "USD");
        alert1.put("to", "EUR");
        alert1.put("previous_rate", 0.8450);
        alert1.put("current_rate", 0.8500);
        alert1.put("change_percentage", 0.59);
        alert1.put("alert_time", LocalDateTime.now().minusMinutes(30));
        
        alerts.add(alert1);
        
        return ResponseEntity.ok(alerts);
    }

    /**
     * 设置汇率变化警报
     */
    @PostMapping("/alerts")
    public ResponseEntity<Map<String, Object>> setRateAlert(@RequestBody Map<String, Object> request) {
        String fromCurrency = (String) request.get("from");
        String toCurrency = (String) request.get("to");
        Double threshold = Double.valueOf(request.get("threshold").toString());
        
        Map<String, Object> alert = new HashMap<>();
        alert.put("id", System.currentTimeMillis());
        alert.put("from", fromCurrency);
        alert.put("to", toCurrency);
        alert.put("threshold", threshold);
        alert.put("created_at", LocalDateTime.now());
        alert.put("is_active", true);
        
        return ResponseEntity.ok(alert);
    }
} 