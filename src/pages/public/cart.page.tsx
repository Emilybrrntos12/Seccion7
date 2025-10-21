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
  Chip,
  Paper,
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
import {
  Delete,
  Add,
  Remove,
  ShoppingBagOutlined,
  WarningAmber,
  LocalShipping,
  Security
} from '@mui/icons-material';
import Header from '@/components/ui/header';

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
    fotos?: string[];
  };
}

const CartPage = () => {
  const navigate = useNavigate();
  const app = useFirebaseApp();
  const { status, data: signInCheckResult } = useSigninCheck();
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

  const calculateItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.cantidad, 0);
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 50%)'
      }}>
        <CircularProgress sx={{ color: '#8B7355' }} size={60} />
      </Box>
    );
  }

  return (
    <>
      <Header />
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 100%)',
        paddingTop: '80px',
        py: 4
      }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
          {/* Header del carrito */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>

            <Box pt={10} sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="700" sx={{ color: '#5d4037', mb: 1 }}>
                Tu Carrito
              </Typography>
              <Typography variant="h6" sx={{ color: '#8B7355' }}>
                {calculateItemsCount()} {calculateItemsCount() === 1 ? 'artículo' : 'artículos'}
              </Typography>
            </Box>

            <Box sx={{ width: '120px' }}></Box> {/* Espaciador para centrar */}
          </Box>

          {cartItems.length === 0 ? (
            /* Estado vacío */
            <Card sx={{ 
              textAlign: 'center', 
              p: 6, 
              background: 'white',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
              border: '1px solid #e8dcc8',
              maxWidth: '500px',
              mx: 'auto'
            }}>
              <ShoppingBagOutlined sx={{ fontSize: 80, color: '#e8dcc8', mb: 3 }} />
              <Typography variant="h4" fontWeight="600" sx={{ color: '#8B7355', mb: 2 }}>
                Tu carrito está vacío
              </Typography>
              <Typography variant="body1" sx={{ color: '#5d4037', mb: 4, opacity: 0.8 }}>
                Descubre nuestros productos artesanales y llena tu carrito con calzado único
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                sx={{
                  background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
                  color: 'white',
                  borderRadius: 3,
                  padding: '12px 32px',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #A0522D 0%, #8B7355 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(139, 115, 85, 0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Explorar Productos
              </Button>
            </Card>
          ) : (
            <>
              {/* Alerta para usuarios no Google */}
              {!isGoogleUser && (
                <Paper sx={{ 
                  p: 3, 
                  mb: 4, 
                  background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
                  border: '2px solid #ffd54f',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <WarningAmber sx={{ color: '#ff9800', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="600" sx={{ color: '#8B7355', mb: 0.5 }}>
                      Verificación requerida
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#5d4037' }}>
                      Solo los usuarios que iniciaron sesión con Google pueden realizar compras por seguridad.
                    </Typography>
                  </Box>
                </Paper>
              )}

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
                {/* Lista de productos */}
                <Box sx={{ flex: 1 }}>
                  {cartItems.map((item) => {
                    // Depuración: mostrar en consola las imágenes de cada producto
                    console.log('CART IMG', {
                      id: item.id,
                      nombre: item.product_data.nombre,
                      fotos: item.product_data.fotos,
                      imagen: item.product_data.imagen
                    });
                    return (
                      <Card 
                        key={item.id} 
                        sx={{ 
                          mb: 3, 
                          p: 3,
                          background: 'white',
                          borderRadius: 3,
                          boxShadow: '0 4px 20px rgba(139, 115, 85, 0.1)',
                          border: '1px solid #e8dcc8',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 30px rgba(139, 115, 85, 0.15)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 3 }}>
                          {/* Imagen del producto */}
                          <CardMedia
                            component="img"
                            image={Array.isArray(item.product_data.fotos) && item.product_data.fotos.length > 0
                              ? item.product_data.fotos[0]
                              : item.product_data.imagen}
                            alt={item.product_data.nombre}
                            sx={{ 
                              width: 120, 
                              height: 120, 
                              objectFit: 'cover', 
                              borderRadius: 2,
                              border: '2px solid #e8dcc8'
                            }}
                          />
                          
                          {/* Información del producto */}
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                              <Box>
                                <Typography variant="h6" fontWeight="600" sx={{ color: '#5d4037', mb: 1 }}>
                                  {item.product_data.nombre}
                                </Typography>
                                <Chip 
                                  label={`Talla ${item.talla_seleccionada}`}
                                  size="small"
                                  sx={{
                                    background: '#e8dcc8',
                                    color: '#8B7355',
                                    fontWeight: '600'
                                  }}
                                />
                              </Box>
                              
                              <IconButton
                                onClick={() => handleRemoveItem(item.id)}
                                sx={{
                                  color: '#d32f2f',
                                  background: 'rgba(211, 47, 47, 0.1)',
                                  '&:hover': {
                                    background: 'rgba(211, 47, 47, 0.2)',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </Box>

                            {/* Precio y cantidad */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="h5" fontWeight="700" sx={{ color: '#A0522D' }}>
                                Q{(item.product_data.precio * item.cantidad).toLocaleString()}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body2" sx={{ color: '#8B7355', fontWeight: '600' }}>
                                  Q{item.product_data.precio.toLocaleString()} c/u
                                </Typography>
                                
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 1,
                                  background: '#fffdf9',
                                  borderRadius: 2,
                                  padding: '4px 8px',
                                  border: '1px solid #e8dcc8'
                                }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleUpdateQuantity(item.id, item.cantidad - 1)}
                                    disabled={item.cantidad <= 1}
                                    sx={{
                                      color: '#8B7355',
                                      '&:hover': {
                                        background: 'rgba(139, 115, 85, 0.1)'
                                      },
                                      '&:disabled': {
                                        color: '#e8dcc8'
                                      }
                                    }}
                                  >
                                    <Remove fontSize="small" />
                                  </IconButton>
                                  
                                  <Typography 
                                    variant="body1" 
                                    fontWeight="600" 
                                    sx={{ 
                                      minWidth: '30px', 
                                      textAlign: 'center',
                                      color: '#5d4037'
                                    }}
                                  >
                                    {item.cantidad}
                                  </Typography>
                                  
                                  <IconButton
                                    size="small"
                                    onClick={() => handleUpdateQuantity(item.id, item.cantidad + 1)}
                                    sx={{
                                      color: '#8B7355',
                                      '&:hover': {
                                        background: 'rgba(139, 115, 85, 0.1)'
                                      }
                                    }}
                                  >
                                    <Add fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Card>
                    );
                  })}
                </Box>

                {/* Resumen de compra */}
                <Box sx={{ width: { xs: '100%', lg: '400px' } }}>
                  <Card sx={{ 
                    p: 4, 
                    position: 'sticky', 
                    top: 100,
                    background: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
                    border: '1px solid #e8dcc8'
                  }}>
                    <Typography variant="h5" fontWeight="700" sx={{ color: '#5d4037', mb: 3, textAlign: 'center' }}>
                      Resumen de Pedido
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1" sx={{ color: '#8B7355' }}>Subtotal</Typography>
                        <Typography variant="body1" fontWeight="600" sx={{ color: '#5d4037' }}>
                          Q{calculateTotal().toLocaleString()}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body1" sx={{ color: '#8B7355' }}>EnvÍo</Typography>
                        <Chip 
                          label="GRATIS" 
                          size="small"
                          sx={{
                            background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
                            color: 'white',
                            fontWeight: '600'
                          }}
                        />
                      </Box>
                      
                      <Divider sx={{ my: 2, borderColor: '#e8dcc8' }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" fontWeight="700" sx={{ color: '#5d4037' }}>Total</Typography>
                        <Typography variant="h5" fontWeight="700" sx={{ color: '#A0522D' }}>
                          Q{calculateTotal().toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Beneficios */}
                    <Box sx={{ mb: 3, p: 2, background: '#fffdf9', borderRadius: 2, border: '1px solid #e8dcc8' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocalShipping sx={{ fontSize: 16, color: '#8B7355' }} />
                        <Typography variant="body2" sx={{ color: '#5d4037', fontWeight: '500' }}>
                          Envío gratis a todo el país
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Security sx={{ fontSize: 16, color: '#8B7355' }} />
                        <Typography variant="body2" sx={{ color: '#5d4037', fontWeight: '500' }}>
                          Compra 100% segura
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={!isGoogleUser}
                      onClick={() => navigate('/checkout', { state: { cartItems } })}
                      sx={{
                        background: isGoogleUser 
                          ? 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)'
                          : '#e8dcc8',
                        color: isGoogleUser ? 'white' : '#8B7355',
                        borderRadius: 3,
                        padding: '14px',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        '&:hover': isGoogleUser ? {
                          background: 'linear-gradient(135deg, #A0522D 0%, #8B7355 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(139, 115, 85, 0.3)'
                        } : {},
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isGoogleUser ? 'Proceder al Pago' : 'Verificación Requerida'}
                    </Button>
                  </Card>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default CartPage;