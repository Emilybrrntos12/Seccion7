import { useAuthActions } from "../../hooks/use-auth-actions";
import { Button } from "../../components/ui/button";

import { useUser } from "reactfire";

const DashboardPage = () => {
  const { data: user } = useUser();
  const { logout } = useAuthActions();

  return (
    <div className="container mx-auto p-4">
      <h1>Dashboard Page</h1>
      <p>Welcome, {user?.displayName || "Guest"}!</p>
      <p>Email: {user?.email || "Not provided"}</p>
      <Button onClick={logout}>Sign Out</Button>
    </div>
  );
};
export default DashboardPage;