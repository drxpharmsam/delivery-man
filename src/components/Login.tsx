import { useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import { useAuth } from '../hooks/useAuth'
import { useSnack } from './SnackbarProvider'

export default function Login() {
  const { otpSent, loading, error, requestOtp, verifyAndLogin } = useAuth()
  const { showSnack } = useSnack()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      showSnack('Please enter your phone number', 'warning')
      return
    }
    await requestOtp(phone.trim())
    if (!error) showSnack('OTP sent!', 'success')
  }

  const handleVerify = async () => {
    if (!otp.trim()) {
      showSnack('Please enter the OTP', 'warning')
      return
    }
    await verifyAndLogin(phone.trim(), otp.trim())
  }

  // Show API error via snackbar whenever it changes
  // (kept simple – error is also shown inline)

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
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <LocalShippingIcon sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} />
          <Typography variant="h5" fontWeight={700}>
            Delivery Man
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Rider portal
          </Typography>
        </Box>

        {!otpSent ? (
          <>
            <TextField
              fullWidth
              label="Phone number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              sx={{ mb: 2 }}
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
            </Button>
          </>
        ) : (
          <>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Enter the OTP sent to <strong>{phone}</strong>
            </Typography>
            <TextField
              fullWidth
              label="OTP"
              type="number"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              sx={{ mb: 2 }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              inputProps={{ maxLength: 6 }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleVerify}
              disabled={loading}
              sx={{ mb: 1 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
            </Button>
            <Button
              fullWidth
              variant="text"
              size="small"
              onClick={() => requestOtp(phone.trim())}
              disabled={loading}
            >
              Resend OTP
            </Button>
          </>
        )}

        {error && (
          <Typography color="error" variant="body2" mt={2} textAlign="center">
            {error}
          </Typography>
        )}
      </Box>
    </Box>
  )
}
