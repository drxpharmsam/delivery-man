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
      main: '#0f9d58',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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
