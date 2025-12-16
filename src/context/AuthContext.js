// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';
import * as authService from '../services/auth';

/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the app
 * Usage: const { user, login, logout, isLoading } = useAuth();
 */

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Check if user is already logged in on app start
   */
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      const token = await authService.getToken();
      const userData = await authService.getUserData();
      
      if (token && userData) {
        // Verify token is still valid
        try {
          await authAPI.verifyToken();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear stored data
          await authService.clearAuth();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object>} User data and token
   */
  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      
      if (response.success) {
        // Save token and user data
        await authService.saveToken(response.token);
        await authService.saveUserData(response.user);
        
        // Update state
        setUser(response.user);
        setIsAuthenticated(true);
        
        return { success: true, user: response.user };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authService.clearAuth();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
