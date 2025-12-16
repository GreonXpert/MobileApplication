// src/screens/AttendanceHistoryScreen.js
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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dashboardAPI } from '../services/api';

const AttendanceHistoryScreen = ({ route, navigation }) => {
  const { employee } = route.params;

  const [historyData, setHistoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [limit, setLimit] = useState(30);

  const fetchHistory = async () => {
    try {
      const response = await dashboardAPI.getEmployeeHistory(
        employee.employeeId,
        { limit }
      );
      if (response.success) {
        setHistoryData(response);
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      Alert.alert('Error', 'Failed to load attendance history. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [limit]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, [limit]);

  const handleLoadMore = () => {
    setLimit(prev => prev + 30);
  };

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
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':
        return 'checkmark-circle';
      case 'ABSENT':
        return 'close-circle';
      case 'LATE':
        return 'time';
      case 'HALF_DAY':
        return 'hourglass';
      default:
        return 'help-circle';
    }
  };

  const renderEmployeeHeader = () => {
    if (!historyData) return null;

    const { employee: empData, statistics } = historyData;

    return (
      <View>
        {/* Gradient-like header */}
        <View style={styles.topHeader}>
          <View style={styles.topHeaderLeft}>
            <Text style={styles.topHeaderTitle}>Attendance History</Text>
            <Text style={styles.topHeaderSubtitle}>
              Overview of past {statistics.totalRecords} records
            </Text>
          </View>
          <View style={styles.topHeaderBadge}>
            <Ionicons name="calendar" size={18} color="#fff" />
            <Text style={styles.topHeaderBadgeText}>History</Text>
          </View>
        </View>

        {/* Employee Card */}
        <View style={styles.employeeCard}>
          <View style={styles.employeeAvatar}>
            <Text style={styles.employeeAvatarText}>
              {empData.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName}>{empData.name}</Text>
            <Text style={styles.employeeDetail}>ID: {empData.employeeId}</Text>
            <Text style={styles.employeeDetail}>
              {empData.department} • {empData.jobRole}
            </Text>
          </View>
        </View>

        {/* Stats chips */}
        <View style={styles.statsRow}>
          <View style={[styles.statChip, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
            <View style={styles.statChipTextWrapper}>
              <Text style={styles.statChipLabel}>Present</Text>
              <Text style={[styles.statChipValue, { color: '#4CAF50' }]}>
                {statistics.present}
              </Text>
            </View>
          </View>
          <View style={[styles.statChip, { backgroundColor: '#FFEBEE' }]}>
            <Ionicons name="close-circle-outline" size={18} color="#F44336" />
            <View style={styles.statChipTextWrapper}>
              <Text style={styles.statChipLabel}>Absent</Text>
              <Text style={[styles.statChipValue, { color: '#F44336' }]}>
                {statistics.absent}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statChipSmall, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="time-outline" size={16} color="#FB8C00" />
            <Text style={[styles.statChipSmallText, { color: '#FB8C00' }]}>
              Late: {statistics.late}
            </Text>
          </View>
          <View style={[styles.statChipSmall, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="stats-chart-outline" size={16} color="#1976D2" />
            <Text style={[styles.statChipSmallText, { color: '#1976D2' }]}>
              Rate: {statistics.attendanceRate}
            </Text>
          </View>
        </View>

        {/* Section title */}
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>Timeline</Text>
          <Text style={styles.timelineSubtitle}>Most recent first</Text>
        </View>
      </View>
    );
  };

  const renderHistoryItem = ({ item, index }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    const date = new Date(item.date);
    const dateString = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const markedAtTime = new Date(item.markedAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.historyRow}>
        {/* Timeline column */}
        <View style={styles.timelineColumn}>
          <View
            style={[
              styles.timelineDot,
              { borderColor: statusColor, backgroundColor: '#fff' },
            ]}
          >
            <View
              style={[
                styles.timelineDotInner,
                { backgroundColor: statusColor },
              ]}
            />
          </View>
          {index < (historyData?.history.length || 0) - 1 && (
            <View style={styles.timelineLine} />
          )}
        </View>

        {/* Card content */}
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color="#78909C" />
              <Text style={styles.dateText}>{dateString}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusColor}12` },
              ]}
            >
              <Ionicons name={statusIcon} size={16} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status.replace('_', ' ')}
              </Text>
            </View>
          </View>

          <View style={styles.historyDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={14} color="#90A4AE" />
              <Text style={styles.detailText}>Marked at {markedAtTime}</Text>
            </View>

            {item.markedBy && (
              <View style={styles.detailRow}>
                <Ionicons name="person-outline" size={14} color="#90A4AE" />
                <Text style={styles.detailText}>By {item.markedBy}</Text>
              </View>
            )}

            {item.location && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={14} color="#90A4AE" />
                <Text style={styles.detailText}>
                  {item.location.latitude.toFixed(4)},{' '}
                  {item.location.longitude.toFixed(4)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!historyData || historyData.history.length < limit) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>No more records</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
        <Text style={styles.loadMoreText}>Load more records</Text>
        <Ionicons name="chevron-down" size={20} color="#2196F3" />
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#B0BEC5" />
      <Text style={styles.emptyText}>No attendance records</Text>
      <Text style={styles.emptySubtext}>
        This employee has no attendance history yet.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading attendance history...</Text>
      </View>
    );
  }

  if (!historyData) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#999" />
        <Text style={styles.errorText}>Failed to load history</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchHistory}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={historyData.history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderEmployeeHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContainer}
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
    backgroundColor: '#F3F5F9',
  },
  listContainer: {
    paddingBottom: 16,
  },

  // Loading / error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F5F9',
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
    backgroundColor: '#F3F5F9',
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
    borderRadius: 999,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Top header + employee
  topHeader: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
  },
  topHeaderLeft: {
    flex: 1,
  },
  topHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  topHeaderSubtitle: {
    color: '#E3F2FD',
    fontSize: 13,
  },
  topHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  topHeaderBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },

  employeeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  employeeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#BBDEFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  employeeAvatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1976D2',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#263238',
  },
  employeeDetail: {
    fontSize: 13,
    color: '#607D8B',
    marginTop: 2,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 10,
  },
  statChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    marginHorizontal: 4,
  },
  statChipTextWrapper: {
    marginLeft: 8,
  },
  statChipLabel: {
    fontSize: 12,
    color: '#546E7A',
  },
  statChipValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statChipSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginHorizontal: 4,
    flex: 1,
  },
  statChipSmallText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Timeline header
  timelineHeader: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#37474F',
  },
  timelineSubtitle: {
    fontSize: 12,
    color: '#90A4AE',
  },

  // Timeline + cards
  historyRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  timelineColumn: {
    width: 26,
    alignItems: 'center',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  timelineDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 2,
  },
  historyCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginLeft: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#37474F',
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  historyDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#607D8B',
    marginLeft: 6,
  },

  // Footer / Empty
  footerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginRight: 6,
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
    paddingHorizontal: 24,
  },
});

export default AttendanceHistoryScreen;
