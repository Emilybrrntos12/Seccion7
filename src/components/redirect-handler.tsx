import { useEffect } from "react";
import { useNavigate } from "react-router";
import { getAuth, getRedirectResult } from "firebase/auth";
import { toast } from "sonner";

const RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          const providerId = result.user.providerData?.[0]?.providerId || "";
          if (providerId.includes("google.com")) {
            toast.success("Inicio con Google completado");
            navigate("/");
          } else {
            toast.success("Inicio de sesión completado");
            navigate("/admin");
          }
        }
      })
      .catch((err: unknown) => {
        console.error("Redirect sign-in error", err);
        const e = err as { code?: string; message?: string } | undefined;
        const code = e?.code || "";
        const message = e?.message || "Error during redirect sign-in";
        toast.error(`Redirect sign-in failed${code ? ` (${code})` : ""}: ${message}`);
      });
  }, [navigate]);

  return null;
};

export default RedirectHandler;
