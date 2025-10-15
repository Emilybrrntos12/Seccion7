import { CatalogFilters } from "../../components/ui/catalog-filters";
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
  fotos?: string[];
  categoria?: string;
  tallaDisponible?: string[];
  genero?: string;
  material?: string;
  suela?: string;
};

const HomePage = () => {
  const navigate = useNavigate();
  const app = useFirebaseApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("");
  const [talla, setTalla] = useState("");
  const [genero, setGenero] = useState("");
  const [material, setMaterial] = useState("");
  const [suela, setSuela] = useState("");
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
    // Leer el texto de búsqueda de localStorage
    setSearch(localStorage.getItem("searchText") || "");
    // Escuchar cambios en localStorage (por si se actualiza desde el header)
    const onStorage = () => setSearch(localStorage.getItem("searchText") || "");
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [app]);
  // Filtrar productos por nombre, descripción y filtros avanzados
  const filteredProducts = products.filter(product => {
    const text = search.toLowerCase();
    const matchText =
      product.nombre.toLowerCase().includes(text) ||
      product.descripcion.toLowerCase().includes(text);
    const matchCategoria = categoria ? product.categoria === categoria : true;
    const matchTalla = talla ? (product.tallaDisponible || []).includes(talla) : true;
    const matchGenero = genero ? product.genero === genero : true;
    const matchMaterial = material ? product.material === material : true;
    const matchSuela = suela ? product.suela === suela : true;
    return matchText && matchCategoria && matchTalla && matchGenero && matchMaterial && matchSuela;
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">Catálogo de Productos</h1>
          {/* Filtros avanzados */}
          <CatalogFilters
            categoria={categoria}
            setCategoria={setCategoria}
            talla={talla}
            setTalla={setTalla}
            material={material}
            setMaterial={setMaterial}
            suela={suela}
            setSuela={setSuela}
            genero={genero}
            setGenero={setGenero}
          />
          {loading && <div>Cargando productos...</div>}
          {!loading && filteredProducts.length === 0 && <div>No hay productos que coincidan con la búsqueda y filtros.</div>}
          {!loading && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
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
                  {product.fotos && product.fotos.length > 0 ? (
                    <img src={product.fotos[0]} alt={product.nombre} className="w-32 h-32 object-cover mb-2 rounded" />
                  ) : (
                    product.imagen && (
                      <img src={product.imagen} alt={product.nombre} className="w-32 h-32 object-cover mb-2 rounded" />
                    )
                  )}
                  <h2 className="font-semibold text-lg mb-1">{product.nombre}</h2>
                  <p className="text-primary font-bold mb-2">${product.precio}</p>
                  <p className="text-sm text-gray-600 mb-2">{product.descripcion}</p>
                  {/* Mostrar detalles filtrables */}
                  <div className="text-xs text-gray-500 mt-2">
                    {product.categoria && <span className="mr-2">Categoría: {product.categoria}</span>}
                    {product.tallaDisponible && <span className="mr-2">Tallas: {product.tallaDisponible.join(", ")}</span>}
                    {product.material && <span className="mr-2">Material: {product.material}</span>}
                    {product.suela && <span className="mr-2">Suela: {product.suela}</span>}
                    {product.genero && <span>Género: {product.genero}</span>}
                  </div>
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