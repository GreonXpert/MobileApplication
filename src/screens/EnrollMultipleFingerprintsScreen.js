// src/screens/EnrollMultipleFingerprintsScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import { enrollFingerprint } from '../services/mfs110Service';
import { employeeAPI } from '../services/api';

const FINGER_OPTIONS = [
  { index: 0, name: 'RIGHT_THUMB', label: 'Right Thumb' },
  { index: 1, name: 'RIGHT_INDEX', label: 'Right Index' },
  { index: 2, name: 'RIGHT_MIDDLE', label: 'Right Middle' },
  { index: 3, name: 'RIGHT_RING', label: 'Right Ring' },
  { index: 4, name: 'RIGHT_PINKY', label: 'Right Pinky' },
  { index: 5, name: 'LEFT_THUMB', label: 'Left Thumb' },
  { index: 6, name: 'LEFT_INDEX', label: 'Left Index' },
  { index: 7, name: 'LEFT_MIDDLE', label: 'Left Middle' },
  { index: 8, name: 'LEFT_RING', label: 'Left Ring' },
  { index: 9, name: 'LEFT_PINKY', label: 'Left Pinky' },
];

export default function EnrollMultipleFingerprintsScreen({ route, navigation }) {
  const { employeeId, employee } = route.params;
  const [enrolledFingers, setEnrolledFingers] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleEnrollFinger = async (finger) => {
    setIsCapturing(true);
    
    try {
      const result = await enrollFingerprint({
        onProgress: (message) => console.log(message),
      });

      if (result.success) {
        // Call the fingerprint enrollment API
        const response = await employeeAPI.enrollFingerprint(employeeId, {
          templateBase64: result.template,
          fingerIndex: finger.index,
          fingerName: finger.name,
          quality: result.quality,
          format: 'ISO_19794_2',
          deviceInfo: {
            vendor: 'Mantra',
            model: 'MFS110',
          },
        });

        if (response.success) {
          setEnrolledFingers([...enrolledFingers, finger.index]);
          Alert.alert('Success', `${finger.label} enrolled successfully!`);
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to enroll fingerprint');
    } finally {
      setIsCapturing(false);
    }
  };

  const renderFingerOption = ({ item }) => {
    const isEnrolled = enrolledFingers.includes(item.index);
    
    return (
      <TouchableOpacity
        style={[
          styles.fingerButton,
          isEnrolled && styles.fingerButtonEnrolled,
        ]}
        onPress={() => handleEnrollFinger(item)}
        disabled={isCapturing || isEnrolled}
      >
        <Text style={styles.fingerLabel}>{item.label}</Text>
        {isEnrolled && <Text style={styles.enrolledBadge}>✓ Enrolled</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enroll Fingerprints</Text>
      <Text style={styles.subtitle}>Employee: {employee?.name}</Text>
      
      <FlatList
        data={FINGER_OPTIONS}
        renderItem={renderFingerOption}
        keyExtractor={(item) => item.index.toString()}
        numColumns={2}
      />
    </View>
  );
}