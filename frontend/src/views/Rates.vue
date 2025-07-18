<template>
  <div class="mobile-container">
    <header class="header">
      <h1 class="header-title">Exchange Rates</h1>
      <div class="header-subtitle">Live rates updated every minute</div>
    </header>

    <div class="rates-list">
      <div v-for="rate in displayRates" :key="rate.pair" class="rate-card">
        <div class="rate-info">
          <div class="currency-pair">
            <span class="from-currency">{{ rate.from }}</span>
            <span class="arrow">→</span>
            <span class="to-currency">{{ rate.to }}</span>
          </div>
          <div class="rate-value">{{ rate.rate.toFixed(4) }}</div>
        </div>
        <div class="rate-change" :class="rate.changeClass">
          {{ rate.change > 0 ? '+' : '' }}{{ rate.change.toFixed(4) }}
        </div>
      </div>
    </div>

    <nav class="bottom-nav">
      <router-link to="/" class="nav-item">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Home</span>
      </router-link>
      <router-link to="/rates" class="nav-item active">
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
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Rates',
  computed: {
    ...mapState(['exchangeRates']),
    
    displayRates() {
      const rates = []
      Object.keys(this.exchangeRates).forEach(key => {
        const [from, to] = key.split('_')
        const rate = this.exchangeRates[key]
        const change = (Math.random() - 0.5) * 0.1 // 模拟汇率变化
        
        rates.push({
          pair: key,
          from,
          to,
          rate,
          change,
          changeClass: change > 0 ? 'positive' : 'negative'
        })
      })
      return rates
    }
  }
}
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  padding: 20px 16px;
  text-align: center;
}

.rates-list {
  padding: 16px;
  padding-bottom: 80px;
}

.rate-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.currency-pair {
  display: flex;
  align-items: center;
  font-weight: 600;
  margin-bottom: 4px;
}

.arrow {
  margin: 0 8px;
  color: var(--text-secondary);
}

.rate-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.rate-change {
  font-size: 14px;
  font-weight: 600;
}

.rate-change.positive {
  color: var(--success-color);
}

.rate-change.negative {
  color: var(--error-color);
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
</style> 