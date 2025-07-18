<template>
  <div class="mobile-container">
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
</style> 