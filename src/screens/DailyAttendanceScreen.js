// src/screens/DailyAttendanceScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  TextInput,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dashboardAPI } from '../services/api';

const DailyAttendanceScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dailyData, setDailyData] = useState(null);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [searchText, setSearchText] = useState('');

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

  useEffect(() => {
    fetchDailyAttendance();
  }, [selectedDate]);

  // Combined filters (status, department, search)
  useEffect(() => {
    if (!dailyData) return;

    let filtered = dailyData.employees;

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(
        emp => emp.attendance.status === filterStatus
      );
    }

    if (filterDepartment !== 'ALL') {
      filtered = filtered.filter(emp => emp.department === filterDepartment);
    }

    const trimmedSearch = searchText.trim().toLowerCase();
    if (trimmedSearch) {
      filtered = filtered.filter(emp => {
        const name = emp.name?.toLowerCase() || '';
        const id = emp.employeeId?.toLowerCase() || '';
        return (
          name.includes(trimmedSearch) ||
          id.includes(trimmedSearch)
        );
      });
    }

    setFilteredEmployees(filtered);
  }, [filterStatus, filterDepartment, searchText, dailyData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDailyAttendance();
  }, [selectedDate]);

  const handlePreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

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

  const handleEmployeePress = (employee) => {
    Keyboard.dismiss();
    navigation.navigate('AttendanceHistory', {
      employee,
    });
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
      case 'NOT_MARKED':
        return '#9E9E9E';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status) => status.replace('_', ' ');

  const renderDateSelector = () => {
    const dateObj = new Date(selectedDate + 'T00:00:00');
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <View style={styles.dateHeaderWrapper}>
        <View style={styles.dateSelectorCard}>
          <TouchableOpacity style={styles.dateArrow} onPress={handlePreviousDay}>
            <Ionicons name="chevron-back" size={22} color="#1976D2" />
          </TouchableOpacity>

          <View style={styles.dateInfo}>
            <Text style={styles.dateLabelSmall}>Selected date</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>

          <TouchableOpacity style={styles.dateArrow} onPress={handleNextDay}>
            <Ionicons name="chevron-forward" size={22} color="#1976D2" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSummary = () => {
    if (!dailyData) return null;

    const { summary } = dailyData;

    return (
      <View style={styles.summaryWrapper}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryPrimaryCard}>
            <View style={styles.summaryPrimaryTop}>
              <Ionicons name="people-outline" size={18} color="#FFFFFF" />
              <Text style={styles.summaryPrimaryLabel}>Total employees</Text>
            </View>
            <Text style={styles.summaryPrimaryValue}>{summary.total}</Text>
          </View>

          <View style={styles.summarySideColumn}>
            <View style={[styles.summaryChip, { backgroundColor: '#E8F5E9' }]}>
              <View style={styles.summaryChipRow}>
                <View style={[styles.summaryDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.summaryChipText}>Present</Text>
              </View>
              <Text style={[styles.summaryChipValue, { color: '#4CAF50' }]}>
                {summary.present}
              </Text>
            </View>

            <View style={[styles.summaryChip, { backgroundColor: '#FFEBEE' }]}>
              <View style={styles.summaryChipRow}>
                <View style={[styles.summaryDot, { backgroundColor: '#F44336' }]} />
                <Text style={styles.summaryChipText}>Absent</Text>
              </View>
              <Text style={[styles.summaryChipValue, { color: '#F44336' }]}>
                {summary.absent}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryBottomRow}>
          <View style={[styles.summaryPill, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="time-outline" size={16} color="#FB8C00" />
            <Text style={[styles.summaryPillText, { color: '#FB8C00' }]}>
              Late: {summary.late}
            </Text>
          </View>
          <View style={[styles.summaryPill, { backgroundColor: '#F5F5F5' }]}>
            <Ionicons name="alert-circle-outline" size={16} color="#757575" />
            <Text style={[styles.summaryPillText, { color: '#757575' }]}>
              Not marked: {summary.notMarked}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFilters = () => {
    const statusFilters = ['ALL', 'PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'NOT_MARKED'];

    const departments = dailyData
      ? ['ALL', ...new Set(dailyData.employees.map(e => e.department))]
      : ['ALL'];

    return (
      <View style={styles.filtersContainer}>
        {/* Search bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search-outline" size={18} color="#90A4AE" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or ID"
              placeholderTextColor="#B0BEC5"
              value={searchText}
              onChangeText={setSearchText}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={18} color="#B0BEC5" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.filterTitle}>Filter by status</Text>
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
            <Text style={[styles.filterTitle, { marginTop: 10 }]}>
              Filter by department
            </Text>
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

  const renderEmployeeItem = ({ item }) => {
    const statusColor = getStatusColor(item.attendance.status);
    const statusLabel = getStatusLabel(item.attendance.status);

    return (
      <TouchableOpacity
        style={styles.employeeCard}
        onPress={() => handleEmployeePress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.employeeRowTop}>
          <View style={styles.employeeAvatar}>
            <Text style={styles.employeeAvatarText}>
              {item.name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.employeeInfo}>
            <Text style={styles.employeeName}>{item.name}</Text>
            <Text style={styles.employeeDetail}>
              {item.employeeId} • {item.department}
            </Text>
            <Text style={styles.employeeDetail}>{item.jobRole}</Text>
          </View>

          <View style={styles.statusBadgeContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusColor}15` },
              ]}
            >
              <View
                style={[styles.statusDot, { backgroundColor: statusColor }]}
              />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusLabel}
              </Text>
            </View>
          </View>
        </View>

        {item.attendance.markedAt && (
          <View style={styles.attendanceDetails}>
            <Ionicons name="time-outline" size={14} color="#757575" />
            <Text style={styles.attendanceDetailText}>
              Marked at{' '}
              {new Date(item.attendance.markedAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {item.attendance.markedBy && (
              <>
                <Ionicons
                  name="person-outline"
                  size={14}
                  color="#757575"
                  style={{ marginLeft: 10 }}
                />
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

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-open-outline" size={64} color="#B0BEC5" />
      <Text style={styles.emptyText}>No employees found</Text>
      <Text style={styles.emptySubtext}>
        {filterStatus !== 'ALL' || filterDepartment !== 'ALL' || searchText
          ? 'Try adjusting filters or search text'
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
    <View style={styles.screen}>
      <View style={styles.accentBackground} />
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
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F5F9',
  },
  accentBackground: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#BBDEFB',
  },

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

  dateHeaderWrapper: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
  },
  dateSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  dateArrow: {
    padding: 6,
  },
  dateInfo: {
    flex: 1,
    alignItems: 'center',
  },
  dateLabelSmall: {
    fontSize: 11,
    color: '#78909C',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#263238',
    marginTop: 2,
  },

  summaryWrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  summaryRow: {
    flexDirection: 'row',
  },
  summaryPrimaryCard: {
    flex: 1.1,
    borderRadius: 16,
    padding: 14,
    marginRight: 8,
    backgroundColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  summaryPrimaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  summaryPrimaryLabel: {
    marginLeft: 6,
    color: '#E3F2FD',
    fontSize: 13,
  },
  summaryPrimaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summarySideColumn: {
    flex: 1,
  },
  summaryChip: {
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 6,
  },
  summaryChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  summaryChipText: {
    fontSize: 12,
    color: '#546E7A',
  },
  summaryChipValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryBottomRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  summaryPillText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },

  filtersContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    marginRight: 6,
    fontSize: 13,
    color: '#263238',
    paddingVertical: 4,
  },

  filterTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#455A64',
    marginBottom: 6,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: '#ECEFF1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#CFD8DC',
  },
  filterChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  filterChipText: {
    fontSize: 12,
    color: '#455A64',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  employeeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  employeeRowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#BBDEFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  employeeAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#263238',
  },
  employeeDetail: {
    fontSize: 12,
    color: '#607D8B',
    marginTop: 2,
  },
  statusBadgeContainer: {
    marginLeft: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
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
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F1F1',
  },
  attendanceDetailText: {
    fontSize: 12,
    color: '#757575',
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
    paddingHorizontal: 24,
  },
});

export default DailyAttendanceScreen;
