import { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
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
import { EncuestaCompra } from "./encuesta.page";

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
  const [orderId, setOrderId] = useState<string>("");

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
        const orderDoc = await addDoc(collection(firestore, 'orders'), pedido);
        const orderId = orderDoc.id;

        // Actualizar el stock de cada producto comprado
        for (const item of cartItems) {
          const productoRef = doc(firestore, 'products', item.id_producto);
          const productoSnap = await getDoc(productoRef);
          if (productoSnap.exists()) {
            const productoData = productoSnap.data();
            const stockPorTalla = { ...(productoData.stockPorTalla || {}) };
            if (item.talla_seleccionada && stockPorTalla[item.talla_seleccionada] !== undefined) {
              const stockAnterior = stockPorTalla[item.talla_seleccionada];
              const nuevoStockTalla = Math.max(0, stockAnterior - item.cantidad);
              stockPorTalla[item.talla_seleccionada] = nuevoStockTalla;
              const nuevoStockTotal = Object.values(stockPorTalla).reduce((acc: number, val) => acc + (typeof val === 'number' ? val : 0), 0);
              const updateData = {
                stock: nuevoStockTotal,
                stockPorTalla: stockPorTalla
              };
              await updateDoc(productoRef, updateData);
            }
          }
        }

        // Limpiar el carrito del usuario en Firestore
        for (const item of cartItems) {
          await deleteDoc(doc(firestore, 'cart', item.id));
        }

        // SweetAlert2 flujo
        const MySwal = withReactContent(Swal);
        await MySwal.fire({
          icon: 'success',
          title: '¡Pedido registrado con éxito!',
          text: 'Tu pedido se ha registrado correctamente.',
          confirmButtonText: 'Entendido',
        });

        // Encuesta con estrellas y opciones
        let confianza = 0;
        let recomienda = '';
        await MySwal.fire({
          title: 'Encuesta de satisfacción',
          html: `<div style='margin-bottom:16px;'>¿Qué tan seguro te sentiste al realizar tu compra?</div>
            <div id='swal-stars' style='margin-bottom:16px;'></div>
            <div style='margin-bottom:8px;'>¿Recomendarías nuestra tienda a otras personas?</div>
            <div id='swal-recomienda'></div>`,
          showCancelButton: false,
          showConfirmButton: true,
          confirmButtonText: 'Enviar',
          didOpen: () => {
            // Renderizar estrellas
            const starsDiv = document.getElementById('swal-stars');
            if (starsDiv) {
              for (let i = 1; i <= 5; i++) {
                const star = document.createElement('span');
                star.innerHTML = '★';
                star.style.fontSize = '2rem';
                star.style.cursor = 'pointer';
                star.style.color = '#ccc';
                star.onclick = () => {
                  confianza = i;
                  Array.from(starsDiv.children).forEach((el, idx) => {
                    (el as HTMLElement).style.color = idx < i ? '#FFD700' : '#ccc';
                  });
                };
                starsDiv.appendChild(star);
              }
            }
            // Renderizar opciones recomienda
            const recDiv = document.getElementById('swal-recomienda');
            if (recDiv) {
              ['Sí', 'No', 'Tal vez'].forEach(opt => {
                const btn = document.createElement('button');
                btn.innerText = opt;
                btn.style.marginRight = '8px';
                btn.style.padding = '6px 16px';
                btn.style.borderRadius = '6px';
                btn.style.border = '1px solid #1976d2';
                btn.style.background = '#fff';
                btn.style.color = '#1976d2';
                btn.style.cursor = 'pointer';
                btn.onclick = () => {
                  recomienda = opt.toLowerCase();
                  Array.from(recDiv.children).forEach((el) => {
                    (el as HTMLElement).style.background = '#fff';
                  });
                  btn.style.background = '#e3f2fd';
                };
                recDiv.appendChild(btn);
              });
            }
          },
          preConfirm: () => {
            if (!confianza || !recomienda) {
              Swal.showValidationMessage('Por favor responde ambas preguntas');
              return false;
            }
            return { confianza, recomienda };
          }
        }).then(async result => {
          if (result.isConfirmed && result.value) {
            // Guardar encuesta en Firestore
            await addDoc(collection(firestore, "encuestas"), {
              orderId,
              userId: user?.uid,
              confianza: result.value.confianza,
              recomienda: result.value.recomienda,
              createdAt: new Date().toISOString()
            });
            await MySwal.fire({
              icon: 'success',
              title: '¡Gracias por tu respuesta!',
              text: 'Tu opinión nos ayuda a mejorar.',
              confirmButtonText: 'Cerrar'
            });
          }
        });

        setOrderId(orderId);
        setConfirmado(true);
      } catch {
        alert('Hubo un error al confirmar el pedido. Por favor, intenta de nuevo.');
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
        <>
          <Card sx={{ mt: 3, bgcolor: '#e6ffed', border: '1px solid #b7eb8f' }}>
            <CardContent>
              <Typography variant="h6" color="success.main">¡Pedido realizado con éxito!</Typography>
              <Typography>Te contactaremos pronto para coordinar la entrega.</Typography>
            </CardContent>
          </Card>
          <div style={{ marginTop: 24 }}>
            {/* Mini encuesta post-compra */}
            <EncuestaCompra orderId={orderId} />
          </div>
        </>
      )}
    </Box>
  );
};

export default CheckoutPage;
