import { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Switch,
  Tab,
  Tabs,
  Toolbar,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CircleIcon from '@mui/icons-material/Circle';
import { useAuth } from '../context/AuthContext';
import { getOrCreateProfile, setOnlineStatus, getDispatches, type Dispatch } from '../api/delivery';
import BottomNav from '../components/BottomNav';

/** Returns true if the dispatch was created today in the local timezone */
function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** Status chip colour mapping */
function statusColor(
  status?: string,
): 'default' | 'primary' | 'warning' | 'success' | 'error' {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'success';
    case 'in_progress':
    case 'assigned': return 'warning';
    case 'cancelled': return 'error';
    case 'pending': return 'primary';
    default: return 'default';
  }
}

export default function HomePage() {
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loadingDispatches, setLoadingDispatches] = useState(false);

  // Active dashboard tab: 0 = Income, 1 = Deliveries
  const [activeTab, setActiveTab] = useState(0);

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
      // best-effort; ignore network errors on status toggle
    } finally {
      setToggling(false);
    }
  };

  // --- Income calculations derived from dispatches ---
  const deliveredAll = dispatches.filter((d) => d.status?.toLowerCase() === 'delivered');
  const deliveredToday = deliveredAll.filter((d) => isToday(d.createdAt));
  const todayIncome = deliveredToday.reduce((sum, d) => sum + (d.amount ?? 0), 0);
  const totalIncome = deliveredAll.reduce((sum, d) => sum + (d.amount ?? 0), 0);

  // --- Delivery stats ---
  const pending = dispatches.filter(
    (d) => !d.status || d.status.toLowerCase() === 'pending',
  );
  const inProgress = dispatches.filter(
    (d) => d.status?.toLowerCase() === 'in_progress' || d.status?.toLowerCase() === 'assigned',
  );

  const displayName = user?.name || 'Rider';

  return (
    <Box sx={{ bgcolor: '#F3F4F6', minHeight: '100dvh', pb: 8 }}>
      {/* ── App Bar ── */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #055C61 0%, #0A858C 100%)',
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
          pb: 1,
          boxShadow: '0 8px 25px rgba(5,92,97,0.2)',
        }}
      >
        <Toolbar>
          <LocalShippingIcon sx={{ mr: 1 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              Welcome, {displayName} 👋
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.85 }}>
              {user?.phone}
            </Typography>
          </Box>
          {/* Online/Offline toggle in header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {toggling && <CircularProgress size={16} color="inherit" />}
            <CircleIcon
              sx={{ fontSize: 10, color: isOnline ? '#a5d6a7' : 'rgba(255,255,255,0.4)' }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={isOnline}
                  onChange={handleToggle}
                  disabled={toggling}
                  color="default"
                  size="small"
                  sx={{ '& .MuiSwitch-track': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                />
              }
              label={
                <Typography variant="caption" fontWeight={600}>
                  {isOnline ? 'Online' : 'Offline'}
                </Typography>
              }
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Dashboard Tabs ── */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="fullWidth"
        sx={{
          bgcolor: 'background.paper',
          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          borderRadius: 3,
          mx: 2,
          mt: 2,
          '& .MuiTab-root': { fontWeight: 700 },
          '& .MuiTabs-indicator': { backgroundColor: '#0A858C', height: 3, borderRadius: 2 },
          '& .Mui-selected': { color: '#0A858C !important' },
        }}
      >
        <Tab icon={<AttachMoneyIcon />} label="Income" iconPosition="start" />
        <Tab icon={<LocalShippingIcon />} label="Deliveries" iconPosition="start" />
      </Tabs>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* ──────────── Income Tab ──────────── */}
        {activeTab === 0 && (
          <>
            {/* Today's income vs. total earnings */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Card elevation={0} sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #E0F7F6, #fff)' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                    Today's Income
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#0A858C' }}>
                    {loadingDispatches ? '—' : `₦${todayIncome.toLocaleString()}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {deliveredToday.length} {deliveredToday.length === 1 ? 'delivery' : 'deliveries'}
                  </Typography>
                </CardContent>
              </Card>

              <Card elevation={0} sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #E0F7F6, #fff)' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                    Total Earnings
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#055C61' }}>
                    {loadingDispatches ? '—' : `₦${totalIncome.toLocaleString()}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {deliveredAll.length} completed
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Delivered orders list for income detail */}
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1, color: '#111827' }}>
                  Completed Orders
                </Typography>
                <Divider sx={{ mb: 1 }} />
                {loadingDispatches ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={28} sx={{ color: '#0A858C' }} />
                  </Box>
                ) : deliveredAll.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                    No completed deliveries yet.
                  </Typography>
                ) : (
                  deliveredAll.map((d) => (
                    <Box key={d.id} sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={600}>
                          {d.customerName || d.orderId || d.id}
                        </Typography>
                        <Typography variant="body2" fontWeight={800} sx={{ color: '#055C61' }}>
                          ₦{(d.amount ?? 0).toLocaleString()}
                        </Typography>
                      </Box>
                      {d.address && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {d.address}
                        </Typography>
                      )}
                      {d.createdAt && (
                        <Typography variant="caption" color="text.disabled">
                          {new Date(d.createdAt).toLocaleString()}
                        </Typography>
                      )}
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* ──────────── Deliveries Tab ──────────── */}
        {activeTab === 1 && (
          <>
            {/* Quick stats */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Card elevation={0} sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #E0F7F6, #fff)' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight={800} sx={{ color: '#0A858C' }}>
                    {loadingDispatches ? '—' : pending.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Pending
                  </Typography>
                </CardContent>
              </Card>
              <Card elevation={0} sx={{ textAlign: 'center', background: 'linear-gradient(135deg, #FFF0E0, #fff)' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight={800} color="warning.main">
                    {loadingDispatches ? '—' : inProgress.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    In Progress
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Today's delivery list */}
            <Card elevation={0}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1, color: '#111827' }}>
                  Today's Deliveries
                </Typography>
                <Divider sx={{ mb: 1 }} />
                {loadingDispatches ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={28} sx={{ color: '#0A858C' }} />
                  </Box>
                ) : dispatches.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                    No dispatches assigned yet.
                  </Typography>
                ) : (
                  dispatches.map((d) => (
                    <Box key={d.id} sx={{ py: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={600}>
                          {d.customerName || d.orderId || d.id}
                        </Typography>
                        <Chip
                          label={d.status || 'pending'}
                          color={statusColor(d.status)}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: 11 }}
                        />
                      </Box>
                      {d.address && (
                        <Typography variant="caption" color="text.secondary" display="block">
                        📍 {d.address}
                        </Typography>
                      )}
                      {d.createdAt && (
                        <Typography variant="caption" color="text.disabled">
                          {new Date(d.createdAt).toLocaleString()}
                        </Typography>
                      )}
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}
      </Box>

      <BottomNav />
    </Box>
  );
}
