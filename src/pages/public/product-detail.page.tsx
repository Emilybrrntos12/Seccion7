import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFirebaseApp, useSigninCheck } from "reactfire";
import { getFirestore, doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore/lite";
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  Button, 
  Divider, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  TextField, 
  IconButton, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { ProductReviews } from "../../components/ui/product-reviews";
import Header2 from "@/components/ui/header-v2";

type Product = {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen: string;
  fotos?: string[];
  categoria: string;
  genero: string;
  material: string;
  suela: string;
  stock: number;
  tallaDisponible: string[];
  stockPorTalla?: Record<string, number>;
  fecha_creacion?: string | Date;
  createdBy?: string;
  createdByEmail?: string;
};

const ProductDetailPage = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { id } = useParams();
  const app = useFirebaseApp();
  const navigate = useNavigate();
  const { status, data: signInCheckResult } = useSigninCheck();
  const [product, setProduct] = useState<Product | null>(null);
  const [creatorName, setCreatorName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const firestore = getFirestore(app);
      const productRef = doc(firestore, "products", id!);
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const data = productSnap.data();
        setProduct({
          id: productSnap.id,
          nombre: data?.nombre ?? "",
          precio: data?.precio ?? 0,
          descripcion: data?.descripcion ?? "",
          imagen: data?.imagen ?? "",
          fotos: Array.isArray(data?.fotos) ? data.fotos : (data?.imagen ? [data.imagen] : []),
          categoria: data?.categoria ?? "",
          genero: data?.genero ?? "",
          material: data?.material ?? "",
          suela: data?.suela ?? "",
          stock: data?.stock ?? 0,
          tallaDisponible: Array.isArray(data?.tallaDisponible) ? data.tallaDisponible : [],
          fecha_creacion: data?.fecha_creacion,
          createdBy: data?.createdBy ?? "",
          createdByEmail: data?.createdByEmail ?? "",
          stockPorTalla: data?.stockPorTalla ?? {}
        });
        if (data?.createdBy) {
          try {
            const userRef = doc(firestore, "users", data.createdBy);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              setCreatorName(userData.nombre ?? "");
            } else {
              setCreatorName("");
            }
          } catch {
            setCreatorName("");
          }
        } else {
          setCreatorName("");
        }
      }
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id, app]);

  const handleAddToCart = async () => {
    if (!product || !selectedSize) return;
    if (status === 'loading') return;
    // Guardar también fotos en el localStorage para usuarios no logueados
    if (!signInCheckResult?.signedIn) {
      localStorage.setItem('pendingCartItem', JSON.stringify({
        id_producto: product.id,
        cantidad: quantity,
        talla_seleccionada: selectedSize,
        product_data: {
          nombre: product.nombre,
          precio: product.precio,
          imagen: product.imagen,
          fotos: product.fotos // Guardar el array de fotos
        }
      }));
      navigate('/auth/login', { state: { redirectTo: '/cart' } });
      return;
    }
    try {
      setAddingToCart(true);
      const firestore = getFirestore(app);
      const userId = signInCheckResult.user.uid;
      await addDoc(collection(firestore, "cart"), {
        id_usuario: userId,
        id_producto: product.id,
        cantidad: quantity,
        talla_seleccionada: selectedSize,
        fecha_agregada: serverTimestamp(),
        product_data: {
          nombre: product.nombre,
          precio: product.precio,
          imagen: product.imagen,
          fotos: product.fotos // Guardar el array de fotos
        }
      });
      navigate("/cart");
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const nextImage = () => {
    if (!product) return;
    const images = product.fotos && product.fotos.length > 0 ? product.fotos : [product.imagen];
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (!product) return;
    const images = product.fotos && product.fotos.length > 0 ? product.fotos : [product.imagen];
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 50%)'
    }}>
      <CircularProgress sx={{ color: '#8B7355' }} size={60} />
    </Box>
  );
  
  if (!product) return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 50%)',
      flexDirection: 'column',
      gap: 3
    }}>
      <Typography variant="h4" color="#8B7355" fontWeight="600">
        Producto no encontrado
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate('/')}
        sx={{
          background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
          color: 'white',
          borderRadius: 3,
          padding: '12px 32px',
          fontWeight: 600
        }}
      >
        Volver al Inicio
      </Button>
    </Box>
  );

  const images = product.fotos && product.fotos.length > 0 ? product.fotos : [product.imagen];
  const currentImage = images[selectedImageIndex];

  return (
    <>
      <Header2 />
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 50%)',
        paddingTop: { xs: '60px', md: '80px' },
        py: { xs: 2, md: 4 },
        pt: { xs: 8, md: 15 }
      }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 1, sm: 2, md: 3 } }}>
          <Card sx={{
            width: '100%',
            boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
            borderRadius: { xs: 2, md: 4 },
            overflow: 'hidden',
            border: '1px solid #e8dcc8',
            background: 'white',
            mb: { xs: 2, md: 0 }
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              flexWrap: 'wrap'
            }}>
              {/* Sección de imágenes */}
              <Box sx={{ width: { xs: '100%', md: '45%' }, p: { xs: 2, md: 3 }, pb: { xs: 0, md: 3 } }}>
                <Box sx={{ position: 'relative' }}>
                  {/* Imagen principal */}
                  <Box
                    sx={{
                      width: '100%',
                      height: { xs: 220, sm: 300, md: 400 },
                      borderRadius: { xs: 2, md: 3 },
                      overflow: 'hidden',
                      backgroundColor: '#fffdf9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #e8dcc8',
                      mb: 2,
                      position: 'relative'
                    }}
                  >
                    <img
                      src={currentImage}
                      alt={`${product.nombre} ${selectedImageIndex + 1}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        width: 'auto',
                        height: 'auto',
                        borderRadius: 8
                      }}
                    />
                    {/* Flechas de navegación */}
                    {images.length > 1 && (
                      <>
                        <IconButton
                          onClick={prevImage}
                          sx={{
                            position: 'absolute',
                            left: { xs: 4, md: 16 },
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: '#8B7355',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 1)',
                              transform: 'translateY(-50%) scale(1.1)'
                            },
                            width: { xs: 32, md: 48 },
                            height: { xs: 32, md: 48 },
                            zIndex: 2
                          }}
                        >
                          <ChevronLeft />
                        </IconButton>
                        <IconButton
                          onClick={nextImage}
                          sx={{
                            position: 'absolute',
                            right: { xs: 4, md: 16 },
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(255, 255, 255, 0.9)',
                            color: '#8B7355',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 1)',
                              transform: 'translateY(-50%) scale(1.1)'
                            },
                            width: { xs: 32, md: 48 },
                            height: { xs: 32, md: 48 },
                            zIndex: 2
                          }}
                        >
                          <ChevronRight />
                        </IconButton>
                      </>
                    )}
                  </Box>

                  {/* Miniaturas */}
                  {images.length > 1 && (
                    <Box sx={{
                      display: 'flex',
                      gap: { xs: 0.5, md: 1 },
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      mt: { xs: 1, md: 0 }
                    }}>
                      {images.map((foto, idx) => (
                        <Box
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          sx={{
                            width: { xs: 44, sm: 56, md: 70 },
                            height: { xs: 44, sm: 56, md: 70 },
                            border: '2px solid',
                            borderColor: selectedImageIndex === idx ? '#8B7355' : '#e8dcc8',
                            borderRadius: 2,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            opacity: selectedImageIndex === idx ? 1 : 0.7,
                            backgroundColor: '#fffdf9',
                            '&:hover': {
                              opacity: 1,
                              borderColor: '#A0522D',
                              transform: 'scale(1.05)'
                            },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: { xs: 0.2, md: 0.5 }
                          }}
                        >
                          <img
                            src={foto}
                            alt={`Miniatura ${idx + 1}`}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                              width: 'auto',
                              height: 'auto'
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Información del producto */}
              <Box sx={{ width: { xs: '100%', md: '55%' }, p: { xs: 2, md: 4 } }}>
                <CardContent sx={{ p: 0 }}>
                  <Typography variant="h3" fontWeight="700" sx={{ mb: 2, color: '#5d4037' }}>
                    {product.nombre}
                  </Typography>
                  
                  <Typography variant="h4" fontWeight="700" sx={{ mb: 3, color: '#A0522D' }}>
                    Q{product.precio.toLocaleString()}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 4, color: '#5d4037', lineHeight: 1.6, fontSize: '1.1rem' }}>
                    {product.descripcion}
                  </Typography>
                  
                  <Divider sx={{ my: 4, borderColor: '#e8dcc8' }} />

                  {/* Especificaciones del producto */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: '#8B7355' }}>
                      Especificaciones
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                      <Chip 
                        label={product.categoria} 
                        sx={{ 
                          background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)', 
                          color: 'white',
                          fontWeight: '600'
                        }} 
                      />
                      <Chip 
                        label={product.genero} 
                        sx={{ 
                          background: '#e8dcc8', 
                          color: '#5d4037',
                          fontWeight: '600'
                        }} 
                      />
                      <Chip 
                        label={product.material} 
                        variant="outlined"
                        sx={{ 
                          borderColor: '#8B7355', 
                          color: '#8B7355',
                          fontWeight: '600'
                        }} 
                      />
                      <Chip 
                        label={product.suela} 
                        variant="outlined"
                        sx={{ 
                          borderColor: '#A0522D', 
                          color: '#A0522D',
                          fontWeight: '600'
                        }} 
                      />
                    </Box>

                    {/* Stock por talla */}
                    {product.stockPorTalla && Object.keys(product.stockPorTalla).length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, color: '#5d4037' }}>
                          Disponibilidad por Talla
                        </Typography>
                        <TableContainer 
                          component={Paper} 
                          variant="outlined"
                          sx={{ borderColor: '#e8dcc8', borderRadius: 2 }}
                        >
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ background: '#fffdf9' }}>
                                <TableCell sx={{ fontWeight: '600', color: '#8B7355' }}>Talla</TableCell>
                                <TableCell sx={{ fontWeight: '600', color: '#8B7355' }}>Stock Disponible</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {Object.entries(product.stockPorTalla).map(([talla, stock]) => (
                                <TableRow key={talla}>
                                  <TableCell sx={{ fontWeight: '500', color: '#5d4037' }}>{talla}</TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={stock} 
                                      size="small"
                                      color={stock > 0 ? "success" : "error"}
                                      variant={stock > 0 ? "filled" : "outlined"}
                                      sx={{ fontWeight: '600' }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 4, borderColor: '#e8dcc8' }} />

                  {/* Información del creador */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 4 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#8B7355', mb: 1, fontWeight: '600' }}>
                        Creado por
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#5d4037', fontWeight: '500' }}>
                        {creatorName || product.createdByEmail || product.createdBy || "No disponible"}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#8B7355', mb: 1, fontWeight: '600' }}>
                        Fecha de creación
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#5d4037' }}>
                        {product.fecha_creacion
                          ? new Date(product.fecha_creacion).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : "No disponible"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Selector de talla y cantidad */}
                  <Box sx={{ background: '#fffdf9', p: 3, borderRadius: 3, border: '1px solid #e8dcc8' }}>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel id="size-select-label" sx={{ color: '#8B7355' }}>
                        Seleccionar Talla
                      </InputLabel>
                      <Select
                        labelId="size-select-label"
                        value={selectedSize}
                        label="Seleccionar Talla"
                        onChange={(e) => {
                          const talla = e.target.value;
                          // Si el usuario selecciona la talla ya seleccionada, la deselecciona
                          if (talla === selectedSize) {
                            setSelectedSize("");
                            setQuantity(1);
                          } else {
                            setSelectedSize(talla);
                            const stockDisponible = product.stockPorTalla?.[talla] || 0;
                            setQuantity(stockDisponible > 0 ? 1 : 0);
                          }
                        }}
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#e8dcc8',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8B7355',
                          }
                        }}
                      >
                        <MenuItem value="">Ninguna</MenuItem>
                        {product.tallaDisponible.map((talla) => (
                          <MenuItem key={talla} value={talla}>
                            Talla {talla} {product.stockPorTalla?.[talla] ? `(${product.stockPorTalla[talla]} disponibles)` : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 2,
                      alignItems: { xs: 'stretch', sm: 'center' },
                      mb: 2
                    }}>
                      <TextField
                        type="number"
                        label="Cantidad"
                        value={quantity}
                        onChange={(e) => {
                          const stockDisponible = product.stockPorTalla?.[selectedSize] || 0;
                          let val = parseInt(e.target.value) || 1;
                          if (val > stockDisponible) val = stockDisponible;
                          setQuantity(val);
                        }}
                        InputProps={{
                          inputProps: {
                            min: 1,
                            max: product.stockPorTalla?.[selectedSize] || 99
                          }
                        }}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#e8dcc8',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#8B7355',
                          },
                          fontSize: '1.2rem',
                          minWidth: { xs: '100%', sm: 180 },
                          maxWidth: 300
                        }}
                      />
                      <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        <Button
                          variant="contained"
                          onClick={handleAddToCart}
                          disabled={addingToCart || !selectedSize || quantity <= 0}
                          fullWidth
                          sx={{
                            mt: { xs: 2, sm: 0 },
                            background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
                            color: 'white',
                            borderRadius: 3,
                            padding: '12px 24px',
                            fontWeight: 600,
                            position: 'relative',
                            overflow: 'hidden',
                            '&:disabled': {
                              background: '#e0e0e0',
                              color: '#b0b0b0',
                              cursor: 'not-allowed',
                            }
                          }}
                        >
                          {addingToCart ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Agregar al Carrito"}
                        </Button>
                      </Box>
                    </Box>

                    {/* Mensaje de advertencia si no hay stock */}
                    {product.stock === 0 && (
                      <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: '500', mt: 2 }}>
                        Este producto no tiene stock disponible.
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ my: 4, borderColor: '#e8dcc8' }} />

                  {/* Reseñas del producto */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 3, color: '#8B7355' }}>
                      Reseñas
                    </Typography>
                    <ProductReviews productId={product.id} user={signInCheckResult?.user ? {
                      nombre: signInCheckResult.user.displayName || '',
                      uid: signInCheckResult.user.uid,
                      email: signInCheckResult.user.email || ''
                    } : undefined} />
                  </Box>
                </CardContent>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>
    </>
  );
};

export default ProductDetailPage;