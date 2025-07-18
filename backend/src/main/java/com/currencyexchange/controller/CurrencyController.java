package com.currencyexchange.controller;

import com.currencyexchange.entity.Currency;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/currencies")
@CrossOrigin(origins = "*")
public class CurrencyController {

    /**
     * 功能6: Currency management (simple)
     * 获取所有支持的货币列表
     */
    @GetMapping
    public ResponseEntity<List<Currency>> getAllCurrencies() {
        // 暂时返回静态数据，实际应用中会从数据库获取
        List<Currency> currencies = Arrays.asList(
            new Currency(1L, "USD", "US Dollar", "$", true, LocalDateTime.now(), LocalDateTime.now()),
            new Currency(2L, "EUR", "Euro", "€", true, LocalDateTime.now(), LocalDateTime.now()),
            new Currency(3L, "GBP", "British Pound", "£", true, LocalDateTime.now(), LocalDateTime.now()),
            new Currency(4L, "JPY", "Japanese Yen", "¥", true, LocalDateTime.now(), LocalDateTime.now()),
            new Currency(5L, "CNY", "Chinese Yuan", "¥", true, LocalDateTime.now(), LocalDateTime.now()),
            new Currency(6L, "KRW", "Korean Won", "₩", true, LocalDateTime.now(), LocalDateTime.now()),
            new Currency(7L, "MXN", "Mexican Peso", "$", true, LocalDateTime.now(), LocalDateTime.now())
        );
        
        return ResponseEntity.ok(currencies);
    }

    /**
     * 根据货币代码获取特定货币信息
     */
    @GetMapping("/{code}")
    public ResponseEntity<Currency> getCurrencyByCode(@PathVariable String code) {
        // 模拟数据查找
        Currency currency = switch (code.toUpperCase()) {
            case "USD" -> new Currency(1L, "USD", "US Dollar", "$", true, LocalDateTime.now(), LocalDateTime.now());
            case "EUR" -> new Currency(2L, "EUR", "Euro", "€", true, LocalDateTime.now(), LocalDateTime.now());
            case "GBP" -> new Currency(3L, "GBP", "British Pound", "£", true, LocalDateTime.now(), LocalDateTime.now());
            case "JPY" -> new Currency(4L, "JPY", "Japanese Yen", "¥", true, LocalDateTime.now(), LocalDateTime.now());
            case "CNY" -> new Currency(5L, "CNY", "Chinese Yuan", "¥", true, LocalDateTime.now(), LocalDateTime.now());
            case "KRW" -> new Currency(6L, "KRW", "Korean Won", "₩", true, LocalDateTime.now(), LocalDateTime.now());
            case "MXN" -> new Currency(7L, "MXN", "Mexican Peso", "$", true, LocalDateTime.now(), LocalDateTime.now());
            default -> null;
        };
        
        if (currency != null) {
            return ResponseEntity.ok(currency);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 添加新货币（管理员功能）
     */
    @PostMapping
    public ResponseEntity<Currency> addCurrency(@RequestBody Currency currency) {
        // 在实际应用中，这里会保存到数据库
        currency.setId(System.currentTimeMillis()); // 模拟ID生成
        currency.setCreatedAt(LocalDateTime.now());
        currency.setUpdatedAt(LocalDateTime.now());
        
        return ResponseEntity.ok(currency);
    }

    /**
     * 更新货币信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<Currency> updateCurrency(@PathVariable Long id, @RequestBody Currency currency) {
        // 在实际应用中，这里会更新数据库中的记录
        currency.setId(id);
        currency.setUpdatedAt(LocalDateTime.now());
        
        return ResponseEntity.ok(currency);
    }

    /**
     * 删除货币（软删除）
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCurrency(@PathVariable Long id) {
        // 在实际应用中，这里会执行软删除操作
        return ResponseEntity.ok().build();
    }
} 