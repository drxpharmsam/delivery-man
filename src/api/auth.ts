import { api } from './client';

export interface SendOtpResponse {
  message?: string;
}

export interface VerifyOtpResponse {
  token?: string;
  userId?: string;
}

export function sendOtp(phone: string): Promise<SendOtpResponse> {
  return api.post<SendOtpResponse>('/api/auth/send-otp', { phone });
}

export function verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
  return api.post<VerifyOtpResponse>('/api/auth/verify', { phone, otp });
}
