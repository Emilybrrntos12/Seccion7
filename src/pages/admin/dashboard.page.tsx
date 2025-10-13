import { useNavigate } from "react-router-dom";
import { useUser } from "reactfire";
import { useState, useEffect } from "react";

type Product = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
};
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import SidebarProfile from '../../components/ui/sidebar-profile';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { Button, Typography } from "@mui/material";


const DashboardPage = () => {
  const { data: user } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtener productos creados por el usuario actual
  useEffect(() => {
    const fetchUserProducts = async () => {
      setLoading(true);
      if (!user?.uid) return setLoading(false);
      const { getFirestore, collection, getDocs } = await import('firebase/firestore/lite');
      const app = await import('firebase/app');
      const firestore = getFirestore(app.getApp());
      const productsCol = collection(firestore, "products");
      const snapshot = await getDocs(productsCol);
      const items: Product[] = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nombre: data.nombre ?? '',
            descripcion: data.descripcion ?? '',
            precio: data.precio ?? 0,
            imagen: data.imagen,
            createdBy: data.createdBy
          };
        })
        .filter(product => product.createdBy === user.uid);
      setProducts(items);
      setLoading(false);
    };
    fetchUserProducts();
  }, [user]);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: 'flex', flexGrow: 1 }}>
      <SidebarProfile open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box sx={{ flex: 1 }}>
        <IconButton onClick={() => setSidebarOpen(true)} sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1201, bgcolor: '#fff', boxShadow: 2 }}>
          <MenuIcon fontSize="large" color="primary" />
        </IconButton>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Bienvenido, {user?.displayName || "Invitado"}!
          </Typography>
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/admin/new-product")}
              sx={{ px: 4, py: 1.5, fontSize: 18, borderRadius: 2 }}
            >
              Agregar producto
            </Button>
          </Box>
          <Box mt={5}>
            <Typography variant="h5" fontWeight={700} mb={2}>Tus productos creados</Typography>
            {loading ? (
              <Typography>Cargando productos...</Typography>
            ) : products.length === 0 ? (
              <Typography color="text.secondary">No has creado productos aún.</Typography>
            ) : (
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr 1fr' }} gap={3}>
                {products.map(product => (
                  <Box key={product.id} p={2} borderRadius={2} boxShadow={2} bgcolor="#fff" display="flex" flexDirection="column" alignItems="center">
                    {product.imagen && (
                      <img src={product.imagen} alt={product.nombre} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                    )}
                    <Typography variant="subtitle1" fontWeight={600}>{product.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary">{product.descripcion}</Typography>
                    <Typography variant="body1" color="primary" fontWeight={700}>${product.precio}</Typography>
                    <Box display="flex" gap={1} mt={2}>
                      <Button variant="outlined" color="primary" size="small" onClick={() => navigate(`/admin/edit-product/${product.id}`)}>
                        Editar
                      </Button>
                      <Button variant="outlined" color="error" size="small" onClick={async () => {
                        const confirm = window.confirm('¿Seguro que deseas eliminar este producto?');
                        if (!confirm) return;
                        const { getFirestore, doc, deleteDoc } = await import('firebase/firestore/lite');
                        const app = await import('firebase/app');
                        const firestore = getFirestore(app.getApp());
                        await deleteDoc(doc(firestore, 'products', product.id));
                        setProducts(prev => prev.filter(p => p.id !== product.id));
                      }}>
                        Eliminar
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardPage;