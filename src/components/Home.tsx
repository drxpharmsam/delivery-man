import { useState, useCallback } from 'react'
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import LogoutIcon from '@mui/icons-material/Logout'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import { updateOnlineStatus } from '../api'
import { Session } from '../hooks/useAuth'
import { useSnack } from './SnackbarProvider'
import DispatchList from './DispatchList'

interface Props {
  session: Session
  onLogout: () => void
}

export default function Home({ session, onLogout }: Props) {
  const { showSnack } = useSnack()
  const [isOnline, setIsOnline] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const toggle = useCallback(async () => {
    setToggling(true)
    const next = !isOnline
    try {
      await updateOnlineStatus(session.phone, next)
      setIsOnline(next)
      setLastUpdated(new Date())
      showSnack(`You are now ${next ? 'Online' : 'Offline'}`, next ? 'success' : 'info')
    } catch (e) {
      showSnack(
        e instanceof Error ? e.message : 'Failed to update status',
        'error',
      )
    } finally {
      setToggling(false)
    }
  }, [isOnline, session.phone, showSnack])

  return (
    <Box minHeight="100vh" bgcolor="background.default">
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <LocalShippingIcon sx={{ mr: 1 }} />
          <Typography variant="h6" flexGrow={1}>
            Delivery Man
          </Typography>
          <Typography variant="body2" sx={{ mr: 1, opacity: 0.8 }}>
            {session.phone}
          </Typography>
          <IconButton color="inherit" onClick={onLogout} size="small">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box px={2} pt={3} pb={2} maxWidth={600} mx="auto">
        {/* Status card */}
        <Box
          bgcolor="white"
          borderRadius={4}
          p={3}
          boxShadow={2}
          mb={3}
        >
          <Typography variant="body2" color="text.secondary" mb={1}>
            Availability
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Chip
                label={isOnline ? 'Online' : 'Offline'}
                color={isOnline ? 'success' : 'default'}
                size="small"
                sx={{ mb: 0.5 }}
              />
              {lastUpdated && (
                <Typography variant="caption" display="block" color="text.secondary">
                  Updated {lastUpdated.toLocaleTimeString()}
                </Typography>
              )}
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              {toggling && <CircularProgress size={20} />}
              <Switch
                checked={isOnline}
                onChange={toggle}
                disabled={toggling}
                color="success"
                sx={{ transform: 'scale(1.4)' }}
              />
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary" mt={1} display="block">
            Toggle to go online and receive dispatches
          </Typography>
        </Box>

        {/* Quick stats placeholder */}
        <Box display="flex" gap={2} mb={3}>
          <Box
            flex={1}
            bgcolor="white"
            borderRadius={3}
            p={2}
            boxShadow={1}
            textAlign="center"
          >
            <Typography variant="h5" fontWeight={700} color="primary.main">
              —
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Today's deliveries
            </Typography>
          </Box>
          <Box
            flex={1}
            bgcolor="white"
            borderRadius={3}
            p={2}
            boxShadow={1}
            textAlign="center"
          >
            <Typography variant="h5" fontWeight={700} color="secondary.main">
              —
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Earnings
            </Typography>
          </Box>
        </Box>

        {/* CTA when offline */}
        {!isOnline && (
          <Box
            bgcolor="white"
            borderRadius={4}
            p={3}
            boxShadow={1}
            textAlign="center"
            mb={3}
          >
            <Typography variant="body1" fontWeight={600} mb={1}>
              You're offline
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Go online to see and accept dispatch orders.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={toggle}
              disabled={toggling}
              fullWidth
            >
              Go Online
            </Button>
          </Box>
        )}

        {/* Dispatch list */}
        <DispatchList phone={session.phone} isOnline={isOnline} />
      </Box>
    </Box>
  )
}
