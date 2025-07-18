package com.currencyexchange.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "exchange_rates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "from_currency", nullable = false, length = 3)
    private String fromCurrency;
    
    @Column(name = "to_currency", nullable = false, length = 3)
    private String toCurrency;
    
    @Column(nullable = false, precision = 15, scale = 6)
    private BigDecimal rate;
    
    @Column(name = "source_provider")
    private String sourceProvider; // External API provider
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "valid_until")
    private LocalDateTime validUntil; // For reserved rates
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
} 