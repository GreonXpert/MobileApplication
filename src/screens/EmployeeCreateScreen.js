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
import { Ionicons } from '@expo/vector-icons';
import { employeeAPI, handleAPIError } from '../services/api';

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

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

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

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

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

      const response = await employeeAPI.create(employeeData);

      if (response.success) {
        Alert.alert('Success', 'Employee created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      const errorMessage = handleAPIError(error);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFingerprintCapture = () => {
    Alert.alert(
      'SDK Integration Required',
      'In production, this button would:\n\n' +
        '1. Initialize MFS100/Precision PB100 SDK\n' +
        '2. Capture fingerprint from scanner\n' +
        '3. Get template string from SDK\n' +
        '4. Populate the template field\n\n' +
        'For now, a dummy template will be used.',
      [{ text: 'OK' }]
    );

    const dummyTemplate = `DUMMY_TEMPLATE_${Date.now()}`;
    updateField('fingerprintTemplate', dummyTemplate);
  };

  const initials =
    formData.name.trim() !== ''
      ? formData.name
          .split(' ')
          .map(p => p[0])
          .join('')
          .toUpperCase()
      : 'EMP';

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.accentCircle} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header / context */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>New employee</Text>
            <Text style={styles.headerSubtitle}>
              Fill in basic info, fingerprint and base location.
            </Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
          </View>
        </View>

        {/* Persona preview */}
        <View style={styles.personCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.personInfo}>
            <Text style={styles.personNamePreview}>
              {formData.name.trim() || 'Employee name'}
            </Text>
            <Text style={styles.personMetaPreview}>
              {formData.employeeId.trim() || 'Employee ID'} •{' '}
              {formData.department.trim() || 'Department'}
            </Text>
            <Text style={styles.personMetaPreview}>
              {formData.jobRole.trim() || 'Job role'}
            </Text>
          </View>
        </View>

        {/* Section: basic info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Basic information</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Name *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#9E9E9E" />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#B0BEC5"
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.dualRow}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Employee ID *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="id-card-outline" size={18} color="#9E9E9E" />
                <TextInput
                  style={styles.input}
                  placeholder="EMP001"
                  placeholderTextColor="#B0BEC5"
                  value={formData.employeeId}
                  onChangeText={(text) => updateField('employeeId', text)}
                  editable={!isLoading}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Department *</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="business-outline" size={18} color="#9E9E9E" />
                <TextInput
                  style={styles.input}
                  placeholder="IT, HR, Finance..."
                  placeholderTextColor="#B0BEC5"
                  value={formData.department}
                  onChangeText={(text) => updateField('department', text)}
                  editable={!isLoading}
                />
              </View>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Job role *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="briefcase-outline" size={18} color="#9E9E9E" />
              <TextInput
                style={styles.input}
                placeholder="Software Engineer, Manager..."
                placeholderTextColor="#B0BEC5"
                value={formData.jobRole}
                onChangeText={(text) => updateField('jobRole', text)}
                editable={!isLoading}
              />
            </View>
          </View>
        </View>

        {/* Section: fingerprint */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Fingerprint template *</Text>
            <View style={styles.sectionTag}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#1976D2" />
              <Text style={styles.sectionTagText}>SDK integration</Text>
            </View>
          </View>

          <Text style={styles.sdkNote}>
            In production, this will be captured via MFS100 / Precision PB100 SDK
            instead of manual entry.
          </Text>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleFingerprintCapture}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            <Ionicons name="finger-print-outline" size={20} color="#FFFFFF" />
            <Text style={styles.captureButtonText}>Capture fingerprint (demo)</Text>
          </TouchableOpacity>

          <View style={styles.field}>
            <View style={styles.inputWrapperMultiline}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Fingerprint template will appear here"
                placeholderTextColor="#B0BEC5"
                value={formData.fingerprintTemplate}
                onChangeText={(text) => updateField('fingerprintTemplate', text)}
                editable={!isLoading}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        {/* Section: base location */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Base location *</Text>
          <Text style={styles.sectionHint}>
            Used as default location when marking attendance.
          </Text>

          <View style={styles.dualRow}>
            <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Latitude</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="navigate-outline" size={18} color="#9E9E9E" />
                <TextInput
                  style={styles.input}
                  placeholder="10.0261"
                  placeholderTextColor="#B0BEC5"
                  value={formData.latitude}
                  onChangeText={(text) => updateField('latitude', text)}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Longitude</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="locate-outline" size={18} color="#9E9E9E" />
                <TextInput
                  style={styles.input}
                  placeholder="76.3125"
                  placeholderTextColor="#B0BEC5"
                  value={formData.longitude}
                  onChangeText={(text) => updateField('longitude', text)}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color="#1976D2" />
          <Text style={styles.infoText}>
            You can edit employee details later from the employee profile screen.
          </Text>
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.95}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.submitContent}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Create employee</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#BBDEFB',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },

  headerCard: {
    backgroundColor: '#2196F3',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#E3F2FD',
  },
  headerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1976D2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#BBDEFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#1976D2',
    fontSize: 18,
    fontWeight: '700',
  },
  personInfo: {
    flex: 1,
  },
  personNamePreview: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263238',
  },
  personMetaPreview: {
    fontSize: 12,
    color: '#607D8B',
    marginTop: 2,
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#37474F',
    marginBottom: 6,
  },
  sectionHint: {
    fontSize: 12,
    color: '#78909C',
    marginBottom: 4,
  },
  sectionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E3F2FD',
  },
  sectionTagText: {
    marginLeft: 4,
    color: '#1976D2',
    fontSize: 11,
    fontWeight: '600',
  },

  field: {
    marginBottom: 12,
  },
  dualRow: {
    flexDirection: 'row',
    marginBottom: 4,
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
  inputWrapperMultiline: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    fontSize: 14,
    color: '#263238',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  sdkNote: {
    fontSize: 12,
    color: '#FF9800',
    marginBottom: 10,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    marginTop: 4,
    marginBottom: 14,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 18,
  },

  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
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
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default EmployeeCreateScreen;
