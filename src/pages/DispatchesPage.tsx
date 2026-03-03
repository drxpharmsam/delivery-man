import { useEffect, useState, useCallback } from 'react';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { useAuth } from '../context/AuthContext';
import { getDispatches, updateDispatchStatus, type Dispatch } from '../api/delivery';
import BottomNav from '../components/BottomNav';

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'warning' | 'success' | 'error'> = {
  pending: 'default',
  assigned: 'primary',
  in_progress: 'warning',
  delivered: 'success',
  cancelled: 'error',
};

function statusColor(status?: string) {
  const key = (status ?? '').toLowerCase().replace(/\s+/g, '_');
  return STATUS_COLORS[key] ?? 'default';
}

export default function DispatchesPage() {
  const { user } = useAuth();
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDispatches = useCallback(async () => {
    if (!user?.phone) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getDispatches(user.phone);
      setDispatches(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dispatches');
    } finally {
      setLoading(false);
    }
  }, [user?.phone]);

  useEffect(() => {
    fetchDispatches();
  }, [fetchDispatches]);

  const handleStatusUpdate = async (dispatchId: string, newStatus: string) => {
    setUpdatingId(dispatchId);
    try {
      const updated = await updateDispatchStatus(dispatchId, newStatus);
      setDispatches((prev) =>
        prev.map((d) => (d.id === dispatchId ? { ...d, ...updated } : d)),
      );
    } catch {
      // best-effort; refetch on failure
      fetchDispatches();
    } finally {
      setUpdatingId(null);
    }
  };

  /** Returns the next action button(s) for a given dispatch status */
  function getActions(d: Dispatch) {
    const status = (d.status ?? '').toLowerCase();
    const busy = updatingId === d.id;
    if (status === 'pending') {
      return (
        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <AssignmentTurnedInIcon />}
          disabled={busy}
          onClick={() => handleStatusUpdate(d.id, 'assigned')}
          sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
        >
          Accept Order
        </Button>
      );
    }
    if (status === 'assigned') {
      return (
        <Button
          size="small"
          variant="contained"
          color="warning"
          startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <LocalShippingIcon />}
          disabled={busy}
          onClick={() => handleStatusUpdate(d.id, 'in_progress')}
          sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
        >
          Picked Up
        </Button>
      );
    }
    if (status === 'in_progress') {
      return (
        <Button
          size="small"
          variant="contained"
          color="success"
          startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <CheckCircleIcon />}
          disabled={busy}
          onClick={() => handleStatusUpdate(d.id, 'delivered')}
          sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
        >
          Mark Delivered
        </Button>
      );
    }
    return null;
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100dvh', pb: 8 }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <DeliveryDiningIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            My Dispatches
          </Typography>
          <IconButton color="inherit" onClick={fetchDispatches} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && (
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography color="error">{error}</Typography>
            </CardContent>
          </Card>
        )}

        {!loading && !error && dispatches.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <DeliveryDiningIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body1" color="text.secondary">
              No dispatches assigned yet.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Go online to start receiving orders.
            </Typography>
          </Box>
        )}

        {!loading &&
          dispatches.map((d, idx) => (
            <Card
              key={d.id}
              elevation={2}
              sx={{ borderRadius: 3, mb: 2 }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Order #{d.orderId || d.id}
                    </Typography>
                    {d.customerName && (
                      <Typography variant="body2" color="text.secondary">
                        {d.customerName}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={d.status || 'pending'}
                    color={statusColor(d.status)}
                    size="small"
                    sx={{ fontWeight: 700, textTransform: 'capitalize' }}
                  />
                </Box>

                {d.address && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 1 }}>
                    <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.3 }} />
                    <Typography variant="body2" color="text.secondary">
                      {d.address}
                    </Typography>
                  </Box>
                )}

                {(d.items || d.amount != null) && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      {d.items && (
                        <Typography variant="caption" color="text.secondary">
                          {d.items}
                        </Typography>
                      )}
                      {d.amount != null && (
                        <Typography variant="caption" fontWeight={700}>
                          ₦{d.amount.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  </>
                )}

                {d.createdAt && (
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                    {new Date(d.createdAt).toLocaleString()}
                  </Typography>
                )}

                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ display: 'block', mt: 0.5 }}
                >
                  #{idx + 1} · ID: {d.id}
                </Typography>

                {/* Action buttons for active dispatches */}
                {(() => {
                  const action = getActions(d);
                  return action ? <Box sx={{ mt: 1.5 }}>{action}</Box> : null;
                })()}
              </CardContent>
            </Card>
          ))}
      </Box>

      <BottomNav />
    </Box>
  );
}
