
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Home', icon: <HomeIcon />, path: '/home' },
  { label: 'Dispatches', icon: <DeliveryDiningIcon />, path: '/dispatches' },
  { label: 'Profile', icon: <PersonIcon />, path: '/profile' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const current = NAV_ITEMS.findIndex((item) => location.pathname === item.path);

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        borderTop: '1px solid #E5E7EB',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        maxWidth: 480,
        mx: 'auto',
      }}
    >
      <BottomNavigation
        value={current === -1 ? 0 : current}
        onChange={(_, newValue: number) => navigate(NAV_ITEMS[newValue].path)}
        showLabels
        sx={{
          '& .Mui-selected': {
            color: '#0A858C',
          },
          '& .Mui-selected .MuiBottomNavigationAction-label': {
            fontWeight: 800,
            fontSize: '0.75rem',
          },
          '& .MuiBottomNavigationAction-label': {
            fontWeight: 600,
          },
        }}
      >
        {NAV_ITEMS.map((item) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
