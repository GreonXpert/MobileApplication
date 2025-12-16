// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import EmployeeListScreen from '../screens/EmployeeListScreen';
import EmployeeCreateScreen from '../screens/EmployeeCreateScreen';
import AttendanceCalendarScreen from '../screens/AttendanceCalendarScreen';
import AttendanceMarkScreen from '../screens/AttendanceMarkScreen';

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
          headerShown: false, // Hide header on login screen
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Main Stack - Screens accessible after login
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
      <Stack.Screen
        name="EmployeeList"
        component={EmployeeListScreen}
        options={{
          title: 'Employees',
          headerLeft: null, // Disable back button on main screen
        }}
      />
      <Stack.Screen
        name="EmployeeCreate"
        component={EmployeeCreateScreen}
        options={{
          title: 'Create Employee',
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
