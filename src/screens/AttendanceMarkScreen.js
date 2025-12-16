// src/screens/AttendanceMarkScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { attendanceAPI, handleAPIError } from '../services/api';

const AttendanceMarkScreen = ({ route, navigation }) => {
  const { employee, selectedDate } = route.params;

  const [status, setStatus] = useState('PRESENT');
  const [location, setLocation] = useState({
    latitude: '',
    longitude: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const statusOptions = [
    { value: 'PRESENT', label: 'Present', color: '#4CAF50', icon: 'checkmark-circle' },
    { value: 'ABSENT', label: 'Absent', color: '#F44336', icon: 'close-circle' },
    { value: 'LATE', label: 'Late', color: '#FF9800', icon: 'time' },
    { value: 'HALF_DAY', label: 'Half Day', color: '#2196F3', icon: 'hourglass' },
  ];

  const updateLocation = (field, value) => {
    setLocation(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const useBaseLocation = () => {
    if (employee.baseLocation) {
      setLocation({
        latitude: employee.baseLocation.latitude.toString(),
        longitude: employee.baseLocation.longitude.toString(),
      });
      Alert.alert('Success', 'Employee base location loaded');
    } else {
      Alert.alert('Error', 'No base location available for this employee');
    }
  };

  const validateForm = () => {
    if (!status) {
      Alert.alert('Validation Error', 'Please select attendance status');
      return false;
    }
    if (!location.latitude.trim() || !location.longitude.trim()) {
      Alert.alert('Validation Error', 'Please enter both latitude and longitude');
      return false;
    }

    const lat = parseFloat(location.latitude);
    const lng = parseFloat(location.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Validation Error', 'Latitude and longitude must be valid numbers');
      return false;
    }
    if (lat < -90 || lat > 90) {
      Alert.alert('Validation Error', 'Latitude must be between -90 and 90');
      return false;
    }
    if (lng < -180 || lng > 180) {
      Alert.alert('Validation Error', 'Longitude must be between -180 and 180');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const attendanceData = {
        employeeId: employee.employeeId,
        date: new Date(selectedDate).toISOString(),
        status,
        location: {
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
        },
      };

      const response = await attendanceAPI.mark(attendanceData);


      if (response.success) {
        Alert.alert(
          'Success',
          `Attendance marked as ${status} for ${employee.name}`,
          [
            {
              text: 'OK',
             onPress: () => {
  // go back to the root stack screen (MainTabs)
  navigation.popToTop();
}
            },
          ]
        );
      }
    } catch (error) {
      const errorMessage = handleAPIError(error);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formattedDate = formatDate(selectedDate);

  return (
    <View style={styles.screen}>
      {/* soft top accent */}
      <View style={styles.headerAccent} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top card: context */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Mark Attendance</Text>
            <Text style={styles.headerSubtitle}>Review details and confirm</Text>
          </View>
          <View style={styles.headerChip}>
            <Ionicons name="today-outline" size={18} color="#fff" />
            <Text style={styles.headerChipText}>Session</Text>
          </View>
        </View>

        {/* Employee + date card */}
        <View style={styles.infoCard}>
          <View style={styles.employeeRow}>
            <View style={styles.employeeAvatar}>
              <Text style={styles.employeeAvatarText}>
                {employee?.name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeName}>{employee.name}</Text>
              <Text style={styles.employeeMeta}>
                ID: {employee.employeeId} • {employee.jobRole}
              </Text>
              <Text style={styles.employeeMeta}>{employee.department}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={18} color="#1976D2" />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.dateLabel}>For date</Text>
              <Text style={styles.dateValue}>{formattedDate}</Text>
            </View>
          </View>
        </View>

        {/* Status card */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Attendance status *</Text>
          <View style={styles.statusGrid}>
            {statusOptions.map((option) => {
              const selected = status === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusChip,
                    selected && {
                      backgroundColor: `${option.color}15`,
                      borderColor: option.color,
                    },
                  ]}
                  onPress={() => setStatus(option.value)}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <View
                    style={[
                      styles.statusIconWrapper,
                      selected && { backgroundColor: option.color },
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={18}
                      color={selected ? '#fff' : option.color}
                    />
                  </View>
                  <View style={styles.statusTextWrapper}>
                    <Text
                      style={[
                        styles.statusLabel,
                        selected && { color: option.color },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {selected && (
                      <Text style={styles.statusSubLabel}>Currently selected</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Location card */}
        <View style={styles.formCard}>
          <View style={styles.locationHeaderRow}>
            <Text style={styles.sectionTitle}>Location *</Text>
            <View style={styles.locationTag}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#1976D2" />
              <Text style={styles.locationTagText}>Geo-verified</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.baseLocationButton}
            onPress={useBaseLocation}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            <Ionicons name="navigate-outline" size={18} color="#1976D2" />
            <Text style={styles.baseLocationButtonText}>
              Use employee base location
            </Text>
          </TouchableOpacity>

          <View style={styles.locationRow}>
            <View style={styles.locationField}>
              <Text style={styles.label}>Latitude</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="compass-outline" size={16} color="#9E9E9E" />
                <TextInput
                  style={styles.input}
                  placeholder="10.0261"
                  placeholderTextColor="#B0BEC5"
                  value={location.latitude}
                  onChangeText={(text) => updateLocation('latitude', text)}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>
            </View>
            <View style={styles.locationField}>
              <Text style={styles.label}>Longitude</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="locate-outline" size={16} color="#9E9E9E" />
                <TextInput
                  style={styles.input}
                  placeholder="76.3125"
                  placeholderTextColor="#B0BEC5"
                  value={location.longitude}
                  onChangeText={(text) => updateLocation('longitude', text)}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>
            </View>
          </View>

          <Text style={styles.locationNote}>
            In production, these values should come from device GPS or a secure
            location service.
          </Text>
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="finger-print-outline" size={20} color="#2E7D32" />
          <Text style={styles.infoBannerText}>
            Backend automatically attaches the employee&apos;s fingerprint template
            to this attendance record and exposes it to Superadmin.
          </Text>
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Floating submit button */}
      <View style={styles.floatingFooter}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isLoading && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.95}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.submitContent}>
              <Ionicons name="checkmark-done" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Confirm & mark attendance</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F5F9',
  },
  headerAccent: {
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
    paddingTop: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  headerCard: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#E3F2FD',
    fontSize: 13,
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
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },

  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#BBDEFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  employeeAvatarText: {
    color: '#1976D2',
    fontSize: 20,
    fontWeight: '700',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263238',
  },
  employeeMeta: {
    fontSize: 13,
    color: '#607D8B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 12,
    color: '#78909C',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#263238',
    marginTop: 2,
  },

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#37474F',
    marginBottom: 14,
  },

  statusGrid: {
    flexDirection: 'column',
    gap: 10,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  statusIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  statusTextWrapper: {
    marginLeft: 10,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#37474F',
  },
  statusSubLabel: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 2,
  },

  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E3F2FD',
  },
  locationTagText: {
    marginLeft: 4,
    color: '#1976D2',
    fontSize: 11,
    fontWeight: '600',
  },

  baseLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  baseLocationButtonText: {
    color: '#1976D2',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },

  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  locationField: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#37474F',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 6,
    color: '#263238',
    fontSize: 14,
  },
  locationNote: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 8,
  },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: 16,
  },
  infoBannerText: {
    flex: 1,
    marginLeft: 8,
    color: '#2E7D32',
    fontSize: 12,
    lineHeight: 18,
  },

  floatingFooter: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 20 : 16,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default AttendanceMarkScreen;
