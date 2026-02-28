import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  TextField,
  Toolbar,
  Typography,
  Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrCreateProfile } from '../api/delivery';
import BottomNav from '../components/BottomNav';

export default function ProfilePage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!user?.phone) return;
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await getOrCreateProfile(user.phone, name.trim() || undefined);
      login(user.phone, name.trim() || undefined);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user?.name || user?.phone || '?')
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100dvh', pb: 8 }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <PersonIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            My Profile
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Avatar Card */}
        <Card elevation={2} sx={{ borderRadius: 3, textAlign: 'center' }}>
          <CardContent sx={{ pt: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 1,
                bgcolor: 'primary.main',
                fontSize: 32,
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>
            <Typography variant="h6" fontWeight={700}>
              {user?.name || 'Delivery Rider'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.phone}
            </Typography>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Edit Profile
            </Typography>

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Profile saved!
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Phone Number"
              value={user?.phone ?? ''}
              disabled
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ py: 1.3, borderRadius: 2, fontWeight: 700 }}
            >
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Divider sx={{ mb: 2 }} />
            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{ py: 1.3, borderRadius: 2, fontWeight: 700 }}
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </Box>

      <BottomNav />
    </Box>
  );
}
