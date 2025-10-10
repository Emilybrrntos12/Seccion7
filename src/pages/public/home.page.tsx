import { useState, useEffect } from "react";
import { useUser } from "reactfire";
import { useAuthActions } from "@/hooks/use-auth-actions";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useFirebaseApp } from "reactfire";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  IconButton,
  Paper,
  alpha,
  useTheme
} from "@mui/material";

type Product = {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen: string;
};

const HomePage = () => {
  const navigate = useNavigate();
  const app = useFirebaseApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: user } = useUser();
  const { logout } = useAuthActions();
  const theme = useTheme();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const firestore = getFirestore(app);
      const productsCol = collection(firestore, "products");
      const snapshot = await getDocs(productsCol);
      const items: Product[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(items);
      setLoading(false);
    };
    fetchProducts();
  }, [app]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header Mejorado */}
      <Paper
        elevation={1}
        sx={{
          backgroundColor: 'white',
          px: 3,
          py: 2,
          mb: 3
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 'bold',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              Mi Tienda
            </Typography>

            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  avatar={<Avatar sx={{ bgcolor: theme.palette.primary.light }}><PersonIcon /></Avatar>}
                  label={user.displayName || user.email}
                  variant="outlined"
                  sx={{ fontWeight: 'medium' }}
                />
                <IconButton
                  onClick={() => navigate('/cart')}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <ShoppingCartIcon />
                </IconButton>
                <IconButton
                  onClick={async () => {
                    const result = await logout();
                    if (result.success) {
                      toast.success("Sesión cerrada");
                      navigate("/");
                    } else {
                      toast.error("Error al cerrar sesión");
                    }
                  }}
                  sx={{
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                    color: theme.palette.error.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.2),
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <LogoutIcon />
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="outlined"
                startIcon={<PersonIcon />}
                onClick={() => navigate("/auth/login")}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  fontWeight: 'medium'
                }}
              >
                Iniciar Sesión
              </Button>
            )}
          </Box>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            borderRadius: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.dark }}>
            Descubre Nuestros Productos
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Encuentra los mejores productos con calidad garantizada
          </Typography>
        </Paper>

        {/* Products Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Productos Destacados
            <Chip 
              label={`${products.length} productos`} 
              color="primary" 
              variant="outlined" 
              sx={{ ml: 2, fontWeight: 'medium' }}
            />
          </Typography>

          {loading && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h6" color="text.secondary">
                Cargando productos...
              </Typography>
            </Box>
          )}

          {!loading && products.length === 0 && (
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No hay productos disponibles
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Pronto agregaremos nuevos productos
              </Typography>
            </Paper>
          )}

          {!loading && products.length > 0 && (
            <Box 
              sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 3,
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}
            >
              {products.map(product => (
                <Card
                  key={product.id}
                  onClick={() => navigate(`/producto/${product.id}`)}
                  sx={{
                    width: { xs: '100%', sm: 280 },
                    cursor: 'pointer',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                    },
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={product.imagen}
                    alt={product.nombre}
                    sx={{
                      objectFit: 'cover',
                      backgroundColor: '#f5f5f5'
                    }}
                  />
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 'bold',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {product.nombre}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: 40
                      }}
                    >
                      {product.descripcion}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="h5" 
                        color="primary" 
                        sx={{ fontWeight: 'bold' }}
                      >
                        ${product.precio.toLocaleString()}
                      </Typography>
                      <Chip 
                        label="Ver detalles" 
                        color="primary" 
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* Call to Action */}
        {!user && (
          <Paper
            elevation={0}
            sx={{
              p: 4,
              textAlign: 'center',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              borderRadius: 3,
              mb: 4
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              ¿Aún no tienes cuenta?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Regístrate ahora y disfruta de todos nuestros beneficios
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/auth/register")}
              sx={{
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.9),
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Crear Cuenta
            </Button>
          </Paper>
        )}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 4,
          mt: 6,
          backgroundColor: 'white',
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2024 Mi Tienda. Todos los derechos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;