import { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useUser } from "reactfire";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
} from "@mui/material";
import {
  LocalShipping,
  Payment,
  LocationOn,
  Phone,
  Email,
  ArrowBack,
  ShoppingBag,
  Receipt,
  ArrowForward
} from "@mui/icons-material";

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
    fotos?: string[];
  };
};

const steps = ['Carrito', 'Envío', 'Pago', 'Confirmación'];

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
  const [loadingPedido, setLoadingPedido] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [orderId, setOrderId] = useState<string | null>(null);

  const total = cartItems.reduce((acc, item) => acc + item.product_data.precio * item.cantidad, 0);
  const itemsCount = cartItems.reduce((acc, item) => acc + item.cantidad, 0);

  // Función para imprimir la orden como PDF (cuadro de impresión en la misma ventana)
  const handlePrintPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Orden de Compra", 14, 22);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Número de pedido: ${orderId || 'N/A'}`, 14, 35);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-GT')}`, 14, 42);
    doc.setFont("helvetica", "bold");
    doc.text("Información del Cliente:", 14, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre: ${nombre}`, 14, 62);
    doc.text(`Dirección: ${direccion}`, 14, 69);
    doc.text(`Teléfono: ${telefono}`, 14, 76);
    doc.text(`Email: ${user?.email || 'N/A'}`, 14, 83);
    doc.text(`Método de pago: ${metodoPago === 'efectivo' ? 'Efectivo contra entrega' : 'Transferencia bancaria'}`, 14, 90);
    doc.setFont("helvetica", "bold");
    doc.text("Productos:", 14, 103);
    autoTable(doc, {
      startY: 107,
      head: [["Producto", "Talla", "Cantidad", "Precio Unitario", "Subtotal"]],
      body: cartItems.map((item: CartItem) => [
        item.product_data.nombre,
        item.talla_seleccionada,
        item.cantidad.toString(),
        `Q${item.product_data.precio.toLocaleString()}`,
        `Q${(item.product_data.precio * item.cantidad).toLocaleString()}`
      ]),
      theme: 'grid',
      headStyles: { 
        fillColor: [139, 115, 85],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 25 },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 }
      }
    });
    // @ts-expect-error: lastAutoTable es una propiedad agregada por jsPDF-AutoTable
    const finalY = doc.lastAutoTable?.finalY || 130;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: Q${total.toLocaleString()}`, 14, finalY + 15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Gracias por su compra. Te contactaremos pronto para coordinar la entrega.", 14, finalY + 30);

    // Imprimir en la misma ventana usando un iframe oculto
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    let printIframe = document.getElementById('pdf-print-iframe') as HTMLIFrameElement | null;
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.style.display = 'none';
      printIframe.id = 'pdf-print-iframe';
      document.body.appendChild(printIframe);
    }
    printIframe.src = url;
    printIframe.onload = function () {
      setTimeout(() => {
        printIframe?.contentWindow?.focus();
        printIframe?.contentWindow?.print();
        URL.revokeObjectURL(url);
      }, 500);
    };
  };

  const handleSubmitPago = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPedido(true);
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
  const newOrderId = orderDoc.id;
  setOrderId(newOrderId);

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
              orderId: newOrderId,
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
        setConfirmado(true);
        setActiveStep(3);
      } catch {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un error al confirmar el pedido. Por favor, intenta de nuevo.',
          background: '#fffdf9',
          color: '#5d4037'
        });
      } finally {
        setLoadingPedido(false);
      }
    })();
  };

  const handleContinuarAPago = (e: React.FormEvent) => {
    e.preventDefault();
    // Validar campos de envío
    if (!nombre.trim() || !direccion.trim() || !telefono.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos de envío antes de continuar.',
        background: '#fffdf9',
        color: '#5d4037'
      });
      return;
    }
    if (!/^[0-9]+$/.test(telefono.trim())) {
      Swal.fire({
        icon: 'warning',
        title: 'Teléfono inválido',
        text: 'El campo teléfono solo debe contener números.',
        background: '#fffdf9',
        color: '#5d4037'
      });
      return;
    }
    setActiveStep(2);
  };

  const handleVolverAEnvio = () => {
    setActiveStep(1);
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
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/cart')}
              sx={{
                background: '#8B7355',
                color: 'white',
                borderRadius: 3,
                padding: '10px 20px',
                fontWeight: 600,
                '&:hover': {
                  background: '#A0522D',
                  transform: 'translateY(-2px)'
                }
              }}
            >
            </Button>
            <Typography variant="h2" fontWeight="700" sx={{ color: '#5d4037', textAlign: 'center', flex: 1 }}>
              Finalizar Compra
            </Typography>
            <Box sx={{ width: 180 }} />
          </Box>
          <Stepper activeStep={activeStep} sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel 
                  icon={
                    index === 0 ? <ShoppingBag sx={{ color: activeStep >= index ? '#A0522D' : '#e8dcc8' }} /> :
                    index === 1 ? <LocalShipping sx={{ color: activeStep >= index ? '#A0522D' : '#e8dcc8' }} /> :
                    index === 2 ? <Payment sx={{ color: activeStep >= index ? '#A0522D' : '#e8dcc8' }} /> :
                    <Receipt sx={{ color: activeStep >= index ? '#A0522D' : '#e8dcc8' }} />
                  }
                  sx={{ 
                    '& .MuiStepLabel-label': { 
                      color: activeStep >= index ? '#8B7355' : '#e8dcc8',
                      fontWeight: '600',
                      fontSize: '0.9rem'
                    } 
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          {/* Formulario Principal */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ 
              background: 'white',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
              border: '1px solid #e8dcc8',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: 4 }}>

                {/* SECCIÓN DE ENVÍO (Paso 1) */}
                {activeStep === 1 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                      <LocalShipping sx={{ color: '#8B7355', fontSize: 32 }} />
                      <Typography variant="h5" fontWeight="700" sx={{ color: '#5d4037' }}>
                        Información de Envío
                      </Typography>
                    </Box>

                    <form onSubmit={handleContinuarAPago}>
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
                          onChange={(e) => {
                            // Solo permitir números
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) setTelefono(val);
                          }}
                          fullWidth
                          required
                          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 15 }}
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

                        <TextField
                          label="Notas para el pedido (opcional)"
                          value={notas}
                          onChange={(e) => setNotas(e.target.value)}
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="Instrucciones especiales para la entrega, horarios preferidos, etc..."
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
                          endIcon={<ArrowForward />}
                        >
                          Continuar al Pago
                        </Button>
                      </Box>
                    </form>
                  </Box>
                )}

                {/* SECCIÓN DE PAGO (Paso 2) */}
                {activeStep === 2 && (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                      <Payment sx={{ color: '#8B7355', fontSize: 32 }} />
                      <Typography variant="h5" fontWeight="700" sx={{ color: '#5d4037' }}>
                        Método de Pago
                      </Typography>
                    </Box>

                    <form onSubmit={handleSubmitPago}>
                      <Box sx={{ mb: 4 }}>
                        <FormControl sx={{ width: '100%' }}>
                          <RadioGroup
                            value={metodoPago}
                            onChange={(e) => setMetodoPago(e.target.value)}
                          >
                            <FormControlLabel 
                              value="efectivo" 
                              control={<Radio sx={{ color: '#8B7355' }} />} 
                              label={
                                <Box sx={{ p: 2, border: '2px solid', borderColor: metodoPago === 'efectivo' ? '#8B7355' : '#e8dcc8', borderRadius: 2, width: '100%' }}>
                                  <Typography fontWeight="600" sx={{ color: '#5d4037' }}>
                                    Efectivo contra entrega
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#8B7355' }}>
                                    Paga cuando recibas tu pedido
                                  </Typography>
                                </Box>
                              } 
                              sx={{ width: '100%', ml: 0, mr: 0, mb: 2 }}
                            />
                            <FormControlLabel 
                              value="transferencia" 
                              control={<Radio sx={{ color: '#8B7355' }} />} 
                              label={
                                <Box sx={{ p: 2, border: '2px solid', borderColor: metodoPago === 'transferencia' ? '#8B7355' : '#e8dcc8', borderRadius: 2, width: '100%' }}>
                                  <Typography fontWeight="600" sx={{ color: '#5d4037' }}>
                                    Transferencia bancaria
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#8B7355' }}>
                                    Realiza el pago por transferencia
                                  </Typography>
                                </Box>
                              } 
                              sx={{ width: '100%', ml: 0, mr: 0 }}
                            />
                          </RadioGroup>
                        </FormControl>
                        {/* Mostrar datos bancarios si el método es transferencia */}
                        {metodoPago === 'transferencia' && (
                          <Box sx={{ mt: 3, p: 3, border: '2px solid #8B7355', borderRadius: 3, background: '#f9f6f2' }}>
                            <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#8B7355', mb: 1 }}>
                              Datos para Transferencia Bancaria
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#5d4037' }}>
                              <b>Banco:</b> Banco Industrial<br />
                              <b>No. de cuenta:</b> 123-456789-0<br />
                              <b>Nombre:</b> Emily Barrientos
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                          variant="outlined"
                          onClick={handleVolverAEnvio}
                          disabled={loadingPedido}
                          sx={{
                            borderColor: '#8B7355',
                            color: '#8B7355',
                            borderRadius: 3,
                            padding: '16px',
                            fontWeight: 600,
                            flex: 1,
                            opacity: loadingPedido ? 0.7 : 1,
                            pointerEvents: loadingPedido ? 'none' : 'auto',
                            '&:hover': {
                              borderColor: '#A0522D',
                              background: 'rgba(139, 115, 85, 0.04)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          Volver a Envío
                        </Button>

                        <Button 
                          type="submit"
                          variant="contained" 
                          size="large"
                          disabled={loadingPedido}
                          sx={{
                            background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
                            color: 'white',
                            borderRadius: 3,
                            padding: '16px',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            flex: 2,
                            opacity: loadingPedido ? 0.7 : 1,
                            pointerEvents: loadingPedido ? 'none' : 'auto',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #A0522D 0%, #8B7355 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(139, 115, 85, 0.3)'
                            }
                          }}
                        >
                          {loadingPedido ? 'Procesando...' : 'Confirmar Pedido'}
                        </Button>
                      </Box>
                    </form>
                  </Box>
                )}

                {/* SECCIÓN DE CONFIRMACIÓN (Paso 3) */}
                {activeStep === 3 && (
                  <Card sx={{ mt: 4, background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)', border: '2px solid #4caf50', borderRadius: 4 }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="700" sx={{ color: '#2e7d32', mb: 2 }}>
                        ¡Pedido Realizado con Éxito!
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#5d4037', mb: 3 }}>
                        Te contactaremos pronto para coordinar la entrega de tu pedido.
                      </Typography>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="h6" fontWeight="600" sx={{ color: '#8B7355', mb: 2 }}>
                        Orden de Compra
                      </Typography>
                      <Box sx={{ textAlign: 'left', maxWidth: 500, mx: 'auto', mb: 3 }}>
                        <Typography variant="body1" sx={{ mb: 1 }}><b>Número de pedido:</b> {orderId || 'N/A'}</Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}><b>Nombre:</b> {nombre}</Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}><b>Dirección:</b> {direccion}</Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}><b>Teléfono:</b> {telefono}</Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}><b>Email:</b> {user?.email}</Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}><b>Método de pago:</b> {metodoPago === 'efectivo' ? 'Efectivo contra entrega' : 'Transferencia bancaria'}</Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h6" fontWeight="600" sx={{ color: '#8B7355', mb: 2 }}>Productos</Typography>
                      <List sx={{ maxWidth: 500, mx: 'auto', mb: 2 }}>
                        {cartItems.map((item) => {
                          // Depuración de imagen
                          const imgUrl = (item.product_data.fotos && item.product_data.fotos[0]) || item.product_data.imagen || '';
                          console.log('IMG URL:', imgUrl, 'Nombre:', item.product_data.nombre);
                          return (
                            <ListItem key={item.id} sx={{ px: 0, py: 2 }}>
                              <img
                                src={imgUrl}
                                alt={item.product_data.nombre}
                                style={{
                                  width: 60,
                                  height: 60,
                                  marginRight: 16,
                                  borderRadius: 8,
                                  objectFit: 'cover',
                                  border: '2px solid #e8dcc8'
                                }}
                                onError={e => (e.currentTarget.style.display = 'none')}
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
                                      Cantidad: {item.cantidad} × Q{item.product_data.precio}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="h5" fontWeight="700" sx={{ color: '#A0522D', mb: 2 }}>
                        Total: Q{total.toLocaleString()}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', mt: 2 }}>
                        <Button
                          variant="outlined"
                          sx={{ 
                            borderColor: '#8B7355', 
                            color: '#8B7355', 
                            fontWeight: 600,
                            '&:hover': {
                              borderColor: '#A0522D',
                              background: 'rgba(139, 115, 85, 0.04)'
                            }
                          }}
                          onClick={handlePrintPDF}
                        >
                          Imprimir Orden
                        </Button>
                        <Button
                          variant="contained"
                          sx={{ 
                            background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #A0522D 0%, #8B7355 100%)'
                            }
                          }}
                          onClick={() => navigate('/')}
                        >
                          Volver al inicio
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Resumen del Pedido (Siempre visible) */}
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
                    {cartItems.map((item) => {
                      // Depuración de imagen
                      const imgUrl = (item.product_data.fotos && item.product_data.fotos[0]) || item.product_data.imagen || '';
                      console.log('IMG URL:', imgUrl, 'Nombre:', item.product_data.nombre);
                      return (
                        <ListItem key={item.id} sx={{ px: 0, py: 2 }}>
                          <img
                            src={imgUrl}
                            alt={item.product_data.nombre}
                            style={{
                              width: 60,
                              height: 60,
                              marginRight: 16,
                              borderRadius: 8,
                              objectFit: 'cover',
                              border: '2px solid #e8dcc8'
                            }}
                            onError={e => (e.currentTarget.style.display = 'none')}
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
                                  Cantidad: {item.cantidad} × Q.{item.product_data.precio}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>

                <Divider sx={{ borderColor: '#e8dcc8' }} />

                <Box sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1" sx={{ color: '#8B7355' }}>Subtotal</Typography>
                    <Typography variant="body1" fontWeight="600" sx={{ color: '#5d4037' }}>
                      Q.{total.toLocaleString()}
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
                      Q.{total.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CheckoutPage;