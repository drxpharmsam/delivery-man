import { api } from './client';
import {
  MOCK_PROFILE,
  MOCK_DISPATCHES,
} from './mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

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

export async function getOrCreateProfile(
  phone: string,
  name?: string,
  deviceId?: string,
): Promise<DeliveryProfile | null> {
  if (USE_MOCK) return { ...MOCK_PROFILE, phone, ...(name ? { name } : {}) };
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
  if (USE_MOCK) return Promise.resolve({ ...MOCK_PROFILE, phone, isOnline });
  return api.put<DeliveryProfile>('/api/delivery/me/status', { phone, isOnline });
}

export function getDispatches(assignedToDeliveryId: string): Promise<Dispatch[]> {
  if (USE_MOCK) {
    // Small artificial delay to mimic a real network call
    return new Promise((resolve) =>
      setTimeout(() => resolve([...MOCK_DISPATCHES]), 600),
    );
  }
  return api.get<Dispatch[]>(
    `/api/delivery/dispatch?assignedToDeliveryId=${encodeURIComponent(assignedToDeliveryId)}`,
  );
}

export function updateDispatchStatus(
  dispatchId: string,
  status: string,
): Promise<Dispatch> {
  if (USE_MOCK) {
    const dispatch = MOCK_DISPATCHES.find((d) => d.id === dispatchId);
    if (dispatch) dispatch.status = status;
    return Promise.resolve(dispatch ?? { id: dispatchId, status });
  }
  return api.put<Dispatch>(`/api/delivery/dispatch/${encodeURIComponent(dispatchId)}/status`, {
    status,
  });
}
