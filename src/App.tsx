import { useState, useCallback } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './components/Login'
import LocationGate from './components/LocationGate'
import Home from './components/Home'

function App() {
  const auth = useAuth()
  const [locationGranted, setLocationGranted] = useState(false)

  const handleLocationGranted = useCallback(() => {
    setLocationGranted(true)
  }, [])

  if (!auth.session) {
    return <Login />
  }

  if (!locationGranted) {
    return <LocationGate onGranted={handleLocationGranted} />
  }

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Home session={auth.session} onLogout={auth.logout} />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App
