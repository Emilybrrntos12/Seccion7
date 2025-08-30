import CardFooterAuth from "../../components/card-footer-auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useAuthActions } from "../../hooks/use-auth-actions";

const LoginPage = () => {

  const { loading } = useAuthActions()

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Sign in to your account or continue with Google
        </CardDescription>
      </CardHeader>
      <CardContent>...</CardContent>
      <CardFooterAuth
      type = 'login'
      loading={loading}
      />
    </Card>
  );
};
export default LoginPage;