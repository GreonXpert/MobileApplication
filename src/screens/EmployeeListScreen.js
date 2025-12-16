// src/screens/EmployeeListScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { employeeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Employee List Screen
 * 
 * Displays all employees and allows:
 * - Viewing employee list
 * - Creating new employees
 * - Selecting employee to mark attendance
 * - Pull-to-refresh
 * - Logout
 */
const EmployeeListScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Fetch employees from backend
   */
  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      if (response.success) {
        setEmployees(response.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      Alert.alert('Error', 'Failed to load employees. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Load employees on screen focus
   */
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEmployees();
    });

    return unsubscribe;
  }, [navigation]);

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEmployees();
  }, []);

  /**
   * Navigate to create employee screen
   */
  const handleCreateEmployee = () => {
    navigation.navigate('EmployeeCreate');
  };

  /**
   * Navigate to attendance calendar for selected employee
   */
  const handleEmployeePress = (employee) => {
    navigation.navigate('AttendanceCalendar', {
      employee: employee,
    });
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
          },
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * Render employee item
   */
  const renderEmployeeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.employeeCard}
      onPress={() => handleEmployeePress(item)}
    >
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.name}</Text>
        <Text style={styles.employeeDetail}>ID: {item.employeeId}</Text>
        <Text style={styles.employeeDetail}>Role: {item.jobRole}</Text>
        <Text style={styles.employeeDetail}>Dept: {item.department}</Text>
      </View>
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  /**
   * Render empty list message
   */
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No employees found</Text>
      <Text style={styles.emptySubtext}>
        Tap the + button to create your first employee
      </Text>
    </View>
  );

  // Set header buttons
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* User Info Header */}
      <View style={styles.userInfo}>
        <Text style={styles.welcomeText}>Welcome, {user?.username}!</Text>
        <Text style={styles.roleText}>Role: {user?.role}</Text>
      </View>

      {/* Employee List */}
      <FlatList
        data={employees}
        renderItem={renderEmployeeItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
          />
        }
        ListEmptyComponent={renderEmptyList}
      />

      {/* Floating Action Button for Create Employee */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateEmployee}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    backgroundColor: '#2196F3',
    padding: 15,
    paddingBottom: 20,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roleText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
  },
  listContent: {
    padding: 15,
    paddingBottom: 80,
  },
  employeeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  employeeDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  arrowContainer: {
    marginLeft: 10,
  },
  arrow: {
    fontSize: 30,
    color: '#2196F3',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  fabText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginRight: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmployeeListScreen;
