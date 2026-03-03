/**
 * Mock API — used when VITE_MOCK=true (local development without a real backend).
 *
 * Enable by adding VITE_MOCK=true to your .env file:
 *   cp .env.example .env
 *   # set VITE_MOCK=true inside .env
 *   npm run dev
 *
 * Demo credentials:
 *   Phone : any 10-digit number  (e.g. 0801 234 5678 → 0801234567 → enter as 0801234567)
 *   OTP   : 123456
 */

import type { SendOtpResponse, VerifyOtpResponse } from './auth';
import type { DeliveryProfile, Dispatch } from './delivery';

const DEMO_OTP = '123456';

/** Simulate network latency */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function mockSendOtp(_phone: string): Promise<SendOtpResponse> {
  await delay(700);
  return { message: `Demo mode: use OTP ${DEMO_OTP} to log in` };
}

export async function mockVerifyOtp(
  _phone: string,
  otp: string,
): Promise<VerifyOtpResponse> {
  await delay(800);
  if (otp !== DEMO_OTP) {
    throw new Error(`Invalid OTP. In demo mode the OTP is always ${DEMO_OTP}`);
  }
  return { token: 'demo-token', userId: 'demo-rider-1' };
}

// ── Delivery ──────────────────────────────────────────────────────────────────

export async function mockGetOrCreateProfile(
  phone: string,
  name?: string,
): Promise<DeliveryProfile | null> {
  await delay(500);
  return { id: 'demo-rider-1', phone, name: name || 'Demo Rider', isOnline: false };
}

export async function mockSetOnlineStatus(
  phone: string,
  isOnline: boolean,
): Promise<DeliveryProfile> {
  await delay(300);
  return { id: 'demo-rider-1', phone, isOnline };
}

const SAMPLE_DISPATCHES: Dispatch[] = [
  {
    id: 'disp-001',
    orderId: 'ORD-1001',
    customerName: 'Amina Bello',
    address: '14 Lagos Island, Lagos',
    status: 'pending',
    items: 'Paracetamol 500 mg × 2, Vitamin C',
    amount: 2500,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'disp-002',
    orderId: 'ORD-1002',
    customerName: 'Chukwuemeka Obi',
    address: '7 Adeola Odeku, Victoria Island',
    status: 'assigned',
    items: 'Metformin 850 mg × 1',
    amount: 1800,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'disp-003',
    orderId: 'ORD-0998',
    customerName: 'Fatima Yusuf',
    address: '3 Allen Avenue, Ikeja',
    status: 'delivered',
    items: 'Amoxicillin 250 mg × 3, Ibuprofen',
    amount: 3200,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

let _dispatches = [...SAMPLE_DISPATCHES];

export async function mockGetDispatches(
  _assignedToDeliveryId: string,
): Promise<Dispatch[]> {
  await delay(600);
  return [..._dispatches];
}

export async function mockUpdateDispatchStatus(
  dispatchId: string,
  status: string,
): Promise<Dispatch> {
  await delay(400);
  if (!_dispatches.some((d) => d.id === dispatchId)) {
    throw new Error(`Dispatch ${dispatchId} not found`);
  }
  _dispatches = _dispatches.map((d) =>
    d.id === dispatchId ? { ...d, status } : d,
  );
  return _dispatches.find((d) => d.id === dispatchId)!;
}
