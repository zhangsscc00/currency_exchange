import { createStore } from 'vuex'
import axios from 'axios'
import { buildApiUrl } from '@/config/api'

export default createStore({
  state: {
    user: null,
    userInfo: null,
    isLoggedIn: !!localStorage.getItem('token'),
    token: localStorage.getItem('token') || null,
    currencies: [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
      { code: 'KRW', name: 'Korean Won', symbol: '₩' },
      { code: 'MXN', name: 'Mexican Peso', symbol: '$' }
    ],
    exchangeRates: {},
    fromCurrency: 'USD',
    toCurrency: 'CNY',
    amount: 250,
    calculatedAmount: 0,
    watchlist: [],
    exchangeHistory: [],
    rateHistory: []
  },
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    
    SET_USER_INFO(state, userInfo) {
      state.userInfo = userInfo
      state.isLoggedIn = !!userInfo
    },
    
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }
    },
    
    LOGOUT(state) {
      state.user = null
      state.userInfo = null
      state.isLoggedIn = false
      state.token = null
      localStorage.removeItem('token')
    },
    
    SET_EXCHANGE_RATES(state, rates) {
      state.exchangeRates = rates
    },
    
    SET_FROM_CURRENCY(state, currency) {
      state.fromCurrency = currency
    },
    
    SET_TO_CURRENCY(state, currency) {
      state.toCurrency = currency
    },
    
    SET_AMOUNT(state, amount) {
      state.amount = amount
    },
    
    SET_CALCULATED_AMOUNT(state, amount) {
      state.calculatedAmount = amount
    },
    
    ADD_TO_WATCHLIST(state, currencyPair) {
      const exists = state.watchlist.find(item => 
        item.from === currencyPair.from && item.to === currencyPair.to
      )
      if (!exists) {
        state.watchlist.push(currencyPair)
      }
    },
    
    REMOVE_FROM_WATCHLIST(state, index) {
      state.watchlist.splice(index, 1)
    },
    
    ADD_EXCHANGE_HISTORY(state, exchange) {
      state.exchangeHistory.unshift(exchange)
    },
    
    ADD_RATE_HISTORY(state, rateData) {
      state.rateHistory.unshift(rateData)
    }
  },
  
  actions: {
    // 用户认证相关actions
    async login({ commit }, credentials) {
      try {
        const response = await axios.post(buildApiUrl('/api/users/login'), credentials)
        const { token, user } = response.data
        
        commit('SET_TOKEN', token)
        commit('SET_USER_INFO', user)
        
        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.message || '登录失败')
      }
    },
    
    async register(_, userData) {
      try {
        const response = await axios.post(buildApiUrl('/api/users/register'), userData)
        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.message || '注册失败')
      }
    },
    
    async sendEmailCode(_, { email, type }) {
      try {
        console.log('Store: 准备调用API发送验证码', { email, type })
        const response = await axios.post(buildApiUrl('/api/users/send-email-code'), {
          email,
          type
        })
        console.log('Store: API调用成功', response.data)
        
        // 检查是否需要注册或登录
        if (response.data.needRegister || response.data.needLogin) {
          throw new Error(response.data.message)
        }
        
        // 检查是否成功
        if (response.data.success === false) {
          throw new Error(response.data.message)
        }
        
        return response.data
      } catch (error) {
        console.error('Store: API调用失败', error)
        if (error.message) {
          throw error
        }
        throw new Error(error.response?.data?.message || '发送验证码失败')
      }
    },
    
    async emailLogin({ commit }, { email, code, name }) {
      try {
        const response = await axios.post(buildApiUrl('/api/users/email-login'), {
          email,
          code,
          name
        })
        
        const { token, user } = response.data
        commit('SET_TOKEN', token)
        commit('SET_USER_INFO', user)
        
        return response.data
      } catch (error) {
        throw new Error(error.response?.data?.message || '邮箱登录失败')
      }
    },
    
    logout({ commit }) {
      commit('LOGOUT')
    },
    
    async fetchExchangeRates({ commit }) {
      try {
        console.log('正在从后端获取汇率数据...')
        // 调用后端API获取实时汇率数据
        const response = await axios.get(buildApiUrl('/api/rates'))
        console.log('后端API响应:', response.data)
        
        if (response.data && response.data.rates) {
          // 转换后端数据格式为前端需要的格式
          const rates = {}
          const baseRates = response.data.rates
          
          // 从USD转换到其他货币
          Object.keys(baseRates).forEach(currency => {
            if (currency !== 'USD') {
              rates[`USD_${currency}`] = baseRates[currency]
            }
          })
          
          // 从其他货币转换到USD
          Object.keys(baseRates).forEach(currency => {
            if (currency !== 'USD' && baseRates[currency] !== 0) {
              rates[`${currency}_USD`] = 1 / baseRates[currency]
            }
          })
          
          // 货币间互相转换（通过USD作为中介）
          const currencies = Object.keys(baseRates).filter(c => c !== 'USD')
          currencies.forEach(from => {
            currencies.forEach(to => {
              if (from !== to && baseRates[from] !== 0) {
                rates[`${from}_${to}`] = baseRates[to] / baseRates[from]
              }
            })
          })
          
          commit('SET_EXCHANGE_RATES', rates)
          console.log('汇率数据更新成功:', rates)
          console.log('USD_MXN汇率:', rates['USD_MXN'])
          console.log('所有可用的汇率键:', Object.keys(rates))
        } else {
          // 如果API返回格式不正确，使用备用数据
          throw new Error('Invalid API response format')
        }
      } catch (error) {
        console.error('获取汇率数据失败，使用备用数据:', error)
        
        // 备用汇率数据（更新为2025年7月实际汇率）
        const fallbackRates = {
          'USD_EUR': 0.91,
          'USD_GBP': 0.78,
          'USD_JPY': 155.0,
          'USD_CNY': 7.25,
          'USD_KRW': 1340.0,
          'USD_MXN': 18.5,
          'EUR_USD': 1.099,
          'GBP_USD': 1.282,
          'JPY_USD': 0.00645,
          'CNY_USD': 0.138,
          'KRW_USD': 0.000746,
          'MXN_USD': 0.054
        }
        
        commit('SET_EXCHANGE_RATES', fallbackRates)
      }
    },
    
    calculateExchange({ state, commit }) {
      const rateKey = `${state.fromCurrency}_${state.toCurrency}`
      const rate = state.exchangeRates[rateKey] || 1
      const calculated = (state.amount * rate).toFixed(2)
      
      console.log('💱 汇率计算详情:', {
        输入金额: state.amount,
        从货币: state.fromCurrency,
        到货币: state.toCurrency,
        汇率键: rateKey,
        汇率值: rate,
        计算结果: calculated,
        可用汇率: Object.keys(state.exchangeRates),
        详细汇率: state.exchangeRates
      })
      
      commit('SET_CALCULATED_AMOUNT', parseFloat(calculated))
    },
    
    async performExchange({ state, commit }) {
      try {
        const exchange = {
          id: Date.now(),
          from: state.fromCurrency,
          to: state.toCurrency,
          amount: state.amount,
          convertedAmount: state.calculatedAmount,
          rate: state.exchangeRates[`${state.fromCurrency}_${state.toCurrency}`],
          timestamp: new Date().toISOString(),
          status: 'completed'
        }
        
        // 这里将来发送到后端
        // await axios.post('/api/exchange', exchange)
        
        commit('ADD_EXCHANGE_HISTORY', exchange)
        return exchange
      } catch (error) {
        console.error('Error performing exchange:', error)
        throw error
      }
    }
  },
  
  getters: {
    getCurrentRate: (state) => {
      const rateKey = `${state.fromCurrency}_${state.toCurrency}`
      return state.exchangeRates[rateKey] || 0
    },
    
    getCurrencyByCode: (state) => (code) => {
      return state.currencies.find(currency => currency.code === code)
    }
  }
}) 