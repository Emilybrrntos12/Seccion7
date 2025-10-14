import { useSigninCheck, useFirestore, useUser } from "reactfire";
import { doc, getDoc } from "firebase/firestore";
import { Outlet, Navigate } from "react-router";
import React from "react";

const AdminRoute: React.FC = () => {
  const { status, data: signinCheckResult, hasEmitted } = useSigninCheck();
  const firestore = useFirestore();
  const { data: user } = useUser();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (status !== "success" || !hasEmitted) return;

    // Si no hay sesión activa o no hay usuario autenticado
    if (!signinCheckResult || !signinCheckResult.signedIn || !user?.uid) {
      setIsAdmin(false);
      return;
    }

    // Si el usuario inició sesión con Google, NO debe poder entrar a /admin
    const providerId = user?.providerData?.[0]?.providerId;
    if (providerId === "google.com") {
      setIsAdmin(false);
      return;
    }

    // Si no es Google, verificar si es admin en Firestore
    const checkAdmin = async () => {
      const adminDocRef = doc(firestore, "admins", user.uid);
      const adminDoc = await getDoc(adminDocRef);
      setIsAdmin(adminDoc.exists());
    };

    checkAdmin();
  }, [firestore, user, status, hasEmitted, signinCheckResult]);

  if (status === "loading" || !hasEmitted || isAdmin === null) {
    return <div>Loading...</div>;
  }

  // Si inició con Google o no es admin, redirigir a /
  if (isAdmin === false) {
    return <Navigate to="/" replace />;
  }

  // Si pasa todas las validaciones, mostrar contenido admin
  return <Outlet />;
};

export default AdminRoute;
