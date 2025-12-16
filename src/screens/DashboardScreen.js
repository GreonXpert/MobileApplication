// src/screens/DashboardScreen.js
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dashboardAPI, superadminDashboardAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

/**
 * Dashboard Screen
 * 
 * Main dashboard showing:
 * - Today's attendance statistics
 * - Monthly summary
 * - Department-wise breakdown
 * - Quick actions
 * - Recent activity
 */
const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const isSuperadmin = Boolean(user?.role?.toUpperCase() === 'SUPERADMIN');  
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState([]);

  /**
   * Fetch dashboard data
   */
  const fetchDashboardData = async () => {
    try {
      if (isSuperadmin) {
        // Fetch superadmin overview
        const [overviewResponse, alertsResponse] = await Promise.all([
          superadminDashboardAPI.getOverview(),
          superadminDashboardAPI.getAlerts(),
        ]);
        
        if (overviewResponse.success) {
          setStats(overviewResponse.overview);
        }
        
        if (alertsResponse.success) {
          setAlerts(alertsResponse.alerts || []);
        }
      } else {
        // Fetch admin stats
        const response = await dashboardAPI.getStats();
        if (response.success) {
          setStats(response.stats);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Load data on mount and when screen comes into focus
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDashboardData();
    });

    return unsubscribe;
  }, [navigation, isSuperadmin]);

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [isSuperadmin]);

  /**
   * Navigate to daily attendance view
   */
  const handleViewDailyAttendance = () => {
    navigation.navigate('DailyAttendance');
  };

  /**
   * Navigate to employee list
   */
  const handleViewEmployees = () => {
    navigation.navigate('Employees');
  };

  /**
   * Navigate to analytics (superadmin only)
   */
  const handleViewAnalytics = () => {
    // Navigate to analytics screen (to be created)
    Alert.alert('Analytics', 'Detailed analytics coming soon!');
  };

  /**
   * Render stat card
   */
  const renderStatCard = (title, value, icon, color, onPress) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  /**
   * Render attendance status card
   */
  const renderStatusCard = (status, count, total, color) => {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
    
    return (
      <View style={[styles.statusCard, { backgroundColor: `${color}15` }]}>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <View style={styles.statusContent}>
          <Text style={styles.statusLabel}>{status}</Text>
          <Text style={[styles.statusCount, { color }]}>{count}</Text>
          <Text style={styles.statusPercentage}>{percentage}%</Text>
        </View>
      </View>
    );
  };

  /**
   * Render department card
   */
  const renderDepartmentCard = (dept) => (
    <View key={dept.department} style={styles.departmentCard}>
      <View style={styles.departmentHeader}>
        <Text style={styles.departmentName}>{dept.department}</Text>
        <Text style={styles.departmentRate}>{dept.attendanceRate}%</Text>
      </View>
      <View style={styles.departmentStats}>
        <Text style={styles.departmentDetail}>
          {dept.presentToday}/{dept.totalEmployees} present
        </Text>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${dept.attendanceRate}%`,
              backgroundColor: dept.attendanceRate >= 80 ? '#4CAF50' : '#FF9800',
            },
          ]}
        />
      </View>
    </View>
  );

  /**
   * Render alert card
   */
  const renderAlert = (alert, index) => {
    const alertColors = {
      high: '#F44336',
      medium: '#FF9800',
      low: '#2196F3',
    };

    return (
      <View key={index} style={styles.alertCard}>
        <Ionicons
          name="alert-circle"
          size={24}
          color={alertColors[alert.severity]}
        />
        <View style={styles.alertContent}>
          <Text style={styles.alertMessage}>{alert.message}</Text>
          {alert.details && (
            <Text style={styles.alertDetails}>
              Affected: {alert.details.join(', ')}
            </Text>
          )}
        </View>
      </View>
    );
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
        <Ionicons name="alert-circle-outline" size={64} color="#999" />
        <Text style={styles.errorText}>Failed to load dashboard</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.userRole}>{user?.role || 'Admin'}</Text>
      </View>

      {/* Quick Stats for Admin */}
      {!isSuperadmin && stats.today && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.quickStats}>
            {renderStatCard(
              'Total Employees',
              stats.totalEmployees || 0,
              'people',
              '#2196F3'
            )}
            {renderStatCard(
              'Attendance Rate',
              `${stats.today.attendanceRate}%`,
              'checkmark-circle',
              '#4CAF50',
              handleViewDailyAttendance
            )}
          </View>

          {/* Attendance Status Breakdown */}
          <View style={styles.statusGrid}>
            {renderStatusCard(
              'Present',
              stats.today.present,
              stats.totalEmployees,
              '#4CAF50'
            )}
            {renderStatusCard(
              'Absent',
              stats.today.absent,
              stats.totalEmployees,
              '#F44336'
            )}
            {renderStatusCard(
              'Late',
              stats.today.late,
              stats.totalEmployees,
              '#FF9800'
            )}
            {renderStatusCard(
              'Not Marked',
              stats.today.notMarked,
              stats.totalEmployees,
              '#9E9E9E'
            )}
          </View>
        </View>
      )}

      {/* Quick Stats for Superadmin */}
      {isSuperadmin && stats.system && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.quickStats}>
            {renderStatCard(
              'Total Employees',
              stats.system.totalEmployees || 0,
              'people',
              '#2196F3',
              handleViewEmployees
            )}
            {renderStatCard(
              'Total Admins',
              stats.system.totalAdmins || 0,
              'person-circle',
              '#9C27B0'
            )}
            {renderStatCard(
              'Attendance Records',
              stats.system.totalAttendanceRecords || 0,
              'document-text',
              '#FF9800'
            )}
            {renderStatCard(
              'Today\'s Attendance',
              stats.today.totalMarked || 0,
              'calendar',
              '#4CAF50',
              handleViewDailyAttendance
            )}
          </View>
        </View>
      )}

      {/* Alerts (Superadmin only) */}
      {isSuperadmin && alerts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>System Alerts</Text>
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>{alerts.length}</Text>
            </View>
          </View>
          {alerts.slice(0, 3).map(renderAlert)}
          {alerts.length > 3 && (
            <Text style={styles.moreAlertsText}>
              +{alerts.length - 3} more alerts
            </Text>
          )}
        </View>
      )}

      {/* Department Breakdown */}
      {!isSuperadmin && stats.departments && stats.departments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Department Attendance</Text>
          {stats.departments.map(renderDepartmentCard)}
        </View>
      )}

      {/* Monthly Summary */}
      {!isSuperadmin && stats.monthly && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Summary</Text>
          <View style={styles.monthlyCard}>
            <Text style={styles.monthlyMonth}>{stats.monthly.month}</Text>
            <View style={styles.monthlyStats}>
              <View style={styles.monthlyStatItem}>
                <Text style={styles.monthlyStatValue}>{stats.monthly.present}</Text>
                <Text style={styles.monthlyStatLabel}>Present</Text>
              </View>
              <View style={styles.monthlyStatItem}>
                <Text style={styles.monthlyStatValue}>{stats.monthly.absent}</Text>
                <Text style={styles.monthlyStatLabel}>Absent</Text>
              </View>
              <View style={styles.monthlyStatItem}>
                <Text style={styles.monthlyStatValue}>{stats.monthly.late}</Text>
                <Text style={styles.monthlyStatLabel}>Late</Text>
              </View>
              <View style={styles.monthlyStatItem}>
                <Text style={styles.monthlyStatValue}>{stats.monthly.halfDay}</Text>
                <Text style={styles.monthlyStatLabel}>Half Day</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleViewDailyAttendance}
          >
            <Ionicons name="calendar-outline" size={24} color="#2196F3" />
            <Text style={styles.actionButtonText}>View Daily</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleViewEmployees}
          >
            <Ionicons name="people-outline" size={24} color="#2196F3" />
            <Text style={styles.actionButtonText}>Employees</Text>
          </TouchableOpacity>
          
          {isSuperadmin && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleViewAnalytics}
            >
              <Ionicons name="stats-chart-outline" size={24} color="#2196F3" />
              <Text style={styles.actionButtonText}>Analytics</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Bottom Padding */}
      <View style={{ height: 30 }} />
    </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeSection: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  userRole: {
    fontSize: 16,
    color: '#E3F2FD',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  alertBadge: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  alertBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
  },
  statusCount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  statusPercentage: {
    fontSize: 11,
    color: '#999',
  },
  departmentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  departmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  departmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  departmentRate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  departmentStats: {
    marginBottom: 8,
  },
  departmentDetail: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  monthlyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  monthlyMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  monthlyStatItem: {
    alignItems: 'center',
  },
  monthlyStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  monthlyStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertMessage: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  alertDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  moreAlertsText: {
    textAlign: 'center',
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginTop: 8,
  },
});

export default DashboardScreen;