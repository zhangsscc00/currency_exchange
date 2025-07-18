const { Watchlist, User } = require('../models');
const ExternalRateService = require('../services/ExternalRateService');

/**
 * 监控列表控制器
 * 对应 Java WatchlistController
 * 路由前缀: /watchlist
 */
class WatchlistController {
  
  /**
   * 功能5: watchlist (for each user)
   * 获取用户的观察列表
   * GET /watchlist
   */
  async getUserWatchlist(req, res) {
    try {
      // 模拟用户观察列表数据
      const watchlist = [
        {
          id: 1,
          from: 'USD',
          to: 'EUR',
          current_rate: 0.85,
          added_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2天前
        },
        {
          id: 2,
          from: 'GBP',
          to: 'USD',
          current_rate: 1.33,
          added_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1天前
        },
        {
          id: 3,
          from: 'USD',
          to: 'CNY',
          current_rate: 7.25,
          added_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3天前
        },
        {
          id: 4,
          from: 'EUR',
          to: 'GBP',
          current_rate: 0.87,
          added_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5天前
        }
      ];
      
      // 更新实时汇率
      for (const item of watchlist) {
        try {
          const currentRate = await ExternalRateService.getSpecificRate(item.from, item.to);
          if (currentRate) {
            item.current_rate = currentRate;
          }
        } catch (error) {
          console.warn(`Failed to update rate for ${item.from}/${item.to}:`, error.message);
        }
      }
      
      res.json(watchlist);
    } catch (error) {
      console.error('Get user watchlist error:', error);
      res.status(500).json({
        error: 'Failed to get watchlist',
        message: error.message
      });
    }
  }

  /**
   * 添加货币对到观察列表
   * POST /watchlist
   */
  async addToWatchlist(req, res) {
    try {
      const { from: fromCurrency, to: toCurrency } = req.body;
      
      if (!fromCurrency || !toCurrency) {
        return res.status(400).json({
          error: 'Missing required parameters',
          message: 'from and to currencies are required'
        });
      }
      
      if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
        return res.status(400).json({
          error: 'Invalid currency pair',
          message: 'Source and target currencies cannot be the same'
        });
      }
      
      // 获取当前汇率
      let currentRate;
      try {
        currentRate = await ExternalRateService.getSpecificRate(fromCurrency, toCurrency);
      } catch (error) {
        console.warn('Failed to get current rate:', error.message);
        currentRate = 1.0; // 默认汇率
      }
      
      const watchlistItem = {
        id: Date.now(),
        from: fromCurrency.toUpperCase(),
        to: toCurrency.toUpperCase(),
        current_rate: currentRate,
        added_at: new Date().toISOString()
      };
      
      res.status(201).json(watchlistItem);
    } catch (error) {
      console.error('Add to watchlist error:', error);
      res.status(500).json({
        error: 'Failed to add to watchlist',
        message: error.message
      });
    }
  }

  /**
   * 从观察列表中删除货币对
   * DELETE /watchlist/:id
   */
  async removeFromWatchlist(req, res) {
    try {
      const { id } = req.params;
      
      // 在实际应用中，这里会从数据库删除记录
      console.log(`Watchlist item with ID ${id} removed`);
      
      res.status(200).json({
        message: 'Watchlist item removed successfully',
        id: parseInt(id)
      });
    } catch (error) {
      console.error('Remove from watchlist error:', error);
      res.status(500).json({
        error: 'Failed to remove from watchlist',
        message: error.message
      });
    }
  }

  /**
   * 功能7: Rate change watch
   * 获取汇率变化通知
   * GET /watchlist/alerts
   */
  async getRateChangeAlerts(req, res) {
    try {
      const alerts = [
        {
          id: 1,
          from: 'USD',
          to: 'EUR',
          previous_rate: 0.8450,
          current_rate: 0.8500,
          change_percentage: 0.59,
          alert_time: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30分钟前
        },
        {
          id: 2,
          from: 'GBP',
          to: 'USD',
          previous_rate: 1.3350,
          current_rate: 1.3300,
          change_percentage: -0.37,
          alert_time: new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45分钟前
        },
        {
          id: 3,
          from: 'USD',
          to: 'CNY',
          previous_rate: 7.2200,
          current_rate: 7.2500,
          change_percentage: 0.42,
          alert_time: new Date(Date.now() - 60 * 60 * 1000).toISOString() // 1小时前
        }
      ];
      
      res.json(alerts);
    } catch (error) {
      console.error('Get rate change alerts error:', error);
      res.status(500).json({
        error: 'Failed to get rate change alerts',
        message: error.message
      });
    }
  }

  /**
   * 设置汇率变化警报
   * POST /watchlist/alerts
   */
  async setRateAlert(req, res) {
    try {
      const { from: fromCurrency, to: toCurrency, threshold } = req.body;
      
      if (!fromCurrency || !toCurrency || threshold === undefined) {
        return res.status(400).json({
          error: 'Missing required parameters',
          message: 'from, to, and threshold are required'
        });
      }
      
      const thresholdValue = parseFloat(threshold);
      if (isNaN(thresholdValue) || thresholdValue < 0 || thresholdValue > 100) {
        return res.status(400).json({
          error: 'Invalid threshold',
          message: 'Threshold must be a number between 0 and 100'
        });
      }
      
      const alert = {
        id: Date.now(),
        from: fromCurrency.toUpperCase(),
        to: toCurrency.toUpperCase(),
        threshold: thresholdValue,
        created_at: new Date().toISOString(),
        is_active: true
      };
      
      res.status(201).json(alert);
    } catch (error) {
      console.error('Set rate alert error:', error);
      res.status(500).json({
        error: 'Failed to set rate alert',
        message: error.message
      });
    }
  }
}

module.exports = new WatchlistController(); 