// src/screens/AttendanceCalendarScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';

const AttendanceCalendarScreen = ({ route, navigation }) => {
  const { employee } = route.params;
  const [selectedDate, setSelectedDate] = useState('');

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleContinue = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    navigation.navigate('AttendanceMark', {
      employee,
      selectedDate,
    });
  };

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: '#2196F3',
      selectedTextColor: '#fff',
      dotColor: '#FFC107',
      marked: true,
    },
  };

  const formattedSelected =
    selectedDate &&
    new Date(selectedDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <View style={styles.container}>
      {/* Top gradient-like header */}
      <View style={styles.headerCard}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Mark Attendance</Text>
          <Text style={styles.headerSubtitle}>Pick a date for this employee</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            {selectedDate ? 'Ready' : 'Pending'}
          </Text>
        </View>
      </View>

      {/* Employee Info card */}
      <View style={styles.employeeCard}>
        <View style={styles.employeeAvatar}>
          <Text style={styles.employeeAvatarText}>
            {employee?.name?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{employee.name}</Text>
          <Text style={styles.employeeDetail}>ID: {employee.employeeId}</Text>
          <Text style={styles.employeeDetail}>Dept: {employee.department}</Text>
        </View>
      </View>

      {/* Instruction */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionTitle}>Select a date</Text>
        <Text style={styles.instructionText}>
          You can only mark attendance for today or past dates.
        </Text>
      </View>

      {/* Calendar card */}
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={markedDates}
          maxDate={new Date().toISOString().split('T')[0]}
          enableSwipeMonths
          theme={{
            backgroundColor: '#FFFFFF',
            calendarBackground: '#FFFFFF',
            textSectionTitleColor: '#90A4AE',
            selectedDayBackgroundColor: '#2196F3',
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: '#2196F3',
            dayTextColor: '#263238',
            textDisabledColor: '#B0BEC5',
            arrowColor: '#2196F3',
            monthTextColor: '#263238',
            textMonthFontWeight: '700',
            textMonthFontSize: 18,
            textDayFontSize: 14,
            textDayHeaderFontSize: 12,
            'stylesheet.calendar.header': {
              week: {
                marginTop: 8,
                flexDirection: 'row',
                justifyContent: 'space-between',
              },
            },
          }}
          style={styles.calendar}
        />
      </View>

      {/* Selected Date pill */}
      {selectedDate && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateLabel}>Selected date</Text>
          <Text style={styles.selectedDateText}>{formattedSelected}</Text>
        </View>
      )}

      {/* Bottom sticky button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedDate && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedDate}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>
            {selectedDate ? 'Continue to Mark Attendance' : 'Select a date to continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F5F9',
    paddingTop: Platform.OS === 'ios' ? 8 : 0,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    overflow: 'hidden',
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
  headerBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1976D2',
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  employeeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BBDEFB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  employeeAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1976D2',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263238',
  },
  employeeDetail: {
    fontSize: 13,
    color: '#607D8B',
    marginTop: 2,
  },
  instructionContainer: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#37474F',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 13,
    color: '#78909C',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  calendar: {
    borderRadius: 16,
  },
  selectedDateContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#E3F2FD',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDateLabel: {
    fontSize: 13,
    color: '#1976D2',
    marginRight: 8,
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D47A1',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 8,
  },
  continueButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButtonDisabled: {
    backgroundColor: '#B0BEC5',
    shadowOpacity: 0.05,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default AttendanceCalendarScreen;
