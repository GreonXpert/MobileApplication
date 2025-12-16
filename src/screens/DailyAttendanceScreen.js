// src/screens/DailyAttendanceScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dashboardAPI } from '../services/api';

/**
 * Daily Attendance Screen
 * 
 * Shows complete daily attendance with all employees:
 * - Date selector
 * - Summary statistics
 * - All employees with attendance status
 * - Filter by department/status
 * - Navigate to employee details
 */
const DailyAttendanceScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyData, setDailyData] = useState(null);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL'); // ALL, PRESENT, ABSENT, LATE, HALF_DAY, NOT_MARKED
  const [filterDepartment, setFilterDepartment] = useState('ALL');

  /**
   * Fetch daily attendance data
   */
  const fetchDailyAttendance = async () => {
    try {
      const response = await dashboardAPI.getDailyAttendance(selectedDate);
      if (response.success) {
        setDailyData(response);
        setFilteredEmployees(response.employees);
      }
    } catch (error) {
      console.error('Error fetching daily attendance:', error);
      Alert.alert('Error', 'Failed to load daily attendance. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Load data on mount and when date changes
   */
  useEffect(() => {
    fetchDailyAttendance();
  }, [selectedDate]);

  /**
   * Apply filters
   */
  useEffect(() => {
    if (!dailyData) return;

    let filtered = dailyData.employees;

    // Filter by status
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(emp => emp.attendance.status === filterStatus);
    }

    // Filter by department
    if (filterDepartment !== 'ALL') {
      filtered = filtered.filter(emp => emp.department === filterDepartment);
    }

    setFilteredEmployees(filtered);
  }, [filterStatus, filterDepartment, dailyData]);

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDailyAttendance();
  }, [selectedDate]);

  /**
   * Navigate to previous day
   */
  const handlePreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  /**
   * Navigate to next day
   */
  const handleNextDay = () => {
    const currentDate = new Date(selectedDate);
    const today = new Date().toISOString().split('T')[0];
    
    if (selectedDate >= today) {
      Alert.alert('Info', 'Cannot view future dates');
      return;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  /**
   * Handle employee press to view history
   */
  const handleEmployeePress = (employee) => {
    navigation.navigate('AttendanceHistory', {
      employee: employee,
    });
  };

  /**
   * Get status color
   */
  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT':
        return '#4CAF50';
      case 'ABSENT':
        return '#F44336';
      case 'LATE':
        return '#FF9800';
      case 'HALF_DAY':
        return '#2196F3';
      case 'NOT_MARKED':
        return '#9E9E9E';
      default:
        return '#757575';
    }
  };

  /**
   * Get status label
   */
  const getStatusLabel = (status) => {
    return status.replace('_', ' ');
  };

  /**
   * Render date selector
   */
  const renderDateSelector = () => {
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <View style={styles.dateSelector}>
        <TouchableOpacity
          style={styles.dateArrow}
          onPress={handlePreviousDay}
        >
          <Ionicons name="chevron-back" size={24} color="#2196F3" />
        </TouchableOpacity>
        
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.dateArrow}
          onPress={handleNextDay}
        >
          <Ionicons name="chevron-forward" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Render summary statistics
   */
  const renderSummary = () => {
    if (!dailyData) return null;

    const { summary } = dailyData;

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{summary.total}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#E8F5E9' }]}>
          <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
            {summary.present}
          </Text>
          <Text style={styles.summaryLabel}>Present</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FFEBEE' }]}>
          <Text style={[styles.summaryValue, { color: '#F44336' }]}>
            {summary.absent}
          </Text>
          <Text style={styles.summaryLabel}>Absent</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#FFF3E0' }]}>
          <Text style={[styles.summaryValue, { color: '#FF9800' }]}>
            {summary.late}
          </Text>
          <Text style={styles.summaryLabel}>Late</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: '#F5F5F5' }]}>
          <Text style={[styles.summaryValue, { color: '#9E9E9E' }]}>
            {summary.notMarked}
          </Text>
          <Text style={styles.summaryLabel}>Not Marked</Text>
        </View>
      </View>
    );
  };

  /**
   * Render filter chips
   */
  const renderFilters = () => {
    const statusFilters = ['ALL', 'PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'NOT_MARKED'];
    
    // Get unique departments
    const departments = dailyData
      ? ['ALL', ...new Set(dailyData.employees.map(e => e.department))]
      : ['ALL'];

    return (
      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Status:</Text>
        <View style={styles.filterChips}>
          {statusFilters.map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                filterStatus === status && styles.filterChipActive,
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterStatus === status && styles.filterChipTextActive,
                ]}
              >
                {getStatusLabel(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {departments.length > 2 && (
          <>
            <Text style={styles.filterTitle}>Department:</Text>
            <View style={styles.filterChips}>
              {departments.map(dept => (
                <TouchableOpacity
                  key={dept}
                  style={[
                    styles.filterChip,
                    filterDepartment === dept && styles.filterChipActive,
                  ]}
                  onPress={() => setFilterDepartment(dept)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterDepartment === dept && styles.filterChipTextActive,
                    ]}
                  >
                    {dept}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    );
  };

  /**
   * Render employee item
   */
  const renderEmployeeItem = ({ item }) => {
    const statusColor = getStatusColor(item.attendance.status);
    const statusLabel = getStatusLabel(item.attendance.status);

    return (
      <TouchableOpacity
        style={styles.employeeCard}
        onPress={() => handleEmployeePress(item)}
      >
        <View style={styles.employeeHeader}>
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName}>{item.name}</Text>
            <Text style={styles.employeeDetail}>
              {item.employeeId} • {item.department}
            </Text>
            <Text style={styles.employeeDetail}>{item.jobRole}</Text>
          </View>
          
          <View style={styles.statusBadgeContainer}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>

        {item.attendance.markedAt && (
          <View style={styles.attendanceDetails}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.attendanceDetailText}>
              Marked at {new Date(item.attendance.markedAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {item.attendance.markedBy && (
              <>
                <Ionicons name="person-outline" size={14} color="#666" style={{ marginLeft: 12 }} />
                <Text style={styles.attendanceDetailText}>
                  {item.attendance.markedBy}
                </Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /**
   * Render empty list
   */
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-open-outline" size={64} color="#999" />
      <Text style={styles.emptyText}>No employees found</Text>
      <Text style={styles.emptySubtext}>
        {filterStatus !== 'ALL' || filterDepartment !== 'ALL'
          ? 'Try adjusting your filters'
          : 'No attendance data for this date'}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading attendance data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderDateSelector()}
      {renderSummary()}
      {renderFilters()}
      
      <FlatList
        data={filteredEmployees}
        renderItem={renderEmployeeItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dateArrow: {
    padding: 8,
  },
  dateInfo: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  employeeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  employeeDetail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  statusBadgeContainer: {
    marginLeft: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  attendanceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  attendanceDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DailyAttendanceScreen;