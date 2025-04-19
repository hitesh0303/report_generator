import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  withCredentials: true, // Enable sending cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Log the request for debugging
    console.log('Request:', {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Log successful response for debugging
    console.log('Response:', {
      status: response.status,
      data: response.data,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error('API Error Details:', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers
    });

    // Network or timeout errors
    if (!error.response) {
      const errorMessage = error.code === 'ECONNABORTED' 
        ? 'Request timed out. Please try again.'
        : 'Network error. Please check your connection and try again.';
      
      return Promise.reject({
        response: {
          status: 0,
          data: { message: errorMessage }
        }
      });
    }

    // Authentication errors
    if (error.response.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions for common API calls
export const apiService = {
  // Auth endpoints
  login: async (credentials) => {
    try {
      const response = await api.post('/api/login', credentials, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Login Error:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status
      });
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      console.log('Starting registration process...');
      const response = await api.post('/api/register', userData, {
        timeout: 20000, // 20 second timeout for registration
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Accept all responses to handle them properly
        }
      });
      
      console.log('Registration response received:', {
        status: response.status,
        data: response.data
      });
      
      if (response.status >= 400) {
        throw {
          response: {
            status: response.status,
            data: response.data
          }
        };
      }
      
      return response.data;
    } catch (error) {
      console.error('Registration Error:', {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  },
  
  // Reports endpoints
  getReports: async () => {
    const response = await api.get('/api/reports');
    return response.data;
  },
  
  getReport: async (id) => {
    const response = await api.get(`/api/reports/${id}`);
    return response.data;
  },
  
  createReport: async (reportData) => {
    const response = await api.post('/api/reports', reportData);
    return response.data;
  },
  
  updateReport: async (id, reportData) => {
    const response = await api.put(`/api/reports/${id}`, reportData);
    return response.data;
  },
  
  deleteReport: async (id) => {
    const response = await api.delete(`/api/reports/${id}`);
    return response.data;
  }
};

export default api; 