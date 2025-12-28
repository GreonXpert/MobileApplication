// src/services/api.js
// UPDATED with fingerprint enrollment API

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// API CONFIGURATION
// ============================================

// Use your backend URL here
// For local development: http://YOUR_LOCAL_IP:5000/api
// For production: https://your-domain.com/api

const API_BASE_URL = __DEV__
  ? 'http://192.168.20.3:5000/api' // ⚠️ CHANGE THIS to your local IP
  : 'https://your-production-api.com/api';

// ============================================
// AXIOS INSTANCE
// ============================================

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR (Add JWT Token)
// ============================================

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    console.error(`❌ API Error: ${error.config?.url}`, error.response?.data || error.message);

    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Navigation to login should be handled by the app
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION API
// ============================================

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      console.error('Verify token error:', error);
      throw error;
    }
  },
};

// ============================================
// EMPLOYEE API
// ============================================

export const employeeAPI = {
  getAll: async () => {
    const response = await api.get('/admin/employees');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/employees/${id}`);
    return response.data;
  },

  create: async (employeeData) => {
    const response = await api.post('/admin/employees', employeeData);
    return response.data;
  },

  update: async (id, employeeData) => {
    const response = await api.put(`/admin/employees/${id}`, employeeData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/admin/employees/${id}`);
    return response.data;
  },
};

// ============================================
// ATTENDANCE API
// ============================================

export const attendanceAPI = {
  mark: async (attendanceData) => {
    const response = await api.post('/admin/attendance/mark', attendanceData);
    return response.data;
  },

  getHistory: async (employeeId, startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/admin/attendance/history/${employeeId}?${params.toString()}`);
    return response.data;
  },

  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key]) params.append(key, filters[key]);
    });

    const response = await api.get(`/superadmin/attendance?${params.toString()}`);
    return response.data;
  },
};

// ============================================
// ✅ FINGERPRINT API (NEW)
// ============================================

export const fingerprintAPI = {
  /**
   * Enroll a new fingerprint template
   *
   * @param {Object} data - Enrollment data
   * @param {string} data.employeeId - Employee ID
   * @param {string} data.templateBase64 - Base64-encoded template
   * @param {string} data.format - Template format (ISO_19794_2, etc.)
   * @param {number} data.fingerIndex - Finger index (0-9, optional)
   * @param {string} data.fingerName - Finger name (optional)
   * @param {number} data.quality - Quality score (0-100, optional)
   * @param {Object} data.deviceInfo - Device information (optional)
   * @returns {Promise<Object>} Enrollment result
   */
  enroll: async (data) => {
    try {
      const response = await api.post('/fingerprints/enroll', {
        employeeId: data.employeeId,
        templateBase64: data.templateBase64,
        format: data.format || 'ISO_19794_2',
        fingerIndex: data.fingerIndex,
        fingerName: data.fingerName,
        quality: data.quality,
        deviceInfo: data.deviceInfo || {
          vendor: 'Mantra',
          model: 'MFS110',
          rdServiceVersion: '1.4.1',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Fingerprint enrollment error:', error);
      throw error;
    }
  },

  /**
   * Get all fingerprints for an employee
   *
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object>} Fingerprint list
   */
  getByEmployeeId: async (employeeId) => {
    try {
      const response = await api.get(`/fingerprints/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Get fingerprints error:', error);
      throw error;
    }
  },

  /**
   * Get decrypted template by fingerprint ID
   * ⚠️ Use with caution - only for admin purposes
   *
   * @param {string} fingerprintId - Fingerprint document ID
   * @returns {Promise<Object>} Template data
   */
  getTemplate: async (fingerprintId) => {
    try {
      const response = await api.get(`/fingerprints/template/${fingerprintId}`);
      return response.data;
    } catch (error) {
      console.error('Get template error:', error);
      throw error;
    }
  },

  /**
   * Delete (revoke) a fingerprint template
   *
   * @param {string} fingerprintId - Fingerprint document ID
   * @param {string} reason - Revocation reason (optional)
   * @returns {Promise<Object>} Deletion result
   */
  delete: async (fingerprintId, reason = '') => {
    try {
      const response = await api.delete(`/fingerprints/${fingerprintId}`, {
        data: { reason },
      });
      return response.data;
    } catch (error) {
      console.error('Delete fingerprint error:', error);
      throw error;
    }
  },

  /**
   * Get all fingerprints (superadmin only)
   *
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Fingerprint list with pagination
   */
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.page) params.append('page', filters.page);

      const response = await api.get(`/fingerprints/list/all?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get all fingerprints error:', error);
      throw error;
    }
  },
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default api;