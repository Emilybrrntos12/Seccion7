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
  Typography
} from '@mui/material';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error("No tienes permisos para crear productos.");
      return;
    }
    if (!nombre || !descripcion || !precio || !categoria || tallaDisponible.length === 0 || !material || !suela || !genero || imagenes.length < 4) {
      toast.error("Completa todos los campos y selecciona al menos 4 imágenes.");
      return;
    }
    // Validar stockPorTalla
    for (const talla of tallaDisponible) {
      if (!stockPorTalla[talla] && stockPorTalla[talla] !== 0) {
        toast.error(`Falta el stock para la talla ${talla}`);
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
      toast.success("Producto creado exitosamente");
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
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(`Error: ${e?.message || "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={500} mx="auto" p={3} bgcolor="white" borderRadius={2} boxShadow={2}>
      <Typography variant="h5" fontWeight={700} mb={2}>Nuevo producto</Typography>
      {!isAdmin ? (
        <Typography color="error">No tienes permisos para crear productos.</Typography>
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField label="Nombre" fullWidth margin="normal" value={nombre} onChange={e => setNombre(e.target.value)} required />
          <TextField label="Descripción" fullWidth margin="normal" multiline rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
          <TextField label="Precio" type="number" fullWidth margin="normal" value={precio} onChange={e => setPrecio(e.target.value)} required />
          <FormControl fullWidth margin="normal">
            <InputLabel>Categoría</InputLabel>
            <Select value={categoria} onChange={e => setCategoria(e.target.value)} input={<OutlinedInput label="Categoría" />} required>
              <MenuItem value="Mocasines">Mocasines</MenuItem>
              <MenuItem value="Tacones">Tacones</MenuItem>
              <MenuItem value="Botines">Botines</MenuItem>
              <MenuItem value="Botas">Botas</MenuItem>
              <MenuItem value="Sandalias">Sandalias</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Talla disponible</InputLabel>
            <Select
              multiple
              value={tallaDisponible}
              onChange={e => setTallaDisponible(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              input={<OutlinedInput label="Talla disponible" />}
              renderValue={selected => (selected as string[]).join(', ')}
            >
              {['22', '23', '24', '25', '26', '27', '28', '29', '30'].map(talla => (
                <MenuItem key={talla} value={talla}>
                  <Checkbox checked={tallaDisponible.indexOf(talla) > -1} />
                  <ListItemText primary={talla} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Material</InputLabel>
            <Select value={material} onChange={e => setMaterial(e.target.value)} input={<OutlinedInput label="Material" />} required>
              <MenuItem value="Cuero">Cuero</MenuItem>
              <MenuItem value="Sintético">Sintético</MenuItem>
              <MenuItem value="Polipiel">Polipiel</MenuItem>
              <MenuItem value="Charol">Charol</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Suela</InputLabel>
            <Select value={suela} onChange={e => setSuela(e.target.value)} input={<OutlinedInput label="Suela" />} required>
              <MenuItem value="Esponja">Esponja</MenuItem>
              <MenuItem value="Caucho">Caucho</MenuItem>
              <MenuItem value="Cuero">Cuero</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Género</InputLabel>
            <Select value={genero} onChange={e => setGenero(e.target.value)} input={<OutlinedInput label="Género" />} required>
              <MenuItem value="Caballeros">Caballeros</MenuItem>
              <MenuItem value="Damas">Damas</MenuItem>
              <MenuItem value="Niños">Niños</MenuItem>
            </Select>
          </FormControl>
          <Box my={2}>
            <Button variant="contained" component="label">
              Subir imágenes (mínimo 4)
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
              <Typography variant="body2" mt={1}>
                {imagenes.length} imágenes seleccionadas: {imagenes.map(img => img.name).join(", ")}
              </Typography>
            )}
          </Box>
          {/* Campos para stock por talla */}
          <Box my={2}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Stock por talla</Typography>
            {tallaDisponible.length === 0 ? (
              <Typography color="text.secondary">Selecciona las tallas primero</Typography>
            ) : (
              tallaDisponible.map((talla) => (
                <Box key={talla} display="flex" alignItems="center" gap={2} mb={1}>
                  <Typography width={60}>Talla {talla}</Typography>
                  <TextField
                    type="number"
                    label="Stock"
                    value={stockPorTalla[talla] ?? ""}
                    onChange={e => {
                      const value = Math.max(0, parseInt(e.target.value) || 0);
                      setStockPorTalla(prev => ({ ...prev, [talla]: value }));
                    }}
                    inputProps={{ min: 0 }}
                    sx={{ width: 120 }}
                    required
                  />
                </Box>
              ))
            )}
          </Box>
          <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
            {loading ? "Creando..." : "Crear producto"}
          </Button>
        </form>
      )}
    </Box>
  );
};

export default NewProductPage;