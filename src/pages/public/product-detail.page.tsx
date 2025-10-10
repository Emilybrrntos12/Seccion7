import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useFirebaseApp, useSigninCheck } from "reactfire";
import { getFirestore, doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore/lite";
import { Card, CardContent, CardMedia, Typography, Box, Chip, Button, Divider, Select, MenuItem, FormControl, InputLabel, TextField } from "@mui/material";

type Product = {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen: string;
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
        // Buscar el nombre del creador si existe el UID
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
      // Guardar datos del producto pendiente en localStorage
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

  if (loading) return <div>Cargando...</div>;
  if (!product) return <div>Producto no encontrado</div>;

  return (
    <Box minHeight="100vh" bgcolor="#f5f5f5" display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6}>
      <Button variant="contained" color="primary" onClick={() => navigate(-1)} sx={{ mb: 3, alignSelf: 'flex-start' }}>Volver</Button>
      <Card sx={{ maxWidth: 900, width: '100%', boxShadow: 4, borderRadius: 4, p: 2 }}>
        <Box display="flex" flexWrap="wrap" gap={4}>
          <Box width={{ xs: '100%', md: '40%' }}>
            <CardMedia
              component="img"
              image={product.imagen}
              alt={product.nombre}
              sx={{ width: '100%', height: 350, objectFit: 'cover', borderRadius: 3, boxShadow: 2 }}
            />
          </Box>
          <Box width={{ xs: '100%', md: '55%' }}>
            <CardContent>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary.main">{product.nombre}</Typography>
              <Typography variant="h5" color="secondary" fontWeight={600} gutterBottom>${product.precio}</Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom mb={2}>{product.descripcion}</Typography>
              <Divider sx={{ my: 2 }} />
              <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Categoría</Typography>
                  <Chip label={product.categoria} color="primary" sx={{ mt: 0.5 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Género</Typography>
                  <Chip label={product.genero} color="secondary" sx={{ mt: 0.5 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Material</Typography>
                  <Chip label={product.material} sx={{ mt: 0.5 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Suela</Typography>
                  <Chip label={product.suela} sx={{ mt: 0.5 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Stock</Typography>
                  <Chip label={String(product.stock)} color={product.stock > 0 ? "success" : "error"} sx={{ mt: 0.5 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Stock por talla</Typography>
                  {product.stockPorTalla && Object.keys(product.stockPorTalla).length > 0 ? (
                    <Box component="table" width="100%" sx={{ borderCollapse: 'collapse', mt: 1 }}>
                      <Box component="thead">
                        <Box component="tr">
                          <Box component="th" sx={{ textAlign: 'left', p: 1, borderBottom: '1px solid #e0e0e0' }}>Talla</Box>
                          <Box component="th" sx={{ textAlign: 'left', p: 1, borderBottom: '1px solid #e0e0e0' }}>Stock</Box>
                        </Box>
                      </Box>
                      <Box component="tbody">
                        {Object.entries(product.stockPorTalla).map(([talla, stock]) => (
                          <Box component="tr" key={talla}>
                            <Box component="td" sx={{ p: 1, borderBottom: '1px solid #f0f0f0' }}>{talla}</Box>
                            <Box component="td" sx={{ p: 1, borderBottom: '1px solid #f0f0f0' }}>{stock}</Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    <Chip label="No disponible" variant="outlined" />
                  )}
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Divider sx={{ my: 2 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Creado por</Typography>
                  <Typography variant="body2">{creatorName || product.createdByEmail || product.createdBy}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Fecha de creación</Typography>
                  <Typography variant="body2">
                    {product.fecha_creacion
                      ? typeof product.fecha_creacion === "string"
                        ? product.fecha_creacion
                        : product.fecha_creacion instanceof Date
                          ? product.fecha_creacion.toLocaleString()
                          : ""
                      : ""}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 4 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="size-select-label">Talla</InputLabel>
                  <Select
                    labelId="size-select-label"
                    value={selectedSize}
                    label="Talla"
                    onChange={(e) => {
                      const talla = e.target.value;
                      setSelectedSize(talla);
                      // Al cambiar de talla, ajustar la cantidad al máximo permitido si es mayor
                      const stockDisponible = product.stockPorTalla?.[talla] || 0;
                      setQuantity(stockDisponible > 0 ? 1 : 0);
                    }}
                  >
                    {product.tallaDisponible.map((talla) => (
                      <MenuItem key={talla} value={talla}>
                        Talla {talla}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box display="flex" gap={2} alignItems="center">
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
                    inputProps={{ min: 1, max: product.stockPorTalla?.[selectedSize] || 0, step: 1 }}
                    sx={{ width: '120px' }}
                    disabled={!selectedSize}
                    helperText={selectedSize ? `Máximo disponible: ${product.stockPorTalla?.[selectedSize] || 0}` : 'Selecciona una talla'}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={!selectedSize || addingToCart || (product.stockPorTalla?.[selectedSize] ?? product.stock) === 0}
                    onClick={handleAddToCart}
                  >
                    {addingToCart ? 'Agregando...' : 'Agregar al carrito'}
                  </Button>
                </Box>
              <Typography variant="body2" color="text.secondary" mt={2}>
                Stock disponible: <strong>{product.stock}</strong>
              </Typography>
              </Box>
            </CardContent>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default ProductDetailPage;
