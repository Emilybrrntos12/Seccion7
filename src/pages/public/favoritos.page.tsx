import { useFavorites } from '@/hooks/use-favorites';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useFirebaseApp } from 'reactfire';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import Header from '@/components/ui/header';
import FavoriteIcon from '@mui/icons-material/Favorite';

type Product = {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  imagen?: string;
};

const FavoritosPage = () => {
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const app = useFirebaseApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      setLoading(true);
      if (favorites.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const firestore = getFirestore(app);
      const productsCol = collection(firestore, 'products');
      const snapshot = await getDocs(productsCol);
      const items: Product[] = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nombre: data.nombre ?? '',
            precio: data.precio ?? 0,
            descripcion: data.descripcion ?? '',
            imagen: data.imagen ?? undefined,
          };
        })
        .filter(product => favorites.includes(product.id));
      setProducts(items);
      setLoading(false);
    };
    fetchFavoriteProducts();
  }, [app, favorites]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <FavoriteIcon sx={{ color: 'red' }} /> Favoritos
          </h1>
          {loading && <div>Cargando favoritos...</div>}
          {!loading && products.length === 0 && <div>No tienes productos favoritos.</div>}
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
    </>
  );
};

export default FavoritosPage;
