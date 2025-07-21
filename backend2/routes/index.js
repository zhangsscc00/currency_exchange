const express = require('express');
const router = express.Router();

// 导入控制器
const ExchangeRateController = require('../controllers/ExchangeRateController');
const UserController = require('../controllers/UserController');
const CurrencyController = require('../controllers/CurrencyController');
const ExchangeController = require('../controllers/ExchangeController');
const WatchlistController = require('../controllers/WatchlistController');

// 导入安全中间件
const { authenticateJWT, optionalAuthenticateJWT } = require('../middleware/security');

/**
 * 汇率相关路由 - /api/rates
 * 对应 Java ExchangeRateController (@RequestMapping("/rates"))
 * 全部公开访问，与 Java 配置一致
 */
const ratesRouter = express.Router();
ratesRouter.get('/test', ExchangeRateController.testConnection);
ratesRouter.get('/historical', ExchangeRateController.getHistoricalRates);
ratesRouter.get('/:from/:to', ExchangeRateController.getSpecificRate);
ratesRouter.get('/', ExchangeRateController.getCurrentRates);
ratesRouter.post('/calculate', ExchangeRateController.calculateExchange);
ratesRouter.post('/calculate/batch', ExchangeRateController.calculateBatchExchange);
ratesRouter.post('/calculate/reverse', ExchangeRateController.calculateReverseExchange);
ratesRouter.post('/calculate/monitoring', ExchangeRateController.calculateWithRateMonitoring);
ratesRouter.post('/reserve', ExchangeRateController.reserveRate);

/**
 * 用户相关路由 - /api/users
 * 对应 Java UserController (@RequestMapping("/users"))
 * 部分需要认证，与 Java 配置一致
 */
const usersRouter = express.Router();
usersRouter.post('/register', UserController.registerUser); // 公开
usersRouter.post('/login', UserController.loginUser); // 公开
// 邮箱验证码登录路由
usersRouter.post('/send-email-code', UserController.sendEmailCode); // 公开 - 发送邮箱验证码
usersRouter.post('/email-login', UserController.emailLogin); // 公开 - 邮箱验证码登录
// 短信验证码路由
usersRouter.post('/send-sms', UserController.sendSmsCode); // 公开 - 发送短信验证码
usersRouter.post('/register-phone', UserController.registerWithPhone); // 公开 - 手机号注册
usersRouter.post('/login-phone', UserController.loginWithPhone); // 公开 - 手机号登录
usersRouter.get('/profile', optionalAuthenticateJWT, UserController.getUserProfile); // 可选认证
usersRouter.put('/profile', optionalAuthenticateJWT, UserController.updateUserProfile); // 可选认证
usersRouter.get('/stats', optionalAuthenticateJWT, UserController.getUserStats); // 可选认证

/**
 * 货币管理路由 - /api/currencies
 * 对应 Java CurrencyController (@RequestMapping("/currencies"))
 * 全部公开访问，与 Java 配置一致
 */
const currenciesRouter = express.Router();
currenciesRouter.get('/', CurrencyController.getAllCurrencies);
currenciesRouter.get('/:code', CurrencyController.getCurrencyByCode);
currenciesRouter.post('/', CurrencyController.addCurrency); // 实际应用中可能需要管理员权限
currenciesRouter.put('/:id', CurrencyController.updateCurrency); // 实际应用中可能需要管理员权限
currenciesRouter.delete('/:id', CurrencyController.deleteCurrency); // 实际应用中可能需要管理员权限

/**
 * 兑换相关路由 - /api/exchange
 * 对应 Java ExchangeController (@RequestMapping("/exchange"))
 * 全部公开访问，与 Java 配置一致
 */
const exchangeRouter = express.Router();
exchangeRouter.post('/', ExchangeController.performExchange);
exchangeRouter.get('/history', ExchangeController.getExchangeHistory);
exchangeRouter.get('/:transactionId', ExchangeController.getTransactionDetails);

/**
 * 监控列表路由 - /api/watchlist
 * 对应 Java WatchlistController (@RequestMapping("/watchlist"))
 * 全部公开访问（开发阶段），实际应用中需要用户认证
 */
const watchlistRouter = express.Router();
watchlistRouter.get('/alerts', WatchlistController.getRateChangeAlerts);
watchlistRouter.post('/alerts', WatchlistController.setRateAlert);
watchlistRouter.get('/', WatchlistController.getUserWatchlist);
watchlistRouter.post('/', WatchlistController.addToWatchlist);
watchlistRouter.delete('/:id', WatchlistController.removeFromWatchlist);

// 注册所有路由
router.use('/rates', ratesRouter);
router.use('/users', usersRouter);
router.use('/currencies', currenciesRouter);
router.use('/exchange', exchangeRouter);
router.use('/watchlist', watchlistRouter);

// 健康检查端点 (对应 Java 的 /health)
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Currency Exchange API (Node.js)',
    version: '1.0.0'
  });
});

// 根路径信息
router.get('/', (req, res) => {
  res.json({
    message: 'Currency Exchange API (Node.js)',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      rates: '/api/rates',
      users: '/api/users (支持邮箱和手机号注册/登录)',
      currencies: '/api/currencies',
      exchange: '/api/exchange',
      watchlist: '/api/watchlist'
    },
    sms_endpoints: {
      send_sms: 'POST /api/users/send-sms',
      register_phone: 'POST /api/users/register-phone',
      login_phone: 'POST /api/users/login-phone'
    }
  });
});

// 404 处理
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    available_endpoints: {
      rates: '/api/rates',
      users: '/api/users',
      currencies: '/api/currencies',
      exchange: '/api/exchange',
      watchlist: '/api/watchlist'
    }
  });
});

module.exports = router; 