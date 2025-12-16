// DIAGNOSTIC_WRAPPER.js - Use this to find which screen is breaking
// Place this in src/components/DiagnosticWrapper.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Diagnostic Wrapper to catch errors in screen components
 * Wrap each screen with this to identify which one is causing the crash
 */
class DiagnosticWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    console.error('🚨 DiagnosticWrapper caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Error in screen:', this.props.screenName);
    console.error('🚨 Error details:', error);
    console.error('🚨 Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>
            ❌ Error in {this.props.screenName}
          </Text>
          <Text style={styles.errorText}>
            {this.state.error?.toString()}
          </Text>
          <Text style={styles.errorHint}>
            Check console for details
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFF3F3',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default DiagnosticWrapper;

// ===================================
// HOW TO USE THIS DIAGNOSTIC WRAPPER
// ===================================

// 1. Save this file as: src/components/DiagnosticWrapper.js

// 2. Update your BottomTabNavigator.js to wrap each screen:

/*
import DiagnosticWrapper from '../components/DiagnosticWrapper';

// Wrap each screen component
const WrappedDashboard = () => (
  <DiagnosticWrapper screenName="Dashboard">
    <DashboardScreen />
  </DiagnosticWrapper>
);

const WrappedEmployees = () => (
  <DiagnosticWrapper screenName="Employees">
    <EmployeeListScreen />
  </DiagnosticWrapper>
);

const WrappedProfile = () => (
  <DiagnosticWrapper screenName="Profile">
    <ProfileScreen />
  </DiagnosticWrapper>
);

// Then use the wrapped components:
<Tab.Screen name="Dashboard" component={WrappedDashboard} ... />
<Tab.Screen name="Employees" component={WrappedEmployees} ... />
<Tab.Screen name="Profile" component={WrappedProfile} ... />
*/

// 3. The wrapper will catch errors and show you EXACTLY which screen is breaking
// 4. Check the console for detailed error information