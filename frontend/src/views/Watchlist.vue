<template>
  <div class="mobile-container">
    <header class="header">
      <h1 class="header-title">My Watchlist</h1>
      <div class="header-subtitle">Track your favorite currency pairs</div>
    </header>

    <div class="watchlist-content">
      <div class="add-pair-section">
        <button @click="showAddModal = true" class="add-button">
          + Add Currency Pair
        </button>
      </div>

      <div v-if="watchlist.length > 0" class="watchlist-items">
        <div v-for="(item, index) in watchlist" :key="index" class="watchlist-item">
          <div class="pair-info">
            <div class="currency-pair">
              {{ item.from }} → {{ item.to }}
            </div>
            <div class="current-rate">
              1 {{ item.from }} = {{ getRate(item.from, item.to) }} {{ item.to }}
            </div>
          </div>
          <button @click="removeFromWatchlist(index)" class="remove-btn">×</button>
        </div>
      </div>

      <div v-else class="empty-watchlist">
        <div class="empty-icon">👁️</div>
        <h3>No currency pairs in watchlist</h3>
        <p>Add currency pairs to track their exchange rates</p>
      </div>
    </div>

    <!-- Add Currency Pair Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <div class="add-modal" @click.stop>
        <div class="modal-header">
          <h3>Add Currency Pair</h3>
          <button @click="showAddModal = false" class="close-btn">×</button>
        </div>
        
        <div class="modal-content">
          <div class="form-group">
            <label>From Currency</label>
            <select v-model="newPair.from" class="form-select">
              <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
                {{ currency.code }} - {{ currency.name }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>To Currency</label>
            <select v-model="newPair.to" class="form-select">
              <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
                {{ currency.code }} - {{ currency.name }}
              </option>
            </select>
          </div>
          
          <button @click="addToWatchlist" class="btn-primary" :disabled="!canAddPair">
            Add to Watchlist
          </button>
        </div>
      </div>
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
      <router-link to="/history" class="nav-item">
        <span class="nav-icon">📋</span>
        <span class="nav-label">History</span>
      </router-link>
      <router-link to="/watchlist" class="nav-item active">
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
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'Watchlist',
  data() {
    return {
      showAddModal: false,
      newPair: {
        from: 'USD',
        to: 'EUR'
      }
    }
  },
  
  computed: {
    ...mapState(['watchlist', 'currencies', 'exchangeRates']),
    
    canAddPair() {
      return this.newPair.from && this.newPair.to && this.newPair.from !== this.newPair.to
    }
  },
  
  methods: {
    ...mapMutations(['ADD_TO_WATCHLIST', 'REMOVE_FROM_WATCHLIST']),
    
    addToWatchlist() {
      if (this.canAddPair) {
        this.ADD_TO_WATCHLIST({
          from: this.newPair.from,
          to: this.newPair.to,
          addedAt: new Date().toISOString()
        })
        this.showAddModal = false
        this.newPair = { from: 'USD', to: 'EUR' }
      }
    },
    
    removeFromWatchlist(index) {
      this.REMOVE_FROM_WATCHLIST(index)
    },
    
    getRate(from, to) {
      const rateKey = `${from}_${to}`
      const rate = this.exchangeRates[rateKey]
      return rate ? rate.toFixed(4) : 'N/A'
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

.watchlist-content {
  padding: 16px;
  padding-bottom: 80px;
}

.add-pair-section {
  margin-bottom: 24px;
}

.add-button {
  width: 100%;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.add-button:hover {
  background: var(--primary-light);
}

.watchlist-item {
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
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.current-rate {
  font-size: 14px;
  color: var(--text-secondary);
}

.remove-btn {
  background: var(--error-color);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-watchlist {
  text-align: center;
  padding: 80px 32px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
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

.add-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
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

.modal-content {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.form-select {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  background: white;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-color);
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