import { Route, Routes } from "react-router"
import RootLayout from "./layout/root.layout"
import PublicLayout from "./layout/public.layout"
import AdminLayout from "./layout/admin.layout"
import AuthLayout from "./layout/auth.layout"
import HomePage from "./pages/public/home.page"
import HelloPage from "./pages/public/hello.page"
import ProductDetailPage from "./pages/public/product-detail.page"
import DashboardPage from "./pages/admin/dashboard.page"
import ChatPage from "./pages/admin/chat.page"
import NewProductPage from "./pages/admin/product/new-product.page"
import EditProductPage from "./pages/admin/product/edit-product.page"
import LoginPage from "./pages/auth/login.page"
import RegisterPage from "./pages/auth/register.page"
import CartPage from "./pages/public/cart.page"
import CheckoutPage from "./pages/public/checkout.page"
import EditProfilePage from "./pages/admin/edit-profile.page"
import OrderPage from "./pages/admin/order.page"
import FavoritosPage from "./pages/public/favoritos.page"
import {UserProfile} from "./components/ui/user-profile"

const App = () => {
  return (

    <Routes>
    <Route element={<RootLayout />}>

    {/** Publicas */}
    <Route element={<PublicLayout />}>
  <Route index element={<HomePage />}/>
  <Route path="hello" element={<HelloPage />} />
  <Route path="producto/:id" element={<ProductDetailPage />} />
  <Route path="cart" element={<CartPage />} />
  <Route path="checkout" element={<CheckoutPage />} />
  <Route path="favoritos" element={<FavoritosPage />} />
  <Route path="perfil" element={<UserProfile />} />
    </Route>

    {/** Privadas */}
    <Route path="admin" element={<AdminLayout />}>
      <Route index element={<DashboardPage />}/>
      <Route path="chat" element={<ChatPage />}/>
      <Route path="edit-profile" element={<EditProfilePage />}/>
      <Route path="new-product" element={<NewProductPage />}/>
      <Route path="edit-product/:id" element={<EditProductPage />}/>
      <Route path="orders" element={<OrderPage />}/>
    </Route>

    {/** Auth */}
    <Route path="auth" element={<AuthLayout />}>
      <Route path="login" element={<LoginPage />}/>
      <Route path="producto/:id/auth/login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />}/>
    </Route>

      </Route>
    </Routes>
  )
}

export default App