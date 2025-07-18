<template>
  <div class="mobile-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <h1 class="header-title">Send Money</h1>
        <div class="header-subtitle">Currency Exchange</div>
      </div>
    </header>

    <!-- 汇率兑换卡片 -->
    <div class="exchange-card">
      <!-- 卡片标题 -->
      <div class="card-title">
        <span>Send Money to {{ toCurrencyInfo.name }}</span>
      </div>

      <!-- 发送金额区域 -->
      <div class="amount-section">
        <div class="section-subtitle">You send</div>
        
        <div class="amount-input-container">
          <div class="currency-select" @click="showFromCurrencyModal = true">
            <span class="currency-symbol">{{ fromCurrencyInfo.symbol }}</span>
            <span class="currency-code">{{ fromCurrency }}</span>
            <span class="arrow">▼</span>
          </div>
          <input 
            v-model="amount" 
            type="number" 
            class="amount-input"
            placeholder="250"
          />
        </div>
      </div>

      <!-- 接收金额区域 -->
      <div class="amount-section">
        <div class="section-subtitle">They receive</div>
        
        <div class="amount-input-container">
          <div class="currency-select" @click="showToCurrencyModal = true">
            <span class="currency-symbol">{{ toCurrencyInfo.symbol }}</span>
            <span class="currency-code">{{ toCurrency }}</span>
            <span class="arrow">▼</span>
          </div>
          <div class="amount-display">
            {{ formatAmount(calculatedAmount) }}
          </div>
        </div>
      </div>

      <!-- 汇率信息 -->
      <div class="rate-info">
        <div class="rate-display">
          1 {{ fromCurrency }} = {{ getCurrentRate.toFixed(4) }} {{ toCurrency }}
        </div>
        <div class="rate-subtitle">Exchange rate • Updates every minute</div>
      </div>

      <!-- 发送速度选择 -->
      <div class="delivery-section">
        <div class="section-title">Delivery speed</div>
        
        <div class="delivery-options">
          <div class="delivery-option selected">
            <div class="option-header">
              <span class="option-icon">⚡</span>
              <div class="option-content">
                <div class="option-title">Express</div>
                <div class="option-subtitle">Our fastest transfer option</div>
                <div class="option-subtitle">Pay with debit/credit card</div>
              </div>
            </div>
            <div class="option-rate">
              1 {{ fromCurrency }} = {{ getCurrentRate.toFixed(2) }} {{ toCurrency }}
            </div>
          </div>
          
          <div class="delivery-option">
            <div class="option-header">
              <span class="option-icon">🏦</span>
              <div class="option-content">
                <div class="option-title">Economy</div>
                <div class="option-subtitle">Funds transferred Friday, April 26th</div>
                <div class="option-subtitle">Pay with bank account</div>
              </div>
            </div>
            <div class="option-rate">
              1 {{ fromCurrency }} = {{ (getCurrentRate * 1.02).toFixed(2) }} {{ toCurrency }}
            </div>
          </div>
        </div>
      </div>

      <!-- 继续按钮 -->
      <button class="btn-primary continue-btn" @click="proceedToExchange">
        Continue
      </button>
    </div>

    <!-- 底部导航 -->
    <nav class="bottom-nav">
      <router-link to="/" class="nav-item active">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Home</span>
      </router-link>
      <router-link to="/rates" class="nav-item">
        <span class="nav-icon">📊</span>
        <span class="nav-label">Rates</span>
      </router-link>
      <router-link to="/history" class="nav-item">
        <span class="nav-icon">📋</span>
        <span class="nav-label">History</span>
      </router-link>
      <router-link to="/watchlist" class="nav-item">
        <span class="nav-icon">👁️</span>
        <span class="nav-label">Watch</span>
      </router-link>
      <router-link to="/profile" class="nav-item">
        <span class="nav-icon">👤</span>
        <span class="nav-label">Profile</span>
      </router-link>
    </nav>

    <!-- 货币选择模态框 -->
    <div v-if="showFromCurrencyModal" class="modal-overlay" @click="showFromCurrencyModal = false">
      <div class="currency-modal" @click.stop>
        <div class="modal-header">
          <h3>Select Currency</h3>
          <button @click="showFromCurrencyModal = false" class="close-btn">×</button>
        </div>
        <div class="currency-list">
          <div 
            v-for="currency in currencies" 
            :key="currency.code"
            class="currency-item"
            @click="selectFromCurrency(currency.code)"
          >
            <span class="currency-symbol">{{ currency.symbol }}</span>
            <div class="currency-info">
              <div class="currency-code">{{ currency.code }}</div>
              <div class="currency-name">{{ currency.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showToCurrencyModal" class="modal-overlay" @click="showToCurrencyModal = false">
      <div class="currency-modal" @click.stop>
        <div class="modal-header">
          <h3>Select Currency</h3>
          <button @click="showToCurrencyModal = false" class="close-btn">×</button>
        </div>
        <div class="currency-list">
          <div 
            v-for="currency in currencies" 
            :key="currency.code"
            class="currency-item"
            @click="selectToCurrency(currency.code)"
          >
            <span class="currency-symbol">{{ currency.symbol }}</span>
            <div class="currency-info">
              <div class="currency-code">{{ currency.code }}</div>
              <div class="currency-name">{{ currency.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import axios from 'axios'

export default {
  name: 'Home',
  data() {
    return {
      showFromCurrencyModal: false,
      showToCurrencyModal: false,
      rateUpdateInterval: null
    }
  },
  
  computed: {
    ...mapState(['currencies', 'fromCurrency', 'toCurrency', 'calculatedAmount']),
    ...mapGetters(['getCurrentRate', 'getCurrencyByCode']),
    
    // 双向绑定amount到store
    amount: {
      get() {
        return this.$store.state.amount
      },
      set(value) {
        const numValue = parseFloat(value) || 0
        console.log('输入金额变化:', value, '→', numValue)
        this.SET_AMOUNT(numValue)
        // 使用nextTick确保状态更新后再计算
        this.$nextTick(() => {
          this.calculateExchange()
        })
      }
    },
    
    fromCurrencyInfo() {
      return this.getCurrencyByCode(this.fromCurrency) || {}
    },
    
    toCurrencyInfo() {
      return this.getCurrencyByCode(this.toCurrency) || {}
    }
  },

  watch: {
    // 监听汇率变化，自动重新计算
    '$store.state.exchangeRates': {
      handler() {
        this.calculateExchange()
      },
      deep: true
    }
  },
  
  methods: {
    ...mapActions(['fetchExchangeRates', 'calculateExchange']),
    ...mapMutations(['SET_FROM_CURRENCY', 'SET_TO_CURRENCY', 'SET_AMOUNT']),
    

    
    selectFromCurrency(code) {
      this.SET_FROM_CURRENCY(code)
      this.showFromCurrencyModal = false
      this.calculateExchange()
    },
    
    selectToCurrency(code) {
      this.SET_TO_CURRENCY(code)
      this.showToCurrencyModal = false
      this.calculateExchange()
    },
    
    formatAmount(amount) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    },
    
    proceedToExchange() {
      this.$router.push('/exchange')
    },

    // 测试后端连接
    async testBackendConnection() {
      try {
        const response = await axios.get('http://localhost:8080/api/rates/test')
        console.log('后端连接测试成功:', response.data)
        return true
      } catch (error) {
        console.error('后端连接测试失败:', error)
        return false
      }
    }
  },
  
  async mounted() {
    // 先测试后端连接
    console.log('正在测试后端连接...')
    const isConnected = await this.testBackendConnection()
    
    if (isConnected) {
      console.log('后端连接成功，开始获取汇率数据')
      // 初始加载汇率数据
      await this.fetchExchangeRates()
    } else {
      console.warn('后端连接失败，使用默认汇率数据')
    }
    
    // 确保初始计算正确
    this.calculateExchange()
    
    // 设置定时器，每分钟更新一次汇率
    this.rateUpdateInterval = setInterval(async () => {
      await this.fetchExchangeRates()
      this.calculateExchange()
    }, 60000) // 60秒 = 1分钟
  },
  
  beforeUnmount() {
    // 清理定时器
    if (this.rateUpdateInterval) {
      clearInterval(this.rateUpdateInterval)
    }
  }
}
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  padding: 20px 16px 30px;
  text-align: center;
}

.header-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.header-subtitle {
  font-size: 16px;
  opacity: 0.9;
}

.exchange-card {
  background: white;
  margin: -20px 16px 0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
  text-align: center;
}

.amount-section {
  margin-bottom: 20px;
}

.amount-section:last-of-type {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.section-subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  font-weight: 500;
}

.amount-input-container {
  display: flex;
  align-items: center;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 4px;
  transition: border-color 0.3s ease;
  min-height: 56px;
  gap: 8px;
}

.amount-input-container:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.amount-input-container:hover {
  border-color: var(--primary-light);
}

.currency-select {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: var(--background);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease;
  flex-shrink: 0;
  min-width: 100px;
}

.currency-select:hover {
  background: #e8f4fd;
}

.currency-symbol {
  font-size: 18px;
  margin-right: 6px;
}

.currency-code {
  font-weight: 600;
  margin-right: 6px;
  color: var(--text-primary);
}

.arrow {
  color: var(--text-secondary);
  font-size: 12px;
  margin-left: 4px;
}

.amount-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 16px 20px;
  font-size: 18px;
  font-weight: 600;
  text-align: right;
  min-width: 0;
  background: transparent;
}

.amount-input::placeholder {
  color: var(--text-secondary);
  font-weight: 400;
}

.amount-display {
  flex: 1;
  padding: 16px 20px;
  font-size: 18px;
  font-weight: 600;
  text-align: right;
  color: var(--text-primary);
  min-width: 0;
  background: transparent;
}

.rate-info {
  text-align: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 24px;
}

.rate-display {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.rate-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
}

.delivery-section {
  margin-bottom: 32px;
}

.delivery-options {
  margin-top: 16px;
}

.delivery-option {
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.delivery-option.selected {
  border-color: var(--primary-color);
  background: #f8fbff;
}

.delivery-option:hover {
  border-color: var(--primary-light);
}

.option-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.option-icon {
  font-size: 20px;
  margin-right: 12px;
}

.option-content {
  flex: 1;
}

.option-title {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.option-subtitle {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.option-rate {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

.continue-btn {
  margin-top: 8px;
}

/* 响应式优化 */
@media (max-width: 375px) {
  .amount-input-container {
    padding: 2px;
    min-height: 52px;
  }
  
  .currency-select {
    padding: 10px 12px;
    min-width: 90px;
  }
  
  .amount-input, .amount-display {
    padding: 14px 16px;
    font-size: 16px;
  }
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 400px;
  background: white;
  border-top: 1px solid var(--border-color);
  display: flex;
  padding: 8px 0;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  text-decoration: none;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.nav-item.active,
.nav-item:hover {
  color: var(--primary-color);
}

.nav-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.currency-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
}

.currency-list {
  max-height: 400px;
  overflow-y: auto;
}

.currency-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.currency-item:hover {
  background: var(--background);
}

.currency-info {
  margin-left: 12px;
}

.currency-code {
  font-weight: 600;
  color: var(--text-primary);
}

.currency-name {
  font-size: 14px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .bottom-nav {
    max-width: 100%;
  }
}
</style> 