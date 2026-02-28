import { useState, useCallback } from 'react'
import { sendOtp, verifyOtp, AuthResult } from '../api'

export interface Session {
  phone: string
  token?: string
  user?: Record<string, unknown>
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem('dm_session')
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function saveSession(s: Session) {
  localStorage.setItem('dm_session', JSON.stringify(s))
}

export function clearSession() {
  localStorage.removeItem('dm_session')
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(loadSession)
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestOtp = useCallback(async (phone: string) => {
    setLoading(true)
    setError(null)
    try {
      await sendOtp(phone)
      setOtpSent(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }, [])

  const verifyAndLogin = useCallback(
    async (phone: string, otp: string) => {
      setLoading(true)
      setError(null)
      try {
        const result: AuthResult = await verifyOtp(phone, otp)
        const s: Session = { phone, token: result.token, user: result.user }
        saveSession(s)
        setSession(s)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'OTP verification failed')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
    setOtpSent(false)
  }, [])

  return { session, otpSent, loading, error, requestOtp, verifyAndLogin, logout }
}
