import { useState, useEffect } from "react";
import { useUser } from "reactfire";
import { 
  Box, 
  Typography, 
  TextField, 
  Button,  
  Avatar, 
  CircularProgress,
  Card,
  CardContent,
  Paper,
  Divider
} from "@mui/material";
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useFirebaseApp } from "reactfire";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [foto, setFoto] = useState<string>("");
  const [newFotoFile, setNewFotoFile] = useState<File | null>(null);
  const [telefono, setTelefono] = useState("");
  const [aniosNegocio, setAniosNegocio] = useState("");
  const [historia, setHistoria] = useState("");
  const app = useFirebaseApp();
  const { data: user } = useUser();
  const userId = user?.uid;

  // Paleta de colores tierra
  const palette = {
    primary: "#8B7355",
    secondary: "#A0522D",
    background: "#fffdf9",
    light: "#e8dcc8",
    dark: "#5d4037",
    accent: "#c2a77d"
  };

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
      toast.success("Perfil actualizado correctamente");
      navigate("/admin");
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      toast.error("Error al guardar el perfil: " + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 50%)'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: palette.primary, mb: 2 }} size={60} />
          <Typography variant="h6" sx={{ color: palette.primary }}>
            Cargando perfil...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 100%)',
      paddingTop: '80px',
      py: 4
    }}>
      <Box sx={{ maxWidth: '800px', mx: 'auto', px: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/admin")}
            sx={{
              background: palette.primary,
              color: 'white',
              borderRadius: 3,
              padding: '10px 20px',
              fontWeight: 600,
              mb: 3,
              '&:hover': {
                background: palette.secondary,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(139, 115, 85, 0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
          </Button>
          
          <Typography variant="h2" fontWeight="700" sx={{ color: palette.dark, mb: 2, textAlign: 'center' }}>
            Editar Perfil
          </Typography>
          <Typography variant="h6" sx={{ color: palette.primary, textAlign: 'center', opacity: 0.8 }}>
            Actualiza tu información personal y profesional
          </Typography>
        </Box>

        <Card sx={{ 
          background: 'white',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
          border: '1px solid #e8dcc8',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSave}>
              {/* Sección de Foto de Perfil */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar
                  src={newFotoFile ? URL.createObjectURL(newFotoFile) : foto}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    border: `4px solid ${palette.light}`,
                    background: palette.primary
                  }}
                >
                  <PersonIcon sx={{ fontSize: 50 }} />
                </Avatar>
                <Button
                  component="label"
                  startIcon={<PhotoCamera />}
                  sx={{
                    background: palette.light,
                    color: palette.primary,
                    borderRadius: 3,
                    px: 3,
                    '&:hover': {
                      background: palette.light,
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Cambiar Foto
                  <input 
                    type="file" 
                    accept="image/*" 
                    hidden 
                    onChange={e => setNewFotoFile(e.target.files?.[0] || null)} 
                  />
                </Button>
                {newFotoFile && (
                  <Typography variant="body2" sx={{ color: palette.secondary, mt: 1 }}>
                    Nueva foto seleccionada
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 4, borderColor: palette.light }} />

              {/* Información Personal */}
              <Typography variant="h5" fontWeight="600" sx={{ color: palette.dark, mb: 3 }}>
                Información Personal
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
                <TextField
                  label="Nombre completo"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: <PersonIcon sx={{ color: palette.primary, mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: palette.primary }
                    }
                  }}
                />

                <TextField
                  label="Teléfono"
                  type="tel"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ color: palette.primary, mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: palette.primary }
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <TextField
                  label="Correo electrónico"
                  value={email}
                  disabled
                  fullWidth
                  helperText="El correo electrónico no se puede modificar"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: palette.background
                    }
                  }}
                />
              </Box>

              <Divider sx={{ my: 4, borderColor: palette.light }} />

              {/* Información Profesional */}
              <Typography variant="h5" fontWeight="600" sx={{ color: palette.dark, mb: 3 }}>
                Información Profesional
              </Typography>

              <Box sx={{ mb: 4 }}>
                <TextField
                  label="Años en el negocio"
                  type="number"
                  value={aniosNegocio}
                  onChange={e => setAniosNegocio(e.target.value)}
                  fullWidth
                  InputProps={{
                    startAdornment: <BusinessIcon sx={{ color: palette.primary, mr: 1 }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: palette.primary }
                    },
                    mb: 3
                  }}
                />

                <TextField
                  label="Tu historia"
                  multiline
                  rows={4}
                  value={historia}
                  onChange={e => setHistoria(e.target.value)}
                  fullWidth
                  placeholder="Comparte tu experiencia, pasión por la zapatería artesanal, o cualquier información relevante sobre tu negocio..."
                  InputProps={{
                    startAdornment: <HistoryIcon sx={{ color: palette.primary, mr: 1, mt: 1, alignSelf: 'flex-start' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': { borderColor: palette.primary },
                      alignItems: 'flex-start'
                    },
                    '& .MuiInputBase-inputMultiline': {
                      paddingTop: '12px'
                    }
                  }}
                />
              </Box>

              {/* Botones de Acción */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                <Button
                  type="submit"
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  disabled={saving}
                  sx={{
                    background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
                    color: 'white',
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #A0522D 0%, #8B7355 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(139, 115, 85, 0.3)'
                    },
                    '&:disabled': {
                      background: palette.light
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>

                <Button
                  startIcon={<CancelIcon />}
                  onClick={() => navigate('/admin')}
                  disabled={saving}
                  sx={{
                    border: `2px solid ${palette.primary}`,
                    color: palette.primary,
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                    '&:hover': {
                      background: palette.light,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Cancelar
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Paper sx={{ 
          mt: 3, 
          p: 3, 
          background: palette.background,
          borderRadius: 3,
          border: `1px solid ${palette.light}`
        }}>
          <Typography variant="body2" sx={{ color: palette.primary, textAlign: 'center' }}>
            💡 Tu perfil ayuda a los clientes a conocerte mejor y genera confianza en tus productos artesanales.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default EditProfilePage;