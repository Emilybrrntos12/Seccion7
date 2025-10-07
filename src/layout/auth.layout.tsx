import { Navigate, Outlet } from "react-router";
import { useSigninCheck, useUser } from "reactfire";

const AuthLayout = () => {
  const { status, data: signInCheckResult, hasEmitted } = useSigninCheck();
  const { data: user } = useUser();

  if (status === "loading" || !hasEmitted) {
    return <div>Loading...</div>;
  }

  if (status === "success" && signInCheckResult.signedIn) {
    // Si el usuario inició sesión, detectamos el proveedor principal.
    const providerId = user?.providerData?.[0]?.providerId || null;

    if (providerId && providerId.includes("google.com")) {
      return <Navigate to="/hello" />;
    }

    return <Navigate to="/admin" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full">
        <Outlet />
      </div>
    </div>
  );
};
export default AuthLayout;