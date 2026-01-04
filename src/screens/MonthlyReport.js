// src/screens/MonthlyReport.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dashboardAPI } from '../services/api';

const { width } = Dimensions.get('window');

const MonthlyReport = ({ navigation }) => {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchMonthlyReport();
  }, [selectedMonth, selectedYear]);

  const fetchMonthlyReport = async () => {
    try {
      setIsLoading(true);
      const response = await dashboardAPI.getMonthlyReport(selectedMonth, selectedYear);
      
      if (response?.success) {
        setReportData(response.report);
      }
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      Alert.alert('Error', 'Failed to load monthly report');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    if (selectedYear === currentYear && selectedMonth === currentMonth) {
      return; // Don't go beyond current month
    }

    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const renderStatCard = (label, value, color, icon) => (
    <View style={[styles.statCard, { borderLeftColor: color }]} key={label}>
      <View style={styles.statIconWrapper}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statTextWrapper}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
  );

  const renderEmployeeRow = (employee, index) => {
    const attendanceRate = employee.totalDays > 0
      ? ((employee.presentDays / employee.totalDays) * 100).toFixed(1)
      : 0;

    return (
      <View key={employee.employeeId || index} style={styles.employeeRow}>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{employee.employeeName}</Text>
          <Text style={styles.employeeDept}>
            {employee.department} • {employee.jobRole}
          </Text>
        </View>
        <View style={styles.employeeStats}>
          <View style={styles.employeeStatItem}>
            <Text style={styles.employeeStatLabel}>Present</Text>
            <Text style={[styles.employeeStatValue, { color: '#4CAF50' }]}>
              {employee.presentDays}
            </Text>
          </View>
          <View style={styles.employeeStatItem}>
            <Text style={styles.employeeStatLabel}>Absent</Text>
            <Text style={[styles.employeeStatValue, { color: '#F44336' }]}>
              {employee.absentDays}
            </Text>
          </View>
          <View style={styles.employeeStatItem}>
            <Text style={styles.employeeStatLabel}>Rate</Text>
            <Text style={[styles.employeeStatValue, { color: '#2196F3' }]}>
              {attendanceRate}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading report...</Text>
      </View>
    );
  }

  if (!reportData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
        <Text style={styles.errorText}>No data available</Text>
      </View>
    );
  }

  const isCurrentMonth = 
    selectedMonth === new Date().getMonth() + 1 &&
    selectedYear === new Date().getFullYear();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monthly Report</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Month Selector */}
      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={styles.monthArrow}
          onPress={handlePreviousMonth}
        >
          <Ionicons name="chevron-back" size={24} color="#2196F3" />
        </TouchableOpacity>
        <View style={styles.monthDisplay}>
          <Text style={styles.monthText}>
            {months[selectedMonth - 1]} {selectedYear}
          </Text>
          {isCurrentMonth && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Current</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.monthArrow, isCurrentMonth && styles.monthArrowDisabled]}
          onPress={handleNextMonth}
          disabled={isCurrentMonth}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={isCurrentMonth ? '#CCC' : '#2196F3'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.statsGrid}>
            {renderStatCard(
              'Total Days',
              reportData.summary?.totalWorkingDays || 0,
              '#2196F3',
              'calendar'
            )}
            {renderStatCard(
              'Present',
              reportData.summary?.totalPresent || 0,
              '#4CAF50',
              'checkmark-circle'
            )}
            {renderStatCard(
              'Absent',
              reportData.summary?.totalAbsent || 0,
              '#F44336',
              'close-circle'
            )}
            {renderStatCard(
              'Late',
              reportData.summary?.totalLate || 0,
              '#FF9800',
              'time'
            )}
            {renderStatCard(
              'Half Day',
              reportData.summary?.totalHalfDay || 0,
              '#9C27B0',
              'sunny'
            )}
            {renderStatCard(
              'Avg. Rate',
              `${reportData.summary?.averageAttendanceRate || 0}%`,
              '#00BCD4',
              'trending-up'
            )}
          </View>
        </View>

        {/* Employee Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Employee Details</Text>
            <Text style={styles.sectionCount}>
              {reportData.employees?.length || 0} employees
            </Text>
          </View>
          
          {reportData.employees && reportData.employees.length > 0 ? (
            <View style={styles.employeeList}>
              {reportData.employees.map(renderEmployeeRow)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No employee data available</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  monthArrow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
  },
  monthArrowDisabled: {
    opacity: 0.3,
  },
  monthDisplay: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  monthText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  currentBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionCount: {
    fontSize: 13,
    color: '#666',
  },
  statsGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statTextWrapper: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  employeeList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  employeeRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  employeeInfo: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  employeeDept: {
    fontSize: 13,
    color: '#666',
  },
  employeeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  employeeStatItem: {
    alignItems: 'center',
  },
  employeeStatLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  employeeStatValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
});

export default MonthlyReport;