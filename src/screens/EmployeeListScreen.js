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
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { employeeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EmployeeListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      if (response.success) {
        setEmployees(response.employees);
        setFilteredEmployees(response.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      Alert.alert('Error', 'Failed to load employees. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchEmployees();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEmployees();
  }, []);

  // Search filter by name or ID
  useEffect(() => {
    const text = searchText.trim().toLowerCase();
    if (!text) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter(emp => {
      const name = emp.name?.toLowerCase() || '';
      const id = emp.employeeId?.toLowerCase() || '';
      return name.includes(text) || id.includes(text);
    });

    setFilteredEmployees(filtered);
  }, [searchText, employees]);

  const handleCreateEmployee = () => {
    navigation.navigate('EmployeeCreate');
  };

  const handleEmployeePress = (employee) => {
    navigation.navigate('AttendanceCalendar', {
      employee,
    });
  };

  const renderEmployeeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.employeeCard}
      onPress={() => handleEmployeePress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.employeeAvatar}>
        <Text style={styles.employeeAvatarText}>
          {item.name?.[0]?.toUpperCase() || '?'}
        </Text>
      </View>
      <View style={styles.employeeInfo}>
        <Text style={styles.employeeName}>{item.name}</Text>
        <Text style={styles.employeeMeta}>
          ID: {item.employeeId} • {item.department}
        </Text>
        <Text style={styles.employeeMeta}>{item.jobRole}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#B0BEC5" />
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={60} color="#B0BEC5" />
      <Text style={styles.emptyText}>No employees found</Text>
      <Text style={styles.emptySubtext}>
        {searchText.trim()
          ? 'Try a different name or ID'
          : 'Tap “New employee” to create your first record.'}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  const username = user?.username || 'User';
  const role = user?.role || 'admin';

  return (
    <View style={styles.screen}>
      <View style={styles.accentCircle} />

      {/* Top header with inline add button */}
      <View style={styles.headerCard}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Employees</Text>
          <Text style={styles.headerSubtitle}>
            Welcome, {username} • Role: {role}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCreateEmployee}
          activeOpacity={0.9}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search-outline" size={18} color="#90A4AE" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID"
            placeholderTextColor="#B0BEC5"
            value={searchText}
            onChangeText={setSearchText}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color="#B0BEC5" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Employee List */}
      <FlatList
        data={filteredEmployees}
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
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F5F9',
  },
  accentCircle: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#BBDEFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F5F9',
  },

  // Top header with add button
  headerCard: {
    marginHorizontal: 26,
    marginTop: Platform.OS === 'ios' ? 40: 8,
    marginBottom: 6,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: '#E3F2FD',
    fontSize: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  addButtonText: {
    marginLeft: 4,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    marginRight: 6,
    fontSize: 13,
    color: '#263238',
    paddingVertical: 4,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  employeeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  employeeAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#263238',
  },
  employeeMeta: {
    fontSize: 12,
    color: '#607D8B',
    marginTop: 2,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default EmployeeListScreen;
