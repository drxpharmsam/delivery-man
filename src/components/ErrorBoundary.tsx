import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

const MAX_RETRIES = 3;

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleRetry = () => {
    if (this.state.retryCount >= MAX_RETRIES) {
      window.location.reload();
      return;
    }
    this.setState((prev) => ({ hasError: false, error: null, retryCount: prev.retryCount + 1 }));
  };

  render() {
    if (this.state.hasError) {
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

              <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />

              <Typography variant="h6" fontWeight={700} gutterBottom>
                Something went wrong
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                The app encountered an unexpected error. This may be due to a network issue or
                temporary service disruption.
              </Typography>

              {this.state.error && (
                <Typography
                  variant="caption"
                  color="text.disabled"
                  component="pre"
                  sx={{
                    display: 'block',
                    mb: 2,
                    p: 1,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    textAlign: 'left',
                    overflowX: 'auto',
                    fontSize: '0.7rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error.message}
                </Typography>
              )}

              <Button
                fullWidth
                variant="contained"
                onClick={this.handleRetry}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: 700, mb: 1 }}
              >
                {this.state.retryCount >= MAX_RETRIES ? 'Reload Page' : 'Try Again'}
              </Button>
              <Button
                fullWidth
                variant="text"
                size="small"
                onClick={() => window.location.reload()}
                sx={{ fontWeight: 600 }}
              >
                Reload Page
              </Button>

              <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: 'block' }}>
                If this persists, check your internet connection or contact support.
              </Typography>
            </Box>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}
