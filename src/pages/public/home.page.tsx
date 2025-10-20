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
import bootImage from '../../assets/cat1.jpg';

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
      <div className="min-h-screen bg-[#fffdf9] relative">
        {/* Imagen de fondo con overlay degradado */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
          style={{
            backgroundImage: `url(${bootImage})`,
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-30">
          {/* Hero Section */}
          <div className="rounded-2xl p-8 mb-10 text-center text-white border border-white/20">
            <h1 className="text-4xl font-bold mb-4">Descubre tu estilo perfecto</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Calzado artesanal que combina comodidad, estilo y durabilidad
            </p>
          </div>
          
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

          
          {/* Resultados de búsqueda */}
          {search && (
            <div className="mb-6 bg-white/70 backdrop-blur-sm rounded-xl p-4 inline-block">
              <h2 className="text-xl font-semibold text-[#8B7355]">
                Resultados para: <span className="text-[#A0522D]">"{search}"</span>
              </h2>
            </div>
          )}
          
          {/* Estado de carga */}
          {loading && (
            <div className="flex justify-center items-center h-64 bg-white/80 backdrop-blur-sm rounded-2xl">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#A0522D]"></div>
            </div>
          )}
          
          {/* Sin resultados */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-[#e8dcc8]/90 backdrop-blur-sm rounded-2xl border border-white/30">
              <h3 className="text-2xl font-bold text-[#8B7355] mb-4">No encontramos productos</h3>
              <p className="text-[#A0522D] max-w-md mx-auto">
                Intenta ajustar los filtros o cambiar los términos de búsqueda para encontrar lo que buscas.
              </p>
            </div>
          )}
          
          {/* Grid de productos */}
          {!loading && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pt-10">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-white/40"
                  onClick={() => navigate(`/producto/${product.id}`)}
                >
                  {/* Imagen del producto */}
                  <div className="relative overflow-hidden bg-[#f8f5f0] h-64">
                    {product.fotos && product.fotos.length > 0 ? (
                      <img 
                        src={product.fotos[0]} 
                        alt={product.nombre} 
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      product.imagen && (
                        <img 
                          src={product.imagen} 
                          alt={product.nombre} 
                          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" 
                        />
                      )
                    )}
                    
                    {/* Badge de categoría */}
                    {product.categoria && (
                      <div className="absolute top-3 left-3 bg-[#8B7355] text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
                        {product.categoria}
                      </div>
                    )}
                    
                    {/* Icono de favorito */}
                    {user && (
                      <span
                        className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-lg"
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
                          ? <FavoriteIcon sx={{ color: '#A0522D', fontSize: 22 }} />
                          : <FavoriteBorderIcon sx={{ color: '#8B7355', fontSize: 22 }} />}
                      </span>
                    )}
                    
                    {/* Overlay hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                  </div>
                  
                  {/* Información del producto */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="font-bold text-lg text-[#8B7355] group-hover:text-[#A0522D] transition-colors line-clamp-2">
                        {product.nombre}
                      </h2>
                      <p className="text-[#A0522D] font-bold text-xl ml-2">${product.precio}</p>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.descripcion}
                    </p>
                    
                    {/* Detalles del producto */}
                    <div className="border-t border-[#e8dcc8] pt-3">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {product.tallaDisponible && product.tallaDisponible.slice(0, 3).map((t, index) => (
                          <span 
                            key={index} 
                            className="text-xs bg-[#e8dcc8] text-[#8B7355] px-2 py-1 rounded"
                          >
                            {t}
                          </span>
                        ))}
                        {product.tallaDisponible && product.tallaDisponible.length > 3 && (
                          <span className="text-xs bg-[#e8dcc8] text-[#8B7355] px-2 py-1 rounded">
                            +{product.tallaDisponible.length - 3}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                        {product.material && (
                          <div className="truncate">
                            <span className="font-medium">Material:</span> {product.material}
                          </div>
                        )}
                        {product.genero && (
                          <div className="truncate">
                            <span className="font-medium">Género:</span> {product.genero}
                          </div>
                        )}
                        {product.suela && (
                          <div className="truncate">
                            <span className="font-medium">Suela:</span> {product.suela}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Botón de acción */}
                    <button 
                      className="w-full mt-4 bg-[#8B7355] hover:bg-[#A0522D] text-white font-medium py-2.5 rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/producto/${product.id}`);
                      }}
                    >
                      Ver detalles
                    </button>
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