import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  Divider, 
  IconButton,
  Badge,
  Avatar,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { useUser } from 'reactfire';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import EditIcon from '@mui/icons-material/Edit';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HistoryIcon from '@mui/icons-material/History';
import ForumIcon from '@mui/icons-material/Forum';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useAuthActions } from '../../hooks/use-auth-actions';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import UsersStats from './users-stats';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { useUnreadMessages } from '@/hooks/use-unread-messages';

export type PedidoCartItem = {
  id_producto: string;
  cantidad: number;
  talla_seleccionada: string;
  nombre: string;
  precio: number;
  imagen: string;
};

export type Pedido = {
  id: string;
  id_usuario: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  metodoPago: string;
  notas: string;
  cartItems: PedidoCartItem[];
  total: number;
  fecha: Timestamp;
  estado: string;
};

const SidebarProfile = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
  const { data: user } = useUser();
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuthActions();
  const theme = useTheme();
  const unreadCount = useUnreadMessages(isAdmin);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.uid) return;
      const firestore = getFirestore(getApp());
      // Verificar si el usuario es admin
      const adminDoc = await getDoc(doc(firestore, "admins", user.uid));
      if (!adminDoc.exists()) {
        setOrders([]);
        setPendingOrders(0);
        setIsAdmin(false);
        return;
      }
      setIsAdmin(true);
      // Si es admin, obtener todos los pedidos
      const ordersRef = collection(firestore, 'orders');
      const snapshot = await getDocs(ordersRef);
      const pedidos: Pedido[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          id_usuario: data.id_usuario,
          nombre: data.nombre,
          direccion: data.direccion,
          telefono: data.telefono,
          email: data.email,
          metodoPago: data.metodoPago,
          notas: data.notas,
          cartItems: data.cartItems,
          total: data.total,
          fecha: data.fecha,
          estado: data.estado,
        };
      });
      setOrders(pedidos);
      const pending = pedidos.filter(order => 
        order.estado?.toLowerCase() === 'pendiente' || 
        order.estado?.toLowerCase() === 'procesando'
      ).length;
      setPendingOrders(pending);
    };
    fetchOrders();
  }, [user]);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    const { success } = await logout();
    if (success) {
      navigate("/");
      onClose();
    } else {
      alert("Error al cerrar sesión");
    }
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  return (
    <>
      {/* Botón para abrir el sidebar */}
      {!open && (
        <IconButton
          onClick={onClose}
          sx={{
            position: 'fixed',
            left: 16,
            top: 16,
            zIndex: 1200,
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            boxShadow: 2,
          }}
        >
          <ArrowForwardIosIcon sx={{ fontSize: 20 }} />
        </IconButton>
      )}

      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: open ? 280 : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            backgroundColor: 'white',
            border: 'none',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Header con información del usuario */}
        <Box sx={{ p: 3, pb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Chip
                    label="Online"
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.6rem',
                      backgroundColor: theme.palette.success.main,
                      color: 'white',
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                }
              >
                <Avatar
                  src={user?.photoURL || undefined}
                  sx={{
                    width: 60,
                    height: 60,
                    border: `2px solid ${theme.palette.primary.main}`,
                    backgroundColor: user?.photoURL ? 'transparent' : theme.palette.primary.main,
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {getInitials(user?.displayName || 'Usuario')}
                </Avatar>
              </Badge>

              <Box>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  {user?.displayName || "Usuario"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                  {user?.email}
                </Typography>
              </Box>
            </Box>

            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.18),
                }
              }}
            >
              <ArrowBackIosIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Usuarios alcanzados */}
        <UsersStats />
        {/* Estadísticas rápidas */}
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
              {orders.length}
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

        {/* Menú de navegación */}
        <Box sx={{ flex: 1, mt: 2 }}>
          <List sx={{ p: 0 }}>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => handleNavigation('/admin/dashboard')}
                sx={{
                  mx: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <DashboardIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Dashboard" 
                  primaryTypographyProps={{ 
                    fontSize: '0.95rem',
                    color: 'text.primary'
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => handleNavigation('/admin/orders')}
                sx={{
                  mx: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Badge 
                    badgeContent={orders.length} 
                    color="primary"
                    sx={{ 
                      '& .MuiBadge-badge': { 
                        fontSize: '0.6rem',
                        height: 16,
                        minWidth: 16 
                      } 
                    }}
                  >
                    <ShoppingBagIcon color="primary" />
                  </Badge>
                </ListItemIcon>
                <ListItemText 
                  primary="Mis Pedidos" 
                  primaryTypographyProps={{ 
                    fontSize: '0.95rem',
                    color: 'text.primary'
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => handleNavigation('/admin/order-history')}
                sx={{
                  mx: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <HistoryIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Historial" 
                  primaryTypographyProps={{ 
                    fontSize: '0.95rem',
                    color: 'text.primary'
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => handleNavigation('/admin/edit-profile')}
                sx={{
                  mx: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <EditIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Editar Perfil" 
                  primaryTypographyProps={{ 
                    fontSize: '0.95rem',
                    color: 'text.primary'
                  }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => handleNavigation('/admin/mensajes')}
                sx={{
                  mx: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Badge badgeContent={unreadCount} color="error">
                    <ForumIcon color="primary" />
                  </Badge>
                </ListItemIcon>
                <ListItemText 
                  primary="Mensajes" 
                  primaryTypographyProps={{ 
                    fontSize: '0.95rem',
                    color: 'text.primary'
                  }}
                />
              </ListItemButton>
            </ListItem>

            {/* Nuevo ítem para Usuarios Registrados */}
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton 
                onClick={() => handleNavigation('/admin/users')}
                sx={{
                  mx: 2,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    transform: 'translateX(4px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PeopleAltIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Usuarios Registrados" 
                  primaryTypographyProps={{ 
                    fontSize: '0.95rem',
                    color: 'text.primary'
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>

        {/* Footer con botón de logout */}
        <Box sx={{ p: 2 }}>
          <Divider sx={{ mb: 2 }} />
          <ListItemButton 
            onClick={handleLogout}
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
      </Drawer>
    </>
  );
};

export default SidebarProfile;