// src/navigation/AppNavigator.js - UPDATED HEADER DESIGN
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import BottomTabNavigator from './BottomTabNavigator';
import EmployeeCreateScreen from '../screens/EmployeeCreateScreen';
import AttendanceCalendarScreen from '../screens/AttendanceCalendarScreen';
import AttendanceMarkScreen from '../screens/AttendanceMarkScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';
import DailyAttendanceScreen from '../screens/DailyAttendanceScreen';
import EmployeeDetailScreen from '../screens/EmployeeDetailScreen';
import EmployeeListScreen from '../screens/EmployeeListScreen';

// Auth context
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

/**
 * Shared stack header styles
 */
const defaultStackOptions = {
  headerStyle: {
    backgroundColor: '#2196F3',
  },
  headerTintColor: '#FFFFFF',
  headerTitleAlign: 'center',
  headerTitleStyle: {
    fontWeight: '700',
    fontSize: 16,
  },
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: '#F3F5F9',
  },
};

/**
 * Auth Stack
 */
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
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
 * Main Stack
 */
const MainStack = () => {
  return (
    <Stack.Navigator screenOptions={defaultStackOptions}>
      {/* Tabs as root */}
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{
          headerShown: false,
        }}
      />

      {/* Modals / pushed screens */}
      <Stack.Screen
        name="EmployeeCreate"
        component={EmployeeCreateScreen}
        options={{
          title: 'New employee',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="EmployeeListScreen"
        component={EmployeeListScreen}
        options={{
          title: 'EmployeeListScreen',
        }}
      />
      <Stack.Screen
        name="EmployeeDetail"
        component={EmployeeDetailScreen}
        options={{
          title: 'Employee profile',
        }}
      />
      <Stack.Screen
        name="AttendanceCalendar"
        component={AttendanceCalendarScreen}
        options={{
          title: 'Select attendance date',
        }}
      />
      <Stack.Screen
        name="AttendanceMark"
        component={AttendanceMarkScreen}
        options={{
          title: 'Mark attendance',
        }}
      />
      <Stack.Screen
        name="AttendanceHistory"
        component={AttendanceHistoryScreen}
        options={{
          title: 'Attendance history',
        }}
      />
      <Stack.Screen
        name="DailyAttendance"
        component={DailyAttendanceScreen}
        options={{
          title: 'Today\'s attendance',
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * App Navigator
 */
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

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
    backgroundColor: '#F3F5F9',
  },
});

export default AppNavigator;
