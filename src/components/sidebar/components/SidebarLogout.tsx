import { Box, Divider, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { alpha, useTheme } from '@mui/material/styles';

interface SidebarLogoutProps {
  onLogout: () => void;
}

const SidebarLogout = ({ onLogout }: SidebarLogoutProps) => {
  const theme = useTheme();
  return (
    <Box sx={{ p: 2 }}>
      <Divider sx={{ mb: 2 }} />
      <ListItemButton 
        onClick={onLogout}
        sx={{
          borderRadius: 2,
          backgroundColor: alpha(theme.palette.error.main, 0.05),
          '&:hover': {
            backgroundColor: alpha(theme.palette.error.main, 0.1),
            transform: 'translateX(4px)',
          },
          transition: 'all 0.2s ease',
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          <LogoutIcon sx={{ color: theme.palette.error.main }} />
        </ListItemIcon>
        <ListItemText 
          primary="Cerrar Sesión" 
          primaryTypographyProps={{ 
            fontSize: '0.95rem',
            color: theme.palette.error.main,
            fontWeight: 'medium'
          }}
        />
      </ListItemButton>
    </Box>
  );
};

export default SidebarLogout;
