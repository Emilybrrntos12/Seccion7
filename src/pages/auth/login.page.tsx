import { useAuthActions } from "../../hooks/use-auth-actions";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const LoginPage = () => {
  const { loginWithGoogle } = useAuthActions();

  const handleLoginWithGoogle = async () => {
    const result = await loginWithGoogle();
    if (result.success) {
      console.log("Login successful");
    } else {
      console.error("Login failed:", result.error);
    }
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Sign in to your account or continue with Google
        </CardDescription>
      </CardHeader>
      <CardContent>...</CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLoginWithGoogle}
        >
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  );
};
export default LoginPage;