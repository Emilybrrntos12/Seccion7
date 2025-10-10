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
} from "@mui/material";
import OutlinedInput from "@mui/material/OutlinedInput";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import ImageIcon from "@mui/icons-material/Image";
import { toast } from "sonner";

const categorias = ["Mocasines", "Tacones", "Botines", "Botas", "Sandalias"];

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

    // Validaciones básicas
    const parsedPrice = parseFloat(precio);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Precio inválido");
      return;
    }

    // Validar que todas las tallas tengan stock numérico
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
        const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dfqhhvota/image/upload"; // ← sin espacios
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

      toast.success("Producto actualizado");
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
        <CircularProgress />
        <Typography mt={2}>Cargando producto...</Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth={500} mx="auto" p={3} bgcolor="#fff" borderRadius={2} boxShadow={2}>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => navigate("/admin/dashboard")} color="primary" size="large">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700} ml={1}>
          Editar producto
        </Typography>
      </Box>
      <form onSubmit={handleSave}>
        <TextField
          label="Nombre"
          fullWidth
          margin="normal"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <TextField
          label="Descripción"
          fullWidth
          margin="normal"
          multiline
          rows={3}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />
        <TextField
          label="Precio"
          type="number"
          fullWidth
          margin="normal"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          required
          inputProps={{ min: "0.01", step: "0.01" }}
        />
        <FormControl fullWidth margin="normal">
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
        <FormControl fullWidth margin="normal">
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
        <FormControl fullWidth margin="normal">
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
        <FormControl fullWidth margin="normal">
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
          <Box mt={2}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Stock por talla
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
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
                  sx={{ width: 100 }}
                  inputProps={{ min: 0 }}
                  required
                />
              ))}
            </Box>
          </Box>
        )}

        <Box display="flex" alignItems="center" gap={2} mt={2}>
          <IconButton color="primary" component="label">
            <ImageIcon />
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
            />
          </IconButton>
          {imagen && <img src={imagen} alt="Producto" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }} />}
          {newImageFile && <Typography variant="body2">{newImageFile.name}</Typography>}
        </Box>

        <Box display="flex" gap={2} mt={4}>
          <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />} disabled={saving}>
            Guardar
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => navigate("/admin/dashboard")}
            disabled={saving}
          >
            Cancelar
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default EditProductPage;