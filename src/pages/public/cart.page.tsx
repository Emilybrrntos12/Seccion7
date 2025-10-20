import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseApp, useSigninCheck } from 'reactfire';
import {
  Box,
  Card,
  CardMedia,
  Typography,
  Button,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  getFirestore,
  collection,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { onSnapshot } from 'firebase/firestore';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';
import RemoveIcon from '@mui/icons-material/RemoveOutlined';

type CartItem = {
  id: string;
  id_usuario: string;
  id_producto: string;
  cantidad: number;
  talla_seleccionada: string;
  fecha_agregada: Date;
  product_data: {
    nombre: string;
    precio: number;
    imagen: string;
  };
}

const CartPage = () => {
  const navigate = useNavigate();
  const app = useFirebaseApp();
  const { status, data: signInCheckResult } = useSigninCheck();
  // Detectar proveedor Google
  const isGoogleUser = signInCheckResult?.signedIn && signInCheckResult?.user?.providerData?.[0]?.providerId === "google.com";
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!signInCheckResult?.signedIn) {
      navigate('/');
      return;
    }

    

    const firestore = getFirestore(app);
    const cartRef = collection(firestore, 'cart');
    const userId = signInCheckResult.user.uid;
    const cartQuery = query(cartRef, where('id_usuario', '==', userId));

    const unsubscribe = onSnapshot(cartQuery, (snapshot) => {
      const items: CartItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as CartItem);
      });
      setCartItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [app, navigate, signInCheckResult, status]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const firestore = getFirestore(app);
    const cartItemRef = doc(firestore, 'cart', itemId);
    await updateDoc(cartItemRef, { cantidad: newQuantity });
  };

  const handleRemoveItem = async (itemId: string) => {
    const firestore = getFirestore(app);
    const cartItemRef = doc(firestore, 'cart', itemId);
    await deleteDoc(cartItemRef);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product_data.precio * item.cantidad), 0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth="lg" mx="auto" p={3}>
      <Button variant="outlined" color="secondary" sx={{ mb: 2 }} onClick={() => navigate(-1)}>
        Regresar
      </Button>
      <Typography variant="h4" gutterBottom>
        Carrito de Compras
      </Typography>

      {cartItems.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Tu carrito está vacío
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Ir a comprar
          </Button>
        </Card>
      ) : (
        <>
          {!isGoogleUser && (
            <Card sx={{ p: 2, mb: 3, bgcolor: '#fffbe6', border: '1px solid #ffe58f' }}>
              <Typography color="warning.main" fontWeight={600}>
                Solo los usuarios que iniciaron sesión con Google pueden realizar compras.
              </Typography>
            </Card>
          )}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: '1fr', md: '8fr 4fr' }, gap: 3 }}>
            <Box sx={{ width: '100%' }}>
              {cartItems.map((item) => (
                <Card key={item.id} sx={{ mb: 2, p: 2 }}>
                  <Box display="flex" gap={2}>
                    <CardMedia
                      component="img"
                      image={item.product_data.imagen}
                      alt={item.product_data.nombre}
                      sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                    />
                    <Box flex={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6">{item.product_data.nombre}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Talla: {item.talla_seleccionada}
                          </Typography>
                          <Typography variant="body1" color="primary.main" sx={{ mt: 1 }}>
                            ${item.product_data.precio}
                          </Typography>
                        </Box>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveItem(item.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mt={2}>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
                          disabled={item.cantidad <= 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography>{item.cantidad}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
            <Box sx={{ width: '100%' }}>
              <Card sx={{ p: 2, position: 'sticky', top: 20 }}>
                <Typography variant="h6" gutterBottom>
                  Resumen de compra
                </Typography>
                <Box my={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Subtotal</Typography>
                    <Typography>${calculateTotal().toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Envío</Typography>
                    <Typography>Gratis</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">Total</Typography>
                    <Typography variant="h6">${calculateTotal().toFixed(2)}</Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  disabled={!isGoogleUser}
                  onClick={() => {
                    if (!signInCheckResult?.signedIn) {
                      navigate('/auth/login');
                    } else if (!isGoogleUser) {
                      // No hacer nada, botón deshabilitado
                    } else {
                      navigate('/checkout', { state: { cartItems } });
                    }
                  }}
                >
                  Proceder al pago
                </Button>
              </Card>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CartPage;