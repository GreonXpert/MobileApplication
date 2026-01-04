// screens/EnrollFingerprintScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { captureFingerprint } from '../services/fingerprintService';

const EnrollFingerprintScreen = ({ route, navigation }) => {
  const { employeeId, employeeName } = route.params;
  const [loading, setLoading] = useState(false);
  const [fingerprintData, setFingerprintData] = useState(null);

  const handleCaptureFingerprint = async () => {
    setLoading(true);
    try {
      const result = await captureFingerprint();
      
      if (result.success) {
        setFingerprintData(result.data);
        Alert.alert('Success', 'Fingerprint captured successfully!');
      } else {
        Alert.alert('Error', 'Failed to capture fingerprint: ' + result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to fingerprint scanner');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFingerprint = async () => {
    if (!fingerprintData) {
      Alert.alert('Error', 'Please capture fingerprint first');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const API_URL = 'http://YOUR_SERVER_IP:5000'; // Replace with your backend IP
      
      const response = await axios.post(
        `${API_URL}/api/employees/${employeeId}/fingerprint`,
        {
          fingerprintTemplate: fingerprintData.PidData,
          quality: fingerprintData.Resp?.qScore || 0
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      Alert.alert('Success', 'Fingerprint enrolled successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save fingerprint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enroll Fingerprint</Text>
      <Text style={styles.subtitle}>Employee: {employeeName}</Text>

      <TouchableOpacity
        style={[styles.button, styles.captureButton]}
        onPress={handleCaptureFingerprint}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Capturing...' : 'Capture Fingerprint'}
        </Text>
      </TouchableOpacity>

      {fingerprintData && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>✓ Fingerprint Captured</Text>
          <Text style={styles.qualityText}>
            Quality: {fingerprintData.Resp?.qScore || 'N/A'}
          </Text>
        </View>
      )}

      {fingerprintData && (
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSaveFingerprint}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : 'Save Fingerprint'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  captureButton: {
    backgroundColor: '#2196F3',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    backgroundColor: '#E8F5E9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  statusText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: 'bold',
  },
  qualityText: {
    color: '#666',
    marginTop: 5,
  },
});

export default EnrollFingerprintScreen;