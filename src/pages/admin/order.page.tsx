import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, Timestamp } from "firebase/firestore";
import { getApp } from "firebase/app";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  ListItemAvatar,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Stack
} from "@mui/material";
import {
  ShoppingBag,
  Person,
  Email,
  Phone,
  LocationOn,
  Payment,
  Notes,
  CalendarToday,
  LocalShipping,
  CheckCircle,
  Pending,
  Cancel,
  AttachMoney
} from "@mui/icons-material";

// Tipos
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

const OrderPage = () => {
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getStatusIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'completado':
      case 'entregado':
        return <CheckCircle sx={{ color: theme.palette.success.main }} />;
      case 'pendiente':
      case 'procesando':
        return <Pending sx={{ color: theme.palette.warning.main }} />;
      case 'cancelado':
        return <Cancel sx={{ color: theme.palette.error.main }} />;
      default:
        return <LocalShipping sx={{ color: theme.palette.info.main }} />;
    }
  };

  const getStatusColor = (estado: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (estado.toLowerCase()) {
      case 'completado':
      case 'entregado':
        return 'success';
      case 'pendiente':
      case 'procesando':
        return 'warning';
      case 'cancelado':
        return 'error';
      default:
        return 'info';
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const firestore = getFirestore(getApp());
        const ordersRef = collection(firestore, "orders");
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
        
        // Ordenar por fecha más reciente primero
        pedidos.sort((a, b) => b.fecha?.toMillis() - a.fecha?.toMillis());
        setOrders(pedidos);
      } catch (err) {
        setError('Error al cargar las órdenes');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="60vh"
        flexDirection="column"
      >
        <CircularProgress 
          size={60} 
          sx={{ 
            mb: 2, 
            color: theme.palette.primary.main 
          }} 
        />
        <Typography variant="h6" color="text.secondary">
          Cargando órdenes...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxWidth="md" mx="auto" p={3}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box maxWidth="lg" mx="auto" p={isMobile ? 2 : 3}>
      {/* Header */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderRadius: 3
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <ShoppingBag sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Órdenes Realizadas
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              {orders.length} {orders.length === 1 ? 'orden encontrada' : 'órdenes encontradas'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {orders.length === 0 ? (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 3 
          }}
        >
          <ShoppingBag 
            sx={{ 
              fontSize: 60, 
              color: 'text.secondary', 
              mb: 2 
            }} 
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No hay órdenes registradas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cuando se realicen pedidos, aparecerán aquí.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {orders.map((order) => (
            <Card 
              key={order.id}
              elevation={3}
              sx={{ 
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                {/* Header del pedido */}
                <Box 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="flex-start" 
                  mb={2}
                  flexDirection={isMobile ? 'column' : 'row'}
                  gap={isMobile ? 2 : 0}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Orden #{order.id.slice(-8).toUpperCase()}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <Chip
                        icon={getStatusIcon(order.estado)}
                        label={order.estado}
                        color={getStatusColor(order.estado)}
                        variant="filled"
                        size="small"
                      />
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.fecha)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    gap={1}
                    sx={{ 
                      color: theme.palette.primary.main 
                    }}
                  >
                    <AttachMoney />
                    <Typography variant="h5" fontWeight="bold">
                      {order.total?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Información del cliente y pago */}
                <Box 
                  display="flex" 
                  flexDirection={isMobile ? 'column' : 'row'} 
                  gap={3}
                  mb={3}
                >
                  {/* Información del cliente */}
                  <Box flex={1}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="bold" 
                      gutterBottom 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}
                    >
                      <Person color="primary" /> Información del Cliente
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Person sx={{ fontSize: 18, color: 'text.secondary', minWidth: 24 }} />
                        <Typography variant="body2">{order.nombre}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Email sx={{ fontSize: 18, color: 'text.secondary', minWidth: 24 }} />
                        <Typography variant="body2">{order.email}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Phone sx={{ fontSize: 18, color: 'text.secondary', minWidth: 24 }} />
                        <Typography variant="body2">{order.telefono}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOn sx={{ fontSize: 18, color: 'text.secondary', minWidth: 24 }} />
                        <Typography variant="body2">{order.direccion}</Typography>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Información del pago */}
                  <Box flex={1}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="bold" 
                      gutterBottom 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1 
                      }}
                    >
                      <Payment color="primary" /> Información del Pago
                    </Typography>
                    <Stack spacing={1.5}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Payment sx={{ fontSize: 18, color: 'text.secondary', minWidth: 24 }} />
                        <Typography variant="body2">{order.metodoPago}</Typography>
                      </Box>
                      {order.notas && (
                        <Box display="flex" alignItems="flex-start" gap={1}>
                          <Notes sx={{ fontSize: 18, color: 'text.secondary', minWidth: 24, mt: 0.25 }} />
                          <Typography variant="body2">
                            <strong>Notas:</strong> {order.notas}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Productos */}
                <Typography 
                  variant="subtitle1" 
                  fontWeight="bold" 
                  gutterBottom 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1 
                  }}
                >
                  <ShoppingBag color="primary" /> 
                  Productos ({order.cartItems?.length || 0})
                </Typography>
                
                <List sx={{ pt: 0 }}>
                  {order.cartItems?.map((item: PedidoCartItem, idx: number) => (
                    <ListItem 
                      key={idx}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: 'background.default',
                        px: 2,
                        py: 1.5
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar 
                          src={item.imagen} 
                          variant="rounded"
                          sx={{ 
                            width: 56, 
                            height: 56,
                            bgcolor: theme.palette.primary.light
                          }}
                        >
                          <ShoppingBag />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="medium">
                            {item.nombre}
                          </Typography>
                        }
                        secondary={
                          <Box component="div">
                            <Typography variant="body2" color="text.secondary" component="span">
                              Talla: {item.talla_seleccionada} | Cantidad: {item.cantidad}
                            </Typography>
                            <br />
                            <Typography variant="body2" fontWeight="bold" color="primary" component="span">
                              ${item.precio?.toFixed(2)} c/u
                            </Typography>
                          </Box>
                        }
                        sx={{ ml: 2 }}
                      />
                      <Box 
                        display="flex" 
                        alignItems="center" 
                        gap={1}
                        sx={{ 
                          minWidth: isMobile ? 'auto' : 100 
                        }}
                      >
                        <AttachMoney sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="body1" fontWeight="bold">
                          {(item.precio * item.cantidad)?.toFixed(2)}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default OrderPage;