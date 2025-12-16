// src/navigation/AppNavigator.js - UPDATED VERSION
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import BottomTabNavigator from './BottomTabNavigator';
import EmployeeCreateScreen from '../screens/EmployeeCreateScreen';
import AttendanceCalendarScreen from '../screens/AttendanceCalendarScreen';
import AttendanceMarkScreen from '../screens/AttendanceMarkScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import DailyAttendanceScreen from '../screens/DailyAttendanceScreen';
import EmployeeDetailScreen from '../screens/EmployeeDetailScreen';

// Import auth context
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

/**
 * Auth Stack - Screens accessible before login
 */
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Main Stack - Screens accessible after login
 * Now uses BottomTabNavigator as the main screen
 */
const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Bottom Tab Navigator as main screen */}
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{
          headerShown: false, // Tabs have their own headers
        }}
      />
      
      {/* Additional screens that can be accessed from tabs */}
      <Stack.Screen
        name="EmployeeCreate"
        component={EmployeeCreateScreen}
        options={{
          title: 'Create Employee',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="EmployeeDetail"
        component={EmployeeDetailScreen}
        options={{
          title: 'Employee Details',
        }}
      />
      <Stack.Screen
        name="AttendanceCalendar"
        component={AttendanceCalendarScreen}
        options={{
          title: 'Select Date',
        }}
      />
      <Stack.Screen
        name="AttendanceMark"
        component={AttendanceMarkScreen}
        options={{
          title: 'Mark Attendance',
        }}
      />
      <Stack.Screen
        name="AttendanceHistory"
        component={AttendanceHistoryScreen}
        options={{
          title: 'Attendance History',
        }}
      />
      <Stack.Screen
        name="DailyAttendance"
        component={DailyAttendanceScreen}
        options={{
          title: 'Daily Attendance',
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * App Navigator - Manages navigation based on auth state
 */
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default AppNavigator;