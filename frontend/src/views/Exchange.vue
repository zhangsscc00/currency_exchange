<template>
  <div class="app-container">
    <header class="header">
      <button @click="goBack" class="back-btn">←</button>
      <h1 class="header-title">Confirm Exchange</h1>
    </header>

    <div class="exchange-summary card">
      <div class="summary-row">
        <span>You send</span>
        <span class="amount">{{ fromCurrencyInfo.symbol }}{{ formatAmount(amount) }} {{ fromCurrency }}</span>
      </div>
      <div class="summary-row">
        <span>They receive</span>
        <span class="amount">{{ toCurrencyInfo.symbol }}{{ formatAmount(calculatedAmount) }} {{ toCurrency }}</span>
      </div>
      <div class="summary-row">
        <span>Exchange rate</span>
        <span>1 {{ fromCurrency }} = {{ getCurrentRate.toFixed(4) }} {{ toCurrency }}</span>
      </div>
      <div class="summary-row">
        <span>Processing fee</span>
        <span>{{ fromCurrencyInfo.symbol }}3.99</span>
      </div>
    </div>

    <button class="btn-primary" @click="confirmExchange">
      Confirm Exchange
    </button>

    <div v-if="showSuccess" class="success-modal">
      <div class="success-content">
        <div class="success-icon">✅</div>
        <h2>Exchange Successful!</h2>
        <p>Your currency exchange has been completed.</p>
        <button @click="goToHistory" class="btn-primary">View History</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'

export default {
  name: 'Exchange',
  data() {
    return {
      showSuccess: false
    }
  },
  
  computed: {
    ...mapState(['fromCurrency', 'toCurrency', 'amount', 'calculatedAmount']),
    ...mapGetters(['getCurrentRate', 'getCurrencyByCode']),
    
    fromCurrencyInfo() {
      return this.getCurrencyByCode(this.fromCurrency) || {}
    },
    
    toCurrencyInfo() {
      return this.getCurrencyByCode(this.toCurrency) || {}
    }
  },
  
  methods: {
    ...mapActions(['performExchange']),
    
    formatAmount(amount) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    },
    
    async confirmExchange() {
      try {
        await this.performExchange()
        this.showSuccess = true
      } catch (error) {
        console.error('Exchange failed:', error)
      }
    },
    
    goBack() {
      this.$router.go(-1)
    },
    
    goToHistory() {
      this.$router.push('/history')
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
}

.header {
  background: var(--primary-color);
  color: white;
  padding: 16px;
  display: flex;
  align-items: center;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  margin-right: 16px;
  cursor: pointer;
}

.exchange-summary {
  margin: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.summary-row:last-child {
  border-bottom: none;
}

.amount {
  font-weight: 600;
  color: var(--primary-color);
}

.success-modal {
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

.success-content {
  background: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 300px;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* ========================================
   移动端样式 (保持原有设计)
   ======================================== */
@media (max-width: 768px) {
  .app-container {
    max-width: 400px;
    margin: 0 auto;
    position: relative;
  }
}

/* ========================================
   PC端适配样式
   ======================================== */
@media (min-width: 769px) {
  .app-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .header {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    color: white;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    border-radius: 16px;
    margin-bottom: 24px;
  }

  .back-btn {
    background: none;
    border: none;
    color: white;
    font-size: 28px;
    margin-right: 20px;
    cursor: pointer;
    padding: 8px;
    border-radius: 8px;
    transition: background 0.3s ease;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .header-title {
    font-size: 24px;
    font-weight: 600;
  }

  .exchange-summary {
    background: white;
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid var(--border-color);
    font-size: 16px;
  }

  .summary-row:last-child {
    border-bottom: none;
    font-weight: 600;
    font-size: 18px;
    color: var(--primary-color);
  }

  .confirm-btn {
    width: 100%;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 16px;
    padding: 20px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .confirm-btn:hover {
    background: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }

  .success-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .success-content {
    background: white;
    border-radius: 20px;
    padding: 48px;
    text-align: center;
    max-width: 400px;
    margin: 20px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  }

  .success-icon {
    font-size: 64px;
    margin-bottom: 24px;
  }

  .success-content h3 {
    font-size: 24px;
    margin-bottom: 16px;
    color: var(--text-primary);
  }

  .success-content p {
    font-size: 16px;
    color: var(--text-secondary);
    margin-bottom: 32px;
  }

  .btn-primary {
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 16px 32px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-primary:hover {
    background: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }
}

/* ========================================
   大屏幕适配 (1440px+)
   ======================================== */
@media (min-width: 1440px) {
  .app-container {
    max-width: 900px;
    padding: 40px;
  }
}
</style> 