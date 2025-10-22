import { Box, Typography } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

// Paleta de colores tierra
const palette = {
  primary: "#8B7355",
  secondary: "#A0522D",
  background: "#fffdf9",
  light: "#e8dcc8",
  dark: "#5d4037",
  accent: "#c2a77d",
  success: "#4caf50",
  warning: "#ff9800",
  error: "#f44336",
};

interface SidebarOrderStatsProps {
  totalOrders: number;
  pendingOrders: number;
}

const SidebarOrderStats = ({ totalOrders, pendingOrders }: SidebarOrderStatsProps) => {
  return (
    <Box 
      sx={{ 
        p: 2, 
        mx: 2,
        mb: 1,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${palette.light}15 0%, ${palette.background} 100%)`,
        border: `2px solid ${palette.light}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(139, 115, 85, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${palette.primary} 0%, ${palette.secondary} 100%)`,
        }
      }}
    >
      {/* Total de Pedidos */}
      <Box sx={{ textAlign: 'center', flex: 1, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Box
            sx={{
              p: 0.8,
              borderRadius: '50%',
              bgcolor: `${palette.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1
            }}
          >
            <ShoppingBagIcon sx={{ fontSize: 18, color: palette.primary }} />
          </Box>
          <Typography 
            variant="h6" 
            fontWeight="800" 
            sx={{ 
              color: palette.dark,
              fontSize: '1.4rem'
            }}
          >
            {totalOrders}
          </Typography>
        </Box>
        <Typography 
          variant="caption" 
          fontWeight="600" 
          sx={{ 
            color: palette.primary,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Total
        </Typography>
      </Box>

      {/* Separador vertical */}
      <Box 
        sx={{ 
          width: '1px', 
          height: 40, 
          backgroundColor: palette.light,
          mx: 1
        }} 
      />

      {/* Pedidos Pendientes */}
      <Box sx={{ textAlign: 'center', flex: 1, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <Box
            sx={{
              p: 0.8,
              borderRadius: '50%',
              bgcolor: `${pendingOrders > 0 ? palette.warning : palette.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1
            }}
          >
            <PendingActionsIcon 
              sx={{ 
                fontSize: 18, 
                color: pendingOrders > 0 ? palette.warning : palette.primary 
              }} 
            />
          </Box>
          <Typography 
            variant="h6" 
            fontWeight="800" 
            sx={{ 
              color: pendingOrders > 0 ? palette.warning : palette.dark,
              fontSize: '1.4rem'
            }}
          >
            {pendingOrders}
          </Typography>
        </Box>
        <Typography 
          variant="caption" 
          fontWeight="600" 
          sx={{ 
            color: pendingOrders > 0 ? palette.warning : palette.primary,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Pendientes
        </Typography>
      </Box>
    </Box>
  );
};

export default SidebarOrderStats;