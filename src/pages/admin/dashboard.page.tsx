import { useNavigate } from "react-router-dom";
import { useUser } from "reactfire";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getApp } from "firebase/app";
import { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import SidebarProfile from '../../components/sidebar/sidebar-profile';
import { 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Avatar,
  IconButton,
  Skeleton,
  Alert
} from "@mui/material";
import {
  Edit,
  Delete,
  Store,
  Inventory,
  LocalOffer,
  ShoppingBag,
  Rocket,
} from "@mui/icons-material";

type Product = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  fotos?: string[];
  createdBy: string;
};

// Paleta de colores tierra creativa
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
  brownLight: "#d7ccc8",
  brownMedium: "#a1887f"
};

const DashboardPage = () => {
  const { data: user } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ nombre?: string; email?: string; avatar?: string } | null>(null);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Obtener perfil del usuario desde Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.uid) return;
      const firestore = getFirestore(getApp());
      const userRef = doc(firestore, "users", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setProfile(snap.data() as { nombre?: string; email?: string; avatar?: string });
      }
    };
    fetchProfile();
  }, [user]);

  // Obtener productos creados por el usuario actual
  useEffect(() => {
    const fetchUserProducts = async () => {
      setLoading(true);
      if (!user?.uid) return setLoading(false);
      
      try {
        const { getFirestore, collection, getDocs } = await import('firebase/firestore/lite');
        const app = await import('firebase/app');
        const firestore = getFirestore(app.getApp());
        const productsCol = collection(firestore, "products");
        const snapshot = await getDocs(productsCol);
        
        const items: Product[] = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              nombre: data.nombre ?? '',
              descripcion: data.descripcion ?? '',
              precio: data.precio ?? 0,
              imagen: data.imagen,
              fotos: Array.isArray(data.fotos) ? data.fotos : undefined,
              createdBy: data.createdBy
            };
          })
          .filter(product => product.createdBy === user.uid);
        
        setProducts(items);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProducts();
  }, [user]);

  const handleDeleteProduct = async (productId: string, productName: string) => {
    const confirm = window.confirm(`¿Estás seguro de que deseas eliminar "${productName}"?`);
    if (!confirm) return;
    
    try {
      const { getFirestore, doc, deleteDoc } = await import('firebase/firestore/lite');
      const app = await import('firebase/app');
      const firestore = getFirestore(app.getApp());
      await deleteDoc(doc(firestore, 'products', productId));
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error al eliminar el producto. Intenta nuevamente.");
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const displayName = profile?.nombre || user?.displayName || profile?.email || user?.email || "Invitado";

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 50%, #d7ccc8 100%)',
      position: 'relative'
    }}>
      <SidebarProfile 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onOpen={() => setSidebarOpen(true)} 
      />
      
      <Box sx={{ 
        flex: 1, 
        p: 3,
        ml: sidebarOpen ? '280px' : 0,
        transition: 'margin-left 0.3s ease',
        position: 'relative'
      }}>
        
        {/* Elementos decorativos de fondo */}
        <Box sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139, 115, 85, 0.1) 0%, rgba(139, 115, 85, 0) 70%)',
          zIndex: 0
        }} />
        
        <Box sx={{
          position: 'absolute',
          bottom: 50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(160, 82, 45, 0.08) 0%, rgba(160, 82, 45, 0) 70%)',
          zIndex: 0
        }} />

        {/* Header Hero Section */}
        <Card sx={{
          background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.secondary} 100%)`,
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(139, 115, 85, 0.4)',
          mb: 4,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          border: `2px solid ${palette.light}`
        }}>
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 3, 
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
                <Avatar
                  sx={{
                    width: 90,
                    height: 90,
                    bgcolor: palette.background,
                    color: palette.primary,
                    fontSize: '2.2rem',
                    fontWeight: 'bold',
                    border: `4px solid ${palette.light}`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 12px 40px rgba(0,0,0,0.3)'
                    }
                  }}
                  src={profile?.avatar || user?.photoURL || undefined}
                >
                  {getInitials(displayName)}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h2" fontWeight="900" sx={{ 
                    color: 'white', 
                    mb: 1,
                    fontSize: { xs: '2rem', md: '3rem' },
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}>
                    ¡Hola, {displayName}!
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    color: palette.light, 
                    opacity: 0.95,
                    fontSize: { xs: '1rem', md: '1.5rem' }
                  }}>
                    Tu centro de control para el éxito empresarial
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="contained"
                startIcon={<Rocket />}
                onClick={() => navigate("/admin/new-product")}
                sx={{
                  bgcolor: palette.background,
                  color: palette.primary,
                  px: 5,
                  py: 2,
                  fontSize: '1.2rem',
                  borderRadius: 3,
                  fontWeight: '800',
                  minWidth: 220,
                  border: `3px solid ${palette.light}`,
                  '&:hover': {
                    bgcolor: palette.light,
                    transform: 'translateY(-4px)',
                    boxShadow: `0 15px 35px rgba(255, 255, 255, 0.3)`
                  },
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                Crear Producto
              </Button>
            </Box>
          </CardContent>
          
          {/* Patrón decorativo */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            opacity: 0.6,
            zIndex: 1
          }} />
        </Card>

        {/* Stats Cards - Diseño en fila */}
        <Box sx={{ 
          display: 'flex', 
          gap: 3, 
          mb: 4, 
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {/* Tarjeta 1 - Productos Totales */}
          <Card sx={{
            background: 'white',
            borderRadius: 3,
            boxShadow: '0 12px 40px rgba(139, 115, 85, 0.15)',
            border: `2px solid ${palette.light}`,
            transition: 'all 0.4s ease',
            flex: '1 1 200px',
            minWidth: 220,
            maxWidth: 280,
            position: 'relative',
            overflow: 'hidden',
            '&:hover': {
              transform: 'translateY(-8px) rotate(1deg)',
              boxShadow: '0 20px 50px rgba(139, 115, 85, 0.25)'
            }
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <Box sx={{
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                bgcolor: `${palette.primary}20`,
                mb: 2,
                border: `2px solid ${palette.primary}30`
              }}>
                <ShoppingBag sx={{ fontSize: 32, color: palette.primary }} />
              </Box>
              <Typography variant="h3" fontWeight="900" sx={{ 
                color: palette.dark, 
                mb: 1,
                background: `linear-gradient(135deg, ${palette.dark} 0%, ${palette.primary} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {products.length}
              </Typography>
              <Typography variant="h6" sx={{ color: palette.primary, fontWeight: 700 }}>
                Productos Totales
              </Typography>
            </CardContent>
            <Box sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${palette.primary} 0%, ${palette.secondary} 100%)`
            }} />
          </Card>

          {/* Tarjeta 2 - Productos Premium */}


          {/* Tarjeta 3 - Ingreso Potencial */}

        </Box>

        {/* Products Section */}
        <Card sx={{
          background: 'white',
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(139, 115, 85, 0.15)',
          border: `2px solid ${palette.light}`,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              mb: 4,
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Box>
                <Typography variant="h3" fontWeight="900" sx={{ 
                  color: palette.dark, 
                  mb: 1,
                  background: `linear-gradient(135deg, ${palette.dark} 0%, ${palette.primary} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Tu Catálogo
                </Typography>
                <Typography variant="h6" sx={{ color: palette.primary, opacity: 0.8, fontWeight: 600 }}>
                  Gestiona tu colección de productos
                </Typography>
              </Box>
              
              <Chip 
                icon={<Inventory />}
                label={`${products.length} productos en stock`}
                sx={{ 
                  bgcolor: palette.primary,
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '1rem',
                  px: 3,
                  py: 2,
                  border: `2px solid ${palette.light}`
                }}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
                {[1, 2, 3].map((item) => (
                  <Skeleton 
                    key={item} 
                    variant="rectangular" 
                    width={300} 
                    height={350} 
                    sx={{ borderRadius: 3 }} 
                  />
                ))}
              </Box>
            ) : products.length === 0 ? (
              <Alert 
                severity="info" 
                sx={{ 
                  bgcolor: `${palette.light}40`,
                  border: `2px solid ${palette.light}`,
                  borderRadius: 3,
                  p: 4,
                  '& .MuiAlert-icon': { color: palette.primary, fontSize: 32 }
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Store sx={{ fontSize: 64, color: palette.primary, mb: 2, opacity: 0.7 }} />
                  <Typography variant="h4" sx={{ color: palette.dark, mb: 2, fontWeight: 800 }}>
                    ¡Tu tienda está esperando!
                  </Typography>
                  <Typography variant="h6" sx={{ color: palette.primary, mb: 3, opacity: 0.9 }}>
                    Convierte tu creatividad en oportunidades de negocio
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Rocket />}
                    onClick={() => navigate("/admin/new-product")}
                    sx={{
                      bgcolor: palette.primary,
                      color: 'white',
                      px: 5,
                      py: 2,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      fontWeight: '800',
                      '&:hover': {
                        bgcolor: palette.secondary,
                        transform: 'scale(1.05)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Lanzar Primer Producto
                  </Button>
                </Box>
              </Alert>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                gap: 4, 
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {products.map((product) => (
                  <Card key={product.id} sx={{
                    background: 'white',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
                    border: `2px solid ${palette.light}`,
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    width: 320,
                    minHeight: 420,
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: '0 25px 60px rgba(139, 115, 85, 0.25)',
                      borderColor: palette.primary
                    }
                  }}>
                    {/* Product Image */}
                    <Box sx={{ 
                      height: 220, 
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {(product.fotos && product.fotos.length > 0) || product.imagen ? (
                        <img 
                          src={product.fotos?.[0] || product.imagen} 
                          alt={product.nombre}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            transition: 'transform 0.6s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        />
                      ) : (
                        <Box sx={{
                          height: '100%',
                          background: `linear-gradient(135deg, ${palette.light} 0%, ${palette.brownLight} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Store sx={{ fontSize: 64, color: palette.primary, opacity: 0.4 }} />
                        </Box>
                      )}
                      
                      {/* Price Badge */}
                      <Chip
                        icon={<LocalOffer />}
                        label={`Q${product.precio}`}
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          bgcolor: palette.primary,
                          color: 'white',
                          fontWeight: '800',
                          fontSize: '1.1rem',
                          height: 36,
                          border: `2px solid ${palette.light}`
                        }}
                      />
                    </Box>

                    <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography 
                        variant="h5" 
                        fontWeight="800" 
                        sx={{ 
                          color: palette.dark,
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '4.5rem'
                        }}
                      >
                        {product.nombre}
                      </Typography>
                      
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: palette.primary,
                          opacity: 0.9,
                          mb: 3,
                          flex: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.6
                        }}
                      >
                        {product.descripcion}
                      </Typography>

                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        mt: 'auto'
                      }}>
                        <Button
                          startIcon={<Edit />}
                          onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                          sx={{
                            bgcolor: palette.primary,
                            color: 'white',
                            borderRadius: 2,
                            flex: 1,
                            py: 1,
                            fontWeight: 700,
                            '&:hover': {
                              bgcolor: palette.dark,
                              transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Editar
                        </Button>
              
                        <IconButton
                          onClick={() => handleDeleteProduct(product.id, product.nombre)}
                          sx={{
                            bgcolor: `${palette.error}20`,
                            color: palette.error,
                            borderRadius: 2,
                            width: 48,
                            height: 48,
                            '&:hover': {
                              bgcolor: palette.error,
                              color: 'white',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardPage;