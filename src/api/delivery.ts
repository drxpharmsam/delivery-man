import { api } from './client';

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
  return api.put<DeliveryProfile>('/api/delivery/me/status', { phone, isOnline });
}

export function getDispatches(assignedToDeliveryId: string): Promise<Dispatch[]> {
  return api.get<Dispatch[]>(
    `/api/delivery/dispatch?assignedToDeliveryId=${encodeURIComponent(assignedToDeliveryId)}`,
  );
}

export function updateDispatchStatus(
  dispatchId: string,
  status: string,
): Promise<Dispatch> {
  return api.put<Dispatch>(`/api/delivery/dispatch/${encodeURIComponent(dispatchId)}/status`, {
    status,
  });
}
