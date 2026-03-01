import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Typography,
  Alert,
  InputAdornment,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PhoneIcon from '@mui/icons-material/Phone';
import { useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp } from '../api/auth';
import { useAuth } from '../context/AuthContext';

/** Countdown (in seconds) before the rider can resend the OTP */
const RESEND_COUNTDOWN = 60;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resend-OTP countdown state
  const [resendSeconds, setResendSeconds] = useState(0);

  // Tick down the resend timer every second
  useEffect(() => {
    if (resendSeconds <= 0) return;
    const id = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendSeconds]);

  const handleSendOtp = useCallback(async () => {
    setError(null);
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      await sendOtp(phone.trim());
      setStep('otp');
      setResendSeconds(RESEND_COUNTDOWN);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }, [phone]);

  const handleVerifyOtp = async () => {
    setError(null);
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(phone.trim(), otp.trim());
      // Merge phone into session; existing profile data is preserved for returning riders
      login(phone.trim());
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        background: 'linear-gradient(160deg, #0f9d58 0%, #1a237e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="xs">
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 4,
            p: 4,
            boxShadow: 6,
            textAlign: 'center',
          }}
        >
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                borderRadius: '50%',
                p: 1.5,
                display: 'inline-flex',
              }}
            >
              <LocalShippingIcon sx={{ fontSize: 40, color: '#fff' }} />
            </Box>
          </Box>

          <Typography variant="h5" fontWeight={700} gutterBottom>
            Delivery Rider
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {step === 'phone'
              ? 'Enter your mobile number to continue'
              : `Enter the OTP sent to ${phone}`}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
              {error}
            </Alert>
          )}

          {step === 'phone' ? (
            <>
              <TextField
                fullWidth
                label="Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                type="tel"
                inputMode="numeric"
                autoFocus
                inputProps={{ maxLength: 10, pattern: '[0-9]*' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleSendOtp}
                disabled={loading || phone.length !== 10}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Send OTP'}
              </Button>
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                type="text"
                inputMode="numeric"
                inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleVerifyOtp}
                disabled={loading}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Verify OTP'}
              </Button>

              {/* Resend OTP — shown only after the countdown expires */}
              <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center', gap: 1 }}>
                {resendSeconds > 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Resend OTP in {resendSeconds}s
                  </Typography>
                ) : (
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleSendOtp}
                    disabled={loading}
                  >
                    Resend OTP
                  </Button>
                )}
              </Box>

              <Button
                fullWidth
                variant="text"
                size="small"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError(null);
                  setResendSeconds(0);
                }}
                sx={{ mt: 0.5 }}
              >
                Change Number
              </Button>
            </>
          )}
        </Box>
      </Container>
    </Box>
  );
}
