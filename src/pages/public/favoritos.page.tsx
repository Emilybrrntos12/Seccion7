import { useFavorites } from '@/hooks/use-favorites';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useFirebaseApp } from 'reactfire';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  CircularProgress,
  Button,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmptyStateIcon from '@mui/icons-material/FavoriteBorder';
import Header2 from '@/components/ui/header-v2';

type Product = {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen?: string;
};

const FavoritosPage = () => {
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const app = useFirebaseApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      setLoading(true);
      if (favorites.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const firestore = getFirestore(app);
      const productsCol = collection(firestore, 'products');
      const snapshot = await getDocs(productsCol);
      const allProducts: Product[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      console.log('All products sample:', allProducts[0]); // Debug - Ver estructura
      const items: Product[] = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nombre: data.nombre ?? '',
            precio: data.precio ?? 0,
            descripcion: data.descripcion ?? '',
            imagen: Array.isArray(data.fotos) && data.fotos.length > 0 ? data.fotos[0] : undefined,
          };
        })
        .filter(product => favorites.includes(product.id));
      setProducts(items);
      setLoading(false);
    };
    fetchFavoriteProducts();
  }, [app, favorites]);

  return (
    <>
      <Header2 />
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 50%)',
        paddingTop: '80px'
      }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto', p: 3 }}>
          {/* Header de la página */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
            borderRadius: 4,
            padding: 4,
            color: 'white',
            boxShadow: '0 8px 32px rgba(139, 115, 85, 0.2)'
          }}>
            <FavoriteIcon sx={{ fontSize: 48, mb: 2, color: '#ffebee' }} />
            <Typography variant="h3" fontWeight="700" sx={{ mb: 1 }}>
              Tus Favoritos
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {favorites.length} {favorites.length === 1 ? 'producto guardado' : 'productos guardados'}
            </Typography>
          </Box>

          {/* Contenido */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#8B7355' }} size={60} />
            </Box>
          )}

          {!loading && products.length === 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              background: 'white',
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(139, 115, 85, 0.1)',
              border: '1px solid #e8dcc8',
              maxWidth: '500px',
              mx: 'auto'
            }}>
              <EmptyStateIcon sx={{ fontSize: 80, color: '#e8dcc8', mb: 2 }} />
              <Typography variant="h5" color="#8B7355" fontWeight="600" sx={{ mb: 2 }}>
                No tienes productos favoritos
              </Typography>
              <Typography variant="body1" color="#5d4037" sx={{ mb: 3 }}>
                Explora nuestros productos y guarda tus favoritos para verlos después
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
            </Box>
          )}

          {!loading && products.length > 0 && (
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)'
              },
              gap: 3
            }}>
              {products.map(product => (
                <Box key={product.id}>
                  <Card sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: 'hidden',
                    background: 'white',
                    border: '1px solid #e8dcc8',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(139, 115, 85, 0.2)',
                      borderColor: '#8B7355'
                    }
                  }}>
                    {/* Imagen del producto */}
                    {product.imagen ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={product.imagen}
                        alt={product.nombre}
                        sx={{ objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => navigate(`/producto/${product.id}`)}
                      />
                    ) : (
                      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8dcc8' }}>
                        <Typography color="#8B7355">Sin imagen</Typography>
                      </Box>
                    )}

                    <CardContent sx={{ 
                      flexGrow: 1, 
                      display: 'flex', 
                      flexDirection: 'column',
                      padding: 3 
                    }}>
                      {/* Nombre y precio */}
                      <Typography 
                        variant="h6" 
                        fontWeight="600" 
                        color="#5d4037"
                        sx={{ 
                          mb: 1,
                          cursor: 'pointer',
                          '&:hover': { color: '#8B7355' }
                        }}
                        onClick={() => navigate(`/producto/${product.id}`)}
                      >
                        {product.nombre}
                      </Typography>
                      
                      <Typography 
                        variant="h5" 
                        fontWeight="700" 
                        color="#A0522D"
                        sx={{ mb: 2 }}
                      >
                        ${product.precio.toLocaleString()}
                      </Typography>

                      {/* Descripción */}
                      <Typography 
                        variant="body2" 
                        color="#5d4037"
                        sx={{ 
                          mb: 3,
                          flexGrow: 1,
                          opacity: 0.8,
                          lineHeight: 1.5
                        }}
                      >
                        {product.descripcion.length > 100 
                          ? `${product.descripcion.substring(0, 100)}...` 
                          : product.descripcion
                        }
                      </Typography>

                      {/* Botones de acción */}
                      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                        <Button
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => navigate(`/producto/${product.id}`)}
                          fullWidth
                          sx={{
                            borderColor: '#8B7355',
                            color: '#8B7355',
                            borderRadius: 2,
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: '#A0522D',
                              background: 'rgba(139, 115, 85, 0.04)',
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Ver
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}

          {/* Footer informativo */}
          {!loading && products.length > 0 && (
            <Box sx={{ 
              textAlign: 'center', 
              mt: 6, 
              p: 3,
              background: 'rgba(139, 115, 85, 0.05)',
              borderRadius: 3,
              border: '1px solid #e8dcc8',
              maxWidth: '800px',
              mx: 'auto'
            }}>
              <Typography variant="body2" color="#8B7355" sx={{ mb: 1 }}>
                💡 Tip: Los productos en favoritos se sincronizan en todos tus dispositivos
              </Typography>
              <Typography variant="body2" color="#5d4037" sx={{ opacity: 0.8 }}>
                Continúa explorando y agregando más productos a tu lista de favoritos
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default FavoritosPage;