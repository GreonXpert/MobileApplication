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
} from 'react-native';
import { attendanceAPI, handleAPIError } from '../services/api';

/**
 * Attendance Mark Screen
 * 
 * Form to mark attendance for an employee with:
 * - Employee information (from previous screen)
 * - Selected date (from previous screen)
 * - Attendance status (PRESENT/ABSENT/LATE/HALF_DAY)
 * - Location (latitude, longitude)
 * 
 * Backend will automatically retrieve the employee's fingerprint
 * template and include it in the attendance record.
 */
const AttendanceMarkScreen = ({ route, navigation }) => {
  const { employee, selectedDate } = route.params;
  
  const [status, setStatus] = useState('PRESENT');
  const [location, setLocation] = useState({
    latitude: '',
    longitude: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Status options
  const statusOptions = [
    { value: 'PRESENT', label: 'Present', color: '#4CAF50' },
    { value: 'ABSENT', label: 'Absent', color: '#F44336' },
    { value: 'LATE', label: 'Late', color: '#FF9800' },
    { value: 'HALF_DAY', label: 'Half Day', color: '#2196F3' },
  ];

  /**
   * Update location field
   */
  const updateLocation = (field, value) => {
    setLocation(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Use employee's base location
   */
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

  /**
   * Validate form
   */
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

  /**
   * Handle attendance submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Prepare attendance data
      const attendanceData = {
        employeeId: employee.employeeId,
        date: new Date(selectedDate).toISOString(),
        status: status,
        location: {
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
        },
      };

      // Call API to mark attendance
      // Backend will automatically:
      // 1. Retrieve employee's fingerprint template
      // 2. Create attendance record with all details
      // 3. Make it available to Superadmin
      const response = await attendanceAPI.markAttendance(attendanceData);

      if (response.success) {
        Alert.alert(
          'Success',
          `Attendance marked as ${status} for ${employee.name}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to employee list
                navigation.navigate('EmployeeList');
              },
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

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Employee Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Employee:</Text>
        <Text style={styles.infoValue}>{employee.name}</Text>
        <Text style={styles.infoDetail}>ID: {employee.employeeId}</Text>
        <Text style={styles.infoDetail}>Role: {employee.jobRole}</Text>
        <Text style={styles.infoDetail}>Dept: {employee.department}</Text>
      </View>

      {/* Date Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Date:</Text>
        <Text style={styles.infoValue}>{formatDate(selectedDate)}</Text>
      </View>

      {/* Attendance Status Selection */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Attendance Status *</Text>
        <View style={styles.statusGrid}>
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.statusButton,
                status === option.value && {
                  backgroundColor: option.color,
                  borderColor: option.color,
                },
              ]}
              onPress={() => setStatus(option.value)}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.statusButtonText,
                  status === option.value && styles.statusButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Location Input */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Location *</Text>
        <TouchableOpacity
          style={styles.baseLocationButton}
          onPress={useBaseLocation}
          disabled={isLoading}
        >
          <Text style={styles.baseLocationButtonText}>
            📍 Use Employee Base Location
          </Text>
        </TouchableOpacity>
        
        <View style={styles.locationRow}>
          <View style={styles.locationField}>
            <Text style={styles.label}>Latitude</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 10.0261"
              value={location.latitude}
              onChangeText={(text) => updateLocation('latitude', text)}
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>
          <View style={styles.locationField}>
            <Text style={styles.label}>Longitude</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 76.3125"
              value={location.longitude}
              onChangeText={(text) => updateLocation('longitude', text)}
              keyboardType="numeric"
              editable={!isLoading}
            />
          </View>
        </View>
        
        <Text style={styles.locationNote}>
          💡 In production, use device GPS or location services
        </Text>
      </View>

      {/* Information Banner */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerText}>
          ℹ️ Backend will automatically retrieve and include the employee's
          fingerprint template in the attendance record. This data will be
          available to Superadmin in the attendance feed.
        </Text>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Mark Attendance</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  infoDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusButton: {
    width: '48%',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  statusButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  baseLocationButton: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  baseLocationButtonText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationField: {
    flex: 1,
    marginRight: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  locationNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 10,
    fontStyle: 'italic',
  },
  infoBanner: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#388E3C',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AttendanceMarkScreen;
