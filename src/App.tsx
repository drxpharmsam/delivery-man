import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import DispatchesPage from './pages/DispatchesPage';
import ProfilePage from './pages/ProfilePage';
import ErrorBoundary from './components/ErrorBoundary';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0A858C',
      dark: '#055C61',
      light: '#36B8B7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F3F4F6',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightMedium: 600,
    fontWeightBold: 700,
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          fontWeight: 700,
          textTransform: 'none',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #055C61 0%, #0A858C 100%)',
          boxShadow: '0 8px 20px rgba(5, 92, 97, 0.25)',
          '&:hover': {
            background: 'linear-gradient(135deg, #044a4f 0%, #097980 100%)',
            boxShadow: '0 12px 25px rgba(5, 92, 97, 0.35)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          border: '1px solid rgba(255,255,255,0.8)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 14,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#36B8B7',
              boxShadow: '0 0 0 3px rgba(54,184,183,0.15)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 700,
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          borderTop: '1px solid #E5E7EB',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#0A858C',
          },
        },
      },
    },
  },
});

/** Redirects to /login if the rider is not authenticated */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/**
 * Redirects to /profile if the rider hasn't completed their profile setup yet.
 * Must be nested inside ProtectedRoute (user is guaranteed non-null here).
 */
function ProfileRequired({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!user.profileComplete) return <Navigate to="/profile" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Login redirects to dashboard (or profile if setup is pending) */}
      <Route
        path="/login"
        element={
          user
            ? <Navigate to={user.profileComplete ? '/home' : '/profile'} replace />
            : <LoginPage />
        }
      />

      {/* Dashboard — requires auth + complete profile */}
      <Route
        path="/home"
        element={
          <ProfileRequired>
            <HomePage />
          </ProfileRequired>
        }
      />

      {/* All dispatches — requires auth + complete profile */}
      <Route
        path="/dispatches"
        element={
          <ProfileRequired>
            <DispatchesPage />
          </ProfileRequired>
        }
      />

      {/* Profile — only requires auth (rider must be able to reach this to complete setup) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={user ? '/home' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Outer boundary catches errors in AuthProvider or HashRouter setup */}
      <ErrorBoundary>
        <AuthProvider>
          <HashRouter>
            {/* Inner boundary catches route-level render errors */}
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </HashRouter>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
