
import { useState, useEffect } from "react";
import { useUser } from "reactfire";
import { useAuthActions } from "@/hooks/use-auth-actions";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useFirebaseApp } from "reactfire";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

type Product = {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen: string;
};

const HomePage = () => {
  const navigate = useNavigate();
  const app = useFirebaseApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // Nuevo: obtener usuario logueado
  // reactfire: useUser
  // Importar useUser arriba: import { useUser } from "reactfire";
  // ...existing code...
  // Agregar import:
  // import { useUser } from "reactfire";
  // ...existing code...
  // Dentro del componente:
  const { data: user } = useUser();
  const { logout } = useAuthActions();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const firestore = getFirestore(app);
      const productsCol = collection(firestore, "products");
      const snapshot = await getDocs(productsCol);
      const items: Product[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(items);
      setLoading(false);
    };
    fetchProducts();
  }, [app]);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra superior */}
      <header className="w-full bg-white shadow flex items-center justify-between px-6 py-4">
        <div className="font-bold text-xl text-primary">Mi Tienda</div>
        {/* Si el usuario está logueado, mostrar su nombre y botón de cerrar sesión. Si no, mostrar botón de login */}
        {user ? (
          <div className="ml-auto flex items-center gap-4 text-primary font-semibold">
            <div className="flex items-center gap-2">
              <PersonIcon className="w-6 h-6" />
              <span className="hidden md:inline">{user.displayName || user.email}</span>
            </div>
            <button
              className="flex items-center justify-center text-blue-600 hover:text-blue-800 border border-blue-200 rounded-full p-2"
              onClick={() => navigate('/cart')}
              title="Ver carrito"
            >
              <ShoppingCartIcon className="w-6 h-6" />
            </button>
            <button
              className="flex items-center justify-center text-red-600 hover:text-red-800 border border-red-200 rounded-full p-2"
              onClick={async () => {
                const result = await logout();
                if (result.success) {
                  toast.success("Sesión cerrada");
                  navigate("/");
                } else {
                  toast.error("Error al cerrar sesión");
                }
              }}
              title="Cerrar sesión"
            >
              <LogoutIcon className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <button
            className="ml-auto flex items-center gap-2 text-primary hover:text-blue-600"
            onClick={() => navigate("/auth/login")}
            title="Iniciar sesión"
          >
            <PersonIcon className="w-6 h-6" />
            <span className="hidden md:inline">Iniciar sesión</span>
          </button>
        )}
      </header>
      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Productos</h1>
        {loading && <div>Cargando productos...</div>}
        {!loading && products.length === 0 && <div>No hay productos disponibles.</div>}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map(product => (
              <div
                key={product.id}
                className="border rounded p-4 flex flex-col items-center cursor-pointer hover:shadow-lg"
                onClick={() => navigate(`/producto/${product.id}`)}
              >
                {product.imagen && (
                  <img src={product.imagen} alt={product.nombre} className="w-32 h-32 object-cover mb-2 rounded" />
                )}
                <h2 className="font-semibold text-lg mb-1">{product.nombre}</h2>
                <p className="text-primary font-bold mb-2">${product.precio}</p>
                <p className="text-sm text-gray-600 mb-2">{product.descripcion}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
// ...eliminado duplicado...
};

export default HomePage;