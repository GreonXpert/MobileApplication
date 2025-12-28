// src/utils/errorHandler.js

/**
 * Handle API errors and return user-friendly error messages
 * 
 * @param {Error} error - The error object from axios or other sources
 * @returns {string} User-friendly error message
 */
export const handleAPIError = (error) => {
  // Handle network errors
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout. Please check your connection and try again.';
    }
    if (error.message === 'Network Error') {
      return 'Network error. Please check your internet connection.';
    }
    return 'Unable to connect to server. Please try again later.';
  }

  // Handle HTTP error responses
  const { status, data } = error.response;

  // Common status codes
  switch (status) {
    case 400:
      return data?.message || 'Invalid request. Please check your input.';
    
    case 401:
      return 'Unauthorized. Please login again.';
    
    case 403:
      return 'Access denied. You don\'t have permission to perform this action.';
    
    case 404:
      return data?.message || 'Resource not found.';
    
    case 409:
      return data?.message || 'Conflict. The resource already exists.';
    
    case 422:
      return data?.message || 'Validation error. Please check your input.';
    
    case 429:
      return 'Too many requests. Please try again later.';
    
    case 500:
      return 'Server error. Please try again later.';
    
    case 502:
    case 503:
    case 504:
      return 'Service temporarily unavailable. Please try again later.';
    
    default:
      return data?.message || `Error: ${status}. Please try again.`;
  }
};

/**
 * Handle validation errors from the backend
 * 
 * @param {Object} error - Error object with validation details
 * @returns {string} Formatted validation error message
 */
export const handleValidationError = (error) => {
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    
    // If errors is an array
    if (Array.isArray(errors)) {
      return errors.map(err => err.message || err).join('\n');
    }
    
    // If errors is an object with field keys
    if (typeof errors === 'object') {
      return Object.entries(errors)
        .map(([field, message]) => `${field}: ${message}`)
        .join('\n');
    }
  }
  
  return handleAPIError(error);
};

/**
 * Log error for debugging purposes
 * 
 * @param {string} context - Context where error occurred
 * @param {Error} error - The error object
 */
export const logError = (context, error) => {
  console.error(`[${context}] Error:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    stack: error.stack,
  });
};

export default {
  handleAPIError,
  handleValidationError,
  logError,
};