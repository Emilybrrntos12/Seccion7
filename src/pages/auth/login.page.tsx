import CardFooterAuth from "../../components/card-footer-auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useAuthActions } from "../../hooks/use-auth-actions";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";

const LoginPage = () => {
  const { loading, login } = useAuthActions();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor completa el email y la contraseña");
      return;
    }

    const result = await login({ email, password });
    if (result.success) {
      toast.success("Inicio de sesión exitoso");
      navigate("/admin");
    } else {
      const code = result.error?.code;
      const message = result.error?.message || "Error en el inicio de sesión";
      toast.error(`Login failed${code ? ` (${code})` : ""}: ${message}`);
    }
  };

  return (
    <Card className="bg-white max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Ingresa con tu correo y la contraseña asignada o continúa con Google
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border px-3 py-2"
              placeholder="usuario@ejemplo.com"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-md border px-3 py-2"
              placeholder="Contraseña"
            />
          </label>

          <button
            type="submit"
            className="bg-primary text-white rounded-md py-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </form>
      </CardContent>
      <CardFooterAuth type={"login"} loading={loading} />
    </Card>
  );
};

export default LoginPage;