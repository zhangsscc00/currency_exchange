<template>
  <div class="app-container">
    <header class="header">
      <h1 class="header-title">Exchange Rates</h1>
      <div class="header-subtitle">Top 10 live rates updated every minute</div>
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

    <bottom-nav></bottom-nav>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import BottomNav from '@/components/BottomNav.vue'

export default {
  name: 'Rates',
  components: {
    BottomNav
  },
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
      // 只显示前10个汇率
      return rates.slice(0, 10)
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

.header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light)) !important;
  color: white !important;
  padding: 20px 16px !important;
  text-align: center !important;
  display: block !important;
  width: 100% !important;
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

/* ========================================
   移动端样式 (保持原有设计)
   ======================================== */
@media (max-width: 768px) {
  .app-container {
    max-width: 400px;
    margin: 0 auto;
    position: relative;
  }

  .header {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    color: white;
    padding: 20px 16px;
    text-align: center;
    border-radius: 0;
    margin-bottom: 0;
  }

  .rates-list {
    padding: 16px;
    padding-bottom: 80px;
    display: block;
  }

  .rate-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .currency-pair {
    display: flex;
    align-items: center;
    font-weight: 600;
    margin-bottom: 4px;
    font-size: 16px;
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
}

/* ========================================
   PC端适配样式
   ======================================== */
@media (min-width: 769px) {
  .app-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .header {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
    color: white;
    padding: 40px 20px;
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
    font-size: 18px;
    opacity: 0.9;
  }

  .rates-list {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 0 30px 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .rate-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 0;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .rate-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
  }

  .rate-info {
    flex: 1;
  }

  .currency-pair {
    display: flex;
    align-items: center;
    font-weight: 600;
    margin-bottom: 12px;
    font-size: 18px;
  }

  .from-currency {
    color: var(--primary-color);
  }

  .arrow {
    margin: 0 12px;
    color: var(--text-secondary);
    font-size: 16px;
  }

  .to-currency {
    color: var(--text-primary);
  }

  .rate-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .rate-change {
    font-size: 16px;
    font-weight: 600;
    text-align: right;
  }

  .rate-change.positive {
    color: var(--success-color);
  }

  .rate-change.positive::before {
    content: "↗ ";
  }

  .rate-change.negative {
    color: var(--error-color);
  }

  .rate-change.negative::before {
    content: "↘ ";
  }

  /* PC端底部导航 */
  /* .bottom-nav is now handled by its own component's styles */
}

/* ========================================
   大屏幕适配 (1440px+)
   ======================================== */
@media (min-width: 1440px) {
  .app-container {
    max-width: 1400px;
    padding: 40px;
  }

  .rates-list {
    max-width: 1000px;
    grid-template-columns: 1fr 1fr 1fr;
  }
}
</style> 