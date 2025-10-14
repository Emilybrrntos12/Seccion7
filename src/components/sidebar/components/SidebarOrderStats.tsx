import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

interface SidebarOrderStatsProps {
  totalOrders: number;
  pendingOrders: number;
}

const SidebarOrderStats = ({ totalOrders, pendingOrders }: SidebarOrderStatsProps) => {
  const theme = useTheme();
  return (
    <Box 
      sx={{ 
        p: 2, 
        mx: 2,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        display: 'flex',
        justifyContent: 'space-around'
      }}
    >
      <Box textAlign="center">
        <Typography variant="h6" fontWeight="bold" color="primary.main">
          {totalOrders}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Pedidos
        </Typography>
      </Box>
      <Box textAlign="center">
        <Typography 
          variant="h6" 
          fontWeight="bold"
          color={pendingOrders > 0 ? 'warning.main' : 'primary.main'}
        >
          {pendingOrders}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Pendientes
        </Typography>
      </Box>
    </Box>
  );
};

export default SidebarOrderStats;
