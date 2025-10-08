import { Route, Routes } from "react-router"
import RootLayout from "./layout/root.layout"
import PublicLayout from "./layout/public.layout"
import AdminLayout from "./layout/admin.layout"
import AuthLayout from "./layout/auth.layout"
import HomePage from "./pages/public/home.page"
import HelloPage from "./pages/public/hello.page"
import DashboardPage from "./pages/admin/dashboard.page"
import ChatPage from "./pages/admin/chat.page"
import ProfilePage from "./pages/admin/profile.page"
import NewProductPage from "./pages/admin/new-product.page"
import LoginPage from "./pages/auth/login.page"
import RegisterPage from "./pages/auth/register.page"
import NotFoundPage from "./pages/public/not-foung-page"

const App = () => {
  return (

    <Routes>
    <Route element={<RootLayout />}>

    {/** Publicas */}
    <Route element={<PublicLayout />}>
      <Route index element={<HomePage />}/>
      <Route path="hello" element={<HelloPage />} />
      <Route path="*" element={<NotFoundPage />}/> 
      
    </Route>

    {/** Privadas */}
    <Route path="admin" element={<AdminLayout />}>
      <Route index element={<DashboardPage />}/>
      <Route path="chat" element={<ChatPage />}/>
      <Route path="profile" element={<ProfilePage />}/>
      <Route path="new-product" element={<NewProductPage />}/>
    </Route>

    {/** Auth */}
    <Route path="auth" element={<AuthLayout />}>
      <Route path="login" element={<LoginPage />}/>
      <Route path="register" element={<RegisterPage />}/>
    </Route>

      </Route>
    </Routes>
  )
}

export default App