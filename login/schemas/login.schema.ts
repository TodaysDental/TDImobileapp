import { z } from 'zod';
import { Buffer } from 'buffer';

// Request OTP Schema
export const requestOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type RequestOtpPayload = z.infer<typeof requestOtpSchema>;

// Verify OTP Schema
export const verifyOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
  session: z.string().optional(),
});

export type VerifyOtpPayload = z.infer<typeof verifyOtpSchema>;

// API Response Interfaces (matching specification)
export interface InitiateAuthResponse {
  delivery: 'email';
  session: string;
  challengeName: 'CUSTOM_CHALLENGE';
  challengeParameters: Record<string, any>;
}

export interface VerifyOtpResponse {
  idToken: string;
  accessToken: string;
  refreshToken: string;
}

export interface AuthErrorResponse {
  success: false;
  message: string;
}

// JWT Token Payload Interface
export interface JWTPayload {
  sub: string; // User ID
  email: string;
  given_name: string;
  family_name: string;
  'cognito:groups': string[];
  'x_is_super_admin'?: string;
  'x_clinics'?: string;
  'x_rbc'?: string; // Role-based clinic access
  exp: number;
  iat: number;
  iss: string;
  aud: string;
}

// User session information
export interface UserSession {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  user: {
    email: string;
    givenName: string;
    familyName: string;
    isGlobalSuperAdmin: boolean;
    clinics: Array<{
      clinicId: string;
      role: string;
    }>;
  };
  expiresAt: number;
}

// Validation functions
export const validateEmail = (email: string): boolean => {
  try {
    requestOtpSchema.parse({ email });
    return true;
  } catch {
    return false;
  }
};

export const validateOtp = (otp: string): boolean => {
  return /^\d{6}$/.test(otp);
};

export const parseJWTPayload = (token: string): JWTPayload | null => {
  try {
    // Use Buffer for React Native compatibility
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload) as JWTPayload;
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const payload = parseJWTPayload(token);
  if (!payload) return true;
  return Date.now() >= payload.exp * 1000;
};