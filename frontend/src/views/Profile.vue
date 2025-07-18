<template>
  <div class="app-container">
    <header class="header">
      <h1 class="header-title">Profile</h1>
    </header>

    <div class="profile-content">
      <div class="user-info card">
        <div class="avatar">👤</div>
        <div class="user-details">
          <h3>Peter Wang</h3>
          <p>peter.wang@example.com</p>
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

    <bottom-nav></bottom-nav>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import BottomNav from '@/components/BottomNav.vue'

export default {
  name: 'Profile',
  components: {
    BottomNav
  },
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

.profile-content {
  padding: 16px;
  padding-bottom: 80px; /* Space for bottom nav */
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
  flex-grow: 1; /* Allow text to take available space */
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px; /* Add a bit of space */
}

.menu-value,
.menu-arrow {
  color: var(--text-secondary);
  flex-shrink: 0; /* Prevent this from shrinking */
  white-space: nowrap; /* Prevent "English" or "USD" from wrapping */
}

.menu-toggle {
  background-color: #ccc;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  transition: background-color 0.3s ease;
  flex-shrink: 0; /* Prevent this from shrinking */
}

.menu-toggle.active {
  background-color: var(--success-color);
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  z-index: 100;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0;
  text-decoration: none;
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.nav-item.active,
.nav-item:hover {
  color: var(--primary-color);
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.nav-label {
  font-size: 10px;
}


/* ========================================
   PC 适配样式
   ======================================== */
@media (min-width: 768px) {
  .profile-content {
    max-width: 800px;
    margin: 20px auto;
    padding-bottom: 20px;
  }

  /* .bottom-nav is now handled by its own component's styles */
}
</style> 