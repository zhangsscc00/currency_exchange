<template>
  <div class="app-container">
    <header class="header">
      <h1 class="header-title">My Watchlist</h1>
      <div class="header-subtitle">Track your favorite currency pairs</div>
    </header>

    <div class="watchlist-content">
      <div class="controls-section">
        <button @click="showAddModal = true" class="add-button">
          + Add Currency Pair
        </button>
        
        <!-- 搜索框 -->
        <div v-if="watchlist.length > 0" class="search-section">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search currency pairs..."
              class="search-input"
              @input="onSearch"
            />
            <button v-if="searchQuery" @click="clearSearch" class="clear-btn">×</button>
          </div>
        </div>
      </div>

      <div v-if="displayedWatchlist.length > 0" class="watchlist-items">
        <div v-for="item in displayedWatchlist" :key="`${item.from}-${item.to}`" class="watchlist-item">
          <div class="pair-info">
            <div class="currency-pair">
              {{ item.from }} → {{ item.to }}
            </div>
            <div class="current-rate">
              1 {{ item.from }} = {{ getRate(item.from, item.to) }} {{ item.to }}
            </div>
          </div>
          <button @click="removeFromWatchlist(item)" class="remove-btn">×</button>
        </div>
        
        <!-- 加载更多按钮 -->
        <div v-if="canLoadMore" class="load-more-section">
          <button @click="loadMore" class="load-more-btn">
            Load More ({{ remainingCount }} more)
          </button>
        </div>
        
        <!-- 搜索结果统计 -->
        <div v-if="searchQuery && filteredWatchlist.length > 0" class="search-stats">
          Showing {{ displayedWatchlist.length }} of {{ filteredWatchlist.length }} results
        </div>
      </div>

      <!-- 无结果状态 -->
      <div v-else-if="searchQuery && filteredWatchlist.length === 0" class="no-results">
        <div class="empty-icon">🔍</div>
        <h3>No matching currency pairs</h3>
        <p>Try adjusting your search terms</p>
        <button @click="clearSearch" class="btn-secondary">Clear Search</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="watchlist.length === 0" class="empty-watchlist">
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

    <bottom-nav></bottom-nav>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import BottomNav from '@/components/BottomNav.vue'

export default {
  name: 'Watchlist',
  components: {
    BottomNav
  },
  data() {
    return {
      showAddModal: false,
      newPair: {
        from: 'USD',
        to: 'EUR'
      },
      searchQuery: '',
      itemsPerPage: 6, // 每页显示6个项目
      currentPage: 1
    }
  },
  
  computed: {
    ...mapState(['watchlist', 'currencies', 'exchangeRates']),
    
    // 过滤后的监控列表
    filteredWatchlist() {
      if (!this.searchQuery.trim()) {
        return this.watchlist
      }
      
      const query = this.searchQuery.toLowerCase().trim()
      return this.watchlist.filter(item => {
        const pair = `${item.from} ${item.to}`.toLowerCase()
        const reversePair = `${item.to} ${item.from}`.toLowerCase()
        return pair.includes(query) || 
               reversePair.includes(query) ||
               item.from.toLowerCase().includes(query) ||
               item.to.toLowerCase().includes(query)
      })
    },
    
    // 当前显示的项目
    displayedWatchlist() {
      const startIndex = 0
      const endIndex = this.currentPage * this.itemsPerPage
      return this.filteredWatchlist.slice(startIndex, endIndex)
    },
    
    // 是否可以加载更多
    canLoadMore() {
      return this.displayedWatchlist.length < this.filteredWatchlist.length
    },
    
    // 剩余未显示的数量
    remainingCount() {
      return this.filteredWatchlist.length - this.displayedWatchlist.length
    },
    
    canAddPair() {
      return this.newPair.from && this.newPair.to && this.newPair.from !== this.newPair.to
    }
  },
  
  methods: {
    ...mapMutations(['ADD_TO_WATCHLIST', 'REMOVE_FROM_WATCHLIST']),
    
    addToWatchlist() {
      if (this.canAddPair) {
        // 检查是否已存在相同的货币对
        const exists = this.watchlist.some(item => 
          item.from === this.newPair.from && item.to === this.newPair.to
        )
        
        if (exists) {
          alert('This currency pair is already in your watchlist!')
          return
        }
        
        this.ADD_TO_WATCHLIST({
          from: this.newPair.from,
          to: this.newPair.to,
          addedAt: new Date().toISOString()
        })
        this.showAddModal = false
        this.newPair = { from: 'USD', to: 'EUR' }
      }
    },
    
    removeFromWatchlist(item) {
      // 找到要删除项目的索引
      const index = this.watchlist.findIndex(watchItem => 
        watchItem.from === item.from && watchItem.to === item.to
      )
      if (index !== -1) {
        this.REMOVE_FROM_WATCHLIST(index)
        
        // 如果删除后当前页没有项目了，返回上一页
        if (this.displayedWatchlist.length === 0 && this.currentPage > 1) {
          this.currentPage--
        }
      }
    },
    
    // 搜索相关方法
    onSearch() {
      this.currentPage = 1 // 搜索时重置到第一页
    },
    
    clearSearch() {
      this.searchQuery = ''
      this.currentPage = 1
    },
    
    // 分页相关方法
    loadMore() {
      this.currentPage++
    },
    
    resetPagination() {
      this.currentPage = 1
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

.watchlist-content {
  padding: 16px;
  padding-bottom: 80px;
}

.controls-section {
  margin-bottom: 24px;
}

.search-section {
  margin-top: 16px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-icon {
  padding: 12px 16px;
  color: var(--text-secondary);
  font-size: 16px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 8px;
  font-size: 16px;
  background: transparent;
  color: var(--text-primary);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.load-more-section {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.load-more-btn {
  background: var(--background);
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-stats {
  text-align: center;
  margin-top: 12px;
  color: var(--text-secondary);
  font-size: 12px;
}

.no-results {
  text-align: center;
  padding: 60px 32px;
}

.no-results .empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-results h3 {
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 18px;
}

.no-results p {
  color: var(--text-secondary);
  margin-bottom: 20px;
  font-size: 14px;
}

.btn-secondary {
  background: var(--background);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
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
    margin-bottom: 8px;
  }

  .header-subtitle {
    font-size: 18px;
    opacity: 0.9;
  }

  .watchlist-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 0 30px 0;
  }

  .controls-section {
    margin-bottom: 32px;
  }

  .search-section {
    margin-top: 20px;
  }

  .search-box {
    position: relative;
    display: flex;
    align-items: center;
    background: white;
    border-radius: 12px;
    padding: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .search-icon {
    padding: 12px 16px;
    color: var(--text-secondary);
    font-size: 16px;
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 12px 8px;
    font-size: 16px;
    background: transparent;
    color: var(--text-primary);
  }

  .search-input::placeholder {
    color: var(--text-secondary);
  }

  .clear-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 18px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.3s ease;
  }

  .clear-btn:hover {
    background: var(--background);
    color: var(--text-primary);
  }

  .load-more-section {
    text-align: center;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);
  }

  .load-more-btn {
    background: var(--background);
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .load-more-btn:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }

  .search-stats {
    text-align: center;
    margin-top: 16px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .no-results {
    text-align: center;
    padding: 80px 32px;
  }

  .no-results .empty-icon {
    font-size: 64px;
    margin-bottom: 16px;
  }

  .no-results h3 {
    color: var(--text-primary);
    margin-bottom: 8px;
    font-size: 20px;
  }

  .no-results p {
    color: var(--text-secondary);
    margin-bottom: 24px;
    font-size: 16px;
  }

  .btn-secondary {
    background: var(--background);
    color: var(--text-primary);
    border: 2px solid var(--border-color);
    border-radius: 12px;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-secondary:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .add-button {
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

  .add-button:hover {
    background: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
  }

  .watchlist-items {
    display: grid;
    gap: 16px;
  }

  .watchlist-item {
    background: white;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  .watchlist-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
  }

  .pair-info {
    flex: 1;
  }

  .currency-pair {
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 18px;
    color: var(--text-primary);
  }

  .current-rate {
    color: var(--text-secondary);
    font-size: 14px;
  }

  .remove-btn {
    width: 40px;
    height: 40px;
    background: var(--error-color);
    color: white;
    border: none;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
  }

  .remove-btn:hover {
    background: #dc2626;
    transform: scale(1.1);
  }

  .empty-watchlist {
    text-align: center;
    padding: 100px 32px;
  }

  .empty-icon {
    font-size: 80px;
    margin-bottom: 24px;
  }

  .empty-watchlist h3 {
    color: var(--text-primary);
    margin-bottom: 12px;
    font-size: 24px;
  }

  .empty-watchlist p {
    color: var(--text-secondary);
    font-size: 16px;
  }

  /* 模态框PC端适配 */
  .modal-overlay {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }

  .add-modal {
    width: 500px;
    max-width: 90vw;
    margin: 5% auto;
    background: white;
    border-radius: 20px;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  }

  .modal-header {
    padding: 30px;
    border-bottom: 1px solid var(--border-color);
  }

  .modal-header h3 {
    font-size: 24px;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: var(--text-secondary);
    transition: color 0.3s ease;
  }

  .close-btn:hover {
    color: var(--text-primary);
  }

  .modal-content {
    padding: 30px;
  }

  .form-group {
    margin-bottom: 24px;
  }

  .form-group label {
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
    color: var(--text-primary);
    font-size: 16px;
  }

  .form-select {
    width: 100%;
    padding: 16px;
    border: 2px solid var(--border-color);
    border-radius: 12px;
    font-size: 16px;
    background: white;
    transition: border-color 0.3s ease;
  }

  .form-select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

  .watchlist-content {
    max-width: 900px;
  }
}
</style> 