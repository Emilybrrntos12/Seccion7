import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Link,
  Divider,
  InputAdornment,
  CircularProgress
} from "@mui/material";
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useAuthActions } from "../../hooks/use-auth-actions";
  import { useState, useEffect } from "react";
import { useSigninCheck, useFirebaseApp } from "reactfire";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore/lite";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";
import CardFooterAuth from "../../components/card-footer-auth";
import bootImage from '../../assets/bota.jpg';

const LoginPage = () => {
  const { loading, login } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();
  const app = useFirebaseApp();
  const { status, data: signInCheckResult } = useSigninCheck();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const addPendingCartItem = async () => {
      if (status === 'success' && signInCheckResult?.signedIn) {
        const pending = localStorage.getItem('pendingCartItem');
        if (pending) {
          try {
            const firestore = getFirestore(app);
            const userId = signInCheckResult.user.uid;
            const item = JSON.parse(pending);
            await addDoc(collection(firestore, "cart"), {
              id_usuario: userId,
              id_producto: item.id_producto,
              cantidad: item.cantidad,
              talla_seleccionada: item.talla_seleccionada,
              fecha_agregada: serverTimestamp(),
              product_data: item.product_data
            });
          } catch {
            // Puedes mostrar un toast si falla
          }
          localStorage.removeItem('pendingCartItem');
        }
      }
    };
    addPendingCartItem();
  }, [status, signInCheckResult, app]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor completa el email y la contraseña");
      return;
    }

    const result = await login({ email, password });
    if (result.success) {
      toast.success("Inicio de sesión exitoso");
      navigate(location.state?.redirectTo || "/admin");
    } else {
      const code = result.error?.code;
      const message = result.error?.message || "Error en el inicio de sesión";
      toast.error(`Login failed${code ? ` (${code})` : ""}: ${message}`);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'center' }}>
      {/* Columna imagen */}
      <Box sx={{ flex: 1, minWidth: 400, maxWidth: 600, height: { xs: 200, md: '80vh' }, display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', boxShadow: 3, borderRadius: 4, overflow: 'hidden', mr: 4, background: 'transparent' }}>
        <img src={bootImage} alt="Bota" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', background: 'transparent' }} />
      </Box>
{/* Columna formulario */}
<Box 
  sx={{ 
    flex: 1, 
    minWidth: 320, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: { xs: 'auto', md: '80vh' }, 
    background: 'transparent',
    py: { xs: 4, md: 0 }
  }}
>
  <Paper 
    elevation={8} 
    sx={{ 
      p: { xs: 3, sm: 4 }, 
      maxWidth: 420, 
      width: '100%', 
      borderRadius: 3,
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        boxShadow: '0 12px 48px rgba(0,0,0,0.12)',
        transform: 'translateY(-2px)'
      }
    }}
  >
    {/* Header con mejor diseño */}
    <Box sx={{ textAlign: 'center', mb: 3 }}>
      <Typography 
        variant="h4" 
        fontWeight={800} 
        gutterBottom
        sx={{
          background: 'linear-gradient(45deg, primary.main, primary.dark)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          fontSize: { xs: '1.75rem', sm: '2rem' }
        }}
      >
        <Box component="span" sx={{ color: 'primary.main' }}> Bienvenido a BM</Box>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.8 }}>
        Inicia sesión en tu cuenta
      </Typography>
    </Box>

    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Campo Email mejorado */}
      <TextField
        label="Correo electrónico"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="primary" sx={{ opacity: 0.7 }} />
            </InputAdornment>
          ),
        }}
        placeholder="tu@ejemplo.com"
        required
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.2s',
            '&:hover': {
              '& fieldset': {
                borderColor: 'primary.main',
              }
            },
            '&.Mui-focused': {
              '& fieldset': {
                borderWidth: 2,
                borderColor: 'primary.main',
              }
            }
          }
        }}
      />

      {/* Campo Contraseña mejorado */}
      <TextField
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="primary" sx={{ opacity: 0.7 }} />
            </InputAdornment>
          ),
        }}
        placeholder="••••••••"
        required
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            transition: 'all 0.2s',
            '&:hover': {
              '& fieldset': {
                borderColor: 'primary.main',
              }
            },
            '&.Mui-focused': {
              '& fieldset': {
                borderWidth: 2,
                borderColor: 'primary.main',
              }
            }
          }
        }}
      />

      {/* Enlace de recuperación */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Link 
          href="#" 
          underline="hover" 
          sx={{ 
            fontSize: 14, 
            fontWeight: 500,
            color: 'primary.main',
            transition: 'all 0.2s',
            '&:hover': {
              color: 'primary.dark',
              transform: 'translateX(2px)'
            }
          }}
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </Box>

      {/* Botón de envío mejorado */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        sx={{ 
          py: 1.8, 
          fontWeight: 700,
          fontSize: '1rem',
          borderRadius: 2,
          textTransform: 'none',
          background: 'linear-gradient(45deg, primary.main, primary.dark)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
          },
          '&:disabled': {
            background: 'grey.300',
            transform: 'none',
            boxShadow: 'none'
          }
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} color="inherit" />
            Iniciando sesión...
          </Box>
        ) : (
          "Iniciar Sesión"
        )}
      </Button>

      {/* Divider con mejor estilo */}
      <Divider sx={{ my: 2, color: 'text.secondary', '&::before, &::after': { borderColor: 'divider' } }}>
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, opacity: 0.7 }}>
          O continúa con
        </Typography>
      </Divider>
    </Box>

    {/* Footer de auth */}
    <Box sx={{ mt: 3 }}>
      <CardFooterAuth type={"login"} loading={loading} />
    </Box>
  </Paper>
</Box>
    </Box>
  );
};

export default LoginPage;