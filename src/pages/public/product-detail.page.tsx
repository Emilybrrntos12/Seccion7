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
  Paper 
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { ProductReviews } from "../../components/ui/product-reviews";

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
    if (!signInCheckResult?.signedIn) {
      localStorage.setItem('pendingCartItem', JSON.stringify({
        id_producto: product.id,
        cantidad: quantity,
        talla_seleccionada: selectedSize,
        product_data: {
          nombre: product.nombre,
          precio: product.precio,
          imagen: product.imagen
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
          imagen: product.imagen
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

  if (loading) return <div>Cargando...</div>;
  if (!product) return <div>Producto no encontrado</div>;

  const images = product.fotos && product.fotos.length > 0 ? product.fotos : [product.imagen];
  const currentImage = images[selectedImageIndex];

  return (
    <Box minHeight="100vh" bgcolor="#f5f5f5" display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6}>
      <Button variant="contained" color="primary" onClick={() => navigate(-1)} sx={{ mb: 3, alignSelf: 'flex-start' }}>Volver</Button>
      <Card sx={{ maxWidth: 900, width: '100%', boxShadow: 4, borderRadius: 4, p: 2 }}>
        <Box display="flex" flexWrap="wrap" gap={4}>
          {/* Sección de imágenes con Material-UI */}
          <Box width={{ xs: '100%', md: '40%' }}>
            <Box>
              {/* Imagen principal GRANDE */}
              <Box 
                position="relative" 
                sx={{ 
                  mb: 2,
                  width: '100%',
                  height: 400,
                  borderRadius: 12,
                  overflow: 'hidden',
                  backgroundColor: '#f8f8f8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                    height: 'auto'
                  }}
                />
                
                {/* Flechas de navegación - Solo se muestran si hay más de 1 imagen */}
                {images.length > 1 && (
                  <>
                    <IconButton 
                      onClick={prevImage}
                      sx={{
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                        zIndex: 10,
                        width: 40,
                        height: 40
                      }}
                    >
                      <ChevronLeft />
                    </IconButton>
                    <IconButton 
                      onClick={nextImage}
                      sx={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
                        zIndex: 10,
                        width: 40,
                        height: 40
                      }}
                    >
                      <ChevronRight />
                    </IconButton>
                  </>
                )}
              </Box>

              {/* Miniaturas - Solo se muestran si hay más de 1 imagen */}
              {images.length > 1 && (
                <Box 
                  display="flex" 
                  gap={1} 
                  justifyContent="center" 
                  alignItems="center"
                  sx={{ px: 1 }}
                >
                  {images.map((foto, idx) => (
                    <Box
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      sx={{
                        width: 60,
                        height: 60,
                        border: '2px solid',
                        borderColor: selectedImageIndex === idx ? 'primary.main' : 'transparent',
                        borderRadius: 1,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: selectedImageIndex === idx ? 1 : 0.6,
                        backgroundColor: '#f8f8f8',
                        '&:hover': {
                          opacity: 1,
                          borderColor: 'primary.light'
                        },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0.5
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
          <Box width={{ xs: '100%', md: '55%' }}>
            <CardContent>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary.main">
                {product.nombre}
              </Typography>
              <Typography variant="h5" color="secondary" fontWeight={600} gutterBottom>
                ${product.precio}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom mb={2}>
                {product.descripcion}
              </Typography>
              
              <Divider sx={{ my: 3 }} />

              {/* Especificaciones del producto en grid organizado */}
              <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={3} mb={3}>
                {/* Fila 1 */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Categoría
                  </Typography>
                  <Chip label={product.categoria} color="primary" />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Género
                  </Typography>
                  <Chip label={product.genero} color="secondary" />
                </Box>

                {/* Fila 2 */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Material
                  </Typography>
                  <Chip label={product.material} variant="outlined" />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Suela
                  </Typography>
                  <Chip label={product.suela} variant="outlined" />
                </Box>

                {/* Fila 3 - Stock general */}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Stock Total
                  </Typography>
                  <Chip 
                    label={product.stock} 
                    color={product.stock > 0 ? "success" : "error"} 
                    variant="filled"
                  />
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Tallas Disponibles
                  </Typography>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {product.tallaDisponible.map((talla) => (
                      <Chip 
                        key={talla} 
                        label={talla} 
                        size="small" 
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </Box>

              {/* Stock por talla */}
              {product.stockPorTalla && Object.keys(product.stockPorTalla).length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Stock por Talla
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Talla</strong></TableCell>
                          <TableCell><strong>Stock Disponible</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(product.stockPorTalla).map(([talla, stock]) => (
                          <TableRow key={talla}>
                            <TableCell>{talla}</TableCell>
                            <TableCell>
                              <Chip 
                                label={stock} 
                                size="small"
                                color={stock > 0 ? "success" : "error"}
                                variant={stock > 0 ? "filled" : "outlined"}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Información del creador */}
              <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={3} mb={4}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Creado por
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {creatorName || product.createdByEmail || product.createdBy || "No disponible"}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Fecha de creación
                  </Typography>
                  <Typography variant="body1">
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
              <Box sx={{ mt: 4 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="size-select-label">Seleccionar Talla</InputLabel>
                  <Select
                    labelId="size-select-label"
                    value={selectedSize}
                    label="Seleccionar Talla"
                    onChange={(e) => {
                      const talla = e.target.value;
                      setSelectedSize(talla);
                      const stockDisponible = product.stockPorTalla?.[talla] || 0;
                      setQuantity(stockDisponible > 0 ? 1 : 0);
                    }}
                  >
                    {product.tallaDisponible.map((talla) => (
                      <MenuItem key={talla} value={talla}>
                        Talla {talla} {product.stockPorTalla?.[talla] ? `(${product.stockPorTalla[talla]} disponibles)` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box display="flex" gap={2} alignItems="center" mb={2}>
                  <TextField
                    type="number"
                    label="Cantidad"
                    value={quantity}
                    onChange={(e) => {
                      const stockDisponible = product.stockPorTalla?.[selectedSize] || 0;
                      let val = parseInt(e.target.value) || 1;
                      if (val > stockDisponible) val = stockDisponible;
                      if (val < 1) val = 1;
                      setQuantity(val);
                    }}
                    inputProps={{ 
                      min: 1, 
                      max: product.stockPorTalla?.[selectedSize] || 0, 
                      step: 1 
                    }}
                    sx={{ width: '120px' }}
                    disabled={!selectedSize}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={!selectedSize || addingToCart || (product.stockPorTalla?.[selectedSize] ?? product.stock) === 0}
                    onClick={handleAddToCart}
                    sx={{ py: 1.5 }}
                  >
                    {addingToCart ? 'Agregando...' : 'Agregar al Carrito'}
                  </Button>
                </Box>

                {selectedSize && (
                  <Typography variant="body2" color="text.secondary">
                    Máximo disponible en talla {selectedSize}: <strong>{product.stockPorTalla?.[selectedSize] || 0}</strong>
                  </Typography>
                )}
              </Box>

              {/* Sección de opiniones/reseñas */}
              <Box sx={{ mt: 4 }}>
                <ProductReviews
                  productId={product.id}
                  user={signInCheckResult?.signedIn ? {
                    nombre: signInCheckResult.user.displayName || signInCheckResult.user.email || "",
                    uid: signInCheckResult.user.uid,
                    email: signInCheckResult.user.email || ""
                  } : undefined}
                />
              </Box>
            </CardContent>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default ProductDetailPage;