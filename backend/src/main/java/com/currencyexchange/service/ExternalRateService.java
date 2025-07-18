package com.currencyexchange.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 外部汇率API服务
 * 功能1: Get Source Currency Rates - 获取实时汇率数据
 * 
 * 数据来源: UniRateAPI (https://unirateapi.com)
 * - 免费无限制使用
 * - 支持593种货币
 * - 实时更新
 * - 26年历史数据
 */
@Service
@Slf4j
public class ExternalRateService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    @Value("${currency-exchange.api.external-api.base-url:https://api.exchangerate-api.com/v4/latest}")
    private String baseUrl;
    
    @Value("${currency-exchange.api.external-api.api-key:}")
    private String apiKey;

    public ExternalRateService() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * 获取所有当前汇率 (基于USD)
     * GET /v4/latest/USD (exchangerate-api.com格式)
     */
    public Map<String, Object> getAllCurrentRates() {
        try {
            // 使用exchangerate-api.com的正确格式
            String url = baseUrl + "/USD";
            log.info("调用外部汇率API: {}", url);
            log.info("Base URL配置: {}", baseUrl);
            
            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            log.info("外部API响应: {}", response);
            return parseExchangeRateApiResponse(response, "USD");
            
        } catch (Exception e) {
            log.error("外部汇率API调用失败: {}", e.getMessage(), e);
            return getFallbackRates();
        }
    }

    /**
     * 获取特定货币对的汇率
     * @param fromCurrency 源货币
     * @param toCurrency 目标货币
     */
    public BigDecimal getSpecificRate(String fromCurrency, String toCurrency) {
        try {
            if (fromCurrency.equals(toCurrency)) {
                return BigDecimal.ONE;
            }

            String url = buildUrl("/api/rates", fromCurrency);
            
            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode ratesNode = rootNode.get("rates");
            
            if (ratesNode != null && ratesNode.has(toCurrency)) {
                return new BigDecimal(ratesNode.get(toCurrency).asText());
            }
            
            return getFallbackRate(fromCurrency, toCurrency);
            
        } catch (Exception e) {
            log.error("Error fetching specific rate {}/{}: {}", fromCurrency, toCurrency, e.getMessage());
            return getFallbackRate(fromCurrency, toCurrency);
        }
    }

    /**
     * 获取历史汇率
     * @param date 日期 (YYYY-MM-DD)
     * @param fromCurrency 源货币
     */
    public Map<String, Object> getHistoricalRates(String date, String fromCurrency) {
        try {
            String url = buildHistoricalUrl("/api/historical/rates", date, fromCurrency);
            
            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseHistoricalResponse(response, date, fromCurrency);
            
        } catch (Exception e) {
            log.error("Error fetching historical rates for {}: {}", date, e.getMessage());
            return getFallbackHistoricalRates(date, fromCurrency);
        }
    }

    /**
     * 转换货币
     * @param amount 金额
     * @param fromCurrency 源货币
     * @param toCurrency 目标货币
     */
    public Map<String, Object> convertCurrency(BigDecimal amount, String fromCurrency, String toCurrency) {
        try {
            String url = buildConvertUrl("/api/convert", amount, fromCurrency, toCurrency);
            
            String response = webClient.get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return parseConvertResponse(response);
            
        } catch (Exception e) {
            log.error("Error converting currency: {}", e.getMessage());
            return getFallbackConversion(amount, fromCurrency, toCurrency);
        }
    }

    /**
     * 构建API URL
     */
    private String buildUrl(String endpoint, String baseCurrency) {
        StringBuilder url = new StringBuilder(baseUrl + endpoint);
        url.append("?from=").append(baseCurrency);
        
        if (apiKey != null && !apiKey.isEmpty()) {
            url.append("&api_key=").append(apiKey);
        }
        
        return url.toString();
    }

    private String buildHistoricalUrl(String endpoint, String date, String baseCurrency) {
        StringBuilder url = new StringBuilder(baseUrl + endpoint);
        url.append("?date=").append(date);
        url.append("&from=").append(baseCurrency);
        
        if (apiKey != null && !apiKey.isEmpty()) {
            url.append("&api_key=").append(apiKey);
        }
        
        return url.toString();
    }

    private String buildConvertUrl(String endpoint, BigDecimal amount, String from, String to) {
        StringBuilder url = new StringBuilder(baseUrl + endpoint);
        url.append("?amount=").append(amount);
        url.append("&from=").append(from);
        url.append("&to=").append(to);
        
        if (apiKey != null && !apiKey.isEmpty()) {
            url.append("&api_key=").append(apiKey);
        }
        
        return url.toString();
    }

    /**
     * 解析汇率响应 (原UniRateAPI格式)
     */
    private Map<String, Object> parseRatesResponse(String response, String baseCurrency) throws Exception {
        JsonNode rootNode = objectMapper.readTree(response);
        
        Map<String, Object> result = new HashMap<>();
        result.put("base", baseCurrency);
        result.put("last_updated", LocalDateTime.now());
        result.put("source", "UniRateAPI");
        
        Map<String, BigDecimal> rates = new HashMap<>();
        JsonNode ratesNode = rootNode.get("rates");
        
        if (ratesNode != null) {
            ratesNode.fields().forEachRemaining(entry -> {
                rates.put(entry.getKey(), new BigDecimal(entry.getValue().asText()));
            });
        }
        
        result.put("rates", rates);
        return result;
    }

    /**
     * 解析ExchangeRate-API响应格式
     */
    private Map<String, Object> parseExchangeRateApiResponse(String response, String baseCurrency) throws Exception {
        JsonNode rootNode = objectMapper.readTree(response);
        
        Map<String, Object> result = new HashMap<>();
        result.put("base", baseCurrency);
        result.put("last_updated", LocalDateTime.now());
        result.put("source", "ExchangeRate-API");
        
        Map<String, BigDecimal> rates = new HashMap<>();
        JsonNode ratesNode = rootNode.get("rates");
        
        if (ratesNode != null) {
            ratesNode.fields().forEachRemaining(entry -> {
                rates.put(entry.getKey(), new BigDecimal(entry.getValue().asText()));
            });
        }
        
        result.put("rates", rates);
        log.info("成功解析汇率数据，包含{}种货币", rates.size());
        return result;
    }

    private Map<String, Object> parseHistoricalResponse(String response, String date, String baseCurrency) throws Exception {
        JsonNode rootNode = objectMapper.readTree(response);
        
        Map<String, Object> result = new HashMap<>();
        result.put("date", date);
        result.put("base", baseCurrency);
        result.put("source", "UniRateAPI");
        
        Map<String, BigDecimal> rates = new HashMap<>();
        JsonNode ratesNode = rootNode.get("rates");
        
        if (ratesNode != null) {
            ratesNode.fields().forEachRemaining(entry -> {
                rates.put(entry.getKey(), new BigDecimal(entry.getValue().asText()));
            });
        }
        
        result.put("rates", rates);
        return result;
    }

    private Map<String, Object> parseConvertResponse(String response) throws Exception {
        JsonNode rootNode = objectMapper.readTree(response);
        
        Map<String, Object> result = new HashMap<>();
        result.put("amount", rootNode.get("amount").asDouble());
        result.put("from", rootNode.get("from").asText());
        result.put("to", rootNode.get("to").asText());
        result.put("result", rootNode.get("result").asDouble());
        result.put("calculated_at", LocalDateTime.now());
        
        return result;
    }

    /**
     * 备用汇率数据 (当外部API不可用时)
     * 更新为2025年7月当前实际汇率
     */
    private Map<String, Object> getFallbackRates() {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("base", "USD");
        fallback.put("last_updated", LocalDateTime.now());
        fallback.put("source", "Fallback Data (Updated 2025-07)");
        
        Map<String, BigDecimal> rates = new HashMap<>();
        // 更新为当前实际汇率 (2025年7月)
        rates.put("EUR", new BigDecimal("0.9100"));   // 欧元较强
        rates.put("GBP", new BigDecimal("0.7800"));   // 英镑
        rates.put("JPY", new BigDecimal("155.0000")); // 日元较弱
        rates.put("CNY", new BigDecimal("7.2500"));   // 人民币当前汇率
        rates.put("KRW", new BigDecimal("1340.0000"));// 韩元较弱
        rates.put("MXN", new BigDecimal("18.5000"));  // 墨西哥比索
        rates.put("CAD", new BigDecimal("1.3600"));   // 加元
        rates.put("AUD", new BigDecimal("1.4900"));   // 澳元
        rates.put("CHF", new BigDecimal("0.8900"));   // 瑞士法郎
        rates.put("SGD", new BigDecimal("1.3500"));   // 新加坡元
        
        fallback.put("rates", rates);
        log.info("使用更新的备用汇率数据 (2025-07)");
        return fallback;
    }

    private BigDecimal getFallbackRate(String fromCurrency, String toCurrency) {
        // 简单的备用汇率计算
        Map<String, BigDecimal> usdRates = Map.of(
            "EUR", new BigDecimal("0.8500"),
            "GBP", new BigDecimal("0.7500"),
            "JPY", new BigDecimal("110.0000"),
            "CNY", new BigDecimal("6.4500"),
            "KRW", new BigDecimal("1180.0000"),
            "MXN", new BigDecimal("17.9900")
        );
        
        if (fromCurrency.equals("USD") && usdRates.containsKey(toCurrency)) {
            return usdRates.get(toCurrency);
        } else if (toCurrency.equals("USD") && usdRates.containsKey(fromCurrency)) {
            return BigDecimal.ONE.divide(usdRates.get(fromCurrency), 6, BigDecimal.ROUND_HALF_UP);
        }
        
        return BigDecimal.ONE; // 默认返回1:1
    }

    private Map<String, Object> getFallbackHistoricalRates(String date, String baseCurrency) {
        Map<String, Object> fallback = new HashMap<>();
        fallback.put("date", date);
        fallback.put("base", baseCurrency);
        fallback.put("source", "Fallback Historical Data");
        fallback.put("rates", getFallbackRates().get("rates"));
        
        return fallback;
    }

    private Map<String, Object> getFallbackConversion(BigDecimal amount, String fromCurrency, String toCurrency) {
        BigDecimal rate = getFallbackRate(fromCurrency, toCurrency);
        BigDecimal result = amount.multiply(rate);
        
        Map<String, Object> conversion = new HashMap<>();
        conversion.put("amount", amount);
        conversion.put("from", fromCurrency);
        conversion.put("to", toCurrency);
        conversion.put("result", result);
        conversion.put("calculated_at", LocalDateTime.now());
        
        return conversion;
    }
} 