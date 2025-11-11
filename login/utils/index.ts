import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

/**
 * Email validation function
 */
export const isValidEmail = (email: string) => /.+@.+\..+/.test(email);

/**
 * Clear all auth tokens from storage
 */
export const clearAuthTokens = async (): Promise<void> => {
  try {
    const keys = ['authToken', 'idToken', 'accessToken', 'refreshToken'];
    await AsyncStorage.multiRemove(keys);
    console.log('Auth tokens cleared successfully');
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
};

/**
 * Get stored authentication token
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('idToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Show toast message compatible with React Native
 * This is a simple wrapper that uses Alert on React Native
 */
export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  if (Platform.OS === 'web') {
    // For React Native Web
    console.log(`[${type}] ${message}`);
  } else {
    // For native platforms
    Alert.alert(
      type.charAt(0).toUpperCase() + type.slice(1),
      message,
      [{ text: 'OK' }],
      { cancelable: true }
    );
  }
};

/**
 * Format phone number for display (US format)
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Strip all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phoneNumber;
};