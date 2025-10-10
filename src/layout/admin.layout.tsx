import { Navigate, Outlet } from "react-router"
import { useSigninCheck } from "reactfire";


const AdminLayout = () => {
const { status, data: signinCheckResult, hasEmitted } = useSigninCheck();

  if (status === "loading" || !hasEmitted) {
    return <div>Loading...</div>;
  }

  if (status === "success" && !signinCheckResult.signedIn) {
    return (<Navigate to="/" replace />)
  }

  return (
    <div>
      <Outlet />
    </div>
  )
}

export default AdminLayout