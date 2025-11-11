import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRequestOtp, useVerifyOtp } from '../hooks/useLogin';

// Define navigation type
type RootStackParamList = {
  Login: undefined;
  CallCenter: undefined;
  Dashboard: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const Login: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'email' | 'otp'>('email');
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<string | undefined>(undefined);
  
  // Logo path needs to be updated for React Native
  const logoImage = require('../../../assets/logo.png');

  const requestOtpMutation = useRequestOtp();
  const verifyOtpMutation = useVerifyOtp();

  const onRequestOtp = async () => {
    setError(null);
    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const response = await requestOtpMutation.mutateAsync({ email: email.trim() });
      if (response.session) {
        setSession(response.session);
        Alert.alert('Success', `OTP sent via ${response.delivery}! Check your email.`);
        setStage('otp');
      } else {
        setError('Failed to initiate authentication. Please try again.');
      }
    } catch (e: any) {
      console.error('OTP request error:', e);
      let errorMessage = 'Failed to request OTP';
      
      if (e?.response?.status === 400) {
        errorMessage = 'Invalid email address';
      } else if (e?.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait before trying again.';
      } else if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      setError(errorMessage);
    }
  };

  const onVerifyOtp = async () => {
    setError(null);
    if (!otp.trim()) {
      setError('Please enter a valid OTP.');
      return;
    }
    
    // Basic OTP validation (6 digits)
    if (!/^\d{6}$/.test(otp.trim())) {
      setError('OTP must be 6 digits.');
      return;
    }

    try {
      const data = await verifyOtpMutation.mutateAsync({ 
        email: email.trim(), 
        otp: otp.trim(), 
        session 
      });
      
      if (data?.idToken) {
        Alert.alert('Success', 'Logged in successfully');
        // Store all tokens
        // React Native's AsyncStorage is handled in the hook
        // Navigate to call center screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'CallCenter' }],
        });
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (e: any) {
      console.error('OTP verification error:', e);
      let errorMessage = 'Failed to verify OTP';
      
      if (e?.response?.status === 400) {
        errorMessage = 'Invalid OTP or session expired';
      } else if (e?.response?.status === 401) {
        errorMessage = 'Invalid OTP. Please check your code and try again.';
      } else if (e?.response?.status === 429) {
        errorMessage = 'Too many attempts. Please wait before trying again.';
      } else if (e?.response?.data?.message) {
        errorMessage = e.response.data.message;
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      setError(errorMessage);
    }
  };

  const isRequesting = requestOtpMutation.isPending;
  const isVerifying = verifyOtpMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.loginCard}>
            <View style={styles.loginCardHeader}>
              <Image source={logoImage} style={styles.logo} />
              <Text style={styles.headerText}>Login to Todays Dental Insights</Text>
            </View>
            
            <View style={styles.cardBody}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {stage === 'email' && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Email Address *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isRequesting}
                  />
                </View>
              )}

              {stage === 'otp' && (
                <>
                  <View style={styles.otpInfoContainer}>
                    <Text style={styles.otpInfoText}>
                      OTP sent to <Text style={styles.emailText}>{email}</Text>
                    </Text>
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Enter 6-digit OTP *</Text>
                    <TextInput
                      style={styles.otpInput}
                      placeholder="123456"
                      value={otp}
                      onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!isVerifying}
                    />
                  </View>
                </>
              )}

              {stage === 'email' ? (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={onRequestOtp}
                  disabled={isRequesting}
                >
                  {isRequesting ? (
                    <View style={styles.buttonContent}>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text style={styles.buttonTextWithSpinner}>Requesting...</Text>
                    </View>
                  ) : (
                    <Text style={styles.buttonText}>Request OTP</Text>
                  )}
                </TouchableOpacity>
              ) : (
                <View>
                  <TouchableOpacity
                    style={styles.warningButton}
                    onPress={onVerifyOtp}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <View style={styles.buttonContent}>
                        <ActivityIndicator size="small" color="#000000" />
                        <Text style={styles.warningButtonTextWithSpinner}>Verifying...</Text>
                      </View>
                    ) : (
                      <Text style={styles.warningButtonText}>Login</Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {
                      setStage('email');
                      setOtp('');
                      setSession(undefined);
                      setError(null);
                    }}
                    disabled={isVerifying}
                  >
                    <Text style={styles.secondaryButtonText}>Back to Email</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loginCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
    overflow: 'hidden',
  },
  loginCardHeader: {
    backgroundColor: '#e7f1ff',
    padding: 16,
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  cardBody: {
    padding: 16,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#721c24',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  otpInfoContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  otpInfoText: {
    fontSize: 14,
    color: '#6c757d',
  },
  emailText: {
    fontWeight: 'bold',
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 20,
    letterSpacing: 8,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  warningButton: {
    backgroundColor: '#ffc107',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#6c757d',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 16,
  },
  buttonTextWithSpinner: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 8,
  },
  warningButtonText: {
    color: '#000000',
    fontWeight: '500',
    fontSize: 16,
  },
  warningButtonTextWithSpinner: {
    color: '#000000',
    fontWeight: '500',
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#6c757d',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default Login;