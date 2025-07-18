const ExternalRateService = require('../services/ExternalRateService');
const CurrencyCalculationService = require('../services/CurrencyCalculationService');

/**
 * 汇率控制器
 * 对应 Java ExchangeRateController
 * 路由前缀: /rates
 */
class ExchangeRateController {
  
  /**
   * 测试端点 - 验证前后端连接
   * GET /rates/test
   */
  async testConnection(req, res) {
    try {
      const response = {
        status: 'success',
        message: '后端API连接正常',
        timestamp: new Date().toISOString(),
        endpoint: '/api/rates/test'
      };
      
      res.json(response);
    } catch (error) {
      console.error('Test connection error:', error);
      res.status(500).json({
        status: 'error',
        message: '后端API连接失败',
        error: error.message
      });
    }
  }

  /**
   * 功能1: get source currency rates
   * 获取当前汇率信息
   * GET /rates
   * 
   * 上游服务：外部汇率API
   * 数据源：ExchangeRate-API等
   * 更新频率：实时更新
   */
  async getCurrentRates(req, res) {
    try {
      // 调用外部汇率服务获取实时数据
      const response = await ExternalRateService.getAllCurrentRates();
      
      // 确保响应格式正确
      if (response.rates) {
        console.log('成功获取汇率数据:', Object.keys(response.rates).length, '种货币');
        res.json(response);
      } else {
        console.warn('外部API响应格式异常，使用备用数据');
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('获取汇率失败:', error.message);
      
      // 返回备用汇率数据
      const fallbackResponse = {
        base: 'USD',
        last_updated: new Date().toISOString(),
        source: 'Fallback Data'
      };
      
      const rates = {
        // 更新为2025年7月当前实际汇率
        'EUR': 0.9100,   // 欧元较强
        'GBP': 0.7800,   // 英镑
        'JPY': 155.0000, // 日元较弱
        'CNY': 7.2500,   // 人民币当前汇率
        'KRW': 1340.0000,// 韩元较弱
        'MXN': 18.5000   // 墨西哥比索
      };
      
      console.log('返回备用汇率数据，包含货币:', Object.keys(rates));
      fallbackResponse.rates = rates;
      
      res.json(fallbackResponse);
    }
  }

  /**
   * 获取特定货币对的汇率
   * GET /rates/:from/:to
   * 下游接口：为第二个功能（货币兑换计算）提供准确汇率
   */
  async getSpecificRate(req, res) {
    try {
      const { from, to } = req.params;
      const fromCurrency = from.toUpperCase();
      const toCurrency = to.toUpperCase();
      
      const rate = await ExternalRateService.getSpecificRate(fromCurrency, toCurrency);
      
      const response = {
        from: fromCurrency,
        to: toCurrency,
        rate: rate,
        last_updated: new Date().toISOString(),
        source: 'ExchangeRate-API'
      };
      
      res.json(response);
      
    } catch (error) {
      const errorResponse = {
        error: 'Unable to fetch exchange rate',
        from: req.params.from?.toUpperCase(),
        to: req.params.to?.toUpperCase(),
        message: error.message
      };
      
      res.status(503).json(errorResponse);
    }
  }

  /**
   * 功能2: calculate currency exchange
   * 计算货币兑换 - 标准计算接口
   * POST /rates/calculate
   * 
   * 下游服务：为客户端提供精确的兑换计算
   * 上游依赖：ExternalRateService (实时汇率)
   */
  async calculateExchange(req, res) {
    try {
      const result = await CurrencyCalculationService.calculateExchange(req.body);
      
      // 检查是否有错误
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.json(result);
      
    } catch (error) {
      const errorResponse = {
        error: 'Calculation service unavailable',
        message: error.message,
        timestamp: new Date().toISOString()
      };
      
      res.status(503).json(errorResponse);
    }
  }

  /**
   * 批量计算货币兑换
   * POST /rates/calculate/batch
   */
  async calculateBatchExchange(req, res) {
    try {
      const result = await CurrencyCalculationService.calculateBatchExchange(req.body);
      res.json(result);
    } catch (error) {
      const errorResponse = {
        error: 'Batch calculation failed',
        message: error.message
      };
      
      res.status(503).json(errorResponse);
    }
  }

  /**
   * 反向计算 - 根据目标金额计算所需源货币
   * POST /rates/calculate/reverse
   */
  async calculateReverseExchange(req, res) {
    try {
      const result = await CurrencyCalculationService.calculateReverseExchange(req.body);
      res.json(result);
    } catch (error) {
      const errorResponse = {
        error: 'Reverse calculation failed',
        message: error.message
      };
      
      res.status(503).json(errorResponse);
    }
  }

  /**
   * 汇率监控计算 - 提供波动情况下的计算
   * POST /rates/calculate/monitoring
   */
  async calculateWithRateMonitoring(req, res) {
    try {
      const result = await CurrencyCalculationService.calculateWithRateMonitoring(req.body);
      res.json(result);
    } catch (error) {
      const errorResponse = {
        error: 'Rate monitoring calculation failed',
        message: error.message
      };
      
      res.status(503).json(errorResponse);
    }
  }

  /**
   * 功能8: Reserve currency rate (for a limited time)
   * 预留汇率（限时）
   * POST /rates/reserve
   */
  async reserveRate(req, res) {
    try {
      const { from: fromCurrency, to: toCurrency, amount } = req.body;
      
      const rate = await ExternalRateService.getSpecificRate(fromCurrency, toCurrency);
      if (!rate) {
        return res.status(400).json({ error: 'Unable to get exchange rate' });
      }
      
      // 预留汇率15分钟
      const validUntil = new Date(Date.now() + 15 * 60 * 1000); // 15分钟后
      const reservationId = `RES-${Date.now()}`;
      
      const response = {
        reservation_id: reservationId,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount: parseFloat(amount),
        reserved_rate: rate,
        valid_until: validUntil.toISOString(),
        reserved_at: new Date().toISOString()
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        error: 'Rate reservation failed',
        message: error.message
      });
    }
  }

  /**
   * 获取历史汇率数据
   * GET /rates/historical
   */
  async getHistoricalRates(req, res) {
    try {
      const { date, from = 'USD' } = req.query;
      const result = await ExternalRateService.getHistoricalRates(date, from);
      res.json(result);
    } catch (error) {
      const errorResponse = {
        error: 'Unable to fetch historical rates',
        date: req.query.date,
        message: error.message
      };
      
      res.status(503).json(errorResponse);
    }
  }
}

module.exports = new ExchangeRateController(); 