import { useSigninCheck, useFirestore, useUser } from "reactfire";
import { doc, getDoc } from "firebase/firestore";
import { Outlet } from "react-router";
import React from "react";

const AdminRoute: React.FC = () => {
  const { status, data: signinCheckResult, hasEmitted } = useSigninCheck();
  const firestore = useFirestore();
  const { data: user } = useUser();
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
  const [showDenied, setShowDenied] = React.useState(false);

  React.useEffect(() => {
    const checkAdmin = async () => {
      if (user?.uid) {
        const adminDocRef = doc(firestore, "admins", user.uid);
        const adminDoc = await getDoc(adminDocRef);
        setIsAdmin(adminDoc.exists());
        setShowDenied(!adminDoc.exists());
      } else {
        setIsAdmin(false);
        setShowDenied(false); // No mostrar acceso denegado hasta que se verifique
      }
    };
    if (status === "success" && hasEmitted && signinCheckResult && signinCheckResult.signedIn) {
      checkAdmin();
    }
    // Si no está autenticado, no mostrar nada
    if (status === "success" && hasEmitted && signinCheckResult && !signinCheckResult.signedIn) {
      setIsAdmin(false);
      setShowDenied(false);
    }
  }, [firestore, user, status, hasEmitted, signinCheckResult]);

  if (status === "loading" || !hasEmitted || isAdmin === null) {
    return <div>Loading...</div>;
  }

  if (showDenied) {
    return (
      <div style={{textAlign: 'center', marginTop: '4rem', color: '#8d6748'}}>
        <h2>Acceso denegado</h2>
        <p>No tienes permisos de administrador para acceder a esta sección.</p>
        <button style={{marginTop: '2rem', padding: '0.5rem 1.5rem', background: '#f5ecd7', color: '#8d6748', border: 'none', borderRadius: '8px', cursor: 'pointer'}} onClick={() => window.location.href = '/'}>
          Volver al inicio
        </button>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminRoute;
