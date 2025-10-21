import { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useUser } from "reactfire";
import { useLocation, useNavigate } from "react-router-dom";
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
  FormControl,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from "@mui/material";
import {
  LocalShipping,
  Payment,
  Person,
  LocationOn,
  Phone,
  Email,
  CheckCircle,
  ArrowBack,
  ShoppingBag
} from "@mui/icons-material";
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

const steps = ['Carrito', 'Envío y Pago', 'Confirmación'];

const CheckoutPage = () => {
  const { data: user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const cartItems: CartItem[] = location.state?.cartItems || [];
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [notas, setNotas] = useState("");
  const [confirmado, setConfirmado] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [activeStep, setActiveStep] = useState(1);

  const total = cartItems.reduce((acc, item) => acc + item.product_data.precio * item.cantidad, 0);
  const itemsCount = cartItems.reduce((acc, item) => acc + item.cantidad, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (async () => {
      try {
        const { getFirestore, collection, addDoc, Timestamp, doc, getDoc, updateDoc, deleteDoc } = await import('firebase/firestore');
        const app = await import('firebase/app');
        const firestore = getFirestore(app.getApp());

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

        const orderDoc = await addDoc(collection(firestore, 'orders'), pedido);
        const orderId = orderDoc.id;

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

        for (const item of cartItems) {
          await deleteDoc(doc(firestore, 'cart', item.id));
        }

        const MySwal = withReactContent(Swal);
        await MySwal.fire({
          icon: 'success',
          title: '¡Pedido registrado con éxito!',
          text: 'Tu pedido se ha registrado correctamente.',
          confirmButtonText: 'Entendido',
          background: '#fffdf9',
          color: '#5d4037'
        });

        let confianza = 0;
        let recomienda = '';
        await MySwal.fire({
          title: 'Encuesta de satisfacción',
          html: `<div style='margin-bottom:16px; color: #5d4037; font-weight: 600;'>¿Qué tan seguro te sentiste al realizar tu compra?</div>
            <div id='swal-stars' style='margin-bottom:16px;'></div>
            <div style='margin-bottom:8px; color: #5d4037; font-weight: 600;'>¿Recomendarías nuestra tienda a otras personas?</div>
            <div id='swal-recomienda'></div>`,
          showCancelButton: false,
          showConfirmButton: true,
          confirmButtonText: 'Enviar',
          background: '#fffdf9',
          color: '#5d4037',
          didOpen: () => {
            const starsDiv = document.getElementById('swal-stars');
            if (starsDiv) {
              for (let i = 1; i <= 5; i++) {
                const star = document.createElement('span');
                star.innerHTML = '★';
                star.style.fontSize = '2rem';
                star.style.cursor = 'pointer';
                star.style.color = '#e8dcc8';
                star.style.margin = '0 4px';
                star.onclick = () => {
                  confianza = i;
                  Array.from(starsDiv.children).forEach((el, idx) => {
                    (el as HTMLElement).style.color = idx < i ? '#A0522D' : '#e8dcc8';
                  });
                };
                starsDiv.appendChild(star);
              }
            }
            const recDiv = document.getElementById('swal-recomienda');
            if (recDiv) {
              ['Sí', 'No', 'Tal vez'].forEach(opt => {
                const btn = document.createElement('button');
                btn.innerText = opt;
                btn.style.marginRight = '8px';
                btn.style.padding = '8px 20px';
                btn.style.borderRadius = '20px';
                btn.style.border = '2px solid #8B7355';
                btn.style.background = '#fff';
                btn.style.color = '#8B7355';
                btn.style.cursor = 'pointer';
                btn.style.fontWeight = '600';
                btn.style.transition = 'all 0.3s ease';
                btn.onclick = () => {
                  recomienda = opt.toLowerCase();
                  Array.from(recDiv.children).forEach((el) => {
                    (el as HTMLElement).style.background = '#fff';
                    (el as HTMLElement).style.color = '#8B7355';
                  });
                  btn.style.background = '#8B7355';
                  btn.style.color = '#fff';
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
              confirmButtonText: 'Cerrar',
              background: '#fffdf9',
              color: '#5d4037'
            });
          }
        });

        setOrderId(orderId);
        setConfirmado(true);
        setActiveStep(2);
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al confirmar el pedido. Por favor, intenta de nuevo.',
          background: '#fffdf9',
          color: '#5d4037'
        });
      }
    })();
  };

  if (cartItems.length === 0 && !confirmado) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '80px'
      }}>
        <Card sx={{ 
          textAlign: 'center', 
          p: 6, 
          maxWidth: 500,
          background: 'white',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
          border: '1px solid #e8dcc8'
        }}>
          <ShoppingBag sx={{ fontSize: 80, color: '#e8dcc8', mb: 3 }} />
          <Typography variant="h4" fontWeight="700" sx={{ color: '#8B7355', mb: 2 }}>
            Carrito Vacío
          </Typography>
          <Typography variant="body1" sx={{ color: '#5d4037', mb: 4, opacity: 0.8 }}>
            No hay productos en tu carrito para proceder al checkout
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/cart')}
            sx={{
              background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
              color: 'white',
              borderRadius: 3,
              padding: '12px 32px',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #A0522D 0%, #8B7355 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(139, 115, 85, 0.3)'
              }
            }}
          >
            Volver al Carrito
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 100%)',
      paddingTop: '80px',
      py: 4
    }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
        {/* Header y Stepper */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/cart')}
            sx={{
              background: '#8B7355',
              color: 'white',
              borderRadius: 3,
              padding: '10px 20px',
              fontWeight: 600,
              mb: 3,
              '&:hover': {
                background: '#A0522D',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Volver al Carrito
          </Button>
          
          <Typography variant="h2" fontWeight="700" sx={{ color: '#5d4037', mb: 2 }}>
            Finalizar Compra
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel sx={{ 
                  '& .MuiStepLabel-label': { 
                    color: '#8B7355',
                    fontWeight: '600'
                  } 
                }}>
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          {/* Formulario de Checkout */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ 
              background: 'white',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
              border: '1px solid #e8dcc8',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                  <Person sx={{ color: '#8B7355', fontSize: 32 }} />
                  <Typography variant="h5" fontWeight="700" sx={{ color: '#5d4037' }}>
                    Información de Envío
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      label="Nombre completo"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      fullWidth
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#8B7355' }
                        }
                      }}
                    />
                    
                    <TextField
                      label="Dirección de envío"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: <LocationOn sx={{ color: '#8B7355', mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#8B7355' }
                        }
                      }}
                    />
                    
                    <TextField
                      label="Teléfono de contacto"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: <Phone sx={{ color: '#8B7355', mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#8B7355' }
                        }
                      }}
                    />
                    
                    <TextField
                      label="Email"
                      value={user?.email || ""}
                      disabled
                      fullWidth
                      InputProps={{
                        startAdornment: <Email sx={{ color: '#8B7355', mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />

                    <FormControl sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Payment sx={{ color: '#8B7355', fontSize: 32 }} />
                        <Typography variant="h6" fontWeight="600" sx={{ color: '#5d4037' }}>
                          Método de Pago
                        </Typography>
                      </Box>
                      <RadioGroup
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                      >
                        <FormControlLabel 
                          value="efectivo" 
                          control={<Radio sx={{ color: '#8B7355' }} />} 
                          label={
                            <Box>
                              <Typography fontWeight="600" sx={{ color: '#5d4037' }}>
                                Efectivo contra entrega
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#8B7355' }}>
                                Paga cuando recibas tu pedido
                              </Typography>
                            </Box>
                          } 
                        />
                        <FormControlLabel 
                          value="transferencia" 
                          control={<Radio sx={{ color: '#8B7355' }} />} 
                          label={
                            <Box>
                              <Typography fontWeight="600" sx={{ color: '#5d4037' }}>
                                Transferencia bancaria
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#8B7355' }}>
                                Realiza el pago por transferencia
                              </Typography>
                            </Box>
                          } 
                        />
                      </RadioGroup>
                    </FormControl>

                    <TextField
                      label="Notas para el pedido (opcional)"
                      value={notas}
                      onChange={(e) => setNotas(e.target.value)}
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Instrucciones especiales para la entrega..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': { borderColor: '#8B7355' }
                        }
                      }}
                    />

                    <Button 
                      type="submit" 
                      variant="contained" 
                      size="large"
                      sx={{
                        background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
                        color: 'white',
                        borderRadius: 3,
                        padding: '16px',
                        fontWeight: 600,
                        fontSize: '1.1rem',
                        mt: 2,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #A0522D 0%, #8B7355 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(139, 115, 85, 0.3)'
                        }
                      }}
                    >
                      Confirmar Pedido
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Box>

          {/* Resumen del Pedido */}
          <Box sx={{ width: { xs: '100%', lg: '400px' } }}>
            <Card sx={{ 
              position: 'sticky', 
              top: 100,
              background: 'white',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
              border: '1px solid #e8dcc8',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)', 
                  color: 'white', 
                  p: 3,
                  textAlign: 'center'
                }}>
                  <Typography variant="h6" fontWeight="700" sx={{ mb: 1 }}>
                    Resumen del Pedido
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {itemsCount} {itemsCount === 1 ? 'artículo' : 'artículos'}
                  </Typography>
                </Box>

                <Box sx={{ p: 3, maxHeight: '400px', overflowY: 'auto' }}>
                  <List>
                    {cartItems.map((item) => (
                      <ListItem key={item.id} sx={{ px: 0, py: 2 }}>
                        <img 
                          src={item.product_data.imagen} 
                          alt={item.product_data.nombre} 
                          style={{ 
                            width: 60, 
                            height: 60, 
                            marginRight: 16, 
                            borderRadius: 8,
                            objectFit: 'cover',
                            border: '2px solid #e8dcc8'
                          }} 
                        />
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight="600" sx={{ color: '#5d4037' }}>
                              {item.product_data.nombre}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Chip 
                                label={`Talla ${item.talla_seleccionada}`} 
                                size="small" 
                                sx={{ 
                                  background: '#e8dcc8', 
                                  color: '#8B7355',
                                  fontWeight: '600',
                                  mr: 1
                                }} 
                              />
                              <Typography variant="body2" sx={{ color: '#8B7355', mt: 0.5 }}>
                                Cantidad: {item.cantidad} × ${item.product_data.precio}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                <Divider sx={{ borderColor: '#e8dcc8' }} />

                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1" sx={{ color: '#8B7355' }}>Subtotal</Typography>
                    <Typography variant="body1" fontWeight="600" sx={{ color: '#5d4037' }}>
                      ${total.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1" sx={{ color: '#8B7355' }}>Envío</Typography>
                    <Chip 
                      label="GRATIS" 
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
                        color: 'white',
                        fontWeight: '600'
                      }}
                    />
                  </Box>
                  
                  <Divider sx={{ my: 2, borderColor: '#e8dcc8' }} />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" fontWeight="700" sx={{ color: '#5d4037' }}>Total</Typography>
                    <Typography variant="h5" fontWeight="700" sx={{ color: '#A0522D' }}>
                      ${total.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Información de seguridad */}
            <Paper sx={{ 
              mt: 3, 
              p: 3, 
              background: '#fffdf9',
              borderRadius: 3,
              border: '1px solid #e8dcc8'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <LocalShipping sx={{ color: '#8B7355' }} />
                <Typography variant="body2" fontWeight="600" sx={{ color: '#5d4037' }}>
                  Envío gratis a nivel nacional
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#8B7355', opacity: 0.8 }}>
                Tu pedido será procesado en 24-48 horas y enviado con la mayor brevedad posible.
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Confirmación de pedido */}
        {confirmado && (
          <Card sx={{ 
            mt: 4, 
            background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
            border: '2px solid #4caf50',
            borderRadius: 4
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 64, color: '#4caf50', mb: 3 }} />
              <Typography variant="h4" fontWeight="700" sx={{ color: '#2e7d32', mb: 2 }}>
                ¡Pedido Realizado con Éxito!
              </Typography>
              <Typography variant="h6" sx={{ color: '#5d4037', mb: 3 }}>
                Te contactaremos pronto para coordinar la entrega de tu pedido #{orderId}
              </Typography>
              
              <Box sx={{ mt: 4 }}>
                <EncuestaCompra orderId={orderId} />
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default CheckoutPage;