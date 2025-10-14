import { useState, useEffect } from "react";
import { useUser } from "reactfire";
import { Box, Typography, TextField, Button, IconButton, Avatar, CircularProgress } from "@mui/material";
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useFirebaseApp } from "reactfire";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState("");
  const [, setEmail] = useState(""); // Solo mostrar
  const [foto, setFoto] = useState<string>("");
  const [newFotoFile, setNewFotoFile] = useState<File | null>(null);
  const [telefono, setTelefono] = useState("");
  const [aniosNegocio, setAniosNegocio] = useState("");
  const [historia, setHistoria] = useState("");
  // const [password, setPassword] = useState(""); // Si quieres editar contraseña, implementa lógica extra
  const app = useFirebaseApp();
  // Obtener el usuario autenticado
  const { data: user } = useUser();
  const userId = user?.uid;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const fetchProfile = async () => {
      try {
        const { getFirestore, doc, getDoc } = await import('firebase/firestore/lite');
        const firestore = getFirestore(app);
        console.log("[EditProfile] UID actual:", userId);
        console.log("[EditProfile] Email actual:", user?.email);
        const ref = doc(firestore, "users", userId);
        const snap = await getDoc(ref);
        console.log("[EditProfile] Documento existe:", snap.exists());
        if (!snap.exists()) {
          // Crear el documento de usuario si no existe
          try {
            const { setDoc } = await import('firebase/firestore/lite');
            await setDoc(ref, {
              nombre: user?.displayName ?? "",
              email: user?.email ?? "",
              foto: user?.photoURL ?? "",
              telefono: "",
              aniosNegocio: "",
              historia: ""
            });
            toast.success("Perfil creado automáticamente");
            // Recargar el perfil
            const newSnap = await getDoc(ref);
            const data = newSnap.data();
            setNombre(data?.nombre ?? "");
            setEmail(data?.email ?? "");
            setFoto(data?.foto ?? "");
            setTelefono(data?.telefono ?? "");
            setAniosNegocio(data?.aniosNegocio ?? "");
            setHistoria(data?.historia ?? "");
            return;
          } catch (createErr) {
            toast.error("No se pudo crear el perfil automáticamente");
            console.log("[EditProfile] Error creando perfil Firestore:", createErr);
            navigate("/admin/edit-profile");
            return;
          }
        }
        const data = snap.data();
        console.log("[EditProfile] Datos del usuario Firestore:", data);
        setNombre(data.nombre ?? "");
        setEmail(data.email ?? "");
        setFoto(data.foto ?? "");
        setTelefono(data.telefono ?? "");
        setAniosNegocio(data.aniosNegocio ?? "");
        setHistoria(data.historia ?? "");
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        toast.error("Error al cargar el perfil: " + errorMsg);
        console.log("[EditProfile] Error al cargar el perfil:", errorMsg);
        navigate("/admin/edit-profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [app, navigate, userId, user?.displayName, user?.email, user?.photoURL]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let fotoUrl = foto;
      if (newFotoFile) {
        // Subida real a Cloudinary
        const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dfqhhvota/image/upload";
        const CLOUDINARY_PRESET = "ecommerce_unsigned";
        const formData = new FormData();
        formData.append("file", newFotoFile);
        formData.append("upload_preset", CLOUDINARY_PRESET);
        const response = await fetch(CLOUDINARY_URL, {
          method: "POST",
          body: formData
        });
        const result = await response.json();
        fotoUrl = result.secure_url;
      }
      if (!userId) throw new Error("No autenticado");
      const { getFirestore, doc, updateDoc } = await import('firebase/firestore/lite');
      const firestore = getFirestore(app);
      const ref = doc(firestore, "users", userId);
      await updateDoc(ref, {
        nombre,
        telefono,
        aniosNegocio,
        historia,
        foto: fotoUrl
      });
      toast.success("Perfil actualizado");
      navigate("/admin/edit-profile");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast.error("Error al guardar el perfil: " + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="60vh">
        <CircularProgress />
        <Typography mt={2}>Cargando perfil...</Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth={400} mx="auto" p={3} bgcolor="#fff" borderRadius={2} boxShadow={2}>
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => navigate("/admin")} color="primary" size="large">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700} ml={1}>Editar perfil</Typography>
      </Box>
      <form onSubmit={handleSave}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Avatar src={newFotoFile ? URL.createObjectURL(newFotoFile) : foto} sx={{ width: 80, height: 80 }} />
          <IconButton color="primary" component="label" sx={{ mt: 1 }}>
            <PhotoCamera />
            <input type="file" accept="image/*" hidden onChange={e => setNewFotoFile(e.target.files?.[0] || null)} />
          </IconButton>
        </Box>
        <TextField label="Nombre" fullWidth margin="normal" value={nombre} onChange={e => setNombre(e.target.value)} required />
        <TextField label="Teléfono" type="tel" fullWidth margin="normal" value={telefono} onChange={e => setTelefono(e.target.value)} />
        <TextField label="Años en el negocio" type="number" fullWidth margin="normal" value={aniosNegocio} onChange={e => setAniosNegocio(e.target.value)} />
        <TextField label="Tu historia" multiline rows={4} fullWidth margin="normal" value={historia} onChange={e => setHistoria(e.target.value)} />
        <Box display="flex" gap={2} mt={4}>
          <Button type="submit" variant="contained" color="primary" disabled={saving}>
            Guardar
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => navigate('/admin')} disabled={saving}>
            Cancelar
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default EditProfilePage;
