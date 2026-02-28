import { useState, useCallback } from 'react'

export type GeoStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'

export interface GeoState {
  status: GeoStatus
  coords: GeolocationCoordinates | null
}

export function useGeolocation() {
  const [geo, setGeo] = useState<GeoState>({ status: 'idle', coords: null })

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setGeo({ status: 'unavailable', coords: null })
      return
    }
    setGeo({ status: 'requesting', coords: null })
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ status: 'granted', coords: pos.coords }),
      () => setGeo({ status: 'denied', coords: null }),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }, [])

  return { geo, request }
}
