import { api } from './client';
import { mockSendOtp, mockVerifyOtp } from './mock';

export interface SendOtpResponse {
  message?: string;
}

export interface VerifyOtpResponse {
  token?: string;
  userId?: string;
}

const MOCK = import.meta.env.VITE_MOCK === 'true';

export function sendOtp(phone: string): Promise<SendOtpResponse> {
  if (MOCK) return mockSendOtp(phone);
  return api.post<SendOtpResponse>('/api/auth/send-otp', { phone });
}

export function verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
  if (MOCK) return mockVerifyOtp(phone, otp);
  return api.post<VerifyOtpResponse>('/api/auth/verify', { phone, otp });
}
