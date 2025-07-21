<template>
  <div class="app-container">
    <!-- 未登录状态显示登录界面 -->
    <div v-if="!isLoggedIn" class="login-container">
      <header class="header">
        <h1 class="header-title">登录</h1>
      </header>

      <div class="login-content">
        <div class="login-card">
          <div class="login-tabs">
            <div 
              class="tab" 
              :class="{ active: activeTab === 'login' }"
              @click="activeTab = 'login'"
            >
              登录
            </div>
            <div 
              class="tab" 
              :class="{ active: activeTab === 'register' }"
              @click="activeTab = 'register'"
            >
              注册
            </div>
          </div>

          <!-- 登录表单 -->
          <div v-if="activeTab === 'login'" class="login-form">
            <!-- 登录方式切换 -->
            <div class="login-method-tabs">
              <div 
                class="method-tab" 
                :class="{ active: loginMethod === 'password' }"
                @click="loginMethod = 'password'"
              >
                密码登录
              </div>
              <div 
                class="method-tab" 
                :class="{ active: loginMethod === 'email' }"
                @click="loginMethod = 'email'"
              >
                验证码登录
              </div>
            </div>

            <!-- 密码登录 -->
            <div v-if="loginMethod === 'password'" class="password-login">
              <div class="form-group">
                <label>邮箱</label>
                <input 
                  v-model="passwordLoginForm.email" 
                  type="email" 
                  placeholder="请输入邮箱"
                  class="form-input"
                >
              </div>
              
              <div class="form-group">
                <label>密码</label>
                <input 
                  v-model="passwordLoginForm.password" 
                  type="password" 
                  placeholder="请输入密码"
                  class="form-input"
                >
              </div>

              <button @click="handlePasswordLogin" class="btn-primary" :disabled="passwordLoginLoading">
                {{ passwordLoginLoading ? '登录中...' : '登录' }}
              </button>
            </div>

            <!-- 邮箱验证码登录 -->
            <div v-if="loginMethod === 'email'" class="email-login">
              <div class="form-group">
                <label>邮箱</label>
                <input 
                  v-model="emailLoginForm.email" 
                  type="email" 
                  placeholder="请输入邮箱"
                  class="form-input"
                >
              </div>
              
              <div class="form-group">
                <label>验证码</label>
                <div class="email-code-group">
                  <input 
                    v-model="emailLoginForm.code" 
                    type="text" 
                    placeholder="请输入验证码"
                    class="form-input"
                    maxlength="6"
                  >
                  <button 
                    @click="sendEmailCode" 
                    class="btn-secondary"
                    :disabled="emailCodeLoading || countdown > 0"
                  >
                    {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
                  </button>
                </div>
              </div>

              <button @click="handleEmailLogin" class="btn-primary" :disabled="emailLoginLoading">
                {{ emailLoginLoading ? '登录中...' : '验证码登录' }}
              </button>
            </div>
          </div>

          <!-- 注册表单 -->
          <div v-if="activeTab === 'register'" class="register-form">
            <div class="form-group">
              <label>用户名</label>
              <input 
                v-model="registerForm.name" 
                type="text" 
                placeholder="请输入用户名"
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label>邮箱</label>
              <input 
                v-model="registerForm.email" 
                type="email" 
                placeholder="请输入邮箱"
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label>邮箱验证码</label>
              <div class="email-code-group">
                <input 
                  v-model="registerForm.email" 
                  type="email" 
                  placeholder="请输入邮箱"
                  class="form-input"
                  disabled
                >
                <button 
                  @click="sendRegisterCode" 
                  class="btn-secondary"
                  :disabled="registerCodeLoading || registerCountdown > 0"
                >
                  {{ registerCountdown > 0 ? `${registerCountdown}s` : '发送验证码' }}
                </button>
              </div>
              <input 
                v-model="registerForm.code" 
                type="text" 
                placeholder="请输入验证码"
                class="form-input"
                maxlength="6"
              >
            </div>

            <div class="form-group">
              <label>密码</label>
              <input 
                v-model="registerForm.password" 
                type="password" 
                placeholder="请输入密码"
                class="form-input"
              >
            </div>

            <div class="form-group">
              <label>确认密码</label>
              <input 
                v-model="registerForm.confirmPassword" 
                type="password" 
                placeholder="请再次输入密码"
                class="form-input"
              >
            </div>

            <button @click="handleRegister" class="btn-primary" :disabled="registerLoading">
              {{ registerLoading ? '注册中...' : '注册' }}
            </button>
          </div>

          <!-- 错误信息显示 -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <!-- 成功信息显示 -->
          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- 已登录状态显示用户信息 -->
    <div v-else>
      <header class="header">
        <h1 class="header-title">Profile</h1>
      </header>

      <div class="profile-content">
        <div class="user-info card">
          <div class="avatar">👤</div>
          <div class="user-details">
            <h3>{{ userInfo?.name || '用户' }}</h3>
            <p>{{ userInfo?.email || '邮箱' }}</p>
            <p class="login-type">登录方式: 邮箱验证码</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ exchangeHistory?.length || 0 }}</div>
            <div class="stat-label">Total Exchanges</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-number">{{ watchlist?.length || 0 }}</div>
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
          
          <div class="menu-item logout" @click="handleLogout">
            <span class="menu-icon">🚪</span>
            <span class="menu-text">Sign Out</span>
          </div>
        </div>
      </div>
    </div>

    <bottom-nav></bottom-nav>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import BottomNav from '@/components/BottomNav.vue'

export default {
  name: 'Profile',
  components: {
    BottomNav
  },
  data() {
    return {
      notificationsEnabled: true,
      activeTab: 'login',
      loginMethod: 'password', // 'password' | 'email'
      
      // 密码登录
      passwordLoginForm: {
        email: '',
        password: ''
      },
      passwordLoginLoading: false,
      
      // 邮箱验证码登录
      emailLoginForm: {
        email: '',
        code: ''
      },
      emailLoginLoading: false,
      emailCodeLoading: false,
      countdown: 0,
      
      // 注册表单
      registerForm: {
        name: '',
        email: '',
        code: '',
        password: '',
        confirmPassword: ''
      },
      registerLoading: false,
      registerCodeLoading: false,
      registerCountdown: 0,
      
      // 消息
      errorMessage: '',
      successMessage: ''
    }
  },
  
  computed: {
    ...mapState(['exchangeHistory', 'watchlist', 'userInfo', 'isLoggedIn']),
    
    totalExchanged() {
      return (this.exchangeHistory || []).reduce((total, exchange) => {
        return total + (exchange.amount || 0)
      }, 0).toFixed(2)
    }
  },
  
  methods: {
    ...mapActions({
      registerUser: 'register',
      sendEmailCodeAction: 'sendEmailCode',
      emailLoginAction: 'emailLogin',
      passwordLoginAction: 'login',
      logoutAction: 'logout'
    }),
    
    toggleNotifications() {
      this.notificationsEnabled = !this.notificationsEnabled
    },
    
    // 清除错误信息
    clearErrors() {
      this.errorMessage = ''
      this.successMessage = ''
    },
    
    // 显示错误信息
    showError(message) {
      this.errorMessage = message
      setTimeout(() => {
        this.errorMessage = ''
      }, 5000)
    },
    
    // 显示成功信息
    showSuccess(message) {
      this.successMessage = message
      setTimeout(() => {
        this.successMessage = ''
      }, 3000)
    },
    
    // 密码登录
    async handlePasswordLogin() {
      this.clearErrors()
      
      if (!this.passwordLoginForm.email || !this.passwordLoginForm.password) {
        this.showError('请填写完整信息')
        return
      }
      
      this.passwordLoginLoading = true
      try {
        await this.passwordLoginAction(this.passwordLoginForm)
        this.showSuccess('登录成功')
      } catch (error) {
        console.error('密码登录失败:', error)
        this.showError(error.message || '登录失败')
      } finally {
        this.passwordLoginLoading = false
      }
    },

    // 发送邮箱验证码
    async sendEmailCode() {
      console.log('sendEmailCode 方法被调用')
      this.clearErrors()
      
      if (!this.emailLoginForm.email) {
        this.showError('请输入邮箱')
        return
      }
      
      console.log('准备发送验证码到:', this.emailLoginForm.email)
      this.emailCodeLoading = true
      try {
        const result = await this.sendEmailCodeAction({
          email: this.emailLoginForm.email,
          type: 'login'
        })
        console.log('验证码发送成功:', result)
        this.showSuccess('验证码已发送')
        this.startCountdown()
      } catch (error) {
        console.error('发送验证码失败:', error)
        const errorMessage = error.message || '发送验证码失败'
        this.showError(errorMessage)
        
        // 根据错误类型给出相应提示
        if (errorMessage.includes('尚未注册')) {
          setTimeout(() => {
            this.activeTab = 'register'
            this.showSuccess('已自动切换到注册页面')
          }, 1500)
        } else if (errorMessage.includes('已被注册')) {
          // 如果在注册页面但邮箱已存在，切换到登录
          if (this.activeTab === 'register') {
            setTimeout(() => {
              this.activeTab = 'login'
              this.loginMethod = 'email'
              this.showSuccess('该邮箱已注册，已切换到登录页面')
            }, 1500)
          }
        }
      } finally {
        this.emailCodeLoading = false
      }
    },
    
    // 邮箱验证码登录
    async handleEmailLogin() {
      console.log('邮箱验证码登录被调用')
      this.clearErrors()
      
      if (!this.emailLoginForm.email || !this.emailLoginForm.code) {
        this.showError('请填写完整信息')
        return
      }
      
      console.log('准备邮箱验证码登录:', this.emailLoginForm)
      this.emailLoginLoading = true
      try {
        const result = await this.emailLoginAction(this.emailLoginForm)
        console.log('邮箱验证码登录成功:', result)
        this.showSuccess('登录成功')
      } catch (error) {
        console.error('邮箱验证码登录失败:', error)
        this.showError(error.message || '登录失败')
      } finally {
        this.emailLoginLoading = false
      }
    },
    
    // 发送注册验证码
    async sendRegisterCode() {
      this.clearErrors()
      
      if (!this.registerForm.email) {
        this.showError('请输入邮箱')
        return
      }
      
      this.registerCodeLoading = true
      try {
        await this.sendEmailCodeAction({
          email: this.registerForm.email,
          type: 'register'
        })
        this.showSuccess('验证码已发送')
        this.startRegisterCountdown()
      } catch (error) {
        console.error('发送注册验证码失败:', error)
        const errorMessage = error.message || '发送验证码失败'
        this.showError(errorMessage)
        
        // 如果邮箱已被注册，自动切换到登录
        if (errorMessage.includes('已被注册')) {
          setTimeout(() => {
            this.activeTab = 'login'
            this.loginMethod = 'email'
            this.emailLoginForm.email = this.registerForm.email
            this.showSuccess('该邮箱已注册，已切换到登录页面')
          }, 1500)
        }
      } finally {
        this.registerCodeLoading = false
      }
    },
    
    // 注册
    async handleRegister() {
      this.clearErrors()
      
      if (!this.registerForm.name || !this.registerForm.email || 
          !this.registerForm.code || !this.registerForm.password || 
          !this.registerForm.confirmPassword) {
        this.showError('请填写完整信息')
        return
      }
      
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        this.showError('两次输入的密码不一致')
        return
      }
      
      this.registerLoading = true
      try {
        await this.registerUser(this.registerForm)
        this.showSuccess('注册成功')
        this.activeTab = 'login'
      } catch (error) {
        this.showError(error.message || '注册失败')
      } finally {
        this.registerLoading = false
      }
    },
    
    // 开始倒计时
    startCountdown() {
      this.countdown = 60
      const timer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },
    
    // 开始注册倒计时
    startRegisterCountdown() {
      this.registerCountdown = 60
      const timer = setInterval(() => {
        this.registerCountdown--
        if (this.registerCountdown <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    },
    
    // 登出
    async handleLogout() {
      try {
        await this.logoutAction()
        this.showSuccess('已退出登录')
      } catch (error) {
        this.showError('退出登录失败')
      }
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

/* 登录界面样式 */
.login-container {
  background: var(--background);
  min-height: 100vh;
}

.login-content {
  padding: 16px;
  padding-bottom: 100px;
  max-width: 400px;
  margin: 0 auto;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  width: 100%;
  box-sizing: border-box;
}

.login-tabs {
  display: flex;
  margin-bottom: 24px;
  border-bottom: 2px solid var(--border-color);
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px;
  cursor: pointer;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab.active {
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
  margin-bottom: -2px;
}

.login-method-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.method-tab {
  flex: 1;
  text-align: center;
  padding: 10px;
  cursor: pointer;
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 14px;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.method-tab.active {
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
  margin-bottom: -1px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.form-input:disabled {
  background-color: var(--background);
  color: var(--text-secondary);
}

.email-code-group {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.email-code-group .form-input {
  flex: 1;
  min-width: 0;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  padding: 12px 16px;
  background: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 120px;
  flex-shrink: 0;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--secondary-dark);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  border: 1px solid #fcc;
}

.success-message {
  background: #efe;
  color: #363;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  border: 1px solid #cfc;
}

.login-type {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  padding: 20px 16px;
  text-align: center;
}

.header-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.profile-content {
  padding: 16px;
  padding-bottom: 100px;
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
  flex-grow: 1;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}

.menu-value,
.menu-arrow {
  color: var(--text-secondary);
  flex-shrink: 0;
  white-space: nowrap;
}

.menu-toggle {
  background-color: #ccc;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  transition: background-color 0.3s ease;
  flex-shrink: 0;
}

.menu-toggle.active {
  background-color: var(--success-color);
}

/* ========================================
   响应式设计
   ======================================== */
@media (max-width: 480px) {
  .login-content {
    padding: 12px;
    max-width: 100%;
  }
  
  .login-card {
    padding: 20px;
    margin-top: 16px;
    border-radius: 12px;
  }
  
  .email-code-group {
    flex-direction: column;
    gap: 12px;
  }
  
  .btn-secondary {
    width: 100%;
    min-width: auto;
  }
  
  .form-input {
    font-size: 16px; /* 防止iOS缩放 */
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .login-content {
    max-width: 450px;
    padding: 20px;
  }
}

/* PC 适配样式 */
@media (min-width: 768px) {
  .login-content {
    max-width: 500px;
    padding: 24px;
  }
  
  .profile-content {
    max-width: 800px;
    margin: 20px auto;
    padding-bottom: 20px;
  }
}
</style> 