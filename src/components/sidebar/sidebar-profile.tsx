import { 
  Drawer, 
  IconButton,
  useTheme,
} from '@mui/material';
import { useUser } from 'reactfire';
import { useAuthActions } from '../../hooks/use-auth-actions';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import SidebarMenuNav from './components/SidebarMenuNav';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SidebarLogout from './components/SidebarLogout';
import SidebarUserHeader from './components/SidebarUserHeader';
import SidebarOrderStats from './components/SidebarOrderStats';

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

interface UserProfile {
  nombre?: string;
  email?: string;
  foto?: string;
  telefono?: string;
  aniosNegocio?: string;
  historia?: string;
}

const SidebarProfile = ({ open, onClose, onOpen }: { open: boolean, onClose: () => void, onOpen: () => void }) => {
  const { data: user } = useUser();
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();
  const { logout } = useAuthActions();
  const theme = useTheme();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.uid) return;
      const firestore = getFirestore(getApp());
      // Verificar si el usuario es admin
      const adminDoc = await getDoc(doc(firestore, "admins", user.uid));
      if (!adminDoc.exists()) {
        setOrders([]);
        setPendingOrders(0);
        return;
      }
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

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;
      const firestore = getFirestore(getApp());
      const userRef = doc(firestore, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      }
    };
    fetchProfile();
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

  const safeUser = {
    displayName: profile?.nombre ?? user?.displayName ?? undefined,
    email: profile?.email ?? user?.email ?? undefined,
    photoURL: profile?.foto ?? user?.photoURL ?? undefined,
    telefono: profile?.telefono ?? undefined,
  };

  return (
    <>
      {/* Botón para abrir el sidebar */}
      {!open && (
        <IconButton
          onClick={onOpen}
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
        <SidebarUserHeader user={safeUser} onClose={onClose} getInitials={getInitials} />

        {/* Estadísticas rápidas */}
        <SidebarOrderStats totalOrders={orders.length} pendingOrders={pendingOrders} />

        {/* Menú de navegación */}
        <SidebarMenuNav ordersCount={orders.length} onNavigate={handleNavigation} />

        {/* Footer con botón de logout */}
        <SidebarLogout onLogout={handleLogout} />
      </Drawer>
    </>
  );
};

export default SidebarProfile;