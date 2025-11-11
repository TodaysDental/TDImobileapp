import axios, { type AxiosInstance, type AxiosError } from 'axios';
import { authTokenAtom } from '../login/store/atoms';
import { getDefaultStore } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface HttpClientConfig {
  baseURL: string;
  authHeader?: string;
}

// Helper function to show toast-like alerts in React Native
export const showToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
  const title = type.charAt(0).toUpperCase() + type.slice(1);
  Alert.alert(title, message);
};

export function createHttpClient(config: HttpClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL,
    headers: {
      'Content-Type': 'application/json',
      ...(config.authHeader ? { Authorization: config.authHeader } : {}),
    },
  });

  // Attach ID token from storage or auth store if present
  const store = getDefaultStore();
  client.interceptors.request.use(async (req) => {
    try {
      let token: string | null = null;
      
      // First try to get token from AsyncStorage
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        console.log('🔍 HTTP Interceptor - Raw token from AsyncStorage:', storedToken);
        
        if (storedToken) {
          token = JSON.parse(storedToken);
          console.log('🔍 HTTP Interceptor - Parsed token:', token ? 'Found' : 'None');
        }
      } catch (err) {
        console.log('🔍 HTTP Interceptor - AsyncStorage error:', err);
        
        // Fallback to Jotai default store
        try { 
          token = store.get(authTokenAtom); 
          console.log('🔍 HTTP Interceptor - Fallback to Jotai token:', token ? 'Found' : 'None');
        } catch (jotaiErr) {
          console.log('🔍 HTTP Interceptor - Jotai error:', jotaiErr);
        }
      }

      if (token) {
        req.headers = req.headers || ({} as any);
        if (!(req.headers as any).Authorization) {
          (req.headers as any).Authorization = `Bearer ${token}`;
          console.log('✅ HTTP Interceptor - Added Authorization header');
        }
      } else {
        console.log('❌ HTTP Interceptor - No token found, request will be unauthorized');
      }
    } catch (err) {
      console.log('🔍 HTTP Interceptor - General error:', err);
    }
    return req;
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      try {
        let message = 'Request failed';
        if (error.response) {
          const status = error.response.status;
          const statusText = error.response.statusText || '';
          const data: any = error.response.data;
          const details = typeof data === 'string' ? data : data?.error || data?.message;
          message = `${status} ${statusText}${details ? `: ${details}` : ''}`;
        } else if (error.request) {
          message = 'Network error: No response received';
        } else if (error.message) {
          message = error.message;
        }
        
        // Use React Native Alert instead of toast
        showToast(message, 'error');
      } catch (alertError) {
        console.error('Failed to show error alert:', alertError);
      }
      return Promise.reject(error);
    }
  );

  return client;
}