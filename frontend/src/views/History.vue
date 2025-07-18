<template>
  <div class="app-container">
    <header class="header">
      <h1 class="header-title">Transaction History</h1>
    </header>

    <div class="history-list" v-if="exchangeHistory.length > 0">
      <div v-for="transaction in exchangeHistory" :key="transaction.id" class="transaction-card">
        <div class="transaction-main">
          <div class="transaction-info">
            <div class="currency-exchange">
              {{ transaction.from }} → {{ transaction.to }}
            </div>
            <div class="transaction-date">
              {{ formatDate(transaction.timestamp) }}
            </div>
          </div>
          <div class="transaction-amounts">
            <div class="sent-amount">-{{ formatAmount(transaction.amount) }} {{ transaction.from }}</div>
            <div class="received-amount">+{{ formatAmount(transaction.convertedAmount) }} {{ transaction.to }}</div>
          </div>
        </div>
        <div class="transaction-status" :class="transaction.status">
          {{ transaction.status.toUpperCase() }}
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>No transactions yet</h3>
      <p>Your exchange history will appear here</p>
      <router-link to="/" class="btn-primary">Make your first exchange</router-link>
    </div>

    <nav class="bottom-nav">
      <router-link to="/" class="nav-item">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Home</span>
      </router-link>
      <router-link to="/rates" class="nav-item">
        <span class="nav-icon">📊</span>
        <span class="nav-label">Rates</span>
      </router-link>
      <router-link to="/history" class="nav-item active">
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
  name: 'History',
  computed: {
    ...mapState(['exchangeHistory'])
  },
  
  methods: {
    formatAmount(amount) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    },
    
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
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
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  padding: 20px 16px;
  text-align: center;
}

.history-list {
  padding: 16px;
  padding-bottom: 80px;
}

.transaction-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.transaction-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.currency-exchange {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.transaction-date {
  font-size: 12px;
  color: var(--text-secondary);
}

.transaction-amounts {
  text-align: right;
}

.sent-amount {
  color: var(--error-color);
  font-weight: 600;
  margin-bottom: 2px;
}

.received-amount {
  color: var(--success-color);
  font-weight: 600;
}

.transaction-status {
  text-align: right;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.transaction-status.completed {
  background: #e8f5e8;
  color: var(--success-color);
}

.empty-state {
  text-align: center;
  padding: 80px 32px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 24px;
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
    margin: 0;
  }

  .history-list {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 0 30px 0;
  }

  .transaction-card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 16px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .transaction-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
  }

  .transaction-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .currency-exchange {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 6px;
    font-size: 18px;
  }

  .transaction-date {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .transaction-amounts {
    text-align: right;
  }

  .sent-amount,
  .received-amount {
    font-weight: 600;
    font-size: 16px;
    margin-bottom: 4px;
  }

  .transaction-status {
    text-align: right;
    font-size: 14px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 8px;
  }

  .empty-state {
    text-align: center;
    padding: 100px 32px;
    max-width: 500px;
    margin: 0 auto;
  }

  .empty-icon {
    font-size: 80px;
    margin-bottom: 24px;
  }

  .empty-state h3 {
    color: var(--text-primary);
    margin-bottom: 12px;
    font-size: 24px;
  }

  .empty-state p {
    color: var(--text-secondary);
    margin-bottom: 32px;
    font-size: 16px;
  }

  .btn-primary {
    padding: 16px 32px;
    font-size: 16px;
    border-radius: 12px;
    text-decoration: none;
    display: inline-block;
    transition: all 0.3s ease;
  }

  .btn-primary:hover {
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
}

/* ========================================
   大屏幕适配 (1440px+)
   ======================================== */
@media (min-width: 1440px) {
  .app-container {
    max-width: 1400px;
    padding: 40px;
  }

  .history-list {
    max-width: 900px;
  }
}
</style> 