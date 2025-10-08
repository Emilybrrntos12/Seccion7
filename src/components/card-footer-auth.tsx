
import { Button } from "../components/ui/button"
import { CardFooter } from "../components/ui/card"
import { useAuthActions } from "../hooks/use-auth-actions"
import { toast } from "sonner"
import { Mail } from "lucide-react"
import { useNavigate } from "react-router"

interface Props{
  type: 'login' | 'register'
  loading: boolean
}

const CardFooterAuth = ({type,loading}:Props) => {

  const isLogin = type === 'login'

  const { loginWithGoogle } = useAuthActions();
  const navigate = useNavigate();

  const handleLoginWithGoogle = async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      // Redirigir a la página Hello Word cuando el usuario use Google
      navigate("/hello");
    } else {
      console.error("Login failed:", result.error);
  const err = result.error as { code?: string; message?: string } | null;
  const code = err?.code;
  const message = err?.message;
  toast.error(`Login failed${code ? ` (${code})` : ""}: ${message || "Unknown error"}`);
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
