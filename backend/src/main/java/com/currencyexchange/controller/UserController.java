package com.currencyexchange.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    /**
     * 功能4: user mgmt (simple)
     * 用户注册
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerUser(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        String name = (String) request.get("name");
        String password = (String) request.get("password");
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", System.currentTimeMillis());
        response.put("email", email);
        response.put("name", name);
        response.put("default_currency", "USD");
        response.put("created_at", LocalDateTime.now());
        response.put("is_active", true);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody Map<String, Object> request) {
        String email = (String) request.get("email");
        String password = (String) request.get("password");
        
        // 模拟认证逻辑
        Map<String, Object> response = new HashMap<>();
        response.put("token", "jwt-token-" + System.currentTimeMillis());
        response.put("user", Map.of(
            "id", 1,
            "email", email,
            "name", "Peter Wang",
            "default_currency", "USD"
        ));
        response.put("expires_in", 3600); // 1 hour
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取用户信息
     */
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getUserProfile() {
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", 1);
        profile.put("email", "peter.wang@example.com");
        profile.put("name", "Peter Wang");
        profile.put("default_currency", "USD");
        profile.put("is_active", true);
        profile.put("created_at", LocalDateTime.now().minusMonths(3));
        profile.put("total_transactions", 15);
        profile.put("total_volume", 5000.00);
        
        return ResponseEntity.ok(profile);
    }

    /**
     * 更新用户信息
     */
    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateUserProfile(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        String defaultCurrency = (String) request.get("default_currency");
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", 1);
        response.put("email", "john.doe@example.com");
        response.put("name", name);
        response.put("default_currency", defaultCurrency);
        response.put("updated_at", LocalDateTime.now());
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取用户统计信息
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total_exchanges", 15);
        stats.put("total_volume", 5000.00);
        stats.put("favorite_currency_pair", "USD/EUR");
        stats.put("avg_transaction_size", 333.33);
        stats.put("watchlist_items", 3);
        stats.put("member_since", LocalDateTime.now().minusMonths(3));
        
        return ResponseEntity.ok(stats);
    }
} 