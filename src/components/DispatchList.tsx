import { useState, useEffect, useCallback } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import InboxIcon from '@mui/icons-material/Inbox'
import { fetchDispatches, Dispatch } from '../api'
import { useSnack } from './SnackbarProvider'
import DispatchDetail from './DispatchDetail'

const POLL_INTERVAL_MS = 20_000 // 20 s

interface Props {
  phone: string
  isOnline: boolean
}

function statusColor(
  status?: string,
): 'default' | 'warning' | 'info' | 'success' | 'error' {
  switch ((status || '').toLowerCase()) {
    case 'delivered':
      return 'success'
    case 'out for delivery':
      return 'info'
    case 'picked up':
      return 'warning'
    case 'cancelled':
      return 'error'
    default:
      return 'default'
  }
}

export default function DispatchList({ phone, isOnline }: Props) {
  const { showSnack } = useSnack()
  const [dispatches, setDispatches] = useState<Dispatch[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Dispatch | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchDispatches(phone)
      setDispatches(data)
    } catch (e) {
      showSnack(
        e instanceof Error ? e.message : 'Failed to load dispatches',
        'error',
      )
    } finally {
      setLoading(false)
    }
  }, [phone, showSnack])

  // Initial load + polling while online
  useEffect(() => {
    void load()
    if (!isOnline) return
    const id = setInterval(() => void load(), POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [isOnline, load])

  const handleStatusUpdate = useCallback((updated: Dispatch) => {
    setDispatches((prev) =>
      prev.map((d) => (d._id === updated._id ? updated : d)),
    )
  }, [])

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Typography variant="h6">Dispatches</Typography>
        {loading && <CircularProgress size={18} />}
      </Box>

      {!loading && dispatches.length === 0 ? (
        <Box
          bgcolor="white"
          borderRadius={4}
          p={4}
          boxShadow={1}
          textAlign="center"
        >
          <InboxIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body1" fontWeight={600} gutterBottom>
            No dispatches yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isOnline
              ? "You'll be notified when a new order is assigned."
              : 'Go online to receive dispatch orders.'}
          </Typography>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {dispatches.map((d) => (
            <Card key={d._id} sx={{ boxShadow: 2 }}>
              <CardActionArea onClick={() => setSelected(d)}>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Typography variant="subtitle1" fontWeight={700} noWrap>
                      #{d.orderId || d._id.slice(-6)}
                    </Typography>
                    <Chip
                      label={d.status || 'Pending'}
                      color={statusColor(d.status)}
                      size="small"
                    />
                  </Box>
                  {d.customerName && (
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {d.customerName}
                    </Typography>
                  )}
                  {d.address && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary" noWrap>
                        📍 {d.address}
                      </Typography>
                    </>
                  )}
                  {d.paymentMethod && (
                    <Typography variant="caption" display="block" mt={0.5}>
                      💳 {d.paymentMethod}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}

      <DispatchDetail
        dispatch={selected}
        onClose={() => setSelected(null)}
        onStatusUpdate={handleStatusUpdate}
      />
    </Box>
  )
}
