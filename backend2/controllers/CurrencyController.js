const { Currency } = require('../models');

/**
 * 货币控制器
 * 对应 Java CurrencyController
 * 路由前缀: /currencies
 */
class CurrencyController {
  
  /**
   * 功能6: Currency management (simple)
   * 获取所有支持的货币列表
   * GET /currencies
   */
  async getAllCurrencies(req, res) {
    try {
      // 暂时返回静态数据，实际应用中会从数据库获取
      const currencies = [
        { id: 1, code: 'USD', name: 'US Dollar', symbol: '$', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 2, code: 'EUR', name: 'Euro', symbol: '€', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 3, code: 'GBP', name: 'British Pound', symbol: '£', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 4, code: 'JPY', name: 'Japanese Yen', symbol: '¥', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 5, code: 'CNY', name: 'Chinese Yuan', symbol: '¥', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 6, code: 'KRW', name: 'Korean Won', symbol: '₩', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 7, code: 'MXN', name: 'Mexican Peso', symbol: '$', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 8, code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 9, code: 'AUD', name: 'Australian Dollar', symbol: 'A$', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: 10, code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      ];
      
      res.json(currencies);
    } catch (error) {
      console.error('Get all currencies error:', error);
      res.status(500).json({
        error: 'Failed to get currencies',
        message: error.message
      });
    }
  }

  /**
   * 根据货币代码获取特定货币信息
   * GET /currencies/:code
   */
  async getCurrencyByCode(req, res) {
    try {
      const { code } = req.params;
      const currencyCode = code.toUpperCase();
      
      // 模拟数据查找
      const currencyData = {
        'USD': { id: 1, code: 'USD', name: 'US Dollar', symbol: '$', is_active: true },
        'EUR': { id: 2, code: 'EUR', name: 'Euro', symbol: '€', is_active: true },
        'GBP': { id: 3, code: 'GBP', name: 'British Pound', symbol: '£', is_active: true },
        'JPY': { id: 4, code: 'JPY', name: 'Japanese Yen', symbol: '¥', is_active: true },
        'CNY': { id: 5, code: 'CNY', name: 'Chinese Yuan', symbol: '¥', is_active: true },
        'KRW': { id: 6, code: 'KRW', name: 'Korean Won', symbol: '₩', is_active: true },
        'MXN': { id: 7, code: 'MXN', name: 'Mexican Peso', symbol: '$', is_active: true },
        'CAD': { id: 8, code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', is_active: true },
        'AUD': { id: 9, code: 'AUD', name: 'Australian Dollar', symbol: 'A$', is_active: true },
        'CHF': { id: 10, code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', is_active: true }
      };
      
      const currency = currencyData[currencyCode];
      
      if (currency) {
        currency.created_at = new Date().toISOString();
        currency.updated_at = new Date().toISOString();
        res.json(currency);
      } else {
        res.status(404).json({
          error: 'Currency not found',
          message: `Currency with code ${currencyCode} not found`
        });
      }
    } catch (error) {
      console.error('Get currency by code error:', error);
      res.status(500).json({
        error: 'Failed to get currency',
        message: error.message
      });
    }
  }

  /**
   * 添加新货币（管理员功能）
   * POST /currencies
   */
  async addCurrency(req, res) {
    try {
      const { code, name, symbol, is_active = true } = req.body;
      
      if (!code || !name || !symbol) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Code, name and symbol are required'
        });
      }
      
      // 在实际应用中，这里会保存到数据库
      const currency = {
        id: Date.now(), // 模拟ID生成
        code: code.toUpperCase(),
        name,
        symbol,
        is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      res.status(201).json(currency);
    } catch (error) {
      console.error('Add currency error:', error);
      res.status(500).json({
        error: 'Failed to add currency',
        message: error.message
      });
    }
  }

  /**
   * 更新货币信息
   * PUT /currencies/:id
   */
  async updateCurrency(req, res) {
    try {
      const { id } = req.params;
      const { code, name, symbol, is_active } = req.body;
      
      // 在实际应用中，这里会更新数据库中的记录
      const currency = {
        id: parseInt(id),
        code: code?.toUpperCase(),
        name,
        symbol,
        is_active,
        updated_at: new Date().toISOString()
      };
      
      res.json(currency);
    } catch (error) {
      console.error('Update currency error:', error);
      res.status(500).json({
        error: 'Failed to update currency',
        message: error.message
      });
    }
  }

  /**
   * 删除货币（软删除）
   * DELETE /currencies/:id
   */
  async deleteCurrency(req, res) {
    try {
      const { id } = req.params;
      
      // 在实际应用中，这里会执行软删除操作
      console.log(`Currency with ID ${id} marked as inactive`);
      
      res.status(200).json({
        message: 'Currency deleted successfully',
        id: parseInt(id)
      });
    } catch (error) {
      console.error('Delete currency error:', error);
      res.status(500).json({
        error: 'Failed to delete currency',
        message: error.message
      });
    }
  }
}

module.exports = new CurrencyController(); 