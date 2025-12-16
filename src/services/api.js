// src/services/api.js - COMPLETE FIXED VERSION
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API Service Configuration
 * 
 * This file creates an axios instance configured with:
 * - Base URL pointing to backend server
 * - Automatic JWT token injection
 * - Error handling
 * 
 * ⚠️ IMPORTANT: Update BASE_URL with your backend server IP address
 */

// ============================================
// CONFIGURATION - UPDATE THIS!
// ============================================

// For local development:
// - If testing on Android Emulator: use http://10.0.2.2:5000
// - If testing on iOS Simulator: use http://localhost:5000
// - If testing on physical device: use http://<YOUR_COMPUTER_IP>:5000
//   (Find your IP: Windows: ipconfig, Mac/Linux: ifconfig)
// 
// For production:
// - Use your deployed backend URL: https://your-domain.com

const BASE_URL = 'http://192.168.1.4:5000/api';

// ============================================

/**
 * Create axios instance with default configuration
 */
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically adds JWT token to all requests
 */
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        // Add token to Authorization header
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles common errors and logging
 */
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    console.error(`❌ API Error: ${error.config?.url}`, error.response?.data || error.message);
    
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      // Clear stored token
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // You can add navigation to login screen here if needed
      // navigationRef.navigate('Login');
    }
    
    return Promise.reject(error);
  }
);

/**
 * API Methods
 */

// Authentication
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data; // ✅ Return only the data
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },
  
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data; // ✅ Return only the data
    } catch (error) {
      console.error('Verify token error:', error);
      throw error;
    }
  },
};

// Employee Management
export const employeeAPI = {
  getAll: async () => {
    const response = await api.get('/admin/employees');
    return response.data; // ✅ Return only the data
  },
  
  getById: async (id) => {
    const response = await api.get(`/admin/employees/${id}`);
    return response.data; // ✅ Return only the data
  },
  
  create: async (employeeData) => {
    const response = await api.post('/admin/employees', employeeData);
    return response.data; // ✅ Return only the data
  },
  
  update: async (id, employeeData) => {
    const response = await api.put(`/admin/employees/${id}`, employeeData);
    return response.data; // ✅ Return only the data
  },
  
  delete: async (id) => {
    const response = await api.delete(`/admin/employees/${id}`);
    return response.data; // ✅ Return only the data
  },
  
  /**
   * Get attendance history for an employee
   */
  getAttendanceHistory: async (employeeId, dateRange = {}) => {
    const params = new URLSearchParams();
    if (dateRange.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange.endDate) params.append('endDate', dateRange.endDate);
    
    const response = await api.get(`/admin/attendance/history/${employeeId}?${params}`);
    return response.data; // ✅ Return only the data
  },
};

// Attendance Management
export const attendanceAPI = {
  mark: async (attendanceData) => {
    const response = await api.post('/admin/attendance/mark', attendanceData);
    return response.data; // ✅ Return only the data
  },
  
  getHistory: async (employeeId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/attendance/history/${employeeId}?${queryString}`);
    return response.data; // ✅ Return only the data
  },
  
  getDailyAttendance: async (date) => {
    const params = date ? `?date=${date}` : '';
    const response = await api.get(`/admin/attendance/daily${params}`);
    return response.data; // ✅ Return only the data
  },
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data; // ✅ Return only the data
  },
  
  // Get daily attendance with all employee details
  getDailyAttendance: async (date) => {
    const params = date ? `?date=${date}` : '';
    const response = await api.get(`/admin/dashboard/daily-attendance${params}`);
    return response.data; // ✅ Return only the data
  },
  
  // Get employee attendance history
  getEmployeeHistory: async (employeeId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/dashboard/employee-history/${employeeId}?${queryString}`);
    return response.data; // ✅ Return only the data
  },
  
  // Get monthly report
  getMonthlyReport: async (month, year) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const response = await api.get(`/admin/dashboard/monthly-report?${params.toString()}`);
    return response.data; // ✅ Return only the data
  },
};

// Superadmin Dashboard API
export const superadminDashboardAPI = {
  // Get overview
  getOverview: async () => {
    const response = await api.get('/superadmin/dashboard/overview');
    return response.data; // ✅ Return only the data
  },
  
  // Get analytics
  getAnalytics: async (period = 'month') => {
    const response = await api.get(`/superadmin/dashboard/analytics?period=${period}`);
    return response.data; // ✅ Return only the data
  },
  
  // Get alerts
  getAlerts: async () => {
    const response = await api.get('/superadmin/dashboard/alerts');
    return response.data; // ✅ Return only the data
  },
  
  // Get all attendance (superadmin feed)
  getAllAttendance: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/superadmin/attendance?${queryString}`);
    return response.data; // ✅ Return only the data
  },
};

// Export the configured axios instance for custom requests
export default api;

/**
 * Helper function to handle API errors
 * @param {Error} error - Axios error object
 * @returns {string} User-friendly error message
 */
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.message || 'Server error occurred';
  } else if (error.request) {
    // Request made but no response received
    return 'Network error. Please check your connection and ensure the backend server is running.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};