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
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getStats();
      if (response?.success) {
        setStats(response.stats);
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
    Alert.alert('Monthly Report', 'Monthly report feature coming soon!');
  };

  const handleMarkAttendance = () => {
    navigation.navigate('AttendanceCalendar');
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
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={16} color={color} />
      )}
    </TouchableOpacity>
  );

  const renderStatusCard = (label, count, total, color) => {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
    
    return (
      <View style={styles.statusCard} key={label}>
        <View style={styles.statusTopRow}>
          <View style={[styles.statusDotLarge, { backgroundColor: color }]} />
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
              Welcome, {user?.username || 'Admin'} • Role: {getRoleDisplay()}
            </Text>
          </View>
          <View style={styles.welcomeBadge}>
            <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
            <Text style={styles.welcomeBadgeText}>Today</Text>
          </View>
        </View>

        {/* Horizontal metrics strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.metricsStrip}
        >
          {renderStatCard(
            'Total employees',
            totalEmployees,
            'people',
            '#2196F3',
            handleViewEmployees
          )}
          {renderStatCard(
            'Present today',
            todayStats.present || 0,
            'checkmark-circle',
            '#4CAF50',
            handleViewDailyAttendance
          )}
          {renderStatCard(
            'Absent today',
            todayStats.absent || 0,
            'close-circle',
            '#F44336',
            handleViewDailyAttendance
          )}
          {renderStatCard(
            'Attendance rate',
            `${todayStats.attendanceRate || 0}%`,
            'stats-chart',
            '#FF9800',
            handleViewDailyAttendance
          )}
        </ScrollView>

        {/* Today's breakdown grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Today's breakdown</Text>
            <Text style={styles.sectionHint}>Live attendance status</Text>
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
              'Not marked',
              todayStats.notMarked || 0,
              totalEmployees,
              '#9E9E9E'
            )}
          </View>
        </View>

        {/* Monthly summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>This month</Text>
            <TouchableOpacity onPress={handleViewMonthlyReport}>
              <Text style={styles.viewMoreLink}>View details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.monthlyCard}>
            <View style={styles.monthlyRow}>
              <View style={styles.monthlyItem}>
                <Text style={styles.monthlyLabel}>Total marked</Text>
                <Text style={styles.monthlyValue}>
                  {monthlyStats.totalMarked || 0}
                </Text>
              </View>
              <View style={styles.monthlyDivider} />
              <View style={styles.monthlyItem}>
                <Text style={styles.monthlyLabel}>Present</Text>
                <Text style={[styles.monthlyValue, { color: '#4CAF50' }]}>
                  {monthlyStats.present || 0}
                </Text>
              </View>
            </View>
            <View style={styles.monthlyDividerHorizontal} />
            <View style={styles.monthlyRow}>
              <View style={styles.monthlyItem}>
                <Text style={styles.monthlyLabel}>Absent</Text>
                <Text style={[styles.monthlyValue, { color: '#F44336' }]}>
                  {monthlyStats.absent || 0}
                </Text>
              </View>
              <View style={styles.monthlyDivider} />
              <View style={styles.monthlyItem}>
                <Text style={styles.monthlyLabel}>Late</Text>
                <Text style={[styles.monthlyValue, { color: '#FF9800' }]}>
                  {monthlyStats.late || 0}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Department-wise breakdown */}
        {stats.departments && stats.departments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Department overview</Text>
            {stats.departments.map((dept, index) => (
              <View style={styles.deptCard} key={index}>
                <View style={styles.deptHeader}>
                  <View style={styles.deptIconWrap}>
                    <Ionicons name="briefcase-outline" size={18} color="#2196F3" />
                  </View>
                  <Text style={styles.deptName}>{dept.department}</Text>
                </View>
                <View style={styles.deptStats}>
                  <View style={styles.deptStatItem}>
                    <Text style={styles.deptStatLabel}>Employees</Text>
                    <Text style={styles.deptStatValue}>{dept.employees}</Text>
                  </View>
                  <View style={styles.deptStatItem}>
                    <Text style={styles.deptStatLabel}>Present today</Text>
                    <Text style={[styles.deptStatValue, { color: '#4CAF50' }]}>
                      {dept.presentToday}
                    </Text>
                  </View>
                  <View style={styles.deptStatItem}>
                    <Text style={styles.deptStatLabel}>Attendance</Text>
                    <Text style={[styles.deptStatValue, { color: '#2196F3' }]}>
                      {dept.attendanceRate}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleMarkAttendance}
              activeOpacity={0.9}
            >
              <View style={styles.actionIconWrap}>
                <Ionicons name="finger-print-outline" size={22} color="#2196F3" />
              </View>
              <Text style={styles.actionTitle}>Mark attendance</Text>
              <Text style={styles.actionSubtitle}>Scan fingerprint</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleViewDailyAttendance}
              activeOpacity={0.9}
            >
              <View style={styles.actionIconWrap}>
                <Ionicons name="calendar-outline" size={22} color="#2196F3" />
              </View>
              <Text style={styles.actionTitle}>Daily attendance</Text>
              <Text style={styles.actionSubtitle}>View today's records</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleViewEmployees}
              activeOpacity={0.9}
            >
              <View style={styles.actionIconWrap}>
                <Ionicons name="people-outline" size={22} color="#2196F3" />
              </View>
              <Text style={styles.actionTitle}>Manage employees</Text>
              <Text style={styles.actionSubtitle}>Add or edit employees</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleViewMonthlyReport}
              activeOpacity={0.9}
            >
              <View style={styles.actionIconWrap}>
                <Ionicons name="document-text-outline" size={22} color="#2196F3" />
              </View>
              <Text style={styles.actionTitle}>Monthly report</Text>
              <Text style={styles.actionSubtitle}>View detailed report</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
};

const CARD_WIDTH = width * 0.78;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F5F9',
  },
  accentCircle: {
    position: 'absolute',
    top: -80,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#BBDEFB',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F5F9',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F5F9',
    padding: 32,
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
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Welcome card
  welcomeCard: {
    backgroundColor: '#2196F3',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  welcomeLeft: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#E3F2FD',
  },
  welcomeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  welcomeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  // Horizontal metrics
  metricsStrip: {
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 4,
    width: CARD_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#263238',
  },
  statTitle: {
    fontSize: 12,
    color: '#78909C',
    marginTop: 2,
  },

  // Section
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263238',
  },
  sectionHint: {
    fontSize: 11,
    color: '#90A4AE',
  },
  viewMoreLink: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '600',
  },

  // Status grid
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    margin: 6,
    flexBasis: (width - 16 * 2 - 6 * 4) / 2,
    flexGrow: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusLabel: {
    fontSize: 12,
    color: '#607D8B',
    fontWeight: '600',
  },
  statusBottomRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  statusCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#263238',
  },
  statusPercentage: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Monthly card
  monthlyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  monthlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  monthlyItem: {
    flex: 1,
    alignItems: 'center',
  },
  monthlyLabel: {
    fontSize: 12,
    color: '#78909C',
    marginBottom: 4,
  },
  monthlyValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#263238',
  },
  monthlyDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  monthlyDividerHorizontal: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },

  // Department cards
  deptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  deptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  deptIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  deptName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#263238',
  },
  deptStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  deptStatItem: {
    alignItems: 'center',
  },
  deptStatLabel: {
    fontSize: 11,
    color: '#78909C',
    marginBottom: 4,
  },
  deptStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263238',
  },

  // Quick actions
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginTop: 8,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    margin: 6,
    flexBasis: (width - 16 * 2 - 6 * 4) / 2,
    flexGrow: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  actionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#263238',
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#78909C',
    marginTop: 2,
  },
});

export default AdminDashboard;