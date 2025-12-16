// src/screens/DashboardScreen.js - FIXED VERSION
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
  
  // ✅ FIX: Case-insensitive role check with proper null safety
  const isSuperadmin = user?.role?.toLowerCase() === 'superadmin';
  
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
        
        if (overviewResponse?.success) {
          setStats(overviewResponse.overview);
        }
        
        if (alertsResponse?.success) {
          setAlerts(alertsResponse.alerts || []);
        }
      } else {
        // Fetch admin stats
        const response = await dashboardAPI.getStats();
        if (response?.success) {
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
    Alert.alert('Analytics', 'Detailed analytics coming soon!');
  };

  /**
   * Render stat card
   */
  const renderStatCard = (title, value, icon, color, onPress) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value || 0}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
    </TouchableOpacity>
  );

  /**
   * Render status card (for attendance breakdown)
   */
  const renderStatusCard = (label, count, total, color) => (
    <View style={styles.statusCard}>
      <View style={[styles.statusIndicator, { backgroundColor: color }]} />
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusCount}>{count || 0}</Text>
      {total > 0 && (
        <Text style={styles.statusPercentage}>
          {((count / total) * 100).toFixed(0)}%
        </Text>
      )}
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
          color={alertColors[alert.severity] || '#2196F3'}
        />
        <View style={styles.alertContent}>
          <Text style={styles.alertMessage}>{alert.message}</Text>
          {alert.details && Array.isArray(alert.details) && (
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
        <Text style={styles.userRole}>
          {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin'}
        </Text>
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
              'Present Today',
              stats.today.present || 0,
              'checkmark-circle',
              '#4CAF50',
              handleViewDailyAttendance
            )}
            {renderStatCard(
              'Absent Today',
              stats.today.absent || 0,
              'close-circle',
              '#F44336'
            )}
            {renderStatCard(
              'Attendance Rate',
              `${stats.today.attendanceRate || 0}%`,
              'stats-chart',
              '#4CAF50',
              handleViewDailyAttendance
            )}
          </View>

          {/* Attendance Status Breakdown */}
          <View style={styles.statusGrid}>
            {renderStatusCard(
              'Present',
              stats.today.present || 0,
              stats.totalEmployees || 0,
              '#4CAF50'
            )}
            {renderStatusCard(
              'Absent',
              stats.today.absent || 0,
              stats.totalEmployees || 0,
              '#F44336'
            )}
            {renderStatusCard(
              'Late',
              stats.today.late || 0,
              stats.totalEmployees || 0,
              '#FF9800'
            )}
            {renderStatusCard(
              'Not Marked',
              stats.today.notMarked || 0,
              stats.totalEmployees || 0,
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
              "Today's Attendance",
              stats.today?.totalMarked || 0,
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
          {alerts.map((alert, index) => renderAlert(alert, index))}
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
    textTransform: 'capitalize',
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
    flex: 1,
  },
  alertBadge: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  alertBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    flex: 1,
    minWidth: (width - 48) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginHorizontal: -6,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 6,
    flex: 1,
    minWidth: (width - 60) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIndicator: {
    width: 32,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statusCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statusPercentage: {
    fontSize: 12,
    color: '#999',
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
    elevation: 3,
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
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 6,
    flex: 1,
    minWidth: (width - 60) / 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    marginTop: 8,
  },
});

export default DashboardScreen;