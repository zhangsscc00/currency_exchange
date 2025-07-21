<template>
  <div class="app-container">
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

      <!-- 金额输入区域 - PC端使用网格布局 -->
      <div class="exchange-layout">
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
      </div>

      <!-- 汇率信息 -->
      <div class="rate-info">
        <div class="rate-display">
          1 {{ fromCurrency }} = {{ getCurrentRate.toFixed(4) }} {{ toCurrency }}
        </div>
        <div class="rate-subtitle">Exchange rate • Updates every minute</div>
      </div>

      <!-- 继续按钮 -->
      <button class="btn-primary continue-btn" @click="proceedToExchange">
        Continue
      </button>
    </div>

    <!-- 底部导航 -->
    <bottom-nav></bottom-nav>

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
import BottomNav from '@/components/BottomNav.vue'

export default {
  name: 'Home',
  components: {
    BottomNav
  },
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
        const { buildApiUrl } = await import('@/config/api')
        const response = await axios.get(buildApiUrl('/api/rates/test'))
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
/* ========================================
   基础样式 (适用于所有设备)
   ======================================== */
.app-container {
  background: var(--background);
  min-height: 100vh;
  padding-bottom: 80px;
}

.exchange-layout {
  /* 基础样式，PC端会覆盖为网格布局 */
}

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
  padding: 16px 0 24px;
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



.continue-btn {
  margin-top: 16px; /* Reduced margin */
}

/* 移除旧的底部导航样式，因为它们现在在BottomNav组件中 */

/* 模态框样式 */
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

/* ========================================
   移动端样式 (保持原有设计)
   ======================================== */
@media (max-width: 768px) {
  .app-container {
    max-width: 400px;
    margin: 0 auto;
    background: var(--background);
    min-height: 100vh;
    position: relative;
  }
  
  /* 移动端恢复垂直布局 */
  .exchange-layout {
    display: block;
  }
  
  .amount-section {
    margin-bottom: 20px;
  }
  
  .amount-section:last-of-type {
    margin-bottom: 24px;
  }
  
  .bottom-nav {
    max-width: 100%;
  }
}

/* ========================================
   PC端适配样式
   ======================================== */
@media (min-width: 769px) {
  .app-container {
    max-width: 1200px;
    margin: 0 auto;
    background: var(--background);
    min-height: 100vh;
    padding: 20px;
  }

  .header {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    color: white;
    padding: 40px 20px 50px;
    text-align: center;
    border-radius: 16px;
    margin-bottom: 30px;
  }

  .header-title {
    font-size: 36px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .header-subtitle {
    font-size: 20px;
    opacity: 0.9;
  }

  .exchange-card {
    background: white;
    margin: 0 auto;
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    max-width: 800px;
    margin-bottom: 30px;
  }

  .card-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 30px;
    text-align: center;
  }

  /* PC端布局优化 */
  .exchange-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-bottom: 30px;
  }

  .amount-section {
    margin-bottom: 0;
  }

  .section-subtitle {
    font-size: 16px;
    color: var(--text-secondary);
    margin-bottom: 16px;
    font-weight: 500;
  }

     .amount-input-container {
     min-height: 70px;
     border-radius: 16px;
     padding: 8px;
     transition: all 0.3s ease;
   }

   .amount-input-container:hover {
     border-color: var(--primary-light);
     box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1);
   }

   .amount-input-container:focus-within {
     border-color: var(--primary-color);
     box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
     transform: translateY(-1px);
   }

     .currency-select {
     padding: 16px 20px;
     border-radius: 12px;
     min-width: 120px;
     transition: all 0.3s ease;
   }

   .currency-select:hover {
     background: #e8f4fd;
     transform: translateY(-1px);
     box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
   }

  .currency-symbol {
    font-size: 20px;
    margin-right: 8px;
  }

  .currency-code {
    font-weight: 600;
    margin-right: 8px;
    color: var(--text-primary);
    font-size: 16px;
  }

  .amount-input, .amount-display {
    padding: 20px 24px;
    font-size: 20px;
    font-weight: 600;
  }

  .rate-info {
    text-align: center;
    padding: 24px 0 32px;
    margin-bottom: 30px;
  }

  .rate-display {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .rate-subtitle {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .continue-btn {
    margin-top: 20px;
    width: 100%;
    padding: 18px 32px;
    font-size: 18px;
    font-weight: 600;
    border-radius: 12px;
    background: var(--primary-color);
    color: white;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .continue-btn:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }

  /* PC端底部导航 */
  .bottom-nav {
    position: static;
    background: white;
    border: none;
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    transform: none;
    width: auto;
  }

  .nav-item {
    flex-direction: column;
    padding: 16px 20px;
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .nav-item:hover {
    background: var(--background);
    transform: translateY(-2px);
  }

  .nav-item.active {
    background: var(--primary-color);
    color: white;
  }

  .nav-icon {
    font-size: 20px;
    margin-bottom: 8px;
  }

  .nav-label {
    font-size: 14px;
    font-weight: 500;
  }

  /* 货币选择模态框适配 */
  .modal-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .currency-modal {
    max-width: 500px;
    width: 100%;
    max-height: 70vh;
    border-radius: 20px;
    padding: 30px;
  }

  .modal-header {
    margin-bottom: 25px;
  }

  .modal-header h3 {
    font-size: 24px;
    margin: 0;
  }

  .currency-list {
    max-height: 400px;
  }

  .currency-item {
    padding: 16px 20px;
    border-radius: 12px;
    margin-bottom: 8px;
  }

  .currency-symbol {
    font-size: 20px;
    margin-right: 16px;
  }

  .currency-code {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 16px;
  }

  .currency-name {
    font-size: 14px;
    color: var(--text-secondary);
  }
}

/* ========================================
   大屏幕适配 (1440px+)
   ======================================== */
@media (min-width: 1440px) {
  .app-container {
    max-width: 1400px;
    padding: 40px;
  }

  .exchange-card {
    max-width: 900px;
    padding: 50px;
  }
}
</style> 