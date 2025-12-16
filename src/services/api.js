// src/services/api.js
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
      const token = await AsyncStorage.getItem('userToken');
      
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
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      
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
  /**
   * Login user
   * @param {Object} credentials - { username, password }
   * @returns {Promise} Response with token and user data
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  /**
   * Verify token validity
   * @returns {Promise} Response with user data
   */
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

// Employee Management
export const employeeAPI = {
  /**
   * Get all employees
   * @returns {Promise} List of employees
   */
  getAll: async () => {
    const response = await api.get('/admin/employees');
    return response.data;
  },
  
  /**
   * Get single employee by ID
   * @param {string} id - Employee ID
   * @returns {Promise} Employee details
   */
  getById: async (id) => {
    const response = await api.get(`/admin/employees/${id}`);
    return response.data;
  },
  
  /**
   * Create new employee
   * @param {Object} employeeData - Employee information
   * @returns {Promise} Created employee data
   */
  create: async (employeeData) => {
    const response = await api.post('/admin/employees', employeeData);
    return response.data;
  },
  
  /**
   * Get attendance history for an employee
   * @param {string} employeeId - Employee ID
   * @param {Object} dateRange - { startDate, endDate } optional
   * @returns {Promise} Attendance records
   */
  getAttendanceHistory: async (employeeId, dateRange = {}) => {
    const params = new URLSearchParams();
    if (dateRange.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange.endDate) params.append('endDate', dateRange.endDate);
    
    const response = await api.get(`/admin/attendance/history/${employeeId}?${params}`);
    return response.data;
  },
};

// Attendance Management
export const attendanceAPI = {
  /**
   * Mark attendance for an employee
   * @param {Object} attendanceData - { employeeId, date, status, location }
   * @returns {Promise} Created attendance record
   */
  markAttendance: async (attendanceData) => {
    const response = await api.post('/admin/attendance/mark', attendanceData);
    return response.data;
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
