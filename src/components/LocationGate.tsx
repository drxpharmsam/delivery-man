import { useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import LocationOffIcon from '@mui/icons-material/LocationOff'
import { useGeolocation } from '../hooks/useGeolocation'

interface Props {
  onGranted: () => void
}

export default function LocationGate({ onGranted }: Props) {
  const { geo, request } = useGeolocation()

  useEffect(() => {
    // Auto-request on mount
    request()
  }, [request])

  useEffect(() => {
    if (geo.status === 'granted') onGranted()
  }, [geo.status, onGranted])

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      px={3}
      bgcolor="background.default"
    >
      <Box
        sx={{
          bgcolor: 'white',
          borderRadius: 4,
          p: 4,
          width: '100%',
          maxWidth: 400,
          boxShadow: 3,
          textAlign: 'center',
        }}
      >
        {geo.status === 'requesting' || geo.status === 'idle' ? (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">Requesting location…</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Please allow location access when prompted.
            </Typography>
          </>
        ) : geo.status === 'denied' || geo.status === 'unavailable' ? (
          <>
            <LocationOffIcon
              sx={{ fontSize: 64, color: 'error.main', mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              Location Access Required
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {geo.status === 'unavailable'
                ? 'Geolocation is not supported by your browser. Please use a modern browser.'
                : 'Location access was denied. Please enable location permissions for this site in your browser settings, then tap Retry.'}
            </Typography>
            {geo.status === 'denied' && (
              <Button variant="contained" onClick={request}>
                Retry
              </Button>
            )}
          </>
        ) : (
          <>
            <LocationOnIcon
              sx={{ fontSize: 64, color: 'primary.main', mb: 2 }}
            />
            <Typography variant="h6">Location granted!</Typography>
          </>
        )}
      </Box>
    </Box>
  )
}
