import { Box, Typography } from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PendingActionsIcon from '@mui/icons-material/PendingActions';

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
        p: 1.5,
        m: 1,
        borderRadius: 2,
        backgroundColor: palette.background,
        border: `1px solid ${palette.light}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        minWidth: '200px'
      }}
    >
      {/* Total Orders */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ShoppingBagIcon 
            sx={{ 
              fontSize: 18, 
              color: palette.primary 
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: '1.2rem',
              color: palette.dark
            }}
          >
            {totalOrders}
          </Typography>
        </Box>
        <Typography 
          variant="caption" 
          sx={{ 
            color: palette.primary,
            fontSize: '0.7rem',
            fontWeight: '500'
          }}
        >
          Total
        </Typography>
      </Box>

      {/* Divider */}
      <Box 
        sx={{ 
          width: '1px', 
          height: '30px', 
          backgroundColor: palette.light,
          mx: 1
        }} 
      />

      {/* Pending Orders */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PendingActionsIcon 
            sx={{ 
              fontSize: 18, 
              color: pendingOrders > 0 ? palette.warning : palette.primary 
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: '1.2rem',
              color: pendingOrders > 0 ? palette.warning : palette.dark
            }}
          >
            {pendingOrders}
          </Typography>
        </Box>
        <Typography 
          variant="caption" 
          sx={{ 
            color: pendingOrders > 0 ? palette.warning : palette.primary,
            fontSize: '0.7rem',
            fontWeight: '500'
          }}
        >
          Pendientes
        </Typography>
      </Box>
    </Box>
  );
};

export default SidebarOrderStats;