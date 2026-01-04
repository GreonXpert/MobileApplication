// services/fingerprintService.js
import axios from 'axios';

const RD_SERVICE_URL = 'http://127.0.0.1:11100';

export const captureFingerprint = async () => {
  try {
    const response = await axios.post(`${RD_SERVICE_URL}/capture`, {
      timeout: 10000,
      quality: 60,
      format: 'ISO'
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

export const getDeviceInfo = async () => {
  try {
    const response = await axios.get(`${RD_SERVICE_URL}/info`);
    return response.data;
  } catch (error) {
    throw error;
  }
};