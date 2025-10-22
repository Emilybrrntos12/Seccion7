import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFirebaseApp } from "reactfire";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Card,
  CardContent,
  Chip,
  Alert
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import InventoryIcon from '@mui/icons-material/Inventory';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { toast } from "sonner";

const categorias = ["Mocasines", "Tacones", "Botines", "Botas", "Sandalias"];

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

const EditProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const app = useFirebaseApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [nuevasImagenes, setNuevasImagenes] = useState<File[]>([]);
  const [genero, setGenero] = useState("");
  const [material, setMaterial] = useState("");
  const [tallaDisponible, setTallaDisponible] = useState<string[]>([]);
  const [stockPorTalla, setStockPorTalla] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const { getFirestore, doc, getDoc } = await import("firebase/firestore/lite");
        const firestore = getFirestore(app);
        const ref = doc(firestore, "products", id!);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          toast.error("Producto no encontrado");
          navigate("/admin");
          return;
        }
        const data = snap.data();
        setNombre(data.nombre ?? "");
        setDescripcion(data.descripcion ?? "");
        setPrecio(data.precio?.toString() ?? "");
        setCategoria(data.categoria ?? "");
        setImagenes(Array.isArray(data.fotos) ? data.fotos : (data.imagen ? [data.imagen] : []));
        setGenero(data.genero ?? "");
        setMaterial(data.material ?? "");
        setTallaDisponible(Array.isArray(data.tallaDisponible) ? data.tallaDisponible : []);
        setStockPorTalla(typeof data.stockPorTalla === "object" && data.stockPorTalla !== null ? data.stockPorTalla : {});
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar el producto");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
    } else {
      toast.error("ID de producto no válido");
      navigate("/admin");
    }
  }, [id, app, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedPrice = parseFloat(precio);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Precio inválido");
      return;
    }

    const stockValido = tallaDisponible.every(talla => {
      const stock = stockPorTalla[talla];
      return typeof stock === "number" && stock >= 0;
    });

    if (!stockValido) {
      toast.error("Completa el stock para todas las tallas seleccionadas");
      return;
    }

    setSaving(true);
    try {
      const nuevasUrls: string[] = [];
      if (nuevasImagenes.length > 0) {
        const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dfqhhvota/image/upload";
        const CLOUDINARY_PRESET = "ecommerce_unsigned";
        for (const file of nuevasImagenes) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", CLOUDINARY_PRESET);
          const response = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData,
          });
          const result = await response.json();
          if (!result.secure_url) throw new Error("Error al subir la imagen");
          nuevasUrls.push(result.secure_url);
        }
      }

      const { getFirestore, doc, updateDoc } = await import("firebase/firestore/lite");
      const firestore = getFirestore(app);
      const ref = doc(firestore, "products", id!);
      await updateDoc(ref, {
        nombre,
        descripcion,
        precio: parsedPrice,
        categoria,
        fotos: [...imagenes, ...nuevasUrls],
        genero,
        material,
        tallaDisponible,
        stockPorTalla,
      });

      toast.success("¡Producto actualizado exitosamente! 🎉");
      navigate("/admin");
    } catch (err: unknown) {
      console.error(err);
      const e = err as { message?: string };
      toast.error("Error al guardar: " + (e?.message || "Error desconocido"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 100%)'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={80} sx={{ mb: 3, color: palette.primary }} />
          <Typography variant="h4" fontWeight="800" sx={{ color: palette.dark, mb: 2 }}>
            Cargando Producto...
          </Typography>
          <Typography variant="h6" sx={{ color: palette.primary, opacity: 0.8 }}>
            Preparando el editor para ti
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 50%, #d7ccc8 100%)',
      py: 4,
      px: 2
    }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        
        {/* Header Hero */}
        <Card sx={{
          background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.secondary} 100%)`,
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(139, 115, 85, 0.4)',
          mb: 4,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <CardContent sx={{ p: 4, position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <IconButton 
                onClick={() => navigate("/admin")}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  width: 60,
                  height: 60,
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <ArrowBackIcon fontSize="large" />
              </IconButton>
              
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <Typography variant="h2" fontWeight="900" sx={{ 
                  color: 'white', 
                  mb: 1,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  Editar Producto
                </Typography>
                <Typography variant="h5" sx={{ 
                  color: palette.light, 
                  opacity: 0.95,
                  fontSize: { xs: '1.1rem', md: '1.4rem' }
                }}>
                  Perfecciona los detalles de tu creación
                </Typography>
              </Box>

              <Chip
                icon={<EditNoteIcon />}
                label="Modo Edición"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  px: 3,
                  py: 2,
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
              />
            </Box>
          </CardContent>
          
          {/* Elementos decorativos */}
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)'
          }} />
        </Card>

        <form onSubmit={handleSave}>
          <Box sx={{ 
            display: 'flex', 
            gap: 4, 
            flexDirection: { xs: 'column', lg: 'row' } 
          }}>
            
            {/* Columna Izquierda - Información Principal */}
            <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Tarjeta de Información Básica */}
              <Card sx={{
                background: 'white',
                borderRadius: 4,
                boxShadow: '0 12px 40px rgba(139, 115, 85, 0.15)',
                border: `2px solid ${palette.light}`,
                overflow: 'hidden'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: '50%',
                      bgcolor: `${palette.primary}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <EditNoteIcon sx={{ fontSize: 28, color: palette.primary }} />
                    </Box>
                    <Typography variant="h4" fontWeight="800" sx={{ color: palette.dark }}>
                      Información Principal
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      label="Nombre del Producto"
                      fullWidth
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontSize: '1.1rem',
                          '&:hover fieldset': {
                            borderColor: palette.primary,
                          },
                        }
                      }}
                    />
                    
                    <TextField
                      label="Descripción Detallada"
                      fullWidth
                      multiline
                      rows={5}
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: palette.primary,
                          },
                        }
                      }}
                    />
                    
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      <TextField
                        label="Precio (Q)"
                        type="number"
                        fullWidth
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        required
                        inputProps={{ min: "0.01", step: "0.01" }}
                        sx={{
                          flex: 1,
                          minWidth: 200,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': {
                              borderColor: palette.primary,
                            },
                          }
                        }}
                      />

                      <FormControl fullWidth sx={{ flex: 1, minWidth: 200 }}>
                        <InputLabel sx={{ fontSize: '1.1rem' }}>Categoría</InputLabel>
                        <Select
                          value={categoria}
                          onChange={(e) => setCategoria(e.target.value as string)}
                          label="Categoría"
                          required
                          sx={{ borderRadius: 2 }}
                        >
                          {categorias.map((cat) => (
                            <MenuItem key={cat} value={cat} sx={{ fontSize: '1rem' }}>
                              {cat}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      <FormControl fullWidth sx={{ flex: 1, minWidth: 200 }}>
                        <InputLabel sx={{ fontSize: '1.1rem' }}>Género</InputLabel>
                        <Select
                          value={genero}
                          onChange={(e) => setGenero(e.target.value as string)}
                          input={<OutlinedInput label="Género" />}
                          required
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="Caballeros">Caballeros</MenuItem>
                          <MenuItem value="Damas">Damas</MenuItem>
                          <MenuItem value="Niños">Niños</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth sx={{ flex: 1, minWidth: 200 }}>
                        <InputLabel sx={{ fontSize: '1.1rem' }}>Material</InputLabel>
                        <Select
                          value={material}
                          onChange={(e) => setMaterial(e.target.value as string)}
                          input={<OutlinedInput label="Material" />}
                          required
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="Cuero">Cuero Genuino</MenuItem>
                          <MenuItem value="Sintético">Material Sintético</MenuItem>
                          <MenuItem value="Polipiel">Polipiel</MenuItem>
                          <MenuItem value="Charol">Charol</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Tarjeta de Galería de Imágenes */}
              <Card sx={{
                background: 'white',
                borderRadius: 4,
                boxShadow: '0 12px 40px rgba(139, 115, 85, 0.15)',
                border: `2px solid ${palette.light}`,
                overflow: 'hidden'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: '50%',
                      bgcolor: `${palette.secondary}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <PhotoLibraryIcon sx={{ fontSize: 28, color: palette.secondary }} />
                    </Box>
                    <Typography variant="h4" fontWeight="800" sx={{ color: palette.dark }}>
                      Galería de Imágenes
                    </Typography>
                  </Box>

                  {/* Imágenes Actuales */}
                  {imagenes.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" fontWeight="700" sx={{ color: palette.dark, mb: 2 }}>
                        Imágenes Actuales
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {imagenes.map((img, idx) => (
                          <Box key={idx} sx={{ position: 'relative' }}>
                            <Box
                              component="img"
                              src={img}
                              alt={`Imagen ${idx + 1}`}
                              sx={{
                                width: 120,
                                height: 120,
                                objectFit: 'cover',
                                borderRadius: 3,
                                border: `3px solid ${palette.light}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)',
                                  borderColor: palette.primary
                                }
                              }}
                            />
                            <IconButton
                              onClick={() => setImagenes(imagenes.filter((_, i) => i !== idx))}
                              sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                bgcolor: palette.error,
                                color: 'white',
                                width: 32,
                                height: 32,
                                '&:hover': {
                                  bgcolor: '#d32f2f',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Nuevas Imágenes */}
                  {nuevasImagenes.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" fontWeight="700" sx={{ color: palette.dark, mb: 2 }}>
                        Nuevas Imágenes por Subir
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {nuevasImagenes.map((img, idx) => (
                          <Box key={idx} sx={{ position: 'relative' }}>
                            <Box
                              component="img"
                              src={URL.createObjectURL(img)}
                              alt={`Nueva ${idx + 1}`}
                              sx={{
                                width: 120,
                                height: 120,
                                objectFit: 'cover',
                                borderRadius: 3,
                                border: `3px solid ${palette.primary}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.05)'
                                }
                              }}
                            />
                            <IconButton
                              onClick={() => setNuevasImagenes(nuevasImagenes.filter((_, i) => i !== idx))}
                              sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                bgcolor: palette.error,
                                color: 'white',
                                width: 32,
                                height: 32,
                                '&:hover': {
                                  bgcolor: '#d32f2f',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Botón de Subida */}
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    sx={{
                      border: `2px dashed ${palette.primary}`,
                      borderRadius: 3,
                      py: 3,
                      color: palette.primary,
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      '&:hover': {
                        bgcolor: `${palette.primary}10`,
                        borderStyle: 'solid',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {imagenes.length + nuevasImagenes.length > 0 ? 'Agregar Más Imágenes' : 'Subir Imágenes del Producto'}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={e => {
                        const files = Array.from(e.target.files || []);
                        setNuevasImagenes(prev => [...prev, ...files]);
                      }}
                    />
                  </Button>
                </CardContent>
              </Card>
            </Box>

            {/* Columna Derecha - Inventario y Acciones */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Tarjeta de Inventario */}
              <Card sx={{
                background: 'white',
                borderRadius: 4,
                boxShadow: '0 12px 40px rgba(139, 115, 85, 0.15)',
                border: `2px solid ${palette.light}`,
                overflow: 'hidden'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Box sx={{
                      p: 1.5,
                      borderRadius: '50%',
                      bgcolor: `${palette.success}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <InventoryIcon sx={{ fontSize: 28, color: palette.success }} />
                    </Box>
                    <Typography variant="h4" fontWeight="800" sx={{ color: palette.dark }}>
                      Gestión de Inventario
                    </Typography>
                  </Box>

                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel sx={{ fontSize: '1.1rem' }}>Tallas Disponibles</InputLabel>
                    <Select
                      multiple
                      value={tallaDisponible}
                      onChange={(e) =>
                        setTallaDisponible(
                          typeof e.target.value === "string" ? e.target.value.split(",") : (e.target.value as string[])
                        )
                      }
                      label="Tallas disponibles"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as string[]).map((value) => (
                            <Chip 
                              key={value} 
                              label={value} 
                              size="small"
                              sx={{ bgcolor: palette.primary, color: 'white' }}
                            />
                          ))}
                        </Box>
                      )}
                      sx={{ borderRadius: 2 }}
                    >
                      {["22", "23", "24", "25", "26", "27", "28", "29", "30"].map((talla) => (
                        <MenuItem key={talla} value={talla} sx={{ fontSize: '1rem' }}>
                          {talla}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Stock por Talla */}
                  {tallaDisponible.length > 0 && (
                    <Box>
                      <Typography variant="h6" fontWeight="700" sx={{ color: palette.dark, mb: 3 }}>
                        Stock por Talla
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {tallaDisponible.map((talla) => (
                          <Box key={talla} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip 
                              label={`Talla ${talla}`} 
                              sx={{ 
                                bgcolor: palette.primary, 
                                color: 'white',
                                fontWeight: 700,
                                minWidth: 80
                              }}
                            />
                            <TextField
                              type="number"
                              value={stockPorTalla[talla] ?? ""}
                              onChange={(e) =>
                                setStockPorTalla((prev) => ({
                                  ...prev,
                                  [talla]: e.target.value === "" ? 0 : Number(e.target.value),
                                }))
                              }
                              fullWidth
                              inputProps={{ min: 0 }}
                              required
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Tarjeta de Acciones */}
              <Card sx={{
                background: `linear-gradient(135deg, ${palette.light} 0%, ${palette.brownLight} 100%)`,
                borderRadius: 4,
                boxShadow: '0 12px 40px rgba(139, 115, 85, 0.2)',
                border: `2px solid ${palette.primary}30`,
                overflow: 'hidden'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight="800" sx={{ color: palette.dark, mb: 3, textAlign: 'center' }}>
                    Acciones
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => navigate("/admin")}
                      disabled={saving}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Cancelar
                    </Button>
                    
                    <Button 
                      type="submit" 
                      variant="contained" 
                      startIcon={saving ? <CircularProgress size={24} sx={{ color: 'white' }} /> : <SaveIcon />}
                      disabled={saving}
                      sx={{
                        bgcolor: palette.primary,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        '&:hover': {
                          bgcolor: palette.secondary,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${palette.primary}50`
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
                    </Button>
                  </Box>

                  {imagenes.length + nuevasImagenes.length === 0 && (
                    <Alert 
                      severity="warning" 
                      sx={{ 
                        mt: 2,
                        borderRadius: 2,
                        bgcolor: `${palette.warning}20`,
                        color: palette.dark,
                        border: `1px solid ${palette.warning}`
                      }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        💡 Recomendación: Agrega al menos una imagen para mejor presentación
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default EditProductPage;