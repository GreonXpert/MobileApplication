// src/services/dashboardAPI.js
// Dashboard API Service for Admin
// Add this file to your MobileApplication/src/services/ directory

import api from './api'; // Import your existing API instance

// ============================================
// DASHBOARD & STATISTICS API
// ============================================

export const dashboardAPI = {
  /**
   * Get comprehensive dashboard statistics
   * Includes today's attendance, monthly summary, and department-wise breakdown
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
// ENHANCED EMPLOYEE API (Update your existing employeeAPI)
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
// ENHANCED ATTENDANCE API (Update your existing attendanceAPI)
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
// USAGE EXAMPLES
// ============================================

/*

// Example 1: Dashboard Screen
import { dashboardAPI } from './services/dashboardAPI';

const DashboardScreen = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      Alert.alert('Error', 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {stats && (
        <>
          <Text>Total Employees: {stats.totalEmployees}</Text>
          <Text>Present Today: {stats.today.present}</Text>
          <Text>Attendance Rate: {stats.today.attendanceRate}%</Text>
        </>
      )}
    </View>
  );
};

// Example 2: Create Employee
import { employeeAPI } from './services/dashboardAPI';

const handleCreateEmployee = async () => {
  try {
    const employeeData = {
      name: 'John Doe',
      employeeId: 'EMP001',
      jobRole: 'Software Engineer',
      department: 'IT',
      phone: '+919876543210',
      email: 'john@company.com',
      fingerprintTemplate: fingerprintData, // from scanner
      baseLocation: {
        latitude: 10.0261,
        longitude: 76.3125,
      },
    };

    const response = await employeeAPI.create(employeeData);
    Alert.alert('Success', response.message);
    navigation.goBack();
  } catch (error) {
    Alert.alert('Error', error.response?.data?.message || 'Failed to create employee');
  }
};

// Example 3: Mark Attendance
import { attendanceAPI } from './services/dashboardAPI';

const handleMarkAttendance = async (employeeId, status) => {
  try {
    const attendanceData = {
      employeeId: employeeId,
      date: new Date().toISOString(),
      status: status, // 'PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'
      location: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
      },
    };

    const response = await attendanceAPI.mark(attendanceData);
    Alert.alert('Success', response.message);
  } catch (error) {
    Alert.alert('Error', error.response?.data?.message || 'Failed to mark attendance');
  }
};

// Example 4: Get Monthly Report
import { dashboardAPI } from './services/dashboardAPI';

const handleGetMonthlyReport = async () => {
  try {
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const currentYear = new Date().getFullYear();
    
    const response = await dashboardAPI.getMonthlyReport(currentMonth, currentYear);
    console.log('Monthly Summary:', response.summary);
    console.log('Daily Breakdown:', response.dailyBreakdown);
  } catch (error) {
    console.error('Failed to get monthly report:', error);
  }
};

// Example 5: Search Employees
import { employeeAPI } from './services/dashboardAPI';

const handleSearchEmployees = async (searchTerm, department) => {
  try {
    const filters = {
      search: searchTerm,
      department: department,
      page: 1,
      limit: 20,
    };

    const response = await employeeAPI.getAll(filters);
    setEmployees(response.employees);
    setTotalPages(response.totalPages);
  } catch (error) {
    console.error('Search failed:', error);
  }
};

// Example 6: Get Employee with Stats
import { employeeAPI } from './services/dashboardAPI';

const handleViewEmployee = async (employeeId) => {
  try {
    const response = await employeeAPI.getById(employeeId);
    console.log('Employee:', response.employee);
    console.log('Attendance Rate:', response.statistics.attendanceRate);
    console.log('Total Records:', response.statistics.totalRecords);
  } catch (error) {
    console.error('Failed to get employee:', error);
  }
};

// Example 7: Get Daily Attendance
import { dashboardAPI } from './services/dashboardAPI';

const handleGetDailyAttendance = async (date) => {
  try {
    const response = await dashboardAPI.getDailyAttendance(date);
    console.log('Summary:', response.summary);
    console.log('Employees:', response.employees);
    
    // Filter employees by status
    const presentEmployees = response.employees.filter(
      emp => emp.attendance.status === 'PRESENT'
    );
    const absentEmployees = response.employees.filter(
      emp => emp.attendance.status === 'ABSENT'
    );
    const notMarkedEmployees = response.employees.filter(
      emp => emp.attendance.status === 'NOT_MARKED'
    );
  } catch (error) {
    console.error('Failed to get daily attendance:', error);
  }
};

*/

export default {
  dashboardAPI,
  employeeAPI,
  attendanceAPI,
};