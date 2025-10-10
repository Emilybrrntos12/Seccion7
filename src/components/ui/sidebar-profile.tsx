import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, IconButton } from '@mui/material';
import { useUser } from 'reactfire';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuthActions } from '../../hooks/use-auth-actions';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from 'react-router-dom';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
type PedidoCartItem = {
  id_producto: string;
  cantidad: number;
  talla_seleccionada: string;
  nombre: string;
  precio: number;
  imagen: string;
};

type Pedido = {
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
import { getApp } from 'firebase/app';

const SidebarProfile = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
  const { data: user } = useUser();
  const [orders, setOrders] = useState<Pedido[]>([]);
  const navigate = useNavigate();
  const { logout } = useAuthActions();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.uid) return;
      const firestore = getFirestore(getApp());
      const ordersRef = collection(firestore, 'orders');
      const q = query(ordersRef, where('id_usuario', '==', user.uid));
      const snapshot = await getDocs(q);
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
    };
    fetchOrders();
  }, [user]);

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: 220,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 220, boxSizing: 'border-box', bgcolor: '#f5f5f5' },
      }}
    >
      <Box display="flex" flexDirection="column" alignItems="center" py={3} height="100%">
        <Box mb={2}>
          <img src={user?.photoURL || "https://ui-avatars.com/api/?name=Admin"} alt="Foto de perfil" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 8px #ccc' }} />
        </Box>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>{user?.displayName || "Sin nombre"}</Typography>
        <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 700 }}>&times;</span>
        </IconButton>
        <List sx={{ width: '100%' }}>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/admin/orders')}>
              <ListItemIcon>
                <LocalMallIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary={`Pedidos (${orders.length})`} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => navigate('/admin/edit-profile')}>
              <ListItemIcon>
                <PersonIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary="Editar perfil" />
            </ListItemButton>
          </ListItem>
        </List>
        <Box flex={1} />
        <Divider sx={{ my: 2, width: '80%' }} />
        <List sx={{ width: '100%' }}>
          <ListItem disablePadding>
            <ListItemButton onClick={async () => {
              const { success } = await logout();
              if (success) navigate("/");
              else alert("Error al cerrar sesión");
            }}>
              <ListItemIcon>
                <LogoutIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Cerrar sesión" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default SidebarProfile;
