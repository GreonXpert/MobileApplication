// src/screens/EmployeeCreateScreen.js
// UPDATED VERSION with MFS110 RDService integration

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { employeeAPI } from '../services/api';
import { handleAPIError } from '../utils/errorHandler';

// ✅ IMPORT MFS110 SERVICE
import MFS110Service, {
  enrollFingerprint,
  showSetupInstructions,
  validatePrerequisites,
} from '../services/mfs110Service';

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
  const [isCapturing, setIsCapturing] = useState(false); // ✅ NEW
  const [captureStatus, setCaptureStatus] = useState(''); // ✅ NEW
  const [fingerprintQuality, setFingerprintQuality] = useState(null); // ✅ NEW

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ============================================
  // ✅ NEW: MFS110 FINGERPRINT CAPTURE
  // ============================================

  const handleFingerprintCapture = async () => {
    try {
      setIsCapturing(true);
      setCaptureStatus('Initializing...');
      setFingerprintQuality(null);

      // Step 1: Validate prerequisites
      setCaptureStatus('Checking device...');
      const validation = await validatePrerequisites();

      if (!validation.valid) {
        Alert.alert(
          'Setup Required',
          validation.message,
          [
            {
              text: 'View Instructions',
              onPress: () => showSetupInstructions(),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        setIsCapturing(false);
        setCaptureStatus('');
        return;
      }

      // Step 2: Capture fingerprint
      setCaptureStatus('Place finger on scanner...');

      const result = await enrollFingerprint({
        onProgress: (message) => {
          setCaptureStatus(message);
        },
        onSuccess: (data) => {
          console.log('[Fingerprint Captured]', {
            quality: data.quality,
            templateLength: data.template?.length,
          });
        },
        onError: (error) => {
          console.error('[Fingerprint Error]', error);
        },
      });

      if (result.success) {
        // Update form with captured template
        updateField('fingerprintTemplate', result.template);
        setFingerprintQuality(result.quality);
        setCaptureStatus('Capture successful ✓');

        Alert.alert(
          'Success',
          `Fingerprint captured successfully!\n\n` +
            (result.quality ? `Quality Score: ${result.quality}/100` : 'Quality data not available'),
          [{ text: 'OK' }]
        );
      } else {
        setCaptureStatus('Capture failed');
        Alert.alert('Capture Failed', result.error || 'Unknown error', [{ text: 'Retry' }]);
      }
    } catch (error) {
      console.error('[Capture Error]', error);
      setCaptureStatus('Error occurred');
      Alert.alert('Error', error.message || 'Failed to capture fingerprint');
    } finally {
      setIsCapturing(false);
    }
  };

  // ============================================
  // SUBMIT EMPLOYEE
  // ============================================

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Employee name is required');
      return;
    }
    if (!formData.employeeId.trim()) {
      Alert.alert('Error', 'Employee ID is required');
      return;
    }
    if (!formData.jobRole.trim()) {
      Alert.alert('Error', 'Job role is required');
      return;
    }
    if (!formData.department.trim()) {
      Alert.alert('Error', 'Department is required');
      return;
    }
    if (!formData.fingerprintTemplate.trim()) {
      Alert.alert('Error', 'Fingerprint template is required. Please capture fingerprint.');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      Alert.alert('Error', 'Base location is required');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        employeeId: formData.employeeId.trim(),
        jobRole: formData.jobRole.trim(),
        department: formData.department.trim(),
        fingerprintTemplate: formData.fingerprintTemplate,
        baseLocation: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        },
      };

      const response = await employeeAPI.create(payload);

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

  const initials =
    formData.name.trim() !== ''
      ? formData.name
          .split(' ')
          .map((p) => p[0])
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
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>New employee</Text>
            <Text style={styles.headerSubtitle}>
              Fill in basic info, fingerprint and base location.
            </Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {/* Basic Info Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Basic information</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Full name *</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#9E9E9E" />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#B0BEC5"
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
                editable={!isLoading && !isCapturing}
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
                  editable={!isLoading && !isCapturing}
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
                  editable={!isLoading && !isCapturing}
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
                editable={!isLoading && !isCapturing}
              />
            </View>
          </View>
        </View>

        {/* ✅ FINGERPRINT SECTION - UPDATED */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Fingerprint template *</Text>
            <View style={styles.sectionTag}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#1976D2" />
              <Text style={styles.sectionTagText}>MFS110 RDService</Text>
            </View>
          </View>

          <Text style={styles.sdkNote}>
            Captures biometric data using MFS110 L1 RDService via USB OTG connection.
          </Text>

          {/* Capture Button */}
          <TouchableOpacity
            style={[
              styles.captureButton,
              isCapturing && styles.captureButtonDisabled,
              formData.fingerprintTemplate && styles.captureButtonSuccess,
            ]}
            onPress={handleFingerprintCapture}
            disabled={isLoading || isCapturing}
            activeOpacity={0.9}
          >
            {isCapturing ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.captureButtonText}>{captureStatus}</Text>
              </>
            ) : (
              <>
                <Ionicons
                  name={formData.fingerprintTemplate ? 'checkmark-circle' : 'finger-print-outline'}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.captureButtonText}>
                  {formData.fingerprintTemplate ? 'Recapture fingerprint' : 'Capture fingerprint'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Quality Indicator */}
          {fingerprintQuality !== null && (
            <View style={styles.qualityIndicator}>
              <Text style={styles.qualityLabel}>Quality Score:</Text>
              <View
                style={[
                  styles.qualityBadge,
                  fingerprintQuality >= 70
                    ? styles.qualityGood
                    : fingerprintQuality >= 40
                    ? styles.qualityMedium
                    : styles.qualityPoor,
                ]}
              >
                <Text style={styles.qualityValue}>{fingerprintQuality}/100</Text>
              </View>
            </View>
          )}

          {/* Template Preview (truncated) */}
          <View style={styles.field}>
            <View style={styles.inputWrapperMultiline}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Fingerprint template will appear here after capture"
                placeholderTextColor="#B0BEC5"
                value={
                  formData.fingerprintTemplate
                    ? `${formData.fingerprintTemplate.substring(0, 100)}...\n(${formData.fingerprintTemplate.length} characters)`
                    : ''
                }
                editable={false}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>

        {/* Base Location Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Base location *</Text>
          <Text style={styles.sectionHint}>Used as default location when marking attendance.</Text>

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
                  editable={!isLoading && !isCapturing}
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
                  editable={!isLoading && !isCapturing}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color="#1976D2" />
          <Text style={styles.infoText}>
            Ensure MFS110 L1 RDService app is installed and the scanner is connected via OTG before
            capturing fingerprint.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading || isCapturing}
        >
          <View style={styles.submitContent}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
            )}
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Creating...' : 'Create employee'}
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ============================================
// STYLES (keeping existing styles + new ones)
// ============================================

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  accentCircle: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#E3F2FD',
    opacity: 0.5,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A237E',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#757575',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263238',
    flex: 1,
  },
  sectionTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sectionTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1976D2',
    marginLeft: 4,
  },
  sectionHint: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 12,
  },
  field: {
    marginBottom: 12,
  },
  dualRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#546E7A',
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
    paddingHorizontal: 12,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  captureButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  captureButtonSuccess: {
    backgroundColor: '#00897B',
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  qualityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  qualityLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#546E7A',
    marginRight: 8,
  },
  qualityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  qualityGood: {
    backgroundColor: '#C8E6C9',
  },
  qualityMedium: {
    backgroundColor: '#FFE082',
  },
  qualityPoor: {
    backgroundColor: '#FFCDD2',
  },
  qualityValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#263238',
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