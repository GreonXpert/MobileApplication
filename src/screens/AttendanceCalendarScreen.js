// src/screens/AttendanceCalendarScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';

/**
 * Attendance Calendar Screen
 * 
 * Shows a calendar to select a date for marking attendance
 * Features:
 * - Calendar UI
 * - Date selection
 * - Navigate to mark attendance screen with selected date
 */
const AttendanceCalendarScreen = ({ route, navigation }) => {
  const { employee } = route.params;
  const [selectedDate, setSelectedDate] = useState('');

  /**
   * Handle date selection
   */
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  /**
   * Navigate to mark attendance screen
   */
  const handleContinue = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    navigation.navigate('AttendanceMark', {
      employee: employee,
      selectedDate: selectedDate,
    });
  };

  /**
   * Format marked dates for calendar
   */
  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: '#2196F3',
    },
  };

  return (
    <View style={styles.container}>
      {/* Employee Info */}
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{employee.name}</Text>
        <Text style={styles.employeeDetail}>ID: {employee.employeeId}</Text>
        <Text style={styles.employeeDetail}>Dept: {employee.department}</Text>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Select a date to mark attendance
        </Text>
      </View>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={markedDates}
          theme={{
            selectedDayBackgroundColor: '#2196F3',
            todayTextColor: '#2196F3',
            arrowColor: '#2196F3',
            monthTextColor: '#333',
            textMonthFontWeight: 'bold',
            textMonthFontSize: 16,
          }}
          // Don't allow selecting future dates
          maxDate={new Date().toISOString().split('T')[0]}
        />
      </View>

      {/* Selected Date Display */}
      {selectedDate && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateLabel}>Selected Date:</Text>
          <Text style={styles.selectedDateText}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
      )}

      {/* Continue Button */}
      <TouchableOpacity
        style={[
          styles.continueButton,
          !selectedDate && styles.continueButtonDisabled,
        ]}
        onPress={handleContinue}
        disabled={!selectedDate}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  employeeInfo: {
    backgroundColor: '#2196F3',
    padding: 15,
  },
  employeeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  employeeDetail: {
    fontSize: 14,
    color: '#fff',
    marginTop: 2,
  },
  instructionContainer: {
    backgroundColor: '#E3F2FD',
    padding: 15,
  },
  instructionText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDateContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  continueButton: {
    backgroundColor: '#2196F3',
    margin: 15,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: '#999',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AttendanceCalendarScreen;
