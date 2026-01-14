// src/context/AuthContext.js - FIXED VERSION
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking auth status...');
      const token = await AsyncStorage.getItem('token');
      const savedUser = await AsyncStorage.getItem('user');

      console.log('🔍 Token exists:', !!token);
      console.log('🔍 Saved user:', savedUser);

      if (token && savedUser) {
        try {
          const response = await authAPI.verifyToken();
          console.log('✅ Token verification response:', response);
          
          if (response.success) {
            const userObj = JSON.parse(savedUser);
            
            if (!userObj.role) {
              console.warn('⚠️ User object missing role, setting default');
              userObj.role = 'admin';
            }
            
            userObj.role = String(userObj.role).toLowerCase().trim();
            
            console.log('✅ Setting user:', JSON.stringify(userObj, null, 2));
            
            setUser(userObj);
            setIsAuthenticated(true);
          } else {
            console.warn('⚠️ Token invalid, logging out');
            await logout();
          }
        } catch (error) {
          console.error('❌ Token verification failed:', error);
          await logout();
        }
      } else {
        console.log('ℹ️ No saved credentials found');
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
    } finally {
      setIsLoading(false);
      console.log('✅ Auth check complete');
    }
  };

  const login = async (username, password) => {
    try {
      console.log('🔐 Attempting login...');
      
      // ✅ FIXED: Pass as separate arguments, not as object
      const response = await authAPI.login(username, password);
      
      console.log('📥 Login response:', JSON.stringify(response, null, 2));

      if (response.success && response.token) {
        await AsyncStorage.setItem('token', response.token);
        console.log('✅ Token saved');

        const userObj = {
          username: response.user?.username || username,
          role: response.user?.role 
            ? String(response.user.role).toLowerCase().trim() 
            : 'admin',
          id: response.user?.id,
          fullName: response.user?.fullName,
          email: response.user?.email,
        };

        console.log('✅ Created user object:', JSON.stringify(userObj, null, 2));

        await AsyncStorage.setItem('user', JSON.stringify(userObj));
        console.log('✅ User data saved');

        setUser(userObj);
        setIsAuthenticated(true);

        return { success: true };
      } else {
        console.warn('⚠️ Login failed:', response.message);
        return {
          success: false,
          message: response.message || 'Login failed',
        };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      console.log('👋 Logging out...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logout complete');
    } catch (error) {
      console.error('❌ Logout error:', error);
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