import { useNavigate } from "react-router-dom";
import { useUser } from "reactfire";
import { useState, useEffect } from "react";
import {
  Container,
  Box,
  IconButton,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  Paper,
  alpha,
  useTheme
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  ShoppingBag
} from "@mui/icons-material";
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SidebarProfile from '../../components/ui/sidebar-profile';

type Product = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
  createdBy?: string;
};

const DashboardPage = () => {
  const { data: user } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const theme = useTheme();

  // Obtener productos creados por el usuario actual
  useEffect(() => {
    const fetchUserProducts = async () => {
      setLoading(true);
      if (!user?.uid) return setLoading(false);
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
            createdBy: data.createdBy
          };
        })
        .filter(product => product.createdBy === user.uid);
      setProducts(items);
      setLoading(false);
    };
    fetchUserProducts();
  }, [user]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <SidebarProfile open={sidebarOpen} onClose={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main Content */}
      <Box sx={{ flex: 1, p: 2, ml: sidebarOpen ? 0 : 0 }}>
        {!sidebarOpen && (
          <IconButton 
            onClick={() => setSidebarOpen(true)} 
            sx={{ 
              position: 'fixed', 
              top: 16, 
              left: 16, 
              zIndex: 1201, 
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                transform: 'scale(1.1)',
              },
              boxShadow: 3,
              transition: 'all 0.3s ease',
            }}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        )}

        <Container maxWidth="xl" sx={{ mt: 1 }}>
          {/* Header Section Compacto */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                ¡Hola, {user?.displayName || "Invitado"}!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                Gestiona tus productos desde un solo lugar
              </Typography>
              <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<Add />}
                  onClick={() => navigate("/admin/new-product")}
                  sx={{
                    backgroundColor: 'white',
                    color: theme.palette.primary.main,
                    px: 3,
                    py: 1,
                    fontSize: '0.9rem',
                    borderRadius: 2,
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.9),
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  Nuevo Producto
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Products Section Compacta */}
          <Card elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box
              sx={{
                p: 2,
                backgroundColor: 'white',
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  Tus Productos
                </Typography>
                <Chip 
                  label={`${products.length} productos`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>

            <CardContent sx={{ p: 2 }}>
              {loading ? (
                <Box textAlign="center" py={3}>
                  <Typography variant="body1" color="text.secondary">
                    Cargando productos...
                  </Typography>
                </Box>
              ) : products.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <ShoppingBag sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No has creado productos aún
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Comienza agregando tu primer producto
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => navigate("/admin/new-product")}
                  >
                    Crear Primer Producto
                  </Button>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 2,
                    justifyContent: { xs: 'center', sm: 'flex-start' }
                  }}
                >
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      elevation={0}
                      sx={{
                        width: { 
                          xs: '100%', 
                          sm: 'calc(50% - 8px)', 
                          md: 'calc(33.333% - 11px)', 
                          lg: 'calc(25% - 12px)' 
                        },
                        minWidth: 250,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2,
                        }
                      }}
                    >
                      {product.imagen && (
                        <Box
                          sx={{
                            height: 140,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f5f5f5'
                          }}
                        >
                          <img
                            src={product.imagen}
                            alt={product.nombre}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </Box>
                      )}
                      <CardContent sx={{ flexGrow: 1, p: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
                          {product.nombre}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 1.5,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            fontSize: '0.8rem'
                          }}
                        >
                          {product.descripcion}
                        </Typography>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          ${product.precio.toLocaleString()}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button
                          startIcon={<Edit />}
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                          fullWidth
                          sx={{ mr: 1, fontSize: '0.75rem' }}
                        >
                          Editar
                        </Button>
                        <Button
                          startIcon={<Delete />}
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={async () => {
                            const confirm = window.confirm('¿Seguro que deseas eliminar este producto?');
                            if (!confirm) return;
                            const { getFirestore, doc, deleteDoc } = await import('firebase/firestore/lite');
                            const app = await import('firebase/app');
                            const firestore = getFirestore(app.getApp());
                            await deleteDoc(doc(firestore, 'products', product.id));
                            setProducts(prev => prev.filter(p => p.id !== product.id));
                          }}
                          fullWidth
                          sx={{ fontSize: '0.75rem' }}
                        >
                          Eliminar
                        </Button>
                      </CardActions>
                    </Card>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardPage;