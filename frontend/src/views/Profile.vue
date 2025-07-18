<template>
  <div class="mobile-container">
    <header class="header">
      <h1 class="header-title">Profile</h1>
    </header>

    <div class="profile-content">
      <div class="user-info card">
        <div class="avatar">👤</div>
        <div class="user-details">
          <h3>John Doe</h3>
          <p>john.doe@example.com</p>
          <div class="member-since">Member since March 2024</div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">{{ exchangeHistory.length }}</div>
          <div class="stat-label">Total Exchanges</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-number">{{ watchlist.length }}</div>
          <div class="stat-label">Watchlist Items</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-number">${{ totalExchanged }}</div>
          <div class="stat-label">Total Exchanged</div>
        </div>
      </div>

      <div class="menu-section">
        <h3>Settings</h3>
        
        <div class="menu-item" @click="toggleNotifications">
          <span class="menu-icon">🔔</span>
          <span class="menu-text">Notifications</span>
          <span class="menu-toggle" :class="{ active: notificationsEnabled }">
            {{ notificationsEnabled ? 'ON' : 'OFF' }}
          </span>
        </div>
        
        <div class="menu-item">
          <span class="menu-icon">🌍</span>
          <span class="menu-text">Language</span>
          <span class="menu-value">English</span>
        </div>
        
        <div class="menu-item">
          <span class="menu-icon">💰</span>
          <span class="menu-text">Default Currency</span>
          <span class="menu-value">USD</span>
        </div>
        
        <div class="menu-item">
          <span class="menu-icon">🔒</span>
          <span class="menu-text">Privacy & Security</span>
          <span class="menu-arrow">›</span>
        </div>
        
        <div class="menu-item">
          <span class="menu-icon">❓</span>
          <span class="menu-text">Help & Support</span>
          <span class="menu-arrow">›</span>
        </div>
        
        <div class="menu-item logout" @click="logout">
          <span class="menu-icon">🚪</span>
          <span class="menu-text">Sign Out</span>
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
      <router-link to="/watchlist" class="nav-item">
        <span class="nav-icon">👁️</span>
        <span class="nav-label">Watch</span>
      </router-link>
      <router-link to="/profile" class="nav-item active">
        <span class="nav-icon">👤</span>
        <span class="nav-label">Profile</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Profile',
  data() {
    return {
      notificationsEnabled: true
    }
  },
  
  computed: {
    ...mapState(['exchangeHistory', 'watchlist']),
    
    totalExchanged() {
      return this.exchangeHistory.reduce((total, exchange) => {
        return total + exchange.amount
      }, 0).toFixed(2)
    }
  },
  
  methods: {
    toggleNotifications() {
      this.notificationsEnabled = !this.notificationsEnabled
    },
    
    logout() {
      // 实际应用中这里会清除用户状态并重定向到登录页
      alert('Logout functionality would be implemented here')
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

.profile-content {
  padding: 16px;
  padding-bottom: 80px;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
}

.user-details h3 {
  margin: 0 0 4px 0;
  color: var(--text-primary);
}

.user-details p {
  margin: 0 0 8px 0;
  color: var(--text-secondary);
}

.member-since {
  font-size: 12px;
  color: var(--text-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.menu-section h3 {
  color: var(--text-primary);
  margin-bottom: 16px;
}

.menu-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu-item:hover {
  background: var(--background);
}

.menu-item.logout {
  color: var(--error-color);
}

.menu-icon {
  font-size: 20px;
  margin-right: 16px;
}

.menu-text {
  flex: 1;
  font-weight: 500;
}

.menu-value,
.menu-arrow {
  color: var(--text-secondary);
}

.menu-toggle {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
}

.menu-toggle.active {
  color: var(--success-color);
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