const NodeCache = require('node-cache');

/**
 * 验证码管理服务
 * 使用内存缓存存储验证码，支持过期时间
 */
class VerificationService {
  constructor() {
    // 创建缓存实例，验证码默认5分钟过期
    this.cache = new NodeCache({
      stdTTL: 300, // 5分钟 = 300秒
      checkperiod: 60, // 每60秒检查一次过期项
      useClones: false
    });

    // 发送频率限制缓存，1分钟过期
    this.rateLimitCache = new NodeCache({
      stdTTL: 60, // 1分钟 = 60秒
      checkperiod: 30
    });
  }

  /**
   * 存储验证码
   * @param {string} phone 手机号
   * @param {string} code 验证码
   * @param {string} type 验证码类型 ('register', 'login', 'reset')
   * @param {number} ttl 过期时间（秒），默认5分钟
   */
  storeVerificationCode(phone, code, type = 'register', ttl = 300) {
    const key = this.getVerificationKey(phone, type);
    
    const verificationData = {
      code: code,
      phone: phone,
      type: type,
      createdAt: new Date().toISOString(),
      attempts: 0 // 验证尝试次数
    };

    // 存储验证码，设置过期时间
    this.cache.set(key, verificationData, ttl);
    
    console.log(`📱 验证码已存储: ${phone} -> ${code} (${type})`);
    return true;
  }

  /**
   * 验证验证码
   * @param {string} phone 手机号
   * @param {string} inputCode 用户输入的验证码
   * @param {string} type 验证码类型
   * @returns {Object} 验证结果
   */
  verifyCode(phone, inputCode, type = 'register') {
    const key = this.getVerificationKey(phone, type);
    const verificationData = this.cache.get(key);

    // 检查验证码是否存在
    if (!verificationData) {
      return {
        success: false,
        error: 'VERIFICATION_CODE_EXPIRED',
        message: '验证码已过期或不存在，请重新发送'
      };
    }

    // 增加验证尝试次数
    verificationData.attempts += 1;

    // 检查尝试次数限制（最多5次）
    if (verificationData.attempts > 5) {
      this.cache.del(key); // 删除验证码
      return {
        success: false,
        error: 'TOO_MANY_ATTEMPTS',
        message: '验证失败次数过多，请重新发送验证码'
      };
    }

    // 验证码匹配检查
    if (verificationData.code !== inputCode) {
      // 更新尝试次数
      this.cache.set(key, verificationData);
      
      return {
        success: false,
        error: 'INVALID_CODE',
        message: `验证码错误，还可尝试 ${5 - verificationData.attempts} 次`,
        remainingAttempts: 5 - verificationData.attempts
      };
    }

    // 验证成功，删除验证码
    this.cache.del(key);
    
    console.log(`✅ 验证码验证成功: ${phone} (${type})`);
    
    return {
      success: true,
      message: '验证码验证成功',
      verificationData: {
        phone: verificationData.phone,
        type: verificationData.type,
        verifiedAt: new Date().toISOString()
      }
    };
  }

  /**
   * 检查发送频率限制
   * @param {string} phone 手机号
   * @param {string} type 验证码类型
   * @returns {Object} 检查结果
   */
  checkRateLimit(phone, type = 'register') {
    const rateLimitKey = this.getRateLimitKey(phone, type);
    const lastSentTime = this.rateLimitCache.get(rateLimitKey);

    if (lastSentTime) {
      const timeLeft = 60 - Math.floor((Date.now() - lastSentTime) / 1000);
      return {
        canSend: false,
        timeLeft: timeLeft,
        message: `请等待 ${timeLeft} 秒后再次发送验证码`
      };
    }

    return {
      canSend: true,
      message: '可以发送验证码'
    };
  }

  /**
   * 记录发送时间（用于频率限制）
   * @param {string} phone 手机号
   * @param {string} type 验证码类型
   */
  recordSentTime(phone, type = 'register') {
    const rateLimitKey = this.getRateLimitKey(phone, type);
    this.rateLimitCache.set(rateLimitKey, Date.now());
  }

  /**
   * 获取验证码缓存键
   * @param {string} phone 手机号
   * @param {string} type 验证码类型
   * @returns {string} 缓存键
   */
  getVerificationKey(phone, type) {
    return `verification:${type}:${phone}`;
  }

  /**
   * 获取频率限制缓存键
   * @param {string} phone 手机号
   * @param {string} type 验证码类型
   * @returns {string} 缓存键
   */
  getRateLimitKey(phone, type) {
    return `ratelimit:${type}:${phone}`;
  }

  /**
   * 清除手机号的所有验证码
   * @param {string} phone 手机号
   */
  clearAllCodes(phone) {
    const keys = this.cache.keys();
    const phoneKeys = keys.filter(key => key.includes(phone));
    
    phoneKeys.forEach(key => {
      this.cache.del(key);
    });

    console.log(`🧹 已清除手机号 ${phone} 的所有验证码`);
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      verificationCodes: this.cache.getStats(),
      rateLimits: this.rateLimitCache.getStats(),
      activeVerifications: this.cache.keys().length,
      activeRateLimits: this.rateLimitCache.keys().length
    };
  }
}

module.exports = new VerificationService(); 