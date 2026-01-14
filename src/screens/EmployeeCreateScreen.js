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
import { employeeAPI } from '../services/api';
import { handleAPIError } from '../utils/errorHandler';

// ✅ IMPORT MFS110 SERVICE
import {
  enrollFingerprint,
  validatePrerequisites,
  showSetupInstructions,
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
  
  // ✅ NEW: Fingerprint capture states
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStatus, setCaptureStatus] = useState('');
  const [fingerprintQuality, setFingerprintQuality] = useState(null);

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
      Alert.alert('Validation Error', 'Please capture fingerprint');
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

  // ✅ NEW: REAL FINGERPRINT CAPTURE FUNCTION
  const handleFingerprintCapture = async () => {
    try {
      setIsCapturing(true);
      setCaptureStatus('Initializing...');
      setFingerprintQuality(null);

      // Step 1: Validate prerequisites
      console.log('🔍 Checking MFS110 prerequisites...');
      setCaptureStatus('Checking device...');
      
      const validation = await validatePrerequisites();

      if (!validation.valid) {
        console.log('❌ Prerequisites not met:', validation.message);
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

      console.log('✅ Prerequisites validated');

      // Step 2: Capture fingerprint
      setCaptureStatus('Place finger on scanner...');
      console.log('📸 Starting fingerprint capture...');

      const result = await enrollFingerprint({
        onProgress: (message) => {
          console.log('📊 Progress:', message);
          setCaptureStatus(message);
        },
        onSuccess: (data) => {
          console.log('✅ Fingerprint captured:', {
            quality: data.quality,
            templateLength: data.template?.length,
          });
        },
        onError: (error) => {
          console.error('❌ Capture error:', error);
        },
      });

      if (result.success) {
        // Update form with captured template
        updateField('fingerprintTemplate', result.template);
        setFingerprintQuality(result.quality);
        setCaptureStatus('Capture successful ✓');

        console.log('✅ Fingerprint saved to form');

        Alert.alert(
          'Success!',
          `Fingerprint captured successfully!\n\n` +
            (result.quality 
              ? `Quality Score: ${result.quality}/100\n` 
              : '') +
            `Template Size: ${result.template.length} characters`,
          [{ text: 'OK' }]
        );
      } else {
        throw new Error(result.error || 'Capture failed');
      }

    } catch (error) {
      console.error('❌ Fingerprint capture error:', error);
      setCaptureStatus('Capture failed');
      
      Alert.alert(
        'Capture Failed',
        error.message || 'Failed to capture fingerprint. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCapturing(false);
      // Keep status message visible for 3 seconds
      setTimeout(() => {
        if (formData.fingerprintTemplate) {
          setCaptureStatus('Ready ✓');
        } else {
          setCaptureStatus('');
        }
      }, 3000);
    }
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
        quality: fingerprintQuality, // ✅ Include quality score
        baseLocation: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        },
      };

      console.log('📤 Submitting employee data...');
      const response = await employeeAPI.create(employeeData);

      if (response.success) {
        console.log('✅ Employee created successfully');
        Alert.alert('Success', 'Employee created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error('❌ Employee creation error:', error);
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
        {/* Header */}
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

        {/* Preview */}
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

        {/* Basic Info Section */}
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

        {/* ✅ UPDATED: Fingerprint Section */}
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

          {/* ✅ Capture Button */}
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
                <Text style={styles.captureButtonText}>Capturing...</Text>
              </>
            ) : (
              <>
                <Ionicons 
                  name={formData.fingerprintTemplate ? "checkmark-circle" : "finger-print-outline"} 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.captureButtonText}>
                  {formData.fingerprintTemplate ? 'Re-capture fingerprint' : 'Capture fingerprint'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* ✅ Status Display */}
          {captureStatus && (
            <View style={styles.statusBanner}>
              <Ionicons 
                name={formData.fingerprintTemplate ? "checkmark-circle" : "information-circle"} 
                size={16} 
                color={formData.fingerprintTemplate ? "#4CAF50" : "#FF9800"} 
              />
              <Text style={[
                styles.statusText,
                formData.fingerprintTemplate && styles.statusTextSuccess
              ]}>
                {captureStatus}
              </Text>
            </View>
          )}

          {/* ✅ Quality Display */}
          {fingerprintQuality !== null && (
            <View style={styles.qualityBanner}>
              <Text style={styles.qualityLabel}>Quality Score:</Text>
              <Text style={styles.qualityValue}>{fingerprintQuality}/100</Text>
              <View style={[
                styles.qualityIndicator,
                { 
                  backgroundColor: fingerprintQuality >= 70 ? '#4CAF50' : 
                                  fingerprintQuality >= 50 ? '#FF9800' : '#F44336' 
                }
              ]} />
            </View>
          )}

          {/* ✅ Template Preview (Read-only) */}
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
    paddingHorizontal: 10,
  },

  sdkNote: {
    fontSize: 12,
    color: '#607D8B',
    marginBottom: 10,
  },
  
  // ✅ Updated capture button styles
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  captureButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  captureButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  // ✅ New status styles
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '500',
  },
  statusTextSuccess: {
    color: '#4CAF50',
  },

  // ✅ New quality styles
  qualityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  qualityLabel: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
  },
  qualityValue: {
    fontSize: 15,
    color: '#1B5E20',
    fontWeight: '700',
    marginLeft: 8,
  },
  qualityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
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