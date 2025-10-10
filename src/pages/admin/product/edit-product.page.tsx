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
  useTheme
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from "sonner";

const categorias = ["Mocasines", "Tacones", "Botines", "Botas", "Sandalias"];

const EditProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const app = useFirebaseApp();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [categoria, setCategoria] = useState("");
  const [imagen, setImagen] = useState<string>("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
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
        setImagen(data.imagen ?? "");
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
      let imageUrl = imagen;
      if (newImageFile) {
        const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dfqhhvota/image/upload";
        const CLOUDINARY_PRESET = "ecommerce_unsigned";
        const formData = new FormData();
        formData.append("file", newImageFile);
        formData.append("upload_preset", CLOUDINARY_PRESET);
        const response = await fetch(CLOUDINARY_URL, {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (!result.secure_url) {
          throw new Error("Error al subir la imagen");
        }
        imageUrl = result.secure_url;
      }

      const { getFirestore, doc, updateDoc } = await import("firebase/firestore/lite");
      const firestore = getFirestore(app);
      const ref = doc(firestore, "products", id!);
      await updateDoc(ref, {
        nombre,
        descripcion,
        precio: parsedPrice,
        categoria,
        imagen: imageUrl,
        genero,
        material,
        tallaDisponible,
        stockPorTalla,
      });

      toast.success("Producto actualizado exitosamente");
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
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress size={60} sx={{ mb: 2, color: theme.palette.primary.main }} />
        <Typography variant="h6" color="text.secondary">
          Cargando producto...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Box maxWidth="lg" mx="auto">
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <IconButton 
              onClick={() => navigate("/admin")} 
              sx={{ 
                color: 'white',
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight="bold" color="primary">
                Editar Producto
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Actualiza la información de tu producto
              </Typography>
            </Box>
          </Box>
        </Box>

        <form onSubmit={handleSave}>
          <Box display="flex" gap={3} sx={{ flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Columna izquierda - Información básica */}
            <Box sx={{ flex: 2 }}>
              <Card elevation={2} sx={{ borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                    Información del Producto
                  </Typography>
                  
                  <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                      label="Nombre del producto"
                      fullWidth
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                    
                    <TextField
                      label="Descripción"
                      fullWidth
                      multiline
                      rows={4}
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      required
                    />
                    
                    <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                      <TextField
                        label="Precio"
                        type="number"
                        fullWidth
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        required
                        inputProps={{ min: "0.01", step: "0.01" }}
                      />

                      <FormControl fullWidth>
                        <InputLabel>Categoría</InputLabel>
                        <Select
                          value={categoria}
                          onChange={(e) => setCategoria(e.target.value as string)}
                          label="Categoría"
                          required
                        >
                          {categorias.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                              {cat}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    <Box display="flex" gap={2} sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
                      <FormControl fullWidth>
                        <InputLabel>Género</InputLabel>
                        <Select
                          value={genero}
                          onChange={(e) => setGenero(e.target.value as string)}
                          input={<OutlinedInput label="Género" />}
                          required
                        >
                          <MenuItem value="Caballeros">Caballeros</MenuItem>
                          <MenuItem value="Damas">Damas</MenuItem>
                          <MenuItem value="Niños">Niños</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <InputLabel>Material</InputLabel>
                        <Select
                          value={material}
                          onChange={(e) => setMaterial(e.target.value as string)}
                          input={<OutlinedInput label="Material" />}
                          required
                        >
                          <MenuItem value="Cuero">Cuero</MenuItem>
                          <MenuItem value="Sintético">Sintético</MenuItem>
                          <MenuItem value="Polipiel">Polipiel</MenuItem>
                          <MenuItem value="Charol">Charol</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Columna derecha - Inventario e Imagen */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Sección de Inventario */}
              <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                    Inventario
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Tallas disponibles</InputLabel>
                    <Select
                      multiple
                      value={tallaDisponible}
                      onChange={(e) =>
                        setTallaDisponible(
                          typeof e.target.value === "string" ? e.target.value.split(",") : (e.target.value as string[])
                        )
                      }
                      label="Tallas disponibles"
                      renderValue={(selected) => (selected as string[]).join(", ")}
                    >
                      {["22", "23", "24", "25", "26", "27", "28", "29", "30"].map((talla) => (
                        <MenuItem key={talla} value={talla}>
                          {talla}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Stock por talla */}
                  {tallaDisponible.length > 0 && (
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600} mb={2}>
                        Stock por talla
                      </Typography>
                      <Box display="flex" flexDirection="column" gap={1}>
                        {tallaDisponible.map((talla) => (
                          <TextField
                            key={talla}
                            label={`Talla ${talla}`}
                            type="number"
                            value={stockPorTalla[talla] ?? ""}
                            onChange={(e) =>
                              setStockPorTalla((prev) => ({
                                ...prev,
                                [talla]: e.target.value === "" ? 0 : Number(e.target.value),
                              }))
                            }
                            fullWidth
                            size="small"
                            inputProps={{ min: 0 }}
                            required
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Sección de Imagen */}
              <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                    Imagen del Producto
                  </Typography>
                  
                  <Box display="flex" flexDirection="column" gap={2}>
                    {imagen && (
                      <Box display="flex" justifyContent="center">
                        <img 
                          src={imagen} 
                          alt="Vista previa" 
                          style={{ 
                            width: '100%', 
                            maxWidth: 200,
                            height: 200, 
                            objectFit: "cover", 
                            borderRadius: 8,
                            border: `2px solid ${theme.palette.divider}`
                          }} 
                        />
                      </Box>
                    )}
                    
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                      sx={{
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        py: 1.5
                      }}
                    >
                      {imagen ? 'Cambiar Imagen' : 'Subir Imagen'}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
                      />
                    </Button>
                    
                    {newImageFile && (
                      <Typography variant="body2" color="primary" fontWeight="medium" textAlign="center">
                        {newImageFile.name}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>

          {/* Botones de acción */}
          <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/admin")}
              disabled={saving}
              sx={{ px: 4 }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={saving}
              sx={{ px: 4 }}
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default EditProductPage;