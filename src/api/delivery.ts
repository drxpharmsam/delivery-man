import { api } from './client';
import {
  mockGetOrCreateProfile,
  mockSetOnlineStatus,
  mockGetDispatches,
  mockUpdateDispatchStatus,
} from './mock';

export interface DeliveryProfile {
  id?: string;
  phone: string;
  name?: string;
  isOnline?: boolean;
}

export interface Dispatch {
  id: string;
  orderId?: string;
  customerName?: string;
  address?: string;
  status?: string;
  items?: string;
  amount?: number;
  createdAt?: string;
}

const MOCK = import.meta.env.VITE_MOCK === 'true';

export async function getOrCreateProfile(
  phone: string,
  name?: string,
  deviceId?: string,
): Promise<DeliveryProfile | null> {
  if (MOCK) return mockGetOrCreateProfile(phone, name);
  try {
    return await api.post<DeliveryProfile>('/api/delivery/me', {
      phone,
      ...(name ? { name } : {}),
      ...(deviceId ? { deviceId } : {}),
    });
  } catch {
    return null;
  }
}

export function setOnlineStatus(phone: string, isOnline: boolean): Promise<DeliveryProfile> {
  if (MOCK) return mockSetOnlineStatus(phone, isOnline);
  return api.put<DeliveryProfile>('/api/delivery/me/status', { phone, isOnline });
}

export function getDispatches(assignedToDeliveryId: string): Promise<Dispatch[]> {
  if (MOCK) return mockGetDispatches(assignedToDeliveryId);
  return api.get<Dispatch[]>(
    `/api/delivery/dispatch?assignedToDeliveryId=${encodeURIComponent(assignedToDeliveryId)}`,
  );
}

export function updateDispatchStatus(
  dispatchId: string,
  status: string,
): Promise<Dispatch> {
  if (MOCK) return mockUpdateDispatchStatus(dispatchId, status);
  return api.put<Dispatch>(`/api/delivery/dispatch/${encodeURIComponent(dispatchId)}/status`, {
    status,
  });
}
