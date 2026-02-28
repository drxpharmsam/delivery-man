import { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Switch,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CircleIcon from '@mui/icons-material/Circle';
import { useAuth } from '../context/AuthContext';
import { getOrCreateProfile, setOnlineStatus, getDispatches, type Dispatch } from '../api/delivery';
import BottomNav from '../components/BottomNav';

export default function HomePage() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loadingDispatches, setLoadingDispatches] = useState(false);

  useEffect(() => {
    if (!user?.phone) return;

    (async () => {
      const profile = await getOrCreateProfile(user.phone, user.name);
      if (profile) {
        setIsOnline(profile.isOnline ?? false);
      }
    })();

    fetchDispatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.phone]);

  const fetchDispatches = async () => {
    if (!user?.phone) return;
    setLoadingDispatches(true);
    try {
      const data = await getDispatches(user.phone);
      setDispatches(Array.isArray(data) ? data : []);
    } catch {
      setDispatches([]);
    } finally {
      setLoadingDispatches(false);
    }
  };

  const handleToggle = async () => {
    if (!user?.phone || toggling) return;
    setToggling(true);
    const next = !isOnline;
    try {
      await setOnlineStatus(user.phone, next);
      setIsOnline(next);
    } catch {
      // best-effort
    } finally {
      setToggling(false);
    }
  };

  const pending = dispatches.filter(
    (d) => !d.status || d.status.toLowerCase() === 'pending',
  );
  const inProgress = dispatches.filter(
    (d) => d.status?.toLowerCase() === 'in_progress' || d.status?.toLowerCase() === 'assigned',
  );

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100dvh', pb: 8 }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <LocalShippingIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            Delivery Rider
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Status Card */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Your Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <CircleIcon
                    sx={{ fontSize: 12, color: isOnline ? 'success.main' : 'text.disabled' }}
                  />
                  <Typography variant="h6" fontWeight={700}>
                    {isOnline ? 'Online' : 'Offline'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {user?.phone}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {toggling && <CircularProgress size={18} sx={{ mr: 1 }} />}
                <FormControlLabel
                  control={
                    <Switch
                      checked={isOnline}
                      onChange={handleToggle}
                      disabled={toggling}
                      color="success"
                    />
                  }
                  label=""
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Card elevation={2} sx={{ borderRadius: 3, textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="primary">
                {loadingDispatches ? '—' : pending.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
          <Card elevation={2} sx={{ borderRadius: 3, textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {loadingDispatches ? '—' : inProgress.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Recent Dispatches */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              Recent Dispatches
            </Typography>
            <Divider sx={{ mb: 1 }} />
            {loadingDispatches ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={28} />
              </Box>
            ) : dispatches.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                No dispatches assigned yet.
              </Typography>
            ) : (
              dispatches.slice(0, 3).map((d) => (
                <Box key={d.id} sx={{ py: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600}>
                      {d.customerName || d.orderId || d.id}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor:
                          d.status?.toLowerCase() === 'delivered'
                            ? 'success.light'
                            : d.status?.toLowerCase() === 'in_progress'
                            ? 'warning.light'
                            : 'grey.200',
                        px: 1,
                        py: 0.3,
                        borderRadius: 1,
                        fontWeight: 600,
                      }}
                    >
                      {d.status || 'pending'}
                    </Typography>
                  </Box>
                  {d.address && (
                    <Typography variant="caption" color="text.secondary">
                      {d.address}
                    </Typography>
                  )}
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))
            )}
          </CardContent>
        </Card>
      </Box>

      <BottomNav />
    </Box>
  );
}
