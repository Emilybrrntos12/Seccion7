import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebaseApp } from "reactfire";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";
import Header from "@/components/ui/header";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useUser } from "reactfire";
import { useFavorites } from '@/hooks/use-favorites';

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
  const { data: user } = useUser();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

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
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Barra superior */}
        
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
                  className="border rounded p-4 flex flex-col items-center cursor-pointer hover:shadow-lg relative"
                  onClick={() => navigate(`/producto/${product.id}`)}
                >
                  {/* Icono de favorito */}
                  {user && (
                    <span
                      style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}
                      onClick={e => {
                        e.stopPropagation();
                        if (isFavorite(product.id)) {
                          removeFavorite(product.id);
                        } else {
                          addFavorite(product.id);
                        }
                      }}
                    >
                      {isFavorite(product.id)
                        ? <FavoriteIcon sx={{ color: 'red', fontSize: 28 }} />
                        : <FavoriteBorderIcon sx={{ color: 'gray', fontSize: 28 }} />}
                    </span>
                  )}
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
    </>
  );
};

export default HomePage;