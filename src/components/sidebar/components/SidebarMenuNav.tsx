import { Box, List } from '@mui/material';
import SidebarMenuItem from './SidebarMenuItem';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import ForumIcon from '@mui/icons-material/Forum';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

interface SidebarMenuNavProps {
  ordersCount: number;
  onNavigate: (path: string) => void;
}

const SidebarMenuNav = ({ ordersCount, onNavigate }: SidebarMenuNavProps) => (
  <Box sx={{ flex: 1, mt: 2 }}>
    <List sx={{ p: 0 }}>
      <SidebarMenuItem
        icon={<DashboardIcon color="primary" />}
        text="Dashboard"
        onClick={() => onNavigate('/admin/dashboard')}
      />
      <SidebarMenuItem
        icon={<ShoppingBagIcon color="primary" />}
        text="Mis Pedidos"
        onClick={() => onNavigate('/admin/orders')}
        badgeContent={ordersCount}
      />
      <SidebarMenuItem
        icon={<HistoryIcon color="primary" />}
        text="Historial"
        onClick={() => onNavigate('/admin/order-history')}
      />
      <SidebarMenuItem
        icon={<EditIcon color="primary" />}
        text="Editar Perfil"
        onClick={() => onNavigate('/admin/edit-profile')}
      />
      <SidebarMenuItem
        icon={<ForumIcon color="primary" />}
        text="Mensajes"
        onClick={() => onNavigate('/admin/mensajes')}
      />
      <SidebarMenuItem
        icon={<PeopleAltIcon color="primary" />}
        text="Usuarios Registrados"
        onClick={() => onNavigate('/admin/users')}
      />
    </List>
  </Box>
);

export default SidebarMenuNav;
