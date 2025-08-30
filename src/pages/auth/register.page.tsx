import CardFooterAuth from "../../components/card-footer-auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useAuthActions } from "../../hooks/use-auth-actions";

const RegisterPage = () => {

const { loading } = useAuthActions()

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Register in to your account or continue with Google
        </CardDescription>
      </CardHeader>
      <CardContent>...</CardContent>
      <CardFooterAuth
      type = 'register'
      loading={loading}
      />
    </Card>
  );
}

export default RegisterPage