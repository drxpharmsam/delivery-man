import { api } from './client';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export interface SendOtpResponse {
  message?: string;
}

export interface VerifyOtpResponse {
  token?: string;
  userId?: string;
}

export function sendOtp(phone: string): Promise<SendOtpResponse> {
  if (USE_MOCK) return Promise.resolve({ message: 'OTP sent (mock)' });
  return api.post<SendOtpResponse>('/api/auth/send-otp', { phone });
}

export function verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
  if (USE_MOCK) {
    // Accept any 6-digit OTP in mock mode
    if (otp.length === 6) return Promise.resolve({ token: 'mock-token', userId: phone });
    return Promise.reject(new Error('Enter any 6-digit code to log in (mock mode)'));
  }
  return api.post<VerifyOtpResponse>('/api/auth/verify', { phone, otp });
}
