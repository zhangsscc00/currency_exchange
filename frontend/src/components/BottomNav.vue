<template>
  <nav class="bottom-nav">
    <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
      <span class="nav-icon">🏠</span>
      <span class="nav-label">Home</span>
    </router-link>
    <router-link to="/rates" class="nav-item" :class="{ active: $route.path === '/rates' }">
      <span class="nav-icon">📊</span>
      <span class="nav-label">Rates</span>
    </router-link>
    <router-link to="/history" class="nav-item" :class="{ active: $route.path === '/history' }">
      <span class="nav-icon">📋</span>
      <span class="nav-label">History</span>
    </router-link>
    <router-link to="/watchlist" class="nav-item" :class="{ active: $route.path === '/watchlist' }">
      <span class="nav-icon">👁️</span>
      <span class="nav-label">Watch</span>
    </router-link>
    <router-link to="/profile" class="nav-item" :class="{ active: $route.path === '/profile' }">
      <span class="nav-icon">👤</span>
      <span class="nav-label">Profile</span>
    </router-link>
  </nav>
</template>

<script>
export default {
  name: 'BottomNav'
}
</script>

<style scoped>
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

@media (min-width: 768px) {
  .bottom-nav {
    position: static;
    max-width: 800px;
    margin: 20px auto;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
}
</style> 