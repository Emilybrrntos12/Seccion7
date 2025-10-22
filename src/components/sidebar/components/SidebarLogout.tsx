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
      p: 2, // Reducido de 3
      pt: 1.5, // Reducido de 2
      background: `linear-gradient(180deg, transparent 0%, ${palette.light}15 100%)`,
      borderTop: `1px solid ${palette.light}`
    }}>
      <ListItemButton 
        onClick={onLogout}
        sx={{
          borderRadius: 2, // Reducido de 3
          py: 1.5, // Reducido de 2
          px: 1.5, // Reducido de 2
          background: `linear-gradient(135deg, ${palette.error}15 0%, ${palette.errorLight}08 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${palette.error}20 0%, ${palette.errorLight}15 100%)`,
            transform: 'translateY(-1px)', // Reducido de -2px
            boxShadow: `0 6px 20px ${palette.error}25`, // Reducida sombra
            borderLeft: `3px solid ${palette.error}`, // Reducido de 4px
          },
          transition: 'all 0.2s ease', // Reducida duración
          border: `2px solid ${palette.error}20`,
          borderLeft: '3px solid transparent', // Reducido de 4px
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
        {/* Efecto de fondo decorativo - más pequeño */}
        <Box
          sx={{
            position: 'absolute',
            top: -8, // Reducido de -10
            right: -8, // Reducido de -10
            width: 32, // Reducido de 40
            height: 32, // Reducido de 40
            borderRadius: '50%',
            background: `radial-gradient(circle, ${palette.error}15 0%, transparent 70%)`,
            opacity: 0.6,
          }}
        />
        
        <ListItemIcon sx={{ 
          minWidth: 36, // Reducido de 44
          position: 'relative',
          zIndex: 1
        }}>
          <Box
            sx={{
              p: 0.8, // Reducido de 1
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${palette.error} 0%, ${palette.errorLight} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 3px 8px ${palette.error}40`, // Reducida sombra
              transition: 'all 0.2s ease', // Reducida duración
              '.MuiListItemButton:hover &': {
                transform: 'scale(1.05) rotate(-3deg)', // Reducido efecto
              }
            }}
          >
            <ExitToAppIcon sx={{ 
              fontSize: 18, // Reducido de 20
              color: 'white',
              fontWeight: 'bold'
            }} />
          </Box>
        </ListItemIcon>
        
        <ListItemText 
          primary={
            <Typography 
              variant="body2" // Cambiado de body1 a body2
              sx={{
                fontSize: '0.9rem', // Reducido de 1rem
                fontWeight: '600', // Reducido de 700
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
                fontSize: '0.7rem' // Reducido de 0.75rem
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

      {/* Footer decorativo - más compacto */}
      <Box sx={{ 
        textAlign: 'center', 
        mt: 1.5, // Reducido de 2
        pt: 0.8, // Reducido de 1
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '25%', // Ajustado de 20%
          right: '25%', // Ajustado de 20%
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${palette.light} 50%, transparent 100%)`,
        }
      }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: palette.dark,
            opacity: 0.6,
            fontSize: '0.65rem', // Reducido de 0.7rem
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