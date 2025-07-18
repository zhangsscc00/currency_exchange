import { createStore } from 'vuex'
import axios from 'axios'

export default createStore({
  state: {
    user: null,
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
    toCurrency: 'MXN',
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
    async fetchExchangeRates({ commit }) {
      try {
        // 这里将来连接到后端API
        // const response = await axios.get('/api/rates')
        
        // 暂时使用模拟数据
        const mockRates = {
          'USD_EUR': 0.85,
          'USD_GBP': 0.75,
          'USD_JPY': 110.0,
          'USD_CNY': 6.45,
          'USD_KRW': 1180.0,
          'USD_MXN': 17.99,
          'EUR_USD': 1.18,
          'GBP_USD': 1.33,
          'JPY_USD': 0.0091,
          'CNY_USD': 0.155,
          'KRW_USD': 0.00085,
          'MXN_USD': 0.0556
        }
        
        commit('SET_EXCHANGE_RATES', mockRates)
      } catch (error) {
        console.error('Error fetching exchange rates:', error)
      }
    },
    
    calculateExchange({ state, commit }) {
      const rateKey = `${state.fromCurrency}_${state.toCurrency}`
      const rate = state.exchangeRates[rateKey] || 1
      const calculated = (state.amount * rate).toFixed(2)
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