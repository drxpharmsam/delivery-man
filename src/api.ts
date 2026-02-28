import axios from 'axios'

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  'https://mediflow-backend-z29j.onrender.com'

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 })

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function sendOtp(phone: string): Promise<void> {
  await api.post('/api/auth/send-otp', { phone })
}

export interface AuthResult {
  token?: string
  user?: Record<string, unknown>
}

export async function verifyOtp(
  phone: string,
  otp: string,
): Promise<AuthResult> {
  const res = await api.post<AuthResult>('/api/auth/verify', { phone, otp })
  return res.data
}

// ── Delivery profile ──────────────────────────────────────────────────────────

export async function fetchOrCreateProfile(
  phone: string,
  name?: string,
): Promise<void> {
  try {
    await api.post('/api/delivery/me', { phone, name })
  } catch {
    // endpoint may not exist yet – swallow gracefully
  }
}

export async function updateOnlineStatus(
  phone: string,
  isOnline: boolean,
): Promise<void> {
  await api.put('/api/delivery/me/status', { phone, isOnline })
}

// ── Dispatches ────────────────────────────────────────────────────────────────

export interface DispatchItem {
  name?: string
  quantity?: number
  price?: number
}

export interface Dispatch {
  _id: string
  orderId?: string
  customerName?: string
  customerPhone?: string
  address?: string
  paymentMethod?: string
  status?: string
  items?: DispatchItem[]
}

export async function fetchDispatches(phone: string): Promise<Dispatch[]> {
  const res = await api.get<Dispatch[] | { dispatches?: Dispatch[] }>(
    `/api/delivery/dispatch?assignedToDeliveryId=${encodeURIComponent(phone)}`,
  )
  const data = res.data
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && Array.isArray(data.dispatches))
    return data.dispatches
  return []
}

export async function updateDispatchStatus(
  dispatchId: string,
  orderId: string | undefined,
  status: string,
): Promise<void> {
  // Try primary endpoint, fall back to orders endpoint
  try {
    await api.put(`/api/delivery/dispatch/${dispatchId}/status`, { status })
    return
  } catch {
    // primary failed – try orders endpoint if orderId available
  }
  if (orderId) {
    await api.put(`/api/orders/${orderId}/status`, { status })
  }
}
