// src/navigation/BottomTabNavigator.js - FULLY FIXED WITH ERROR HANDLING
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

// Import screens with error boundaries
import DashboardScreen from '../screens/DashboardScreen';
import EmployeeListScreen from '../screens/EmployeeListScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

/**
 * Bottom Tab Navigator
 * Main navigation after login with tabs for:
 * - Dashboard (attendance overview)
 * - Employees (list and management)
 * - Profile (user settings and logout)
 */
const BottomTabNavigator = () => {
  const { user } = useAuth();

  // ✅ Debug logging
  console.log('🔷 BottomTabNavigator rendering with user:', JSON.stringify(user, null, 2));

  // ✅ Safety check - ensure user exists
  if (!user) {
    console.warn('⚠️ BottomTabNavigator: No user found!');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        // ✅ Debug logging for routes
        console.log('🔷 Tab screenOptions for route:', route.name);
        
        return {
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            // ✅ Safe route name checking
            const routeName = route?.name || '';

            if (routeName === 'Dashboard') {
              iconName = focused ? 'grid' : 'grid-outline';
            } else if (routeName === 'Employees') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (routeName === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              // ✅ Fallback icon
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#757575',
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 88 : 60,
            paddingBottom: Platform.OS === 'ios' ? 20 : 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: '#E0E0E0',
            backgroundColor: '#FFFFFF',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#2196F3',
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        };
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Employees"
        component={EmployeeListScreen}
        options={{
          title: 'Employees',
          tabBarLabel: 'Employees',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;