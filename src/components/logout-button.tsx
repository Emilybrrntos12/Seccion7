import { Button } from "./ui/button";
import { useAuthActions } from "../hooks/use-auth-actions";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const LogoutButton = ({ className }: { className?: string }) => {
  const { logout } = useAuthActions();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success("Sesión cerrada");
      navigate("/auth/login");
    } else {
      toast.error(`Error cerrando sesión: ${result.error?.message || "Unknown"}`);
    }
  };

  return (
    <Button variant="outline" size="sm" className={className} onClick={handleLogout}>
      Cerrar sesión
    </Button>
  );
};

export default LogoutButton;
