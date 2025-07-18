const { ExchangeTransaction } = require('../models');
const ExternalRateService = require('../services/ExternalRateService');

/**
 * 兑换控制器
 * 对应 Java ExchangeController
 * 路由前缀: /exchange
 */
class ExchangeController {
  
  /**
   * 功能3: store historical exchange
   * 执行货币兑换并存储历史记录
   * POST /exchange
   */
  async performExchange(req, res) {
    try {
      const { from: fromCurrency, to: toCurrency, amount } = req.body;
      
      if (!fromCurrency || !toCurrency || !amount) {
        return res.status(400).json({
          error: 'Missing required parameters',
          message: 'from, to, and amount are required'
        });
      }
      
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        return res.status(400).json({
          error: 'Invalid amount',
          message: 'Amount must be a positive number'
        });
      }
      
      // 获取汇率
      const rate = await this.getSimulatedRate(fromCurrency, toCurrency);
      if (!rate) {
        return res.status(400).json({
          error: 'Invalid currency pair',
          message: `Cannot exchange from ${fromCurrency} to ${toCurrency}`
        });
      }
      
      const convertedAmount = Math.round((amountValue * rate) * 100) / 100;
      const transactionId = `TXN-${Date.now()}`;
      
      // 在实际应用中，这里会保存到数据库
      const transaction = {
        transaction_id: transactionId,
        status: 'COMPLETED',
        from_currency: fromCurrency.toUpperCase(),
        to_currency: toCurrency.toUpperCase(),
        from_amount: amountValue,
        to_amount: convertedAmount,
        exchange_rate: rate,
        timestamp: new Date().toISOString()
      };
      
      res.json(transaction);
    } catch (error) {
      console.error('Perform exchange error:', error);
      res.status(500).json({
        error: 'Exchange failed',
        message: error.message
      });
    }
  }

  /**
   * 获取交易历史记录
   * GET /exchange/history
   */
  async getExchangeHistory(req, res) {
    try {
      // 模拟历史记录
      const history = [
        {
          id: 'TXN-1234567890',
          from: 'USD',
          to: 'EUR',
          amount: 100,
          converted_amount: 85.0,
          rate: 0.85,
          status: 'COMPLETED',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2小时前
        },
        {
          id: 'TXN-1234567891',
          from: 'EUR',
          to: 'GBP',
          amount: 50,
          converted_amount: 43.5,
          rate: 0.87,
          status: 'COMPLETED',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5小时前
        },
        {
          id: 'TXN-1234567892',
          from: 'USD',
          to: 'CNY',
          amount: 200,
          converted_amount: 1450.0,
          rate: 7.25,
          status: 'COMPLETED',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1天前
        },
        {
          id: 'TXN-1234567893',
          from: 'GBP',
          to: 'USD',
          amount: 75,
          converted_amount: 99.75,
          rate: 1.33,
          status: 'COMPLETED',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3天前
        }
      ];
      
      res.json(history);
    } catch (error) {
      console.error('Get exchange history error:', error);
      res.status(500).json({
        error: 'Failed to get exchange history',
        message: error.message
      });
    }
  }

  /**
   * 获取特定交易详情
   * GET /exchange/:transactionId
   */
  async getTransactionDetails(req, res) {
    try {
      const { transactionId } = req.params;
      
      // 模拟交易详情
      const transaction = {
        id: transactionId,
        from: 'USD',
        to: 'EUR',
        amount: 100,
        converted_amount: 85.0,
        rate: 0.85,
        fee_amount: 2.99,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        reference_number: transactionId,
        user_id: 1
      };
      
      res.json(transaction);
    } catch (error) {
      console.error('Get transaction details error:', error);
      res.status(500).json({
        error: 'Failed to get transaction details',
        message: error.message
      });
    }
  }

  /**
   * 获取模拟汇率
   * 对应 Java 中的 getSimulatedRate 方法
   */
  async getSimulatedRate(from, to) {
    try {
      // 首先尝试获取实时汇率
      const realRate = await ExternalRateService.getSpecificRate(from.toUpperCase(), to.toUpperCase());
      if (realRate && realRate > 0) {
        return realRate;
      }
    } catch (error) {
      console.warn('Failed to get real rate, using fallback:', error.message);
    }
    
    // 备用汇率数据
    const rates = {
      'USD_EUR': 0.8500,
      'USD_GBP': 0.7500,
      'USD_MXN': 17.9900,
      'USD_CNY': 7.2500,
      'USD_KRW': 1340.0000,
      'USD_JPY': 155.0000,
      'EUR_USD': 1.1800,
      'GBP_USD': 1.3300,
      'MXN_USD': 0.0556,
      'CNY_USD': 0.1379,
      'KRW_USD': 0.000746,
      'JPY_USD': 0.00645,
      'EUR_GBP': 0.8700,
      'GBP_EUR': 1.1500,
      'EUR_CNY': 8.5000,
      'CNY_EUR': 0.1176
    };
    
    const rateKey = `${from.toUpperCase()}_${to.toUpperCase()}`;
    return rates[rateKey] || null;
  }
}

module.exports = new ExchangeController(); 