// src/services/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Authentication Service
 * 
 * Handles storing and retrieving authentication data
 * from AsyncStorage (React Native's local storage)
 */

const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';

/**
 * Save authentication token
 * @param {string} token - JWT token
 */
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log('✅ Token saved successfully');
  } catch (error) {
    console.error('Error saving token:', error);
    throw error;
  }
};

/**
 * Get stored authentication token
 * @returns {Promise<string|null>} Stored token or null
 */
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Remove authentication token
 */
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    console.log('✅ Token removed successfully');
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * Save user data
 * @param {Object} userData - User information
 */
export const saveUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
    console.log('✅ User data saved successfully');
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

/**
 * Get stored user data
 * @returns {Promise<Object|null>} Stored user data or null
 */
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Remove user data
 */
export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
    console.log('✅ User data removed successfully');
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

/**
 * Clear all authentication data
 */
export const clearAuth = async () => {
  try {
    await Promise.all([
      removeToken(),
      removeUserData(),
    ]);
    console.log('✅ All auth data cleared');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if token exists
 */
export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};
