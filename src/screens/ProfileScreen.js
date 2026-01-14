// src/screens/ProfileScreen.js - UPDATED UI
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
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

  const renderMenuItem = (icon, title, subtitle, onPress, color = '#2196F3') => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.8}
      key={title}
    >
      <View style={[styles.menuIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#B0BEC5" />
    </TouchableOpacity>
  );

  const renderInfoCard = (label, value) => (
    <View style={styles.infoCard} key={label}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  const username = user?.username || 'User';
  const role = user?.role || 'ADMIN';
  const initials = username
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase();

  const permissionsText =
    role.toLowerCase() === 'superadmin'
      ? 'Full system access'
      : 'Employee & attendance management';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.accentCircle} />

      {/* Hero header */}
      <View style={styles.headerCard}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.userName}>{username}</Text>
            <Text style={styles.userMeta}>Role: {role}</Text>
          </View>
        </View>
        <View style={styles.roleBadge}>
          <Ionicons name="shield-checkmark-outline" size={14} color="#1976D2" />
          <Text style={styles.roleBadgeText}>
            {role.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Account information */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account information</Text>
        {renderInfoCard('Username', username)}
        {renderInfoCard('Role', role)}
        {renderInfoCard('Permissions', permissionsText)}
      </View>

      {/* Settings */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Settings & support</Text>
        {renderMenuItem(
          'notifications-outline',
          'Notifications',
          'Manage notification preferences',
          () =>
            Alert.alert(
              'Coming soon',
              'Notification settings will be available soon.'
            )
        )}
        {renderMenuItem(
          'help-circle-outline',
          'Help & support',
          'Get help with the app',
          () =>
            Alert.alert(
              'Help',
              'Contact your system administrator for support.'
            )
        )}
        {renderMenuItem(
          'information-circle-outline',
          'About',
          'App version 1.0.0',
          () =>
            Alert.alert(
              'About',
              'Auto Attendance Tracker\nVersion 1.0.0\n\n© 2025 GreonXpert'
            )
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.9}
      >
        <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>
          Auto Attendance Tracking System
        </Text>
        <Text style={styles.appInfoText}>Powered by GreonXpert</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F5F9',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: 32,
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

  // Header
  headerCard: {
    backgroundColor: '#2196F3',
    marginTop: Platform.OS === 'ios' ? 36: 8,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#BBDEFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1976D2',
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userMeta: {
    fontSize: 12,
    color: '#E3F2FD',
    marginTop: 2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  roleBadgeText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#1976D2',
  },

  // Sections
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#37474F',
    marginBottom: 10,
  },

  // Info cards
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#78909C',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#263238',
  },

  // Menu items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#263238',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#78909C',
    marginTop: 2,
  },

  // Logout
  logoutButton: {
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#F44336',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  logoutText: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // App info
  appInfo: {
    alignItems: 'center',
    marginTop: 18,
  },
  appInfoText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },
});

export default ProfileScreen;
