// src/services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Update this to your backend URL
const API_BASE_URL = 'http://192.168.1.4:5000/api'; // Replace with your actual IP

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to all requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      Alert.alert('Session Expired', 'Please login again');
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTHENTICATION API
// ============================================

// src/services/api.js - Add logging to the login function

export const authAPI = {
  login: async (username, password) => {
    try {
      console.log('🔵 Login attempt:', { username, password: '***' });
      console.log('🔵 API Base URL:', API_BASE_URL);
      console.log('🔵 Full URL:', `${API_BASE_URL}/auth/login`);
      
      const payload = { username, password };
      console.log('🔵 Request payload:', JSON.stringify(payload));
      
      const response = await api.post('/auth/login', payload);
      
      console.log('✅ Login successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error config:', error.config);
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
// DASHBOARD API (ADMIN)
// ============================================

export const dashboardAPI = {
  /**
   * Get comprehensive dashboard statistics
   */
  getStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw error;
    }
  },

  /**
   * Get daily attendance with all employee details
   * @param {string} date - Optional date in ISO format (defaults to today)
   */
  getDailyAttendance: async (date = null) => {
    try {
      const url = date
        ? `/admin/dashboard/daily-attendance?date=${date}`
        : '/admin/dashboard/daily-attendance';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Daily attendance error:', error);
      throw error;
    }
  },

  /**
   * Get employee attendance history with statistics
   * @param {string} employeeId - Employee ID
   * @param {object} options - Optional filters
   */
  getEmployeeHistory: async (employeeId, options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.limit) params.append('limit', options.limit);

      const url = `/admin/dashboard/employee-history/${employeeId}${
        params.toString() ? `?${params.toString()}` : ''
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Employee history error:', error);
      throw error;
    }
  },

  /**
   * Get monthly attendance report
   * @param {number} month - Month (1-12)
   * @param {number} year - Year
   */
  getMonthlyReport: async (month = null, year = null) => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (year) params.append('year', year);

      const url = `/admin/dashboard/monthly-report${
        params.toString() ? `?${params.toString()}` : ''
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Monthly report error:', error);
      throw error;
    }
  },

  /**
   * Get department-wise statistics
   * @param {string} date - Optional date in ISO format (defaults to today)
   */
  getDepartmentWiseStats: async (date = null) => {
    try {
      const url = date
        ? `/admin/dashboard/department-wise?date=${date}`
        : '/admin/dashboard/department-wise';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Department-wise stats error:', error);
      throw error;
    }
  },
};

// ============================================
// EMPLOYEE API
// ============================================

export const employeeAPI = {
  /**
   * Get all employees with optional filters
   * @param {object} filters - Optional filters
   */
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.department) params.append('department', filters.department);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const url = `/admin/employees${
        params.toString() ? `?${params.toString()}` : ''
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Get employees error:', error);
      throw error;
    }
  },

  /**
   * Get single employee with statistics
   * @param {string} id - Employee MongoDB ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/admin/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get employee error:', error);
      throw error;
    }
  },

  /**
   * Create new employee
   * @param {object} employeeData - Employee data
   */
  create: async (employeeData) => {
    try {
      const response = await api.post('/admin/employees', employeeData);
      return response.data;
    } catch (error) {
      console.error('Create employee error:', error);
      throw error;
    }
  },

  /**
   * Update employee
   * @param {string} id - Employee MongoDB ID
   * @param {object} employeeData - Updated employee data
   */
  update: async (id, employeeData) => {
    try {
      const response = await api.put(`/admin/employees/${id}`, employeeData);
      return response.data;
    } catch (error) {
      console.error('Update employee error:', error);
      throw error;
    }
  },

  /**
   * Delete employee
   * @param {string} id - Employee MongoDB ID
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/employees/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete employee error:', error);
      throw error;
    }
  },
};

// ============================================
// ATTENDANCE API
// ============================================

export const attendanceAPI = {
  /**
   * Mark attendance for an employee
   * @param {object} attendanceData - Attendance data
   */
  mark: async (attendanceData) => {
    try {
      const response = await api.post('/admin/attendance/mark', attendanceData);
      return response.data;
    } catch (error) {
      console.error('Mark attendance error:', error);
      throw error;
    }
  },

  /**
   * Get attendance history for an employee
   * @param {string} employeeId - Employee ID
   * @param {string} startDate - Start date (optional)
   * @param {string} endDate - End date (optional)
   * @param {number} limit - Limit (optional)
   */
  getHistory: async (employeeId, startDate = null, endDate = null, limit = 100) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (limit) params.append('limit', limit);

      const url = `/admin/attendance/history/${employeeId}${
        params.toString() ? `?${params.toString()}` : ''
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Get attendance history error:', error);
      throw error;
    }
  },

  /**
   * Update attendance record
   * @param {string} id - Attendance record ID
   * @param {string} status - New status (PRESENT, ABSENT, LATE, HALF_DAY)
   */
  update: async (id, status) => {
    try {
      const response = await api.put(`/admin/attendance/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error('Update attendance error:', error);
      throw error;
    }
  },

  /**
   * Delete attendance record
   * @param {string} id - Attendance record ID
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/admin/attendance/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete attendance error:', error);
      throw error;
    }
  },
};

// ============================================
// SUPERADMIN DASHBOARD API
// ============================================

export const superadminDashboardAPI = {
  /**
   * Get superadmin overview
   */
  getOverview: async () => {
    try {
      const response = await api.get('/superadmin/dashboard/overview');
      return response.data;
    } catch (error) {
      console.error('Superadmin overview error:', error);
      throw error;
    }
  },

  /**
   * Get system alerts
   */
  getAlerts: async () => {
    try {
      const response = await api.get('/superadmin/dashboard/alerts');
      return response.data;
    } catch (error) {
      console.error('System alerts error:', error);
      throw error;
    }
  },

  /**
   * Get attendance feed
   * @param {object} filters - Optional filters
   */
  getAttendanceFeed: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.department) params.append('department', filters.department);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const url = `/superadmin/attendance${
        params.toString() ? `?${params.toString()}` : ''
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Attendance feed error:', error);
      throw error;
    }
  },

  /**
   * Get statistics
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   */
  getStatistics: async (startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const url = `/superadmin/statistics${
        params.toString() ? `?${params.toString()}` : ''
      }`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Statistics error:', error);
      throw error;
    }
  },

  /**
   * Get all employees (superadmin)
   */
  getEmployees: async () => {
    try {
      const response = await api.get('/superadmin/employees');
      return response.data;
    } catch (error) {
      console.error('Get employees error:', error);
      throw error;
    }
  },
};

// ============================================
// FINGERPRINT API
// ============================================

export const fingerprintAPI = {
  /**
   * Verify fingerprint against database
   * @param {string} fingerprintTemplate - Base64 fingerprint template
   */
  verify: async (fingerprintTemplate) => {
    try {
      const response = await api.post('/fingerprints/verify', {
        fingerprintTemplate,
      });
      return response.data;
    } catch (error) {
      console.error('Fingerprint verify error:', error);
      throw error;
    }
  },

  /**
   * Enroll new fingerprint for employee
   * @param {string} employeeId - Employee ID
   * @param {string} fingerprintTemplate - Base64 fingerprint template
   */
  enroll: async (employeeId, fingerprintTemplate) => {
    try {
      const response = await api.post('/fingerprints/enroll', {
        employeeId,
        fingerprintTemplate,
      });
      return response.data;
    } catch (error) {
      console.error('Fingerprint enroll error:', error);
      throw error;
    }
  },

   /**
   * Enroll a fingerprint for an employee
   */
  enrollFingerprint: async (employeeId, fingerprintData) => {
    try {
      const response = await api.post('/fingerprints/enroll', {
        employeeId,
        ...fingerprintData,
      });
      return response.data;
    } catch (error) {
      console.error('Enroll fingerprint error:', error);
      throw error;
    }
  },

  /**
   * Get all fingerprints for an employee
   */
  getEmployeeFingerprints: async (employeeId) => {
    try {
      const response = await api.get(`/fingerprints/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error('Get fingerprints error:', error);
      throw error;
    }
  },

};

export default api;