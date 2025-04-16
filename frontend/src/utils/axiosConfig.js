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
  }
});

// Request interceptor to add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Authentication errors
    if (error.response && error.response.status === 401) {
      console.error('Authentication error - redirecting to login');
      localStorage.removeItem('token');
      
      // Show notification to user
      if (window) {
        window.alert('Your session has expired. Please log in again.');
        // Use window.location for navigation since we can't use useNavigate outside of components
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
    const response = await api.post('/api/login', credentials);
    return response.data;
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