import { useMutation } from '@tanstack/react-query';
import { loginApi } from '../services/api.service';
import { authTokenAtom } from '../store/atoms';
import { useSetAtom } from 'jotai';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useRequestOtp() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => loginApi.requestOtp(email),
  });
}

export function useVerifyOtp() {
  const setAuthToken = useSetAtom(authTokenAtom);
  return useMutation({
    mutationFn: async ({ email, otp, session }: { email: string; otp: string; session?: string }) =>
      loginApi.verifyOtp(email, otp, session),
    onSuccess: (data) => {
      console.log('🎉 Login Success - Full response:', data);
      if (data?.idToken) {
        console.log('🔑 Login Success - ID Token found:', data.idToken ? 'Yes' : 'No');
        setAuthToken(data.idToken);
        try {
          // Store token in AsyncStorage
          AsyncStorage.setItem('authToken', JSON.stringify(data.idToken))
            .then(() => console.log('💾 Login Success - Stored authToken in AsyncStorage'))
            .catch(err => console.error('❌ Login Success - Error storing authToken:', err));
          
          // Also store individual tokens explicitly
          if (data.idToken) {
            AsyncStorage.setItem('idToken', data.idToken)
              .then(() => console.log('💾 Login Success - Stored idToken in AsyncStorage'))
              .catch(err => console.error('❌ Login Success - Error storing idToken:', err));
          }
          if (data.accessToken) {
            AsyncStorage.setItem('accessToken', data.accessToken)
              .then(() => console.log('💾 Login Success - Stored accessToken in AsyncStorage'))
              .catch(err => console.error('❌ Login Success - Error storing accessToken:', err));
          }
          if (data.refreshToken) {
            AsyncStorage.setItem('refreshToken', data.refreshToken)
              .then(() => console.log('💾 Login Success - Stored refreshToken in AsyncStorage'))
              .catch(err => console.error('❌ Login Success - Error storing refreshToken:', err));
          }
          
          // Verify storage
          AsyncStorage.getItem('authToken')
            .then(stored => console.log('🔍 Login Success - Verification - authToken in AsyncStorage:', stored))
            .catch(err => console.error('❌ Login Success - Error verifying authToken:', err));
        } catch (err) {
          console.error('❌ Login Success - Error storing tokens:', err);
        }
      } else {
        console.log('❌ Login Success - No ID Token in response');
      }
    }
  });
}