// src/screens/LoginScreen.js - ENHANCED UI
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const cleanedUsername = username.trim();
    const cleanedPassword = password.trim();

    if (!cleanedUsername || !cleanedPassword) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    try {
      setIsLoading(true);
      const result = await login(cleanedUsername, cleanedPassword);

      if (!result.success) {
        Alert.alert('Login Failed', result.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Decorative shapes */}
      <View style={styles.accentCircleTop} />
      <View style={styles.accentCircleBottom} />

      <View style={styles.container}>
        {/* Product header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="finger-print-outline" size={20} color="#1976D2" />
          </View>
          <Text style={styles.appTitle}>Auto Attendance</Text>
          <Text style={styles.appSubtitle}>Admin control panel</Text>

          <View style={styles.badgeRow}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusBadgeText}>Secure environment</Text>
            </View>
            <Text style={styles.versionText}>v1.0.0</Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Sign in</Text>
            <View style={styles.roleChip}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#1976D2" />
              <Text style={styles.roleChipText}>Admin / Superadmin</Text>
            </View>
          </View>
          <Text style={styles.cardSubtitle}>
            Use credentials configured by your system administrator.
          </Text>

          {/* Username */}
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#90A4AE" />
              <TextInput
                style={styles.input}
                placeholder="admin@example"
                placeholderTextColor="#B0BEC5"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#90A4AE" />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#B0BEC5"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>
          </View>

          {/* Inline hint */}
          <View style={styles.hintRow}>
            <Ionicons name="lock-closed-outline" size={14} color="#90A4AE" />
            <Text style={styles.hintText}>
              Your credentials are encrypted and sent over a secure connection.
            </Text>
          </View>

          {/* Login button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.9}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.loginContent}>
                <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
                <Text style={styles.loginButtonText}>Login</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.infoContainer}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#1976D2"
            />
            <View style={{ marginLeft: 6 }}>
              <Text style={styles.infoText}>
                Access is restricted to authorized admins only.
              </Text>
              <Text style={styles.infoSubtext}>
                Contact your system administrator to create or update an account.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer meta */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Auto Attendance Tracking System</Text>
          <Text style={styles.footerTextMuted}>© 2025 GreonXpert</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#2196F3',
  },
  accentCircleTop: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#64B5F6',
    opacity: 0.6,
  },
  accentCircleBottom: {
    position: 'absolute',
    bottom: -90,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#1E88E5',
    opacity: 0.5,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    color: '#E3F2FD',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginRight: 8,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '600',
  },
  versionText: {
    fontSize: 11,
    color: '#BBDEFB',
  },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#263238',
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  roleChipText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#1976D2',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#607D8B',
    marginTop: 4,
    marginBottom: 16,
  },

  // Fields
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#37474F',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CFD8DC',
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    fontSize: 14,
    color: '#263238',
  },

  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  hintText: {
    marginLeft: 4,
    fontSize: 11,
    color: '#90A4AE',
  },

  // Button
  loginButton: {
    backgroundColor: '#1976D2',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  loginContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },

  // Info
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 18,
  },
  infoText: {
    fontSize: 12,
    color: '#455A64',
  },
  infoSubtext: {
    fontSize: 11,
    color: '#78909C',
    marginTop: 2,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 11,
    color: '#E3F2FD',
  },
  footerTextMuted: {
    fontSize: 11,
    color: '#BBDEFB',
    marginTop: 2,
  },
});

export default LoginScreen;
