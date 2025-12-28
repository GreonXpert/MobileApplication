// src/services/mfs110Service.js
/**
 * MFS110 L1 RDService Integration
 * 
 * This service communicates with the Mantra MFS110 L1 RDService app
 * which runs as a background service on the Android device.
 * 
 * PREREQUISITES:
 * 1. Install "MFS110 L1 RDService" app from Google Play Store
 * 2. Connect MFS110 scanner via OTG cable
 * 3. Open the RDService app and ensure device is connected
 * 4. The service exposes HTTP endpoints at localhost:11101
 * 
 * ARCHITECTURE:
 * - RDService app runs in background
 * - Exposes HTTP API at 127.0.0.1:11101 (HTTP) and 127.0.0.1:11101 (HTTPS)
 * - Returns biometric data in Registered Device (RD) format
 * - Data is already encrypted with device keys
 * 
 * DATA FORMATS:
 * - ISO 19794-2 (minutiae templates)
 * - ISO 19794-4 (fingerprint images)
 * - Encrypted PID (Personal Identity Data) block
 */

import axios from 'axios';
import { Platform, Alert } from 'react-native';

// ============================================
// CONFIGURATION
// ============================================

const MFS110_CONFIG = {
  // RDService endpoints
  BASE_URL_HTTP: 'http://127.0.0.1:11101',
  BASE_URL_HTTPS: 'https://127.0.0.1:11101',
  
  // Timeouts (in milliseconds)
  TIMEOUT: 30000, // 30 seconds for capture operations
  DEVICE_INFO_TIMEOUT: 5000, // 5 seconds for device info
  
  // Ports
  HTTP_PORT: 11101,
  HTTPS_PORT: 11101,
};

// ============================================
// API ENDPOINTS
// ============================================

const ENDPOINTS = {
  DEVICE_INFO: '/rd/info',           // Get device information
  CAPTURE: '/rd/capture',            // Capture fingerprint
  RD_SERVICE: '/rd/rdservice',       // Get RD service info
};

// ============================================
// HELPER: Create axios instance
// ============================================

function createMFS110Client(useHttps = false) {
  const baseURL = useHttps ? MFS110_CONFIG.BASE_URL_HTTPS : MFS110_CONFIG.BASE_URL_HTTP;
  
  return axios.create({
    baseURL,
    timeout: MFS110_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/xml', // RDService uses XML
      'Accept': 'application/xml',
    },
    // For HTTPS, we may need to ignore SSL errors in development
    // (RDService uses self-signed certificates)
    ...(useHttps && {
      httpsAgent: {
        rejectUnauthorized: false, // ⚠️ Only for development!
      },
    }),
  });
}

// ============================================
// 1. CHECK RDSERVICE STATUS
// ============================================

/**
 * Check if MFS110 RDService is running and accessible
 * 
 * @param {boolean} useHttps - Use HTTPS endpoint (default: false)
 * @returns {Promise<Object>} Status information
 */
export async function checkRDServiceStatus(useHttps = false) {
  try {
    console.log('[MFS110] Checking RDService status...');
    
    const client = createMFS110Client(useHttps);
    
    const response = await client.get(ENDPOINTS.RD_SERVICE, {
      timeout: MFS110_CONFIG.DEVICE_INFO_TIMEOUT,
    });
    
    console.log('[MFS110] RDService response:', response.status);
    
    return {
      success: true,
      available: true,
      status: response.status,
      data: response.data,
    };
    
  } catch (error) {
    console.error('[MFS110] RDService not available:', error.message);
    
    return {
      success: false,
      available: false,
      error: error.message,
      suggestion: 'Please ensure MFS110 L1 RDService app is installed and running',
    };
  }
}

// ============================================
// 2. GET DEVICE INFORMATION
// ============================================

/**
 * Get information about connected MFS110 device
 * 
 * @param {boolean} useHttps - Use HTTPS endpoint (default: false)
 * @returns {Promise<Object>} Device information
 */
export async function getDeviceInfo(useHttps = false) {
  try {
    console.log('[MFS110] Fetching device info...');
    
    const client = createMFS110Client(useHttps);
    
    const response = await client.get(ENDPOINTS.DEVICE_INFO, {
      timeout: MFS110_CONFIG.DEVICE_INFO_TIMEOUT,
    });
    
    // Parse XML response (RDService returns XML)
    // For simplicity, we'll return raw response
    // In production, parse XML to extract specific fields
    
    console.log('[MFS110] Device info retrieved');
    
    return {
      success: true,
      deviceInfo: response.data,
      raw: response.data,
    };
    
  } catch (error) {
    console.error('[MFS110] Failed to get device info:', error.message);
    
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================
// 3. CAPTURE FINGERPRINT
// ============================================

/**
 * Capture fingerprint from MFS110 device
 * 
 * This is the MAIN function for fingerprint enrollment.
 * 
 * @param {Object} options - Capture options
 * @param {boolean} options.useHttps - Use HTTPS endpoint (default: false)
 * @param {number} options.timeout - Capture timeout in ms (default: 30000)
 * @param {string} options.pidFormat - PID format: 'XML' or 'JSON' (default: 'XML')
 * @returns {Promise<Object>} Captured biometric data
 */
export async function captureFingerprint(options = {}) {
  const {
    useHttps = false,
    timeout = MFS110_CONFIG.TIMEOUT,
    pidFormat = 'XML',
  } = options;
  
  try {
    console.log('[MFS110] Starting fingerprint capture...');
    
    const client = createMFS110Client(useHttps);
    
    // Build capture request payload
    // MFS110 RDService expects specific XML format
    const captureRequest = buildCaptureRequestXML({
      timeout,
      pidFormat,
    });
    
    console.log('[MFS110] Sending capture request...');
    
    const response = await client.post(ENDPOINTS.CAPTURE, captureRequest, {
      headers: {
        'Content-Type': 'text/xml',
      },
      timeout,
    });
    
    console.log('[MFS110] Capture response received');
    
    // Parse response
    const parsedData = parseCaptureResponse(response.data);
    
    if (!parsedData.success) {
      throw new Error(parsedData.error || 'Capture failed');
    }
    
    return {
      success: true,
      pidData: parsedData.pidData,
      template: parsedData.template,
      quality: parsedData.quality,
      errorCode: parsedData.errorCode,
      errorInfo: parsedData.errorInfo,
      raw: response.data,
    };
    
  } catch (error) {
    console.error('[MFS110] Fingerprint capture failed:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return {
        success: false,
        error: 'Cannot connect to RDService. Please ensure the app is running.',
      };
    }
    
    if (error.code === 'ETIMEDOUT') {
      return {
        success: false,
        error: 'Capture timeout. Please try again.',
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to capture fingerprint',
    };
  }
}

// ============================================
// HELPER: Build Capture Request XML
// ============================================

function buildCaptureRequestXML(options = {}) {
  const {
    timeout = 30000,
    pidFormat = 'XML',
  } = options;
  
  // RDService capture request format
  // Adjust according to Mantra's RDService specification
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<PidOptions ver="1.0">
  <Opts fCount="1" fType="0" iCount="0" iType="0" pCount="0" pType="0" format="0" pidVer="2.0" timeout="${timeout}" otp="" wadh="" posh="UNKNOWN" env="P" />
  <Demo></Demo>
  <CustOpts>
    <Param name="ValidationKey" value="" />
  </CustOpts>
</PidOptions>`;
  
  return xml;
}

// ============================================
// HELPER: Parse Capture Response
// ============================================

function parseCaptureResponse(xmlResponse) {
  try {
    // Basic XML parsing
    // In production, use a proper XML parser library like 'react-native-xml2js'
    
    // Extract PID data (base64-encoded encrypted biometric data)
    const pidDataMatch = xmlResponse.match(/<Data>(.*?)<\/Data>/s);
    const pidData = pidDataMatch ? pidDataMatch[1].trim() : null;
    
    // Extract error code
    const errorCodeMatch = xmlResponse.match(/errCode="([^"]*)"/);
    const errorCode = errorCodeMatch ? errorCodeMatch[1] : '0';
    
    // Extract error info
    const errorInfoMatch = xmlResponse.match(/errInfo="([^"]*)"/);
    const errorInfo = errorInfoMatch ? errorInfoMatch[1] : '';
    
    // Extract quality score (if available)
    const qualityMatch = xmlResponse.match(/qScore="([^"]*)"/);
    const quality = qualityMatch ? parseInt(qualityMatch[1]) : null;
    
    // Check if capture was successful
    const success = errorCode === '0';
    
    if (!success) {
      return {
        success: false,
        error: errorInfo || `Error code: ${errorCode}`,
        errorCode,
        errorInfo,
      };
    }
    
    if (!pidData) {
      return {
        success: false,
        error: 'No biometric data in response',
      };
    }
    
    return {
      success: true,
      pidData, // Base64-encoded encrypted PID block
      template: pidData, // Alias for compatibility
      quality,
      errorCode,
      errorInfo,
    };
    
  } catch (error) {
    console.error('[MFS110] Failed to parse response:', error);
    return {
      success: false,
      error: 'Failed to parse capture response',
    };
  }
}

// ============================================
// 4. VALIDATE PREREQUISITES
// ============================================

/**
 * Check if all prerequisites are met for MFS110 operation
 * 
 * @returns {Promise<Object>} Validation result
 */
export async function validatePrerequisites() {
  const checks = {
    platform: Platform.OS === 'android',
    rdServiceInstalled: false,
    deviceConnected: false,
  };
  
  if (!checks.platform) {
    return {
      valid: false,
      checks,
      message: 'MFS110 is only supported on Android',
    };
  }
  
  // Check if RDService is accessible
  const statusCheck = await checkRDServiceStatus();
  checks.rdServiceInstalled = statusCheck.available;
  
  if (!checks.rdServiceInstalled) {
    return {
      valid: false,
      checks,
      message: 'MFS110 L1 RDService app is not installed or not running. Please install from Google Play Store.',
    };
  }
  
  // Check if device is connected
  const deviceInfo = await getDeviceInfo();
  checks.deviceConnected = deviceInfo.success;
  
  if (!checks.deviceConnected) {
    return {
      valid: false,
      checks,
      message: 'MFS110 device is not connected. Please connect via OTG cable and ensure device is detected in RDService app.',
    };
  }
  
  return {
    valid: true,
    checks,
    message: 'All prerequisites met',
  };
}

// ============================================
// 5. HIGH-LEVEL ENROLLMENT WORKFLOW
// ============================================

/**
 * Complete enrollment workflow with UI feedback
 * 
 * This function handles the entire capture process with proper error handling
 * and user feedback.
 * 
 * @param {Object} callbacks - Callbacks for UI updates
 * @param {Function} callbacks.onProgress - Called with progress messages
 * @param {Function} callbacks.onSuccess - Called when capture succeeds
 * @param {Function} callbacks.onError - Called when capture fails
 * @returns {Promise<Object>} Enrollment result
 */
export async function enrollFingerprint(callbacks = {}) {
  const {
    onProgress = (message) => console.log(message),
    onSuccess = (data) => console.log('Success:', data),
    onError = (error) => console.error('Error:', error),
  } = callbacks;
  
  try {
    // Step 1: Validate prerequisites
    onProgress('Checking prerequisites...');
    const validation = await validatePrerequisites();
    
    if (!validation.valid) {
      onError(validation.message);
      return {
        success: false,
        error: validation.message,
        checks: validation.checks,
      };
    }
    
    onProgress('Prerequisites validated ✓');
    
    // Step 2: Capture fingerprint
    onProgress('Place finger on scanner...');
    const captureResult = await captureFingerprint({
      useHttps: false,
      timeout: 30000,
    });
    
    if (!captureResult.success) {
      onError(captureResult.error);
      return captureResult;
    }
    
    onProgress('Fingerprint captured ✓');
    
    // Step 3: Success callback
    onSuccess(captureResult);
    
    return {
      success: true,
      template: captureResult.template,
      quality: captureResult.quality,
      pidData: captureResult.pidData,
    };
    
  } catch (error) {
    const errorMessage = `Enrollment failed: ${error.message}`;
    onError(errorMessage);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ============================================
// 6. UTILITY: Show Setup Instructions
// ============================================

/**
 * Show instructions for setting up MFS110
 * 
 * @param {Object} Alert - React Native Alert module
 */
export function showSetupInstructions() {
  if (Platform.OS !== 'android') {
    Alert.alert(
      'Not Supported',
      'MFS110 fingerprint scanner is only supported on Android devices.',
      [{ text: 'OK' }]
    );
    return;
  }
  
  Alert.alert(
    'MFS110 Setup Instructions',
    '1. Install "MFS110 L1 RDService" from Google Play Store\n\n' +
    '2. Connect MFS110 scanner to your device via OTG cable\n\n' +
    '3. Open the RDService app\n\n' +
    '4. Grant USB permissions when prompted\n\n' +
    '5. Ensure device shows "Device connected" status\n\n' +
    '6. Return to this app and try again',
    [
      {
        text: 'Open Play Store',
        onPress: () => {
          // In production, use Linking.openURL to open Play Store
          // Linking.openURL('https://play.google.com/store/apps/details?id=com.mantra.mfs110.rdservice');
        },
      },
      { text: 'OK' },
    ]
  );
}

// ============================================
// EXPORT ALL
// ============================================

export default {
  checkRDServiceStatus,
  getDeviceInfo,
  captureFingerprint,
  validatePrerequisites,
  enrollFingerprint,
  showSetupInstructions,
  MFS110_CONFIG,
};