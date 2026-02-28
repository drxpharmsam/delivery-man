import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import CallIcon from '@mui/icons-material/Call'
import { Dispatch, updateDispatchStatus } from '../api'
import { useSnack } from './SnackbarProvider'

const STATUS_ACTIONS = [
  { label: 'Mark Picked Up', value: 'Picked Up' },
  { label: 'Out for Delivery', value: 'Out for Delivery' },
  { label: 'Mark Delivered', value: 'Delivered' },
]

interface Props {
  dispatch: Dispatch | null
  onClose: () => void
  onStatusUpdate: (updated: Dispatch) => void
}

export default function DispatchDetail({ dispatch, onClose, onStatusUpdate }: Props) {
  const { showSnack } = useSnack()
  const [updating, setUpdating] = useState(false)

  if (!dispatch) return null

  const handleStatusAction = async (status: string) => {
    setUpdating(true)
    try {
      await updateDispatchStatus(dispatch._id, dispatch.orderId, status)
      onStatusUpdate({ ...dispatch, status })
      showSnack(`Status updated to "${status}"`, 'success')
    } catch (e) {
      showSnack(
        e instanceof Error ? e.message : 'Failed to update status',
        'error',
      )
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Drawer
      anchor="bottom"
      open={!!dispatch}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '90vh',
          px: 2,
          py: 2,
        },
      }}
    >
      {/* Handle */}
      <Box display="flex" justifyContent="center" mb={1}>
        <Box sx={{ width: 40, height: 4, bgcolor: 'grey.300', borderRadius: 2 }} />
      </Box>

      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight={700}>
          Order #{dispatch.orderId || dispatch._id.slice(-6)}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Customer info */}
      {dispatch.customerName && (
        <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Customer
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body1">{dispatch.customerName}</Typography>
            {dispatch.customerPhone && (
              <IconButton
                href={`tel:${dispatch.customerPhone}`}
                component="a"
                color="primary"
                size="small"
              >
                <CallIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      )}

      {/* Address */}
      {dispatch.address && (
        <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Delivery Address
          </Typography>
          <Typography variant="body2">{dispatch.address}</Typography>
        </Box>
      )}

      {/* Payment */}
      {dispatch.paymentMethod && (
        <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Payment
          </Typography>
          <Typography variant="body2">{dispatch.paymentMethod}</Typography>
        </Box>
      )}

      {/* Items */}
      {dispatch.items && dispatch.items.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Items
          </Typography>
          <List dense disablePadding>
            {dispatch.items.map((item, i) => (
              <ListItem key={i} disablePadding sx={{ py: 0.25 }}>
                <ListItemText
                  primary={item.name || `Item ${i + 1}`}
                  secondary={
                    item.quantity != null
                      ? `Qty: ${item.quantity}${item.price != null ? ` · ₹${item.price}` : ''}`
                      : undefined
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      {/* Status actions */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Update Status
      </Typography>
      <Box display="flex" flexDirection="column" gap={1.5} mb={2}>
        {STATUS_ACTIONS.map((action) => (
          <Button
            key={action.value}
            variant={
              dispatch.status === action.value ? 'contained' : 'outlined'
            }
            onClick={() => handleStatusAction(action.value)}
            disabled={updating || dispatch.status === action.value}
            fullWidth
          >
            {updating && dispatch.status !== action.value ? (
              <CircularProgress size={20} />
            ) : (
              action.label
            )}
          </Button>
        ))}
      </Box>
    </Drawer>
  )
}
