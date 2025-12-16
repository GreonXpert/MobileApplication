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

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();

  const userRole = React.useMemo(() => {
    if (!user || !user.role || typeof user.role !== 'string') {
      return 'admin';
    }
    return user.role.toLowerCase().trim();
  }, [user]);

  const isSuperadmin = userRole === 'superadmin';

  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const fetchDashboardData = async () => {
    try {
      if (isSuperadmin) {
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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDashboardData();
    });
    return unsubscribe;
  }, [navigation, isSuperadmin]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, [isSuperadmin]);

  const handleViewDailyAttendance = () => {
    navigation.navigate('DailyAttendance');
  };

  const handleViewEmployees = () => {
    navigation.navigate('Employees');
  };

  const handleViewAnalytics = () => {
    Alert.alert('Analytics', 'Detailed analytics coming soon!');
  };

  const renderStatCard = (title, value, icon, color, onPress) => (
    <TouchableOpacity
      style={[styles.statCard, { borderColor: `${color}40` }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={styles.statCardLeft}>
        <Text style={styles.statCardLabel}>{title}</Text>
        <Text style={styles.statCardValue}>{value || 0}</Text>
      </View>
      <View style={[styles.statCardIconWrap, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={26} color={color} />
      </View>
    </TouchableOpacity>
  );

  const renderStatusCard = (label, count, total, color) => {
    const pct = total > 0 ? ((count / total) * 100).toFixed(0) : '0';
    return (
      <View style={styles.statusCard}>
        <View style={styles.statusTopRow}>
          <View style={[styles.statusDotLarge, { backgroundColor: color }]} />
          <Text style={styles.statusLabel}>{label}</Text>
        </View>
        <View style={styles.statusBottomRow}>
          <Text style={styles.statusCount}>{count || 0}</Text>
          <Text style={[styles.statusPercentage, { color }]}>{pct}%</Text>
        </View>
      </View>
    );
  };

  const renderAlert = (alert, index) => {
    const alertColors = {
      high: '#F44336',
      medium: '#FF9800',
      low: '#2196F3',
    };

    return (
      <View key={index} style={styles.alertCard}>
        <View
          style={[
            styles.alertIconWrap,
            { backgroundColor: `${alertColors[alert.severity] || '#2196F3'}15` },
          ]}
        >
          <Ionicons
            name="alert-circle"
            size={22}
            color={alertColors[alert.severity] || '#2196F3'}
          />
        </View>
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

  const getRoleDisplay = () => {
    if (!userRole || typeof userRole !== 'string') return 'Admin';
    return userRole.charAt(0).toUpperCase() + userRole.slice(1);
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

  const todayStats = stats.today || {};
  const totalEmployees = stats.totalEmployees || stats.system?.totalEmployees || 0;

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
            <Text style={styles.welcomeTitle}>Attendance dashboard</Text>
            <Text style={styles.welcomeSubtitle}>
              Role: {getRoleDisplay()}
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
          {!isSuperadmin && (
            <>
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
            </>
          )}

          {isSuperadmin && (
            <>
              {renderStatCard(
                'Total employees',
                stats.system?.totalEmployees || 0,
                'people',
                '#2196F3',
                handleViewEmployees
              )}
              {renderStatCard(
                'Total admins',
                stats.system?.totalAdmins || 0,
                'person-circle',
                '#9C27B0'
              )}
              {renderStatCard(
                'Attendance records',
                stats.system?.totalAttendanceRecords || 0,
                'document-text',
                '#FF9800'
              )}
              {renderStatCard(
                "Today's marked",
                stats.today?.totalMarked || 0,
                'calendar',
                '#4CAF50',
                handleViewDailyAttendance
              )}
            </>
          )}
        </ScrollView>

        {/* Status breakdown grid (admins) */}
        {!isSuperadmin && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Today&apos;s breakdown</Text>
              <Text style={styles.sectionHint}>Tap cards above to drill down</Text>
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
        )}

        {/* Alerts (superadmin only) */}
        {isSuperadmin && alerts && alerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>System alerts</Text>
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>{alerts.length}</Text>
              </View>
            </View>
            {alerts.map((alert, index) => renderAlert(alert, index))}
          </View>
        )}

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleViewDailyAttendance}
              activeOpacity={0.9}
            >
              <View style={styles.actionIconWrap}>
                <Ionicons name="calendar-outline" size={22} color="#2196F3" />
              </View>
              <Text style={styles.actionTitle}>Daily attendance</Text>
              <Text style={styles.actionSubtitle}>View today&apos;s records</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              onPress={handleViewEmployees}
              activeOpacity={0.9}
            >
              <View style={styles.actionIconWrap}>
                <Ionicons name="people-outline" size={22} color="#2196F3" />
              </View>
              <Text style={styles.actionTitle}>Employees</Text>
              <Text style={styles.actionSubtitle}>Manage employees</Text>
            </TouchableOpacity>

            {isSuperadmin && (
              <TouchableOpacity
                style={styles.actionCard}
                onPress={handleViewAnalytics}
                activeOpacity={0.9}
              >
                <View style={styles.actionIconWrap}>
                  <Ionicons name="analytics-outline" size={22} color="#2196F3" />
                </View>
                <Text style={styles.actionTitle}>Analytics</Text>
                <Text style={styles.actionSubtitle}>Coming soon</Text>
              </TouchableOpacity>
            )}
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
    borderRadius: 999,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Hero
  welcomeCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 18,
    padding: 18,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  welcomeBadgeText: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Horizontal metrics
  metricsStrip: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  statCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  statCardLeft: {
    flex: 1,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#78909C',
    marginBottom: 4,
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#263238',
  },
  statCardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Sections
  section: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#37474F',
  },
  sectionHint: {
    fontSize: 11,
    color: '#90A4AE',
  },

  // Status grid
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginTop: 6,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    margin: 6,
    flexBasis: (width - 16 * 2 - 12 * 2) / 2,
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

  // Alerts
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  alertIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#263238',
  },
  alertDetails: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  alertBadge: {
    backgroundColor: '#F44336',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 24,
    alignItems: 'center',
  },
  alertBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
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

export default DashboardScreen;
