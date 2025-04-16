import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Important for CORS with credentials
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
      url: config.url,
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
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log error response for debugging
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Authentication errors
    if (error.response && error.response.status === 401) {
      console.error('Authentication error - redirecting to login');
      localStorage.removeItem('token');
      
      // Show notification to user
      if (window) {
        window.alert('Your session has expired. Please log in again.');
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
      const response = await api.post('/api/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/api/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration Error:', error.response?.data || error.message);
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