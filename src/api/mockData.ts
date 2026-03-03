/**
 * Local mock data for development / visual preview.
 * Enabled by setting VITE_USE_MOCK=true in .env.local
 * This entire file (and its references) can be deleted when a real backend is in use.
 */

import type { DeliveryProfile, Dispatch } from './delivery';

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString();
const hoursAgo = (n: number) => new Date(now.getTime() - n * 3_600_000).toISOString();

export const MOCK_PROFILE: DeliveryProfile = {
  id: 'mock-rider-001',
  phone: '8012345678',
  name: 'Samuel Ade',
  isOnline: true,
};

export const MOCK_DISPATCHES: Dispatch[] = [
  {
    id: 'dsp-001',
    orderId: 'ORD-2001',
    customerName: 'Fatima Bello',
    address: '14 Adeola Odeku St, Victoria Island, Lagos',
    status: 'in_progress',
    items: 'Amoxicillin 500mg x2, Paracetamol x3',
    amount: 4500,
    createdAt: hoursAgo(1),
  },
  {
    id: 'dsp-002',
    orderId: 'ORD-2002',
    customerName: 'Chukwuemeka Obi',
    address: '7 Broad St, Lagos Island, Lagos',
    status: 'pending',
    items: 'Metformin 850mg x1, Lisinopril 10mg x1',
    amount: 3200,
    createdAt: hoursAgo(2),
  },
  {
    id: 'dsp-003',
    orderId: 'ORD-2003',
    customerName: 'Ngozi Eze',
    address: '22 Allen Ave, Ikeja, Lagos',
    status: 'assigned',
    items: 'Vitamin C 1000mg x6, Zinc supplements x2',
    amount: 2800,
    createdAt: hoursAgo(3),
  },
  {
    id: 'dsp-004',
    orderId: 'ORD-1998',
    customerName: 'Biodun Adeleke',
    address: '5 Ogunlana Drive, Surulere, Lagos',
    status: 'delivered',
    items: 'Augmentin 625mg x2, Omeprazole 20mg x1',
    amount: 5100,
    createdAt: daysAgo(0),
  },
  {
    id: 'dsp-005',
    orderId: 'ORD-1990',
    customerName: 'Amaka Okonkwo',
    address: '88 Bode Thomas St, Surulere, Lagos',
    status: 'delivered',
    items: 'Ciprofloxacin 500mg x2',
    amount: 2200,
    createdAt: daysAgo(1),
  },
  {
    id: 'dsp-006',
    orderId: 'ORD-1985',
    customerName: 'Tunde Fashola',
    address: '3 Awolowo Rd, Ikoyi, Lagos',
    status: 'delivered',
    items: 'Losartan 50mg x1, Aspirin 100mg x2, Atorvastatin 20mg x1',
    amount: 6400,
    createdAt: daysAgo(2),
  },
  {
    id: 'dsp-007',
    orderId: 'ORD-1980',
    customerName: 'Kemi Ayodele',
    address: '31 Coker Rd, Ilupeju, Lagos',
    status: 'cancelled',
    items: 'Fluconazole 150mg x1',
    amount: 1800,
    createdAt: daysAgo(3),
  },
];

/** A fully-populated auth user stored in localStorage for the mock session */
export const MOCK_AUTH_USER = {
  phone: MOCK_PROFILE.phone,
  name: MOCK_PROFILE.name,
  age: 28,
  gender: 'male',
  profileComplete: true,
};
