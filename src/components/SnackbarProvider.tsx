import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert, { AlertColor } from '@mui/material/Alert'

interface SnackMsg {
  key: number
  message: string
  severity: AlertColor
}

interface SnackCtx {
  showSnack: (msg: string, severity?: AlertColor) => void
}

const SnackbarContext = createContext<SnackCtx>({
  showSnack: () => undefined,
})

export function useSnack() {
  return useContext(SnackbarContext)
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [msgs, setMsgs] = useState<SnackMsg[]>([])
  const current = msgs[0]

  const showSnack = useCallback((message: string, severity: AlertColor = 'info') => {
    setMsgs((prev) => [...prev, { key: Date.now(), message, severity }])
  }, [])

  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return
    setMsgs((prev) => prev.slice(1))
  }

  return (
    <SnackbarContext.Provider value={{ showSnack }}>
      {children}
      {current && (
        <Snackbar
          key={current.key}
          open
          autoHideDuration={4000}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleClose}
            severity={current.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {current.message}
          </Alert>
        </Snackbar>
      )}
    </SnackbarContext.Provider>
  )
}
