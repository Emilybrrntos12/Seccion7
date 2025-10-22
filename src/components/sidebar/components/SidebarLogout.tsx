import { Box, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

// Paleta de colores tierra
const palette = {
  primary: "#8B7355",
  secondary: "#A0522D",
  background: "#fffdf9",
  light: "#e8dcc8",
  dark: "#5d4037",
  accent: "#c2a77d",
  error: "#d32f2f",
  errorLight: "#f44336",
};

interface SidebarLogoutProps {
  onLogout: () => void;
}

const SidebarLogout = ({ onLogout }: SidebarLogoutProps) => {
  return (
    <Box sx={{ 
      p: 3, 
      pt: 2,
      background: `linear-gradient(180deg, transparent 0%, ${palette.light}15 100%)`,
      borderTop: `1px solid ${palette.light}`
    }}>
      <ListItemButton 
        onClick={onLogout}
        sx={{
          borderRadius: 3,
          py: 2,
          px: 2,
          background: `linear-gradient(135deg, ${palette.error}15 0%, ${palette.errorLight}08 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${palette.error}20 0%, ${palette.errorLight}15 100%)`,
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 25px ${palette.error}25`,
            borderLeft: `4px solid ${palette.error}`,
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: `2px solid ${palette.error}20`,
          borderLeft: '4px solid transparent',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${palette.error}30 50%, transparent 100%)`,
          }
        }}
      >
        {/* Efecto de fondo decorativo */}
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: -10,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${palette.error}15 0%, transparent 70%)`,
            opacity: 0.6,
          }}
        />
        
        <ListItemIcon sx={{ 
          minWidth: 44,
          position: 'relative',
          zIndex: 1
        }}>
          <Box
            sx={{
              p: 1,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${palette.error} 0%, ${palette.errorLight} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${palette.error}40`,
              transition: 'all 0.3s ease',
              '.MuiListItemButton:hover &': {
                transform: 'scale(1.1) rotate(-5deg)',
              }
            }}
          >
            <ExitToAppIcon sx={{ 
              fontSize: 20, 
              color: 'white',
              fontWeight: 'bold'
            }} />
          </Box>
        </ListItemIcon>
        
        <ListItemText 
          primary={
            <Typography 
              variant="body1" 
              sx={{
                fontSize: '1rem',
                fontWeight: '700',
                background: `linear-gradient(135deg, ${palette.error} 0%, ${palette.errorLight} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                position: 'relative',
                zIndex: 1
              }}
            >
              Cerrar Sesión
            </Typography>
          }
          secondary={
            <Typography 
              variant="caption" 
              sx={{
                color: palette.error,
                opacity: 0.8,
                fontWeight: '500',
                fontSize: '0.75rem'
              }}
            >
              Salir de la cuenta actual
            </Typography>
          }
          sx={{ 
            position: 'relative',
            zIndex: 1
          }}
        />
      </ListItemButton>

      {/* Footer decorativo */}
      <Box sx={{ 
        textAlign: 'center', 
        mt: 2,
        pt: 1,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '20%',
          right: '20%',
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${palette.light} 50%, transparent 100%)`,
        }
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: palette.dark,
            opacity: 0.6,
            fontSize: '0.7rem',
            fontWeight: '500'
          }}
        >
          Gestión de Calzado
        </Typography>
      </Box>
    </Box>
  );
};

export default SidebarLogout;