import { Button } from "../components/ui/button"
import { CardFooter } from "../components/ui/card"
import { useAuthActions } from "../hooks/use-auth-actions"
import { toast } from "sonner"
import { Mail } from "lucide-react"
import { useNavigate } from "react-router"
import { useLocation } from "react-router"
import { useFirebaseApp } from "reactfire"

interface Props{
  type: 'login' | 'register'
  loading: boolean
}

const CardFooterAuth = ({type,loading}:Props) => {
  const isLogin = type === 'login'
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
          } catch {
            // Puedes mostrar un toast si falla
          }
          localStorage.removeItem('pendingCartItem');
        }
        navigate(redirectTo);
      } else {
        console.error("Login failed:", result.error);
        const err = result.error as { code?: string; message?: string } | null;
        const code = err?.code;
        const message = err?.message;
        toast.error(`Login failed${code ? ` (${code})` : ""}: ${message || "Unknown error"}`);
      }
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  };

  return (
    <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          disabled={loading}
          onClick={handleLoginWithGoogle}
        >
          <Mail className="mr-2" />
          {isLogin ? "Login with Google" : "Register with Google"}
        </Button>
      </CardFooter>
  )
}

export default CardFooterAuth
