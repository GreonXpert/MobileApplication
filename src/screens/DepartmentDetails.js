// src/screens/DepartmentDetails.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { employeeAPI, dashboardAPI } from '../services/api';

const DepartmentDetails = ({ route, navigation }) => {
  const { department } = route.params;
  
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentData();
  }, [department]);

  const fetchDepartmentData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch employees in this department
      const employeesResponse = await employeeAPI.getAll({ department });
      
      // Fetch department stats
      const statsResponse = await dashboardAPI.getDepartmentWiseStats();
      
      if (employeesResponse?.success) {
        setEmployees(employeesResponse.employees || []);
      }
      
      if (statsResponse?.success) {
        const deptStats = statsResponse.departments?.find(
          d => d.department === department
        );
        setStats(deptStats || null);
      }
    } catch (error) {
      console.error('Error fetching department data:', error);
      Alert.alert('Error', 'Failed to load department data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewEmployee = (employee) => {
    navigation.navigate('EmployeeDetails', { employeeId: employee._id });
  };

  const renderEmployeeCard = ({ item }) => (
    <TouchableOpacity
      style={styles.employeeCard}
      onPress={() => handleViewEmployee(item)}
      activeOpacity={0.9}
    >
      <View style={styles.employeeLeft}>
        <View style={styles.employeeAvatar}>
          <Text style={styles.employeeInitials}>
            {item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{item.name}</Text>
          <Text style={styles.employeeRole}>{item.jobRole}</Text>
          <Text style={styles.employeeId}>ID: {item.employeeId}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9E9E9E" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading department...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{department}</Text>
          <Text style={styles.headerSubtitle}>Department Details</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Stats Card */}
        {stats && (
          <View style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="people" size={24} color="#2196F3" />
                <Text style={styles.statValue}>{stats.totalEmployees}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                  {stats.presentToday}
                </Text>
                <Text style={styles.statLabel}>Present</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="close-circle" size={24} color="#F44336" />
                <Text style={[styles.statValue, { color: '#F44336' }]}>
                  {stats.absentToday}
                </Text>
                <Text style={styles.statLabel}>Absent</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="stats-chart" size={24} color="#FF9800" />
                <Text style={[styles.statValue, { color: '#FF9800' }]}>
                  {stats.attendanceRate}%
                </Text>
                <Text style={styles.statLabel}>Rate</Text>
              </View>
            </View>
          </View>
        )}

        {/* Employees List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Employees</Text>
            <Text style={styles.sectionCount}>{employees.length}</Text>
          </View>

          {employees.length > 0 ? (
            <FlatList
              data={employees}
              renderItem={renderEmployeeCard}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              contentContainerStyle={styles.employeeList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No employees in this department</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  employeeList: {
    gap: 12,
  },
  employeeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  employeeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  employeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  employeeInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2196F3',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  employeeRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  employeeId: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
});

export default DepartmentDetails;