// src/screens/AdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const AdminDashboard = ({ navigation }) => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [dailyAttendance, setDailyAttendance] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      // Fetch all dashboard data
      const [statsResponse, dailyResponse] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getDailyAttendance(),
      ]);

      if (statsResponse?.success) {
        setStats(statsResponse.stats);
        
        // Extract department stats if available
        if (statsResponse.stats?.departmentStats) {
          setDepartmentStats(statsResponse.stats.departmentStats);
        }
      }

      if (dailyResponse?.success) {
        setDailyAttendance(dailyResponse.employees || []);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDashboardData();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  const handleViewDailyAttendance = () => {
    navigation.navigate('DailyAttendance');
  };

  const handleViewEmployees = () => {
    navigation.navigate('Employees');
  };

  const handleViewMonthlyReport = () => {
    navigation.navigate('MonthlyReport');
  };

  const handleMarkAttendance = () => {
    navigation.navigate('AttendanceCalendar');
  };

  const handleViewDepartment = (department) => {
    navigation.navigate('DepartmentDetails', { department });
  };

  const renderStatCard = (title, value, icon, color, onPress) => (
    <TouchableOpacity
      style={[styles.statCard, { borderColor: `${color}40` }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
      disabled={!onPress}
      key={title}
    >
      <View style={[styles.statIconWrap, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={18} color={color} />
      )}
    </TouchableOpacity>
  );

  const renderStatusCard = (label, count, total, color) => {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
    
    return (
      <View style={styles.statusCard} key={label}>
        <View style={styles.statusTopRow}>
          <View style={[styles.statusDot, { backgroundColor: color }]} />
          <Text style={styles.statusLabel}>{label}</Text>
        </View>
        <View style={styles.statusBottomRow}>
          <Text style={styles.statusCount}>{count}</Text>
          <Text style={[styles.statusPercentage, { color }]}>
            {percentage}%
          </Text>
        </View>
      </View>
    );
  };

  const renderDepartmentCard = (dept) => (
    <TouchableOpacity
      key={dept.department}
      style={styles.departmentCard}
      onPress={() => handleViewDepartment(dept.department)}
      activeOpacity={0.9}
    >
      <View style={styles.deptHeader}>
        <View style={styles.deptIconWrap}>
          <Ionicons name="business" size={20} color="#2196F3" />
        </View>
        <View style={styles.deptInfo}>
          <Text style={styles.deptName}>{dept.department}</Text>
          <Text style={styles.deptEmployees}>{dept.totalEmployees} employees</Text>
        </View>
      </View>
      <View style={styles.deptStats}>
        <View style={styles.deptStatItem}>
          <Text style={styles.deptStatLabel}>Present</Text>
          <Text style={[styles.deptStatValue, { color: '#4CAF50' }]}>
            {dept.presentToday}
          </Text>
        </View>
        <View style={styles.deptStatItem}>
          <Text style={styles.deptStatLabel}>Absent</Text>
          <Text style={[styles.deptStatValue, { color: '#F44336' }]}>
            {dept.absentToday}
          </Text>
        </View>
        <View style={styles.deptStatItem}>
          <Text style={styles.deptStatLabel}>Rate</Text>
          <Text style={[styles.deptStatValue, { color: '#2196F3' }]}>
            {dept.attendanceRate}%
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9E9E9E" style={styles.deptChevron} />
    </TouchableOpacity>
  );

  const getRoleDisplay = () => {
    const role = user?.role || 'ADMIN';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
        <Text style={styles.errorText}>Failed to load data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalEmployees = stats.totalEmployees || 0;
  const todayStats = stats.today || {};
  const monthlyStats = stats.monthly || {};

  return (
    <View style={styles.screen}>
      <View style={styles.accentCircle} />
      
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero / welcome header */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.welcomeTitle}>Admin Dashboard</Text>
            <Text style={styles.welcomeSubtitle}>
              Welcome, {user?.username || 'Admin'} • {getRoleDisplay()}
            </Text>
          </View>
          <View style={styles.welcomeBadge}>
            <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
            <Text style={styles.welcomeBadgeText}>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Horizontal metrics strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.metricsStrip}
        >
          {renderStatCard(
            'Total Employees',
            totalEmployees,
            'people',
            '#2196F3',
            handleViewEmployees
          )}
          {renderStatCard(
            'Present Today',
            todayStats.present || 0,
            'checkmark-circle',
            '#4CAF50',
            handleViewDailyAttendance
          )}
          {renderStatCard(
            'Absent Today',
            todayStats.absent || 0,
            'close-circle',
            '#F44336',
            handleViewDailyAttendance
          )}
          {renderStatCard(
            'Attendance Rate',
            `${todayStats.attendanceRate || 0}%`,
            'stats-chart',
            '#FF9800'
          )}
        </ScrollView>

        {/* Today's Status Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today's Breakdown</Text>
            <TouchableOpacity onPress={handleViewDailyAttendance}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statusGrid}>
            {renderStatusCard(
              'Present',
              todayStats.present || 0,
              totalEmployees,
              '#4CAF50'
            )}
            {renderStatusCard(
              'Absent',
              todayStats.absent || 0,
              totalEmployees,
              '#F44336'
            )}
            {renderStatusCard(
              'Late',
              todayStats.late || 0,
              totalEmployees,
              '#FF9800'
            )}
            {renderStatusCard(
              'Half Day',
              todayStats.halfDay || 0,
              totalEmployees,
              '#9C27B0'
            )}
            {renderStatusCard(
              'Not Marked',
              todayStats.notMarked || 0,
              totalEmployees,
              '#9E9E9E'
            )}
          </View>
        </View>

        {/* Monthly Statistics */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>This Month</Text>
            <TouchableOpacity onPress={handleViewMonthlyReport}>
              <Text style={styles.sectionLink}>View Report</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.monthlyCard}>
            <View style={styles.monthlyRow}>
              <View style={styles.monthlyItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.monthlyLabel}>Present</Text>
                <Text style={styles.monthlyValue}>{monthlyStats.present || 0}</Text>
              </View>
              <View style={styles.monthlyItem}>
                <Ionicons name="close-circle" size={20} color="#F44336" />
                <Text style={styles.monthlyLabel}>Absent</Text>
                <Text style={styles.monthlyValue}>{monthlyStats.absent || 0}</Text>
              </View>
              <View style={styles.monthlyItem}>
                <Ionicons name="time" size={20} color="#FF9800" />
                <Text style={styles.monthlyLabel}>Late</Text>
                <Text style={styles.monthlyValue}>{monthlyStats.late || 0}</Text>
              </View>
              <View style={styles.monthlyItem}>
                <Ionicons name="sunny" size={20} color="#9C27B0" />
                <Text style={styles.monthlyLabel}>Half Day</Text>
                <Text style={styles.monthlyValue}>{monthlyStats.halfDay || 0}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Department-wise Statistics */}
        {departmentStats && departmentStats.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Departments</Text>
              <Text style={styles.sectionHint}>{departmentStats.length} total</Text>
            </View>
            {departmentStats.map(renderDepartmentCard)}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleMarkAttendance}
              activeOpacity={0.9}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="finger-print" size={24} color="#2196F3" />
              </View>
              <Text style={styles.actionTitle}>Mark</Text>
              <Text style={styles.actionSubtitle}>Attendance</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleViewEmployees}
              activeOpacity={0.9}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="people" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.actionTitle}>View</Text>
              <Text style={styles.actionSubtitle}>Employees</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleViewDailyAttendance}
              activeOpacity={0.9}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="calendar" size={24} color="#FF9800" />
              </View>
              <Text style={styles.actionTitle}>Daily</Text>
              <Text style={styles.actionSubtitle}>Records</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleViewMonthlyReport}
              activeOpacity={0.9}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="analytics" size={24} color="#9C27B0" />
              </View>
              <Text style={styles.actionTitle}>Monthly</Text>
              <Text style={styles.actionSubtitle}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        {dailyAttendance && dailyAttendance.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={handleViewDailyAttendance}>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>
            {dailyAttendance.slice(0, 5).map((record, index) => (
              <View key={index} style={styles.activityCard}>
                <View style={styles.activityLeft}>
                  <View style={[
                    styles.activityStatus,
                    { backgroundColor: record.attendance?.status === 'PRESENT' ? '#4CAF50' : '#F44336' }
                  ]} />
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityName}>{record.employeeName}</Text>
                    <Text style={styles.activityDetail}>
                      {record.department} • {record.jobRole}
                    </Text>
                  </View>
                </View>
                <Text style={[
                  styles.activityStatusText,
                  { color: record.attendance?.status === 'PRESENT' ? '#4CAF50' : '#9E9E9E' }
                ]}>
                  {record.attendance?.status || 'NOT_MARKED'}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  accentCircle: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#2196F3',
    opacity: 0.05,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeCard: {
    margin: 16,
        marginTop: Platform.OS === 'ios' ? 40: 8,

    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeLeft: {
    flex: 1,
  },
  welcomeTitle: {
  
    
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  welcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  welcomeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  metricsStrip: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: width * 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 13,
    color: '#666',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionLink: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  sectionHint: {
    fontSize: 13,
    color: '#999',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  statusBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  statusCount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statusPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  monthlyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  monthlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthlyItem: {
    alignItems: 'center',
    gap: 6,
  },
  monthlyLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  monthlyValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  departmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  deptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  deptIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deptInfo: {
    flex: 1,
  },
  deptName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  deptEmployees: {
    fontSize: 13,
    color: '#666',
  },
  deptStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  deptStatItem: {
    alignItems: 'center',
  },
  deptStatLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  deptStatValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  deptChevron: {
    position: 'absolute',
    right: 16,
    top: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#666',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  activityDetail: {
    fontSize: 12,
    color: '#666',
  },
  activityStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default AdminDashboard;