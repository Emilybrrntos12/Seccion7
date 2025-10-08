
import { useEffect, useState } from "react";
import { useFirebaseApp } from "reactfire";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";

type Product = {
  id: string;
  title: string;
  price: number;
  description: string;
  images: string[];
};

const HomePage = () => {
  const app = useFirebaseApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Productos</h1>
      {loading ? (
        <div>Cargando productos...</div>
      ) : products.length === 0 ? (
        <div>No hay productos disponibles.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="border rounded p-4 flex flex-col items-center">
              {product.images && product.images[0] && (
                <img src={product.images[0]} alt={product.title} className="w-32 h-32 object-cover mb-2 rounded" />
              )}
              <h2 className="font-semibold text-lg mb-1">{product.title}</h2>
              <p className="text-primary font-bold mb-2">${product.price}</p>
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;