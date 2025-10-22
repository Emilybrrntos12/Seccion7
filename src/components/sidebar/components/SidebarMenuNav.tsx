import { Box, List, Typography } from '@mui/material';
import SidebarMenuItem from './SidebarMenuItem';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import EditIcon from '@mui/icons-material/Edit';
import ForumIcon from '@mui/icons-material/Forum';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import AnalyticsIcon from '@mui/icons-material/Analytics';

// Paleta de colores tierra
const palette = {
  primary: "#8B7355",
  secondary: "#A0522D",
  background: "#fffdf9",
  light: "#e8dcc8",
  dark: "#5d4037",
  accent: "#c2a77d",
};

interface SidebarMenuNavProps {
  ordersCount: number;
  onNavigate: (path: string) => void;
  pendingOrdersCount?: number;
  isAdmin?: boolean;
}

const SidebarMenuNav = ({ ordersCount, onNavigate, pendingOrdersCount = 0, isAdmin = true }: SidebarMenuNavProps) => (
  <Box sx={{ flex: 1, py: 2 }}>
    {/* Header de la sección de navegación */}
    <Box sx={{ px: 3, pb: 2 }}>
      <Typography 
        variant="h6" 
        fontWeight="800" 
        sx={{ 
          color: palette.dark,
          fontSize: '1.1rem',
          background: `linear-gradient(135deg, ${palette.dark} 0%, ${palette.primary} 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Navegación
      </Typography>
    </Box>

    <List sx={{ p: 0 }}>
      {/* Grupo - Dashboard y Análisis */}
      <Box sx={{ mb: 1 }}>
        <SidebarMenuItem
          icon={
            <Box sx={{
              p: 0.5,
              borderRadius: '50%',
              bgcolor: `${palette.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DashboardIcon sx={{ fontSize: 20, color: palette.primary }} />
            </Box>
          }
          text="Dashboard"
          description="Vista general del negocio"
          onClick={() => onNavigate('/admin')}
          isHighlighted={true}
        />
        
        <SidebarMenuItem
          icon={
            <Box sx={{
              p: 0.5,
              borderRadius: '50%',
              bgcolor: `${palette.secondary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AnalyticsIcon sx={{ fontSize: 20, color: palette.secondary }} />
            </Box>
          }
          text="Estadísticas"
          description="Métricas y análisis"
          onClick={() => onNavigate('/admin/estadisticas')}
        />
      </Box>

      {/* Separador visual */}
      <Box sx={{ 
        px: 3, 
        py: 0.5,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: 16,
          right: 16,
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${palette.light} 50%, transparent 100%)`,
        }
      }} />

      {/* Grupo - Gestión de Productos */}
      <Box sx={{ mb: 1 }}>
        <Typography 
          variant="caption" 
          fontWeight="600" 
          sx={{ 
            color: palette.primary,
            px: 3,
            py: 1,
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Gestión
        </Typography>
        
        <SidebarMenuItem
          icon={
            <Box sx={{
              p: 0.5,
              borderRadius: '50%',
              bgcolor: `${palette.primary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBagIcon sx={{ fontSize: 20, color: palette.primary }} />
            </Box>
          }
          text="Pedidos"
          description={`Ordenes generadas`}
          onClick={() => onNavigate('/admin/orders')}
          badgeContent={ordersCount}
          badgeColor={pendingOrdersCount > 0 ? "warning" : "primary"}
        />
      </Box>

      {/* Separador visual */}
      <Box sx={{ 
        px: 3, 
        py: 0.5,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: 16,
          right: 16,
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${palette.light} 50%, transparent 100%)`,
        }
      }} />

      {/* Grupo - Comunicación y Usuarios */}
      <Box sx={{ mb: 1 }}>
        <Typography 
          variant="caption" 
          fontWeight="600" 
          sx={{ 
            color: palette.primary,
            px: 3,
            py: 1,
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Comunicación
        </Typography>
        
        <SidebarMenuItem
          icon={
            <Box sx={{
              p: 0.5,
              borderRadius: '50%',
              bgcolor: `${palette.secondary}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ForumIcon sx={{ fontSize: 20, color: palette.secondary }} />
            </Box>
          }
          text="Mensajes"
          description="Chat con clientes"
          onClick={() => onNavigate('/admin/mensajes')}
          badgeContent={0} // Puedes pasar el contador real aquí
          badgeColor="error"
        />
        
        {isAdmin && (
          <SidebarMenuItem
            icon={
              <Box sx={{
                p: 0.5,
                borderRadius: '50%',
                bgcolor: `${palette.primary}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PeopleAltIcon sx={{ fontSize: 20, color: palette.primary }} />
              </Box>
            }
            text="Usuarios"
            description="Gestión de usuarios"
            onClick={() => onNavigate('/admin/users')}
          />
        )}
      </Box>

      {/* Separador visual */}
      <Box sx={{ 
        px: 3, 
        py: 0.5,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '50%',
          left: 16,
          right: 16,
          height: '1px',
          background: `linear-gradient(90deg, transparent 0%, ${palette.light} 50%, transparent 100%)`,
        }
      }} />

      {/* Grupo - Configuración */}
      <Box>
        <Typography 
          variant="caption" 
          fontWeight="600" 
          sx={{ 
            color: palette.primary,
            px: 3,
            py: 1,
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          Configuración
        </Typography>
        
        <SidebarMenuItem
          icon={
            <Box sx={{
              p: 0.5,
              borderRadius: '50%',
              bgcolor: `${palette.accent}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <EditIcon sx={{ fontSize: 20, color: palette.accent }} />
            </Box>
          }
          text="Perfil"
          description="Configurar cuenta"
          onClick={() => onNavigate('/admin/edit-profile')}
        />
      </Box>
    </List>
  </Box>
);

export default SidebarMenuNav;