
import { Button } from "../components/ui/button"
import { CardFooter } from "../components/ui/card"
import { useAuthActions } from "../hooks/use-auth-actions"
import { toast } from "sonner"
import { Mail } from "lucide-react"

interface Props{
  type: 'login' | 'register'
  loading: boolean
}

const CardFooterAuth = ({type,loading}:Props) => {

  const isLogin = type === 'login'

  const { loginWithGoogle } = useAuthActions();

  const handleLoginWithGoogle = async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      console.log("Login successful");
    } else {
      console.error("Login failed:", result.error);
      toast.error(`Login failed: ${result.error}`);
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
