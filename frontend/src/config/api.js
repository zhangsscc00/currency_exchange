// API配置文件 - 根据环境变量自动切换API地址

const API_URLS = {
  development: 'http://localhost:8080',
  production: 'http://47.243.102.28:8080'
}

// 根据NODE_ENV环境变量确定当前环境
const currentEnv = process.env.NODE_ENV || 'development'
const API_BASE_URL = API_URLS[currentEnv]

/**
 * 构建完整的API URL
 * @param {string} endpoint - API端点，如 '/api/users/login'
 * @returns {string} 完整的API URL
 */
export function buildApiUrl(endpoint) {
  if (!endpoint.startsWith('/')) {
    endpoint = '/' + endpoint
  }
  return API_BASE_URL + endpoint
}

// 导出配置信息
export const apiConfig = {
  baseURL: API_BASE_URL,
  environment: currentEnv
}

export default {
  buildApiUrl,
  apiConfig
} 