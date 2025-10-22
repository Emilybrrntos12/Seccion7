import { useState, useEffect } from "react";
import { useAuth, useFirebaseApp } from "reactfire";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore/lite";
import axios from "axios";
import { toast } from "sonner";
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  AddPhotoAlternate,
  Inventory,
  Category,
  Style,
  Person,
  CloudUpload,
  Rocket,
  CheckCircle,
  ArrowBack,
} from '@mui/icons-material';

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

const NewProductPage = () => {
  const auth = useAuth();
  const app = useFirebaseApp();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tallaDisponible, setTallaDisponible] = useState<string[]>([]);
  const [material, setMaterial] = useState("");
  const [suela, setSuela] = useState("");
  const [genero, setGenero] = useState("");
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [stockPorTalla, setStockPorTalla] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Información Básica', 'Especificaciones', 'Inventario', 'Imágenes'];

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (!user) return setIsAdmin(false);
      const firestore = getFirestore(app);
      const adminDoc = await getDoc(doc(firestore, "admins", user.uid));
      setIsAdmin(adminDoc.exists());
    };
    checkAdmin();
  }, [auth, app]);

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dfqhhvota/image/upload";
  const CLOUDINARY_PRESET = "ecommerce_unsigned";

  async function uploadImageToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_PRESET);
    const response = await axios.post(CLOUDINARY_URL, formData);
    return response.data.secure_url;
  }

  async function uploadMultipleImages(files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadImageToCloudinary(file);
      urls.push(url);
    }
    return urls;
  }

  const handleNext = () => {
    // Validar campos según el paso actual antes de avanzar
    if (activeStep === 0) {
      if (!nombre.trim()) {
        toast.error("⚠️ El nombre del producto es obligatorio");
        return;
      }
      if (!descripcion.trim()) {
        toast.error("⚠️ La descripción del producto es obligatoria");
        return;
      }
      if (!precio || parseFloat(precio) <= 0) {
        toast.error("⚠️ El precio debe ser mayor a 0");
        return;
      }
    }
    
    if (activeStep === 1) {
      if (!categoria) {
        toast.error("⚠️ Debes seleccionar una categoría");
        return;
      }
      if (!material) {
        toast.error("⚠️ Debes seleccionar el material");
        return;
      }
      if (!suela) {
        toast.error("⚠️ Debes seleccionar el tipo de suela");
        return;
      }
      if (!genero) {
        toast.error("⚠️ Debes seleccionar el género");
        return;
      }
    }
    
    if (activeStep === 2) {
      if (tallaDisponible.length === 0) {
        toast.error("⚠️ Debes seleccionar al menos una talla");
        return;
      }
      // Validar que todas las tallas tengan stock asignado
      for (const talla of tallaDisponible) {
        if (!stockPorTalla[talla] && stockPorTalla[talla] !== 0) {
          toast.error(`⚠️ Falta asignar el stock para la talla ${talla}`);
          return;
        }
        if (stockPorTalla[talla] < 0) {
          toast.error(`⚠️ El stock para la talla ${talla} debe ser mayor o igual a 0`);
          return;
        }
      }
    }
    
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("No tienes permisos para crear productos.");
      return;
    }
    
    // Validación completa antes de enviar
    if (!nombre.trim()) {
      toast.error("⚠️ El nombre del producto es obligatorio");
      return;
    }
    if (!descripcion.trim()) {
      toast.error("⚠️ La descripción del producto es obligatoria");
      return;
    }
    if (!precio || parseFloat(precio) <= 0) {
      toast.error("⚠️ El precio debe ser mayor a 0");
      return;
    }
    if (!categoria) {
      toast.error("⚠️ Debes seleccionar una categoría");
      return;
    }
    if (!material) {
      toast.error("⚠️ Debes seleccionar el material");
      return;
    }
    if (!suela) {
      toast.error("⚠️ Debes seleccionar el tipo de suela");
      return;
    }
    if (!genero) {
      toast.error("⚠️ Debes seleccionar el género");
      return;
    }
    if (tallaDisponible.length === 0) {
      toast.error("⚠️ Debes seleccionar al menos una talla");
      return;
    }
    if (imagenes.length < 4) {
      toast.error("⚠️ Debes seleccionar al menos 4 imágenes del producto");
      return;
    }
    
    // Validar stockPorTalla
    for (const talla of tallaDisponible) {
      if (!stockPorTalla[talla] && stockPorTalla[talla] !== 0) {
        toast.error(`⚠️ Falta asignar el stock para la talla ${talla}`);
        return;
      }
      if (stockPorTalla[talla] < 0) {
        toast.error(`⚠️ El stock para la talla ${talla} debe ser mayor o igual a 0`);
        return;
      }
    }
    
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No autenticado");
      let imageUrls: string[] = [];
      if (imagenes.length >= 4) {
        imageUrls = await uploadMultipleImages(imagenes);
      }
      const firestore = getFirestore(app);
      const productsCol = collection(firestore, "products");
      const totalStock = tallaDisponible.reduce((acc, talla) => acc + (stockPorTalla[talla] || 0), 0);
      const docData = {
        nombre,
        descripcion,
        precio: parseFloat(precio),
        categoria,
        tallaDisponible,
        material,
        suela,
        genero,
        fotos: imageUrls,
        stock: totalStock,
        stockPorTalla,
        fecha_creacion: serverTimestamp(),
        createdBy: user.uid,
        createdByEmail: user.email ?? ""
      };
      await addDoc(productsCol, docData);
      toast.success("🎉 ¡Producto creado exitosamente!");
      // Reset form
      setNombre("");
      setDescripcion("");
      setPrecio("");
      setCategoria("");
      setTallaDisponible([]);
      setMaterial("");
      setSuela("");
      setGenero("");
      setImagenes([]);
      setStockPorTalla({});
      setActiveStep(0);
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(`Error: ${e?.message || "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3
      }}>
        <Card sx={{
          maxWidth: 500,
          width: '100%',
          background: 'white',
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(139, 115, 85, 0.2)',
          border: `2px solid ${palette.light}`,
          textAlign: 'center',
          p: 4
        }}>
          <Avatar sx={{ 
            bgcolor: palette.error, 
            width: 80, 
            height: 80, 
            mx: 'auto',
            mb: 3 
          }}>
            <Person sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h3" fontWeight="900" sx={{ color: palette.dark, mb: 2 }}>
            Acceso Restringido
          </Typography>
          <Typography variant="h6" sx={{ color: palette.primary, mb: 3 }}>
            No tienes permisos para crear productos.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => window.history.back()}
            sx={{
              bgcolor: palette.primary,
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 3,
              fontWeight: 700,
              '&:hover': {
                bgcolor: palette.secondary
              }
            }}
          >
            Volver al Dashboard
          </Button>
        </Card>
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
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        
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
                onClick={() => window.history.back()}
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
                <ArrowBack fontSize="large" />
              </IconButton>
              
              <Box sx={{ flex: 1, minWidth: 300 }}>
                <Typography variant="h2" fontWeight="900" sx={{ 
                  color: 'white', 
                  mb: 1,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                }}>
                  Crear Nuevo Producto
                </Typography>
                <Typography variant="h5" sx={{ 
                  color: palette.light, 
                  opacity: 0.95,
                  fontSize: { xs: '1.1rem', md: '1.4rem' }
                }}>
                  Da vida a tu próxima creación
                </Typography>
              </Box>

              <Chip
                icon={<Rocket />}
                label="Modo Creación"
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
        </Card>

        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
          
          {/* Stepper Navigation */}
          <Card sx={{
            flex: 1,
            maxWidth: 300,
            background: 'white',
            borderRadius: 4,
            boxShadow: '0 12px 40px rgba(139, 115, 85, 0.15)',
            border: `2px solid ${palette.light}`,
            height: 'fit-content',
            position: 'sticky',
            top: 20
          }}>
            <CardContent sx={{ p: 3 }}>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      StepIconComponent={() => (
                        <Avatar sx={{ 
                          bgcolor: activeStep >= index ? palette.primary : palette.light,
                          color: activeStep >= index ? 'white' : palette.dark,
                          width: 32,
                          height: 32,
                          fontSize: '0.9rem',
                          fontWeight: 700
                        }}>
                          {activeStep > index ? <CheckCircle /> : index + 1}
                        </Avatar>
                      )}
                    >
                      <Typography variant="h6" fontWeight={700} sx={{ color: palette.dark }}>
                        {label}
                      </Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* Form Content */}
          <Box sx={{ flex: 2 }}>
            <Card sx={{
              background: 'white',
              borderRadius: 4,
              boxShadow: '0 12px 40px rgba(139, 115, 85, 0.15)',
              border: `2px solid ${palette.light}`,
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
                  
                  {/* Step 1: Información Básica */}
                  {activeStep === 0 && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Avatar sx={{ bgcolor: palette.primary, width: 50, height: 50 }}>
                          <Category sx={{ fontSize: 28 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="h3" fontWeight="900" sx={{ color: palette.dark }}>
                            Información Básica
                          </Typography>
                          <Typography variant="h6" sx={{ color: palette.primary }}>
                            Define los detalles principales de tu producto
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                          label="Nombre del Producto"
                          fullWidth
                          value={nombre}
                          onChange={e => setNombre(e.target.value)}
                          onBlur={() => {
                            if (!nombre.trim()) {
                              toast.error("⚠️ El nombre del producto es obligatorio");
                            }
                          }}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              fontSize: '1.1rem',
                              '&:hover fieldset': { borderColor: palette.primary },
                            }
                          }}
                        />
                        
                        <TextField
                          label="Descripción Detallada"
                          fullWidth
                          multiline
                          rows={4}
                          value={descripcion}
                          onChange={e => setDescripcion(e.target.value)}
                          onBlur={() => {
                            if (!descripcion.trim()) {
                              toast.error("⚠️ La descripción del producto es obligatoria");
                            }
                          }}
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': { borderColor: palette.primary },
                            }
                          }}
                        />
                        
                        <TextField
                          label="Precio (Q)"
                          type="number"
                          fullWidth
                          value={precio}
                          onChange={e => setPrecio(e.target.value)}
                          onBlur={() => {
                            if (!precio || parseFloat(precio) <= 0) {
                              toast.error("⚠️ El precio debe ser mayor a 0");
                            }
                          }}
                          required
                          inputProps={{ min: "0.01", step: "0.01" }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': { borderColor: palette.primary },
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  {/* Step 2: Especificaciones */}
                  {activeStep === 1 && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Avatar sx={{ bgcolor: palette.secondary, width: 50, height: 50 }}>
                          <Style sx={{ fontSize: 28 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="h3" fontWeight="900" sx={{ color: palette.dark }}>
                            Especificaciones
                          </Typography>
                          <Typography variant="h6" sx={{ color: palette.primary }}>
                            Características técnicas del producto
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <FormControl fullWidth>
                          <InputLabel sx={{ fontSize: '1.1rem' }}>Categoría</InputLabel>
                          <Select
                            value={categoria}
                            onChange={e => setCategoria(e.target.value)}
                            onBlur={() => {
                              if (!categoria) {
                                toast.error("⚠️ Debes seleccionar una categoría");
                              }
                            }}
                            input={<OutlinedInput label="Categoría" />}
                            required
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="Mocasines">Mocasines</MenuItem>
                            <MenuItem value="Tacones">Tacones</MenuItem>
                            <MenuItem value="Botines">Botines</MenuItem>
                            <MenuItem value="Botas">Botas</MenuItem>
                            <MenuItem value="Sandalias">Sandalias</MenuItem>
                          </Select>
                        </FormControl>

                        <FormControl fullWidth>
                          <InputLabel sx={{ fontSize: '1.1rem' }}>Material</InputLabel>
                          <Select
                            value={material}
                            onChange={e => setMaterial(e.target.value)}
                            onBlur={() => {
                              if (!material) {
                                toast.error("⚠️ Debes seleccionar el material");
                              }
                            }}
                            input={<OutlinedInput label="Material" />}
                            required
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="Cuero">Cuero</MenuItem>
                            <MenuItem value="Sintético">Sintético</MenuItem>
                            <MenuItem value="Polipiel">Polipiel</MenuItem>
                            <MenuItem value="Charol">Charol</MenuItem>
                          </Select>
                        </FormControl>

                        <FormControl fullWidth>
                          <InputLabel sx={{ fontSize: '1.1rem' }}>Suela</InputLabel>
                          <Select
                            value={suela}
                            onChange={e => setSuela(e.target.value)}
                            onBlur={() => {
                              if (!suela) {
                                toast.error("⚠️ Debes seleccionar el tipo de suela");
                              }
                            }}
                            input={<OutlinedInput label="Suela" />}
                            required
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="Esponja">Esponja</MenuItem>
                            <MenuItem value="Caucho">Caucho</MenuItem>
                            <MenuItem value="Cuero">Cuero</MenuItem>
                          </Select>
                        </FormControl>

                        <FormControl fullWidth>
                          <InputLabel sx={{ fontSize: '1.1rem' }}>Género</InputLabel>
                          <Select
                            value={genero}
                            onChange={e => setGenero(e.target.value)}
                            onBlur={() => {
                              if (!genero) {
                                toast.error("⚠️ Debes seleccionar el género");
                              }
                            }}
                            input={<OutlinedInput label="Género" />}
                            required
                            sx={{ borderRadius: 2 }}
                          >
                            <MenuItem value="Caballeros">Caballeros</MenuItem>
                            <MenuItem value="Damas">Damas</MenuItem>
                            <MenuItem value="Niños">Niños</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                  )}

                  {/* Step 3: Inventario */}
                  {activeStep === 2 && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Avatar sx={{ bgcolor: palette.success, width: 50, height: 50 }}>
                          <Inventory sx={{ fontSize: 28 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="h3" fontWeight="900" sx={{ color: palette.dark }}>
                            Gestión de Inventario
                          </Typography>
                          <Typography variant="h6" sx={{ color: palette.primary }}>
                            Configura tallas y stock disponible
                          </Typography>
                        </Box>
                      </Box>

                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel sx={{ fontSize: '1.1rem' }}>Tallas Disponibles</InputLabel>
                        <Select
                          multiple
                          value={tallaDisponible}
                          onChange={e => setTallaDisponible(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                          input={<OutlinedInput label="Tallas Disponibles" />}
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
                          {['22', '23', '24', '25', '26', '27', '28', '29', '30'].map(talla => (
                            <MenuItem key={talla} value={talla}>
                              <Checkbox checked={tallaDisponible.indexOf(talla) > -1} />
                              <ListItemText primary={talla} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {tallaDisponible.length > 0 && (
                        <Box>
                          <Typography variant="h5" fontWeight="700" sx={{ color: palette.dark, mb: 3 }}>
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
                                    minWidth: 100
                                  }}
                                />
                                <TextField
                                  type="number"
                                  label="Cantidad en Stock"
                                  value={stockPorTalla[talla] ?? ""}
                                  onChange={e => {
                                    const value = Math.max(0, parseInt(e.target.value) || 0);
                                    setStockPorTalla(prev => ({ ...prev, [talla]: value }));
                                  }}
                                  onBlur={() => {
                                    if (!stockPorTalla[talla] && stockPorTalla[talla] !== 0) {
                                      toast.error(`⚠️ Debes asignar el stock para la talla ${talla}`);
                                    } else if (stockPorTalla[talla] < 0) {
                                      toast.error(`⚠️ El stock debe ser mayor o igual a 0`);
                                    }
                                  }}
                                  inputProps={{ min: 0 }}
                                  required
                                  sx={{
                                    flex: 1,
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
                    </Box>
                  )}

                  {/* Step 4: Imágenes */}
                  {activeStep === 3 && (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Avatar sx={{ bgcolor: palette.warning, width: 50, height: 50 }}>
                          <AddPhotoAlternate sx={{ fontSize: 28 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="h3" fontWeight="900" sx={{ color: palette.dark }}>
                            Galería de Imágenes
                          </Typography>
                          <Typography variant="h6" sx={{ color: palette.primary }}>
                            Muestra tu producto desde todos los ángulos
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Button
                          component="label"
                          variant="outlined"
                          startIcon={<CloudUpload />}
                          sx={{
                            border: `2px dashed ${palette.primary}`,
                            borderRadius: 3,
                            py: 3,
                            px: 4,
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
                          Subir Imágenes (Mínimo 2)
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={e => {
                              const files = Array.from(e.target.files || []);
                              setImagenes(files);
                            }}
                            required
                          />
                        </Button>
                        
                        {imagenes.length > 0 && (
                          <Box sx={{ mt: 3 }}>
                            <Chip
                              icon={<CheckCircle />}
                              label={`${imagenes.length} imágenes seleccionadas`}
                              color={imagenes.length >= 2 ? "success" : "warning"}
                              sx={{ fontSize: '1rem', fontWeight: 700, py: 2 }}
                            />
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2, justifyContent: 'center' }}>
                              {imagenes.map((img, index) => (
                                <Card key={index} sx={{ width: 100, height: 100, position: 'relative' }}>
                                  <Box
                                    component="img"
                                    src={URL.createObjectURL(img)}
                                    alt={`Preview ${index + 1}`}
                                    sx={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      borderRadius: 1
                                    }}
                                  />
                                  <Chip
                                    label={index + 1}
                                    size="small"
                                    sx={{
                                      position: 'absolute',
                                      top: 4,
                                      left: 4,
                                      bgcolor: palette.primary,
                                      color: 'white',
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                </Card>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>

                      {imagenes.length < 2 && imagenes.length > 0 && (
                        <Alert severity="warning" sx={{ borderRadius: 2, mb: 2 }}>
                          <Typography fontWeight={600}>
                            Se requieren al menos 2 imágenes. Actualmente tienes {imagenes.length}.
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  )}

                  {/* Navigation Buttons */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: `2px solid ${palette.light}` }}>
                    <Button
                      onClick={handleBack}
                      disabled={activeStep === 0}
                      sx={{
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: palette.primary,
                        border: `2px solid ${palette.primary}`,
                        '&:hover': {
                          bgcolor: `${palette.primary}10`
                        }
                      }}
                    >
                      Anterior
                    </Button>

                    {activeStep < steps.length - 1 ? (
                      <Button
                        onClick={handleNext}
                        sx={{
                          bgcolor: palette.primary,
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: 'white',
                          '&:hover': {
                            bgcolor: palette.secondary,
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        Siguiente
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <Rocket />}
                        sx={{
                          bgcolor: palette.success,
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          fontSize: '1.1rem',
                          fontWeight: 800,
                          '&:hover': {
                            bgcolor: '#2e7d32',
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${palette.success}50`
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {loading ? "CREANDO PRODUCTO..." : "LANZAR PRODUCTO 🚀"}
                      </Button>
                    )}
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default NewProductPage;