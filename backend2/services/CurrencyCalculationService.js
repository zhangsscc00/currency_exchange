const ExternalRateService = require('./ExternalRateService');

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
class CurrencyCalculationService {
  constructor() {
    // 费率配置 - 实际生产中可配置化
    this.DEFAULT_FEE_RATE = 0.010; // 1%
    this.EXPRESS_FEE_RATE = 0.015; // 1.5%
    this.ECONOMY_FEE_RATE = 0.005; // 0.5%
    this.MIN_FEE = 2.99; // 最低手续费
    this.MAX_FEE = 50.00; // 最高手续费
  }

  /**
   * 核心计算方法 - 标准兑换计算
   * 
   * @param {Object} request 兑换请求参数
   * @return {Object} 详细的兑换计算结果
   */
  async calculateExchange(request) {
    try {
      // 1. 参数提取和验证
      const fromCurrency = this.validateAndGetString(request, 'from');
      const toCurrency = this.validateAndGetString(request, 'to');
      const amount = this.validateAndGetAmount(request, 'amount');
      const feeMode = request.fee_mode || 'standard';
      
      // 2. 获取实时汇率（调用上游服务）
      const exchangeRate = await ExternalRateService.getSpecificRate(fromCurrency, toCurrency);
      
      // 3. 执行详细计算
      return this.performDetailedCalculation(fromCurrency, toCurrency, amount, exchangeRate, feeMode);
      
    } catch (error) {
      console.error('Currency calculation failed:', error.message);
      return this.createErrorResponse('Calculation failed', error.message);
    }
  }

  /**
   * 批量计算 - 支持多个货币对同时计算
   */
  async calculateBatchExchange(request) {
    try {
      const amount = this.validateAndGetAmount(request, 'amount');
      const currencyPairs = request.currency_pairs || {};
      
      const results = {};
      
      for (const [fromCurrency, toCurrency] of Object.entries(currencyPairs)) {
        try {
          const exchangeRate = await ExternalRateService.getSpecificRate(fromCurrency, toCurrency);
          const calculation = this.performDetailedCalculation(fromCurrency, toCurrency, amount, exchangeRate, 'standard');
          results[`${fromCurrency}_${toCurrency}`] = calculation;
        } catch (error) {
          console.warn(`Failed to calculate ${fromCurrency}/${toCurrency}:`, error.message);
          results[`${fromCurrency}_${toCurrency}`] = this.createErrorResponse('Rate unavailable', error.message);
        }
      }
      
      return {
        batch_results: results,
        calculated_at: new Date().toISOString()
      };
      
    } catch (error) {
      return this.createErrorResponse('Batch calculation failed', error.message);
    }
  }

  /**
   * 反向计算 - 根据目标金额计算需要的源货币金额
   */
  async calculateReverseExchange(request) {
    try {
      const fromCurrency = this.validateAndGetString(request, 'from');
      const toCurrency = this.validateAndGetString(request, 'to');
      const targetAmount = this.validateAndGetAmount(request, 'target_amount');
      const feeMode = request.fee_mode || 'standard';
      
      const exchangeRate = await ExternalRateService.getSpecificRate(fromCurrency, toCurrency);
      const feeRate = this.getFeeRate(feeMode);
      
      // 反向计算：(目标金额 / 汇率) / (1 - 费率)
      const baseAmount = targetAmount / exchangeRate;
      const requiredAmount = baseAmount / (1 - feeRate);
      
      // 验证计算
      const verification = this.performDetailedCalculation(fromCurrency, toCurrency, requiredAmount, exchangeRate, feeMode);
      
      return {
        required_amount: Math.round(requiredAmount * 100) / 100,
        target_amount: targetAmount,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        exchange_rate: exchangeRate,
        verification: verification,
        calculated_at: new Date().toISOString()
      };
      
    } catch (error) {
      return this.createErrorResponse('Reverse calculation failed', error.message);
    }
  }

  /**
   * 实时汇率监控计算 - 为汇率变化提供即时计算
   */
  async calculateWithRateMonitoring(request) {
    try {
      const fromCurrency = this.validateAndGetString(request, 'from');
      const toCurrency = this.validateAndGetString(request, 'to');
      const amount = this.validateAndGetAmount(request, 'amount');
      
      // 获取当前汇率
      const currentRate = await ExternalRateService.getSpecificRate(fromCurrency, toCurrency);
      
      // 模拟汇率波动计算
      const rateVariation = 0.001; // 0.1%波动
      const higherRate = currentRate * (1 + rateVariation);
      const lowerRate = currentRate * (1 - rateVariation);
      
      return {
        current_calculation: this.performDetailedCalculation(fromCurrency, toCurrency, amount, currentRate, 'standard'),
        optimistic_calculation: this.performDetailedCalculation(fromCurrency, toCurrency, amount, higherRate, 'standard'),
        pessimistic_calculation: this.performDetailedCalculation(fromCurrency, toCurrency, amount, lowerRate, 'standard'),
        rate_spread: {
          current: currentRate,
          high: higherRate,
          low: lowerRate,
          spread_percentage: rateVariation * 100
        }
      };
      
    } catch (error) {
      return this.createErrorResponse('Rate monitoring calculation failed', error.message);
    }
  }

  /**
   * 核心计算逻辑 - 执行详细的兑换计算
   */
  performDetailedCalculation(fromCurrency, toCurrency, amount, exchangeRate, feeMode) {
    // 1. 基础计算
    const grossAmount = Math.round((amount * exchangeRate) * 1000000) / 1000000;
    
    // 2. 费用计算
    const feeRate = this.getFeeRate(feeMode);
    const feeAmount = this.calculateFee(amount, feeRate);
    
    // 3. 净兑换金额
    const netAmount = Math.round((grossAmount - (feeAmount * exchangeRate)) * 100) / 100;
    
    // 4. 总成本
    const totalCost = amount + feeAmount;
    
    // 5. 有效汇率（包含费用后的实际汇率）
    const effectiveRate = Math.round((netAmount / amount) * 1000000) / 1000000;
    
    // 6. 构建详细结果
    return {
      from_currency: fromCurrency,
      to_currency: toCurrency,
      original_amount: amount,
      exchange_rate: exchangeRate,
      gross_converted_amount: grossAmount,
      fee_mode: feeMode,
      fee_rate: feeRate,
      fee_amount: feeAmount,
      net_converted_amount: netAmount,
      total_cost: totalCost,
      effective_rate: effectiveRate,
      rate_margin: exchangeRate - effectiveRate,
      calculated_at: new Date().toISOString(),
      calculation_version: '2.0'
    };
  }

  /**
   * 费用计算
   */
  calculateFee(amount, feeRate) {
    let fee = amount * feeRate;
    
    // 应用最低和最高费用限制
    if (fee < this.MIN_FEE) {
      fee = this.MIN_FEE;
    } else if (fee > this.MAX_FEE) {
      fee = this.MAX_FEE;
    }
    
    return Math.round(fee * 100) / 100;
  }

  /**
   * 获取费率
   */
  getFeeRate(feeMode) {
    switch (feeMode.toLowerCase()) {
      case 'express':
        return this.EXPRESS_FEE_RATE;
      case 'economy':
        return this.ECONOMY_FEE_RATE;
      default:
        return this.DEFAULT_FEE_RATE;
    }
  }

  /**
   * 参数验证
   */
  validateAndGetString(request, key) {
    const value = request[key];
    if (!value || typeof value !== 'string' || value.trim() === '') {
      throw new Error(`Missing required parameter: ${key}`);
    }
    return value.toString().trim().toUpperCase();
  }

  validateAndGetAmount(request, key) {
    const value = request[key];
    if (value === null || value === undefined) {
      throw new Error(`Missing required parameter: ${key}`);
    }
    
    const amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Amount must be positive');
    }
    if (amount > 1000000) {
      throw new Error('Amount exceeds maximum limit');
    }
    return amount;
  }

  /**
   * 错误响应
   */
  createErrorResponse(error, message) {
    return {
      error: error,
      message: message,
      timestamp: new Date().toISOString(),
      success: false
    };
  }
}

module.exports = new CurrencyCalculationService(); 