import { Button, Box  , CircularProgress } from "@mui/material";
import { useAuthActions } from "../hooks/use-auth-actions";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";
import { useFirebaseApp } from "reactfire";

interface Props {
  loading: boolean;
}

const CardFooterAuth = ({ loading }: Props) => {
  const { loginWithGoogle } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();
  const app = useFirebaseApp();

  const handleLoginWithGoogle = async () => {
    try {
      // Guardar el destino de redirección en localStorage antes de iniciar el login
      if (location.state?.redirectTo) {
        localStorage.setItem('redirectAfterLogin', location.state.redirectTo);
      }
      
      const result = await loginWithGoogle();
      
      if (result.success) {
        // Leer el destino de redirección desde localStorage después del login
        const redirectTo = localStorage.getItem('redirectAfterLogin') || '/';
        localStorage.removeItem('redirectAfterLogin');

        // Agregar producto pendiente al carrito si existe
        const pending = localStorage.getItem('pendingCartItem');
        if (pending && result.user) {
          try {
            const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore/lite');
            const firestore = getFirestore(app);
            const userId = result.user.uid;
            const item = JSON.parse(pending);
            
            await addDoc(collection(firestore, "cart"), {
              id_usuario: userId,
              id_producto: item.id_producto,
              cantidad: item.cantidad,
              talla_seleccionada: item.talla_seleccionada,
              fecha_agregada: serverTimestamp(),
              product_data: item.product_data
            });
            
            toast.success("Producto agregado al carrito");
          } catch (error) {
            console.error("Error al agregar producto al carrito:", error);
            toast.error("No se pudo agregar el producto al carrito");
          }
          localStorage.removeItem('pendingCartItem');
        }
        
        toast.success("¡Bienvenido de vuelta!");
        navigate(redirectTo, { replace: true });
        
      } else {
        console.error("Login failed:", result.error);
        const err = result.error as { code?: string; message?: string } | null;
        const code = err?.code;
        const message = err?.message;
        
        // Mensajes de error más amigables
        let errorMessage = "Error al iniciar sesión";
        if (code === 'auth/popup-closed-by-user') {
          errorMessage = "El inicio de sesión fue cancelado";
        } else if (code === 'auth/network-request-failed') {
          errorMessage = "Error de conexión. Verifica tu internet";
        } else if (message) {
          errorMessage = message;
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
      toast.error("Error inesperado. Intenta nuevamente");
    }
  };

  const GoogleIcon = () => (
    <Box sx={{ 
      width: 20, 
      height: 20, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      mr: 1
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    </Box>
  );

  return (
    <Box sx={{ textAlign: 'center', mt: 3 }}>

      
      <Button
        variant="outlined"
        fullWidth
        disabled={loading}
        onClick={handleLoginWithGoogle}
        startIcon={loading ? <CircularProgress size={16} /> : <GoogleIcon />}
        sx={{
          py: 1.5,
          fontWeight: 600,
          borderRadius: 2,
          textTransform: 'none',
          borderColor: '#D2C1B0',
          color: '#8B7355',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: '#8B7355',
            backgroundColor: 'rgba(139, 115, 85, 0.04)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(139, 115, 85, 0.1)'
          },
          '&:disabled': {
            borderColor: '#E8DCC8',
            color: '#D2C1B0',
            transform: 'none',
            boxShadow: 'none'
          }
        }}
      >
        {loading ? "Procesando..." : "Continuar con Google"}
      </Button>
    </Box>
  );
};

export default CardFooterAuth;