import { useState } from "react";
import { useUser } from "reactfire";
import { useLocation } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

type CartItem = {
  id: string;
  id_usuario: string;
  id_producto: string;
  cantidad: number;
  talla_seleccionada: string;
  fecha_agregada: Date;
  product_data: {
    nombre: string;
    precio: number;
    imagen: string;
  };
};

const CheckoutPage = () => {
  const { data: user } = useUser();
  const location = useLocation();
  const cartItems: CartItem[] = location.state?.cartItems || [];
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [notas, setNotas] = useState("");
  const [confirmado, setConfirmado] = useState(false);

  const total = cartItems.reduce((acc, item) => acc + item.product_data.precio * item.cantidad, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        // Importar Firestore
  const { getFirestore, collection, addDoc, Timestamp, doc, getDoc, updateDoc, deleteDoc } = await import('firebase/firestore');
        const app = await import('firebase/app');
        const firestore = getFirestore(app.getApp());

        // Crear el pedido
        const pedido = {
          id_usuario: user?.uid,
          nombre,
          direccion,
          telefono,
          email: user?.email,
          metodoPago,
          notas,
          cartItems: cartItems.map(item => ({
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            talla_seleccionada: item.talla_seleccionada,
            nombre: item.product_data.nombre,
            precio: item.product_data.precio,
            imagen: item.product_data.imagen,
          })),
          total,
          fecha: Timestamp.now(),
          estado: 'pendiente',
        };

        // Guardar pedido en la colección 'orders'
        await addDoc(collection(firestore, 'orders'), pedido);

        // Actualizar el stock de cada producto comprado
        console.log('Iniciando actualización de stock para productos:', cartItems);
        for (const item of cartItems) {
          console.log(`Procesando producto ${item.id_producto}, talla ${item.talla_seleccionada}`);
          const productoRef = doc(firestore, 'products', item.id_producto);
          const productoSnap = await getDoc(productoRef);
          
          if (productoSnap.exists()) {
            const productoData = productoSnap.data();
            console.log('Datos actuales del producto:', productoData);
            
            // Obtener stock por talla actual
            const stockPorTalla = { ...(productoData.stockPorTalla || {}) };
            console.log('Stock por talla actual:', stockPorTalla);
            
            // Actualizar stock de la talla específica
            if (item.talla_seleccionada && stockPorTalla[item.talla_seleccionada] !== undefined) {
              const stockAnterior = stockPorTalla[item.talla_seleccionada];
              const nuevoStockTalla = Math.max(0, stockAnterior - item.cantidad);
              
              console.log(`Actualizando stock para talla ${item.talla_seleccionada}:`, {
                anterior: stockAnterior,
                cantidad: item.cantidad,
                nuevo: nuevoStockTalla
              });
              
              // Actualizar el stock por talla en el objeto local
              stockPorTalla[item.talla_seleccionada] = nuevoStockTalla;
              
              // Calcular nuevo stock total
              const nuevoStockTotal = Object.values(stockPorTalla).reduce((acc: number, val) => acc + (typeof val === 'number' ? val : 0), 0);
              console.log('Nuevo stock total calculado:', nuevoStockTotal);
              
              // Intentar actualizar el producto
              try {
                const updateData = {
                  stock: nuevoStockTotal,
                  stockPorTalla: stockPorTalla
                };
                
                console.log('Datos a actualizar:', updateData);
                await updateDoc(productoRef, updateData);
                console.log('Actualización exitosa para el producto:', item.id_producto);
              } catch (updateError) {
                console.error('Error al actualizar el producto:', {
                  productId: item.id_producto,
                  error: updateError
                });
                throw updateError;
              }
            } else {
              console.warn(`Advertencia: No se encontró stock para la talla ${item.talla_seleccionada}`);
            }
          } else {
            console.error('Producto no encontrado:', item.id_producto);
          }
        }

            // Limpiar el carrito del usuario en Firestore
            for (const item of cartItems) {
              try {
                await deleteDoc(doc(firestore, 'cart', item.id));
              } catch (err) {
                console.error('Error al eliminar item del carrito:', err);
              }
            }
            setConfirmado(true);
      } catch (error: unknown) {
        console.error('Error detallado:', {
          mensaje: error instanceof Error ? error.message : 'Error desconocido',
          stack: error instanceof Error ? error.stack : undefined
        });
        
        // Verificar el estado de autenticación
        console.log('Estado de autenticación:', {
          usuarioLogueado: !!user,
          uid: user?.uid,
          email: user?.email
        });
        
        let mensajeError = 'Hubo un error al confirmar el pedido. ';
        if (error && typeof error === 'object' && 'code' in error && error.code === 'permission-denied') {
          mensajeError += 'No tienes permisos para realizar esta operación. Verifica que hayas iniciado sesión.';
        } else if (error && typeof error === 'object' && 'code' in error && error.code === 'not-found') {
          mensajeError += 'No se encontró algún producto del carrito.';
        } else {
          mensajeError += 'Por favor, intenta de nuevo.';
        }
        
        alert(mensajeError);
      }
    })();
  };

  return (
    <Box maxWidth="md" mx="auto" p={3}>
      <Typography variant="h4" gutterBottom>Checkout</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">Resumen del pedido</Typography>
          <List>
            {cartItems.map((item) => (
              <ListItem key={item.id}>
                <img src={item.product_data.imagen} alt={item.product_data.nombre} style={{ width: 60, height: 60, marginRight: 16, borderRadius: 8 }} />
                <ListItemText
                  primary={item.product_data.nombre}
                  secondary={`Talla: ${item.talla_seleccionada} | Cantidad: ${item.cantidad} | $${item.product_data.precio}`}
                />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6">Total</Typography>
            <Typography variant="h6">${total.toFixed(2)}</Typography>
          </Box>
        </CardContent>
      </Card>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>Datos de envío</Typography>
            <TextField
              label="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Dirección"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              value={user?.email || ""}
              disabled
              fullWidth
              sx={{ mb: 2 }}
            />
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Método de pago</FormLabel>
              <RadioGroup
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                <FormControlLabel value="efectivo" control={<Radio />} label="Efectivo contra entrega" />
                <FormControlLabel value="transferencia" control={<Radio />} label="Transferencia bancaria" />
              </RadioGroup>
            </FormControl>
            <TextField
              label="Notas para el pedido (opcional)"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              fullWidth
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth size="large">
              Confirmar pedido
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Al confirmar tu pedido aceptas nuestras políticas de envío y devolución. Nos pondremos en contacto para coordinar la entrega.
          </Typography>
        </CardContent>
      </Card>
      {confirmado && (
        <Card sx={{ mt: 3, bgcolor: '#e6ffed', border: '1px solid #b7eb8f' }}>
          <CardContent>
            <Typography variant="h6" color="success.main">¡Pedido realizado con éxito!</Typography>
            <Typography>Te contactaremos pronto para coordinar la entrega.</Typography>
              <Button variant="contained" color="primary" sx={{ mt: 2, mr: 2 }} onClick={() => window.location.href = "/"}>
                Ir al inicio
              </Button>
              <Button variant="outlined" color="secondary" sx={{ mt: 2 }} onClick={() => window.location.href = "/"}>
                Regresar
              </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CheckoutPage;
