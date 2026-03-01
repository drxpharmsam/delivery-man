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
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
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

  const isFirstSetup = !user?.profileComplete;

  const [name, setName] = useState(user?.name ?? '');
  const [age, setAge] = useState(user?.age != null ? String(user.age) : '');
  const [gender, setGender] = useState(user?.gender ?? '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!user?.phone) return;

    // Validate required fields
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!age || isNaN(Number(age)) || Number(age) < 18 || Number(age) > 65) {
      setError('Please enter a valid age (18–65)');
      return;
    }
    if (!gender) {
      setError('Please select your gender');
      return;
    }

    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      await getOrCreateProfile(user.phone, name.trim() || undefined);
      // Merge all profile fields and mark setup as complete
      login(user.phone, {
        name: name.trim() || undefined,
        age: Number(age),
        gender,
        profileComplete: true,
      });
      setSuccess(true);
      if (isFirstSetup) {
        // Redirect to dashboard after first-time profile completion
        navigate('/home');
      }
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
            {isFirstSetup ? 'Complete Your Profile' : 'My Profile'}
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

        {/* Edit / Complete Profile */}
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
              {isFirstSetup
                ? 'Tell us about yourself to get started'
                : 'Edit Profile'}
            </Typography>

            {isFirstSetup && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This information helps us personalize your experience.
              </Typography>
            )}

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

            {/* Phone — read-only */}
            <TextField
              fullWidth
              label="Phone Number"
              value={user?.phone ?? ''}
              disabled
              sx={{ mb: 2 }}
            />

            {/* Name */}
            <TextField
              fullWidth
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />

            {/* Age */}
            <TextField
              fullWidth
              label="Age"
              value={age}
              onChange={(e) => setAge(e.target.value.replace(/\D/g, ''))}
              type="text"
              inputMode="numeric"
              inputProps={{ maxLength: 3 }}
              sx={{ mb: 2 }}
            />

            {/* Gender */}
            <FormControl sx={{ mb: 3 }}>
              <FormLabel>Gender</FormLabel>
              <RadioGroup
                row
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <FormControlLabel value="male" control={<Radio />} label="Male" />
                <FormControlLabel value="female" control={<Radio />} label="Female" />
                <FormControlLabel value="other" control={<Radio />} label="Other" />
              </RadioGroup>
            </FormControl>

            <Button
              fullWidth
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{ py: 1.3, borderRadius: 2, fontWeight: 700 }}
            >
              {isFirstSetup ? 'Save & Continue' : 'Save Profile'}
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

      {/* Only show bottom nav after profile setup is complete */}
      {!isFirstSetup && <BottomNav />}
    </Box>
  );
}
