import axios, { AxiosInstance } from 'axios';

// For a React Native app, you might want to load this from environment variables or a config file
const AUTH_BASE_URL = 'https://your-api-endpoint.com/auth';

// Create the HTTP client
const createHttpClient = ({ baseURL }: { baseURL: string }): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
  
  // You can add interceptors for handling auth tokens, errors, etc.
  axiosInstance.interceptors.response.use(
    response => response,
    error => {
      console.error('API Error:', error?.response?.data || error?.message || error);
      return Promise.reject(error);
    }
  );
  
  return axiosInstance;
};

// Auth endpoints are under /auth
const BASE_URL = AUTH_BASE_URL;

const http = createHttpClient({ baseURL: BASE_URL });

export interface InitiateAuthResponse {
  delivery: string;
  session: string;
  challengeName: string;
  challengeParameters: Record<string, any>;
}

export interface VerifyOtpResponse {
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export const loginApi = {
  requestOtp: async (email: string): Promise<InitiateAuthResponse> => {
    const { data } = await http.post('/initiate', { email });
    // Return the exact structure from the specification
    return {
      delivery: (data as any)?.delivery || 'email',
      session: (data as any)?.session,
      challengeName: (data as any)?.challengeName || 'CUSTOM_CHALLENGE',
      challengeParameters: (data as any)?.challengeParameters || {},
    };
  },
  
  verifyOtp: async (
    email: string,
    otp: string,
    session?: string
  ): Promise<VerifyOtpResponse> => {
    const body: any = { email, otp };
    if (session) body.session = session;
    const { data } = await http.post('/verify', body);
    
    // Return the exact structure from the specification
    return {
      idToken: (data as any)?.idToken ?? (data as any)?.id_token ?? (data as any)?.token,
      accessToken: (data as any)?.accessToken ?? (data as any)?.access_token,
      refreshToken: (data as any)?.refreshToken ?? (data as any)?.refresh_token,
    };
  },
};