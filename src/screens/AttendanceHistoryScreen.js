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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dashboardAPI } from '../services/api';

/**
 * Attendance History Screen
 * 
 * Shows complete attendance history for a specific employee:
 * - Employee information
 * - Attendance statistics
 * - Chronological attendance records
 * - Filter by date range
 * - Status indicators
 */
const AttendanceHistoryScreen = ({ route, navigation }) => {
  const { employee } = route.params;
  
  const [historyData, setHistoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [limit, setLimit] = useState(30);

  /**
   * Fetch attendance history
   */
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

  /**
   * Load data on mount
   */
  useEffect(() => {
    fetchHistory();
  }, [limit]);

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, [limit]);

  /**
   * Load more records
   */
  const handleLoadMore = () => {
    setLimit(prev => prev + 30);
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
      default:
        return '#757575';
    }
  };

  /**
   * Get status icon
   */
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

  /**
   * Render employee header
   */
  const renderEmployeeHeader = () => {
    if (!historyData) return null;

    const { employee: empData, statistics } = historyData;

    return (
      <View style={styles.headerContainer}>
        {/* Employee Info */}
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

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Attendance Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{statistics.totalRecords}</Text>
              <Text style={styles.statLabel}>Total Records</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                {statistics.present}
              </Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#F44336' }]}>
                {statistics.absent}
              </Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FF9800' }]}>
                {statistics.late}
              </Text>
              <Text style={styles.statLabel}>Late</Text>
            </View>
          </View>

          <View style={styles.attendanceRateContainer}>
            <Text style={styles.attendanceRateLabel}>Attendance Rate</Text>
            <Text style={styles.attendanceRateValue}>
              {statistics.attendanceRate}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render attendance record item
   */
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
      <View style={styles.historyCard}>
        {/* Left indicator */}
        <View style={styles.timeline}>
          <View style={[styles.timelineDot, { backgroundColor: statusColor }]} />
          {index < (historyData?.history.length || 0) - 1 && (
            <View style={styles.timelineLine} />
          )}
        </View>

        {/* Content */}
        <View style={styles.historyContent}>
          <View style={styles.historyHeader}>
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.dateText}>{dateString}</Text>
            </View>
            
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <Ionicons name={statusIcon} size={16} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status.replace('_', ' ')}
              </Text>
            </View>
          </View>

          <View style={styles.historyDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.detailText}>Marked at {markedAtTime}</Text>
            </View>
            
            {item.markedBy && (
              <View style={styles.detailRow}>
                <Ionicons name="person-outline" size={14} color="#666" />
                <Text style={styles.detailText}>By {item.markedBy}</Text>
              </View>
            )}
            
            {item.location && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={14} color="#666" />
                <Text style={styles.detailText}>
                  {item.location.latitude.toFixed(4)}, {item.location.longitude.toFixed(4)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  /**
   * Render footer with load more button
   */
  const renderFooter = () => {
    if (!historyData || historyData.history.length < limit) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>No more records</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.loadMoreButton}
        onPress={handleLoadMore}
      >
        <Text style={styles.loadMoreText}>Load More</Text>
        <Ionicons name="chevron-down" size={20} color="#2196F3" />
      </TouchableOpacity>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#999" />
      <Text style={styles.emptyText}>No attendance records</Text>
      <Text style={styles.emptySubtext}>
        This employee has no attendance history yet
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
  listContainer: {
    flexGrow: 1,
  },
  headerContainer: {
    padding: 16,
  },
  employeeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  employeeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  employeeAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  employeeDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  attendanceRateContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceRateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },
  attendanceRateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  historyCard: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timeline: {
    width: 30,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  historyContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginLeft: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
    color: '#666',
    marginLeft: 6,
  },
  footerContainer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
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
  },
});

export default AttendanceHistoryScreen;