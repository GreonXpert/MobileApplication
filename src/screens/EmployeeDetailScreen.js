// src/screens/EmployeeDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { employeeAPI } from '../services/api';

const EmployeeDetailScreen = ({ route, navigation }) => {
  const { employeeId } = route.params;

  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployeeDetails = async () => {
    try {
      const response = await employeeAPI.getById(employeeId);
      if (response.success) {
        setEmployee(response.employee);
      }
    } catch (error) {
      console.error('Error fetching employee details:', error);
      Alert.alert('Error', 'Failed to load employee details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeDetails();
  }, [employeeId]);

  const handleMarkAttendance = () => {
    if (!employee) return;
    navigation.navigate('AttendanceCalendar', { employee });
  };

  const handleViewHistory = () => {
    if (!employee) return;
    navigation.navigate('AttendanceHistory', { employee });
  };

  const renderInfoRow = (icon, label, value, iconColor = '#2196F3') => (
    <View style={styles.infoRow} key={label}>
      <View style={[styles.infoIcon, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading employee details...</Text>
      </View>
    );
  }

  if (!employee) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#999" />
        <Text style={styles.errorText}>Employee not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const joinedDate = new Date(employee.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const initials = employee.name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase();

  return (
    <View style={styles.screen}>
      <View style={styles.accentCircle} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero header */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.employeeName}>{employee.name}</Text>
              <Text style={styles.employeeMeta}>
                {employee.employeeId} • {employee.department}
              </Text>
              <Text style={styles.employeeMeta}>{employee.jobRole}</Text>
            </View>
          </View>
          <View style={styles.headerChip}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
            <Text style={styles.headerChipText}>Active</Text>
          </View>
        </View>

        {/* Key tags row */}
        <View style={styles.tagsRow}>
          <View style={styles.tagChip}>
            <Ionicons name="calendar-outline" size={14} color="#1976D2" />
            <Text style={styles.tagText}>Joined {joinedDate}</Text>
          </View>
          {employee.baseLocation && (
            <View style={styles.tagChip}>
              <Ionicons name="navigate-outline" size={14} color="#1976D2" />
              <Text style={styles.tagText}>Base location set</Text>
            </View>
          )}
        </View>

        {/* Info section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Employee information</Text>
          {renderInfoRow(
            'briefcase-outline',
            'Job role',
            employee.jobRole,
            '#4CAF50'
          )}
          {renderInfoRow(
            'business-outline',
            'Department',
            employee.department,
            '#FF9800'
          )}
          {employee.baseLocation &&
            renderInfoRow(
              'location-outline',
              'Base location',
              `${employee.baseLocation.latitude.toFixed(
                4
              )}, ${employee.baseLocation.longitude.toFixed(4)}`,
              '#F44336'
            )}
          {renderInfoRow('id-card-outline', 'Employee ID', employee.employeeId)}
        </View>

        {/* Quick actions */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quick actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMarkAttendance}
            activeOpacity={0.9}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Mark attendance</Text>
              <Text style={styles.actionSubtitle}>
                Record today&apos;s attendance for this employee
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0BEC5" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleViewHistory}
            activeOpacity={0.9}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="time-outline" size={22} color="#2196F3" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>View history</Text>
              <Text style={styles.actionSubtitle}>
                See complete attendance history
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B0BEC5" />
          </TouchableOpacity>
        </View>

        {/* Info banner */}
        <View style={styles.infoBox}>
          <Ionicons
            name="finger-print-outline"
            size={22}
            color="#1976D2"
          />
          <Text style={styles.infoBoxText}>
            Fingerprint templates for this employee are securely stored on the
            server and used only for attendance verification.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

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
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: 24,
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
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Header / hero
  headerCard: {
    backgroundColor: '#2196F3',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#BBDEFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1976D2',
  },
  headerInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  employeeMeta: {
    fontSize: 12,
    color: '#E3F2FD',
    marginTop: 2,
  },
  headerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#1976D2',
  },
  headerChipText: {
    marginLeft: 4,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // Tag chips
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '500',
  },

  // Sections
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#37474F',
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#78909C',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#263238',
  },

  // Actions
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#263238',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#78909C',
    marginTop: 2,
  },

  // Info banner
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    marginTop: 4,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: '#1976D2',
    marginLeft: 10,
    lineHeight: 18,
  },
});

export default EmployeeDetailScreen;
