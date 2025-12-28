// src/navigation/BottomTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';

import DashboardScreen from '../screens/DashboardScreen';
import AdminDashboard from '../screens/AdminDashboard';  // 👈 ADD THIS
import EmployeeListScreen from '../screens/EmployeeListScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loaderText}>Loading...</Text>
      </View>
    );
  }

  const userRole = React.useMemo(() => {
    if (!user || !user.role) return 'admin';
    if (typeof user.role !== 'string') return 'admin';
    return user.role.toLowerCase().trim();
  }, [user]);

  const isSuperadmin = userRole === 'superadmin';  // 👈 ADD THIS

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const routeName = route?.name || 'Unknown';

        return {
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = 'ellipse-outline';

            if (routeName === 'Dashboard') {
              iconName = focused ? 'grid' : 'grid-outline';
            } else if (routeName === 'Employees') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (routeName === 'Profile') {
              iconName = focused ? 'person-circle' : 'person-circle-outline';
            }

            return (
              <View style={styles.iconWrapper}>
                {focused && <View style={styles.iconDot} />}
                <Ionicons name={iconName} size={size} color={color} />
              </View>
            );
          },

          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#9E9E9E',

          tabBarStyle: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 24 : 18,
            left: 16,
            right: 16,
            height: Platform.OS === 'ios' ? 78 : 70,
            borderRadius: 24,
            borderTopWidth: 0,
            backgroundColor: 'transparent',
            elevation: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
            overflow: 'hidden',
          },

          tabBarBackground: () => (
            <BlurView
              tint={Platform.OS === 'ios' ? 'light' : 'default'}
              intensity={Platform.OS === 'ios' ? 100 : 95}
              style={StyleSheet.absoluteFill}
            />
          ),

          headerShown: false,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginBottom: Platform.OS === 'ios' ? 0 : 8,
          },
        };
      }}
    >
      {/* 👇 UPDATE THIS SECTION */}
      <Tab.Screen
        name="Dashboard"
        component={isSuperadmin ? DashboardScreen : AdminDashboard}
        options={{
          title: 'Dashboard',
        }}
      />

      <Tab.Screen
        name="Employees"
        component={EmployeeListScreen}
        options={{
          title: 'Employees',
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F5F9',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDot: {
    position: 'absolute',
    top: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2196F3',
  },
});

export default BottomTabNavigator;