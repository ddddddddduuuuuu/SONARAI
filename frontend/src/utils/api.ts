/**
 * API Client
 * 处理与后端API的交互
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器添加token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器处理错误
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理401认证错误
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API函数

// 用户相关API
export const userAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/users/login', { email, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await apiClient.post('/api/users/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await apiClient.get('/api/users/profile');
    return response.data;
  },
  
  updateProfile: async (userData: any) => {
    const response = await apiClient.put('/api/users/profile', userData);
    return response.data;
  },
  
  updatePreferences: async (preferences: any) => {
    const response = await apiClient.put('/api/users/preferences', preferences);
    return response.data;
  }
};

// 警报相关API
export const alertAPI = {
  getAlerts: async (page: number = 1, limit: number = 10, filters: any = {}) => {
    const response = await apiClient.get('/api/alerts', {
      params: { page, limit, ...filters }
    });
    return response.data;
  },
  
  getAlertById: async (id: string) => {
    const response = await apiClient.get(`/api/alerts/${id}`);
    return response.data;
  },
  
  createAlert: async (alertData: any) => {
    const response = await apiClient.post('/api/alerts', alertData);
    return response.data;
  },
  
  updateAlert: async (id: string, alertData: any) => {
    const response = await apiClient.put(`/api/alerts/${id}`, alertData);
    return response.data;
  },
  
  deleteAlert: async (id: string) => {
    const response = await apiClient.delete(`/api/alerts/${id}`);
    return response.data;
  },
  
  submitFeedback: async (id: string, isPositive: boolean) => {
    const response = await apiClient.post(`/api/alerts/${id}/feedback`, { isPositive });
    return response.data;
  },
  
  getRecentAlerts: async (limit: number = 5) => {
    const response = await apiClient.get('/api/alerts/recent', {
      params: { limit }
    });
    return response.data;
  },
  
  getAlertStats: async () => {
    const response = await apiClient.get('/api/alerts/stats');
    return response.data;
  }
};

// 鲸鱼相关API
export const whaleAPI = {
  getWhales: async (page: number = 1, limit: number = 10, filters: any = {}) => {
    const response = await apiClient.get('/api/whales', {
      params: { page, limit, ...filters }
    });
    return response.data;
  },
  
  getWhaleById: async (id: string) => {
    const response = await apiClient.get(`/api/whales/${id}`);
    return response.data;
  },
  
  getWhaleTransactions: async (address: string, limit: number = 10) => {
    const response = await apiClient.get(`/api/whales/${address}/transactions`, {
      params: { limit }
    });
    return response.data;
  },
  
  getTopWhales: async (limit: number = 10) => {
    const response = await apiClient.get('/api/whales/top', {
      params: { limit }
    });
    return response.data;
  }
};

// 代币相关API
export const tokenAPI = {
  getTokens: async (page: number = 1, limit: number = 10, filters: any = {}) => {
    const response = await apiClient.get('/api/tokens', {
      params: { page, limit, ...filters }
    });
    return response.data;
  },
  
  getTokenById: async (id: string) => {
    const response = await apiClient.get(`/api/tokens/${id}`);
    return response.data;
  },
  
  getTokenPrice: async (symbol: string) => {
    const response = await apiClient.get(`/api/tokens/${symbol}/price`);
    return response.data;
  },
  
  getTokenHistory: async (symbol: string, timeframe: string = '1d') => {
    const response = await apiClient.get(`/api/tokens/${symbol}/history`, {
      params: { timeframe }
    });
    return response.data;
  },
  
  getHotTokens: async (limit: number = 10) => {
    const response = await apiClient.get('/api/tokens/hot', {
      params: { limit }
    });
    return response.data;
  }
};

export default {
  userAPI,
  alertAPI,
  whaleAPI,
  tokenAPI
}; 