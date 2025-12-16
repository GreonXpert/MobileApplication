// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check if user is already logged in on app start
   */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const savedUser = await AsyncStorage.getItem('user');

      if (token && savedUser) {
        // Verify token is still valid
        try {
          const response = await authAPI.verifyToken();
          if (response.success) {
            const userObj = JSON.parse(savedUser);
            setUser(userObj);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear storage
            await logout();
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          await logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);

      if (response.success && response.token) {
        // Save token
        await AsyncStorage.setItem('token', response.token);

        // Create user object with safe defaults
        const userObj = {
          username: response.user?.username || username,
          role: response.user?.role || 'ADMIN',
          ...response.user
        };

        // Save user data
        await AsyncStorage.setItem('user', JSON.stringify(userObj));

        setUser(userObj);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        return {
          success: false,
          message: response.message || 'Login failed',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;