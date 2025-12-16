// src/screens/EmployeeCreateScreen.js
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { employeeAPI, handleAPIError } from '../services/api';

/**
 * Employee Create Screen
 * 
 * Form to create a new employee with:
 * - Name
 * - Employee ID
 * - Job Role
 * - Department
 * - Fingerprint Template (currently manual input)
 * - Base Location (latitude, longitude)
 * 
 * ⚠️ SDK INTEGRATION POINT:
 * In production, the fingerprintTemplate field should be populated
 * by capturing a fingerprint using MFS100/Precision PB100 SDK,
 * not through manual text input.
 */
const EmployeeCreateScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    jobRole: '',
    department: '',
    fingerprintTemplate: '',
    latitude: '',
    longitude: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Update form field
   */
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter employee name');
      return false;
    }
    if (!formData.employeeId.trim()) {
      Alert.alert('Validation Error', 'Please enter employee ID');
      return false;
    }
    if (!formData.jobRole.trim()) {
      Alert.alert('Validation Error', 'Please enter job role');
      return false;
    }
    if (!formData.department.trim()) {
      Alert.alert('Validation Error', 'Please enter department');
      return false;
    }
    if (!formData.fingerprintTemplate.trim()) {
      Alert.alert('Validation Error', 'Please enter fingerprint template');
      return false;
    }
    if (!formData.latitude.trim() || !formData.longitude.trim()) {
      Alert.alert('Validation Error', 'Please enter both latitude and longitude');
      return false;
    }

    // Validate latitude and longitude are numbers
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
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
   * Handle form submission
   */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Prepare employee data
      const employeeData = {
        name: formData.name.trim(),
        employeeId: formData.employeeId.trim(),
        jobRole: formData.jobRole.trim(),
        department: formData.department.trim(),
        fingerprintTemplate: formData.fingerprintTemplate.trim(),
        baseLocation: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        },
      };

      // Call API to create employee
      const response = await employeeAPI.create(employeeData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Employee created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
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
   * Simulate fingerprint capture (placeholder for SDK integration)
   */
  const handleFingerprintCapture = () => {
    Alert.alert(
      'SDK Integration Required',
      'In production, this button would:\n\n' +
      '1. Initialize MFS100/Precision PB100 SDK\n' +
      '2. Capture fingerprint from scanner\n' +
      '3. Get template string from SDK\n' +
      '4. Populate the template field\n\n' +
      'For now, you can manually enter a test template string.',
      [{ text: 'OK' }]
    );
    
    // For testing, set a dummy template
    // In production, this would be: const template = await FingerprintSDK.capture();
    const dummyTemplate = `DUMMY_TEMPLATE_${Date.now()}`;
    updateField('fingerprintTemplate', dummyTemplate);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            📝 Create a new employee profile
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., John Doe"
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              editable={!isLoading}
            />
          </View>

          {/* Employee ID */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Employee ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., EMP001"
              value={formData.employeeId}
              onChangeText={(text) => updateField('employeeId', text)}
              editable={!isLoading}
              autoCapitalize="characters"
            />
          </View>

          {/* Job Role */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Job Role *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Software Engineer"
              value={formData.jobRole}
              onChangeText={(text) => updateField('jobRole', text)}
              editable={!isLoading}
            />
          </View>

          {/* Department */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Department *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., IT"
              value={formData.department}
              onChangeText={(text) => updateField('department', text)}
              editable={!isLoading}
            />
          </View>

          {/* Fingerprint Template */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Fingerprint Template *</Text>
            <Text style={styles.sdkNote}>
              ⚠️ In production, use MFS100/Precision PB100 SDK to capture
            </Text>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleFingerprintCapture}
              disabled={isLoading}
            >
              <Text style={styles.captureButtonText}>
                📱 Capture Fingerprint (Demo)
              </Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Fingerprint template will appear here"
              value={formData.fingerprintTemplate}
              onChangeText={(text) => updateField('fingerprintTemplate', text)}
              editable={!isLoading}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Location */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Base Location *</Text>
            <View style={styles.locationRow}>
              <View style={styles.locationField}>
                <Text style={styles.subLabel}>Latitude</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 10.0261"
                  value={formData.latitude}
                  onChangeText={(text) => updateField('latitude', text)}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>
              <View style={styles.locationField}>
                <Text style={styles.subLabel}>Longitude</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 76.3125"
                  value={formData.longitude}
                  onChangeText={(text) => updateField('longitude', text)}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>
            </View>
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
              <Text style={styles.submitButtonText}>Create Employee</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  infoBanner: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  sdkNote: {
    fontSize: 12,
    color: '#FF9800',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  captureButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  captureButtonText: {
    color: '#fff',
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
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
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

export default EmployeeCreateScreen;
