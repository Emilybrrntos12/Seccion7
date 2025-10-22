import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, Timestamp, updateDoc, doc } from "firebase/firestore";
import { getApp } from "firebase/app";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,

  CircularProgress,

  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from "@mui/material";
import {
  ArrowBack,

  Print,
  Visibility,
  FilterList,
  Search,
  CalendarToday,
  LocalShipping,
  CheckCircle,
  Schedule,

  Person,
  Email,
  Phone,
  LocationOn,
} from "@mui/icons-material";

// Tipos
export type PedidoCartItem = {
  id_producto: string;
  cantidad: number;
  talla_seleccionada: string;
  nombre: string;
  precio: number;
  imagen: string;
};

export type Pedido = {
  id: string;
  id_usuario: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  metodoPago: string;
  notas: string;
  cartItems: PedidoCartItem[];
  total: number;
  fecha: Timestamp;
  estado: string;
};

const OrderPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Pedido[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchId, setSearchId] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null);
  const [detailDialog, setDetailDialog] = useState(false);

  // Paleta de colores tierra
  const palette = {
    primary: "#8B7355",
    secondary: "#A0522D",
    background: "#fffdf9",
    light: "#e8dcc8",
    dark: "#5d4037",
    accent: "#c2a77d",
    success: "#4caf50",
    warning: "#ff9800",
    error: "#f44336",
    info: "#2196f3"
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'Fecha no disponible';
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Pendiente": return palette.warning;
      case "En preparación": return palette.info;
      case "Enviado": return palette.primary;
      case "Entregado": return palette.success;
      default: return palette.primary;
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "Pendiente": return <Schedule sx={{ fontSize: 16 }} />;
      case "En preparación": return <Schedule sx={{ fontSize: 16 }} />;
      case "Enviado": return <LocalShipping sx={{ fontSize: 16 }} />;
      case "Entregado": return <CheckCircle sx={{ fontSize: 16 }} />;
      default: return <Schedule sx={{ fontSize: 16 }} />;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const firestore = getFirestore(getApp());
        const ordersRef = collection(firestore, "orders");
        const snapshot = await getDocs(ordersRef);
        const pedidos: Pedido[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            id_usuario: data.id_usuario,
            nombre: data.nombre,
            direccion: data.direccion,
            telefono: data.telefono,
            email: data.email,
            metodoPago: data.metodoPago,
            notas: data.notas,
            cartItems: data.cartItems,
            total: data.total,
            fecha: data.fecha,
            estado: data.estado,
          };
        });
        pedidos.sort((a, b) => b.fecha?.toMillis() - a.fecha?.toMillis());
        setOrders(pedidos);
        setFilteredOrders(pedidos);
      } catch (err) {
        setError('Error al cargar las órdenes');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    if (searchId.trim()) {
      result = result.filter(order => order.id.toLowerCase().includes(searchId.trim().toLowerCase()));
    }

    if (estadoFilter) {
      result = result.filter(order => order.estado === estadoFilter);
    }

    if (fechaInicio) {
      const [inicioYear, inicioMonth, inicioDay] = fechaInicio.split('-').map(Number);
      result = result.filter(order => {
        const orderDate = order.fecha.toDate();
        const orderYear = orderDate.getFullYear();
        const orderMonth = orderDate.getMonth() + 1;
        const orderDay = orderDate.getDate();
        
        if (orderYear > inicioYear) return true;
        if (orderYear < inicioYear) return false;
        if (orderMonth > inicioMonth) return true;
        if (orderMonth < inicioMonth) return false;
        return orderDay >= inicioDay;
      });
    }

    if (fechaFin) {
      const [finYear, finMonth, finDay] = fechaFin.split('-').map(Number);
      result = result.filter(order => {
        const orderDate = order.fecha.toDate();
        const orderYear = orderDate.getFullYear();
        const orderMonth = orderDate.getMonth() + 1;
        const orderDay = orderDate.getDate();
        
        if (orderYear < finYear) return true;
        if (orderYear > finYear) return false;
        if (orderMonth < finMonth) return true;
        if (orderMonth > finMonth) return false;
        return orderDay <= finDay;
      });
    }

    setFilteredOrders(result);
    setPage(0);
  }, [orders, searchId, estadoFilter, fechaInicio, fechaFin]);

  const estados = ["Pendiente", "En preparación", "Enviado", "Entregado"];

  const handleEstadoChange = async (orderId: string, newEstado: string) => {
    try {
      const firestore = getFirestore(getApp());
      const orderRef = doc(firestore, "orders", orderId);
      await updateDoc(orderRef, { estado: newEstado });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: newEstado } : o));
    } catch (err) {
      alert("Error al actualizar el estado");
      console.error(err);
    }
  };

  const downloadOrderPDF = (order: Pedido) => {
    const doc = new jsPDF();
    
    // Header con diseño mejorado
    doc.setFillColor(139, 115, 85);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("ORDEN DE COMPRA", 105, 18, { align: "center" });
    
    // Información de la orden
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Número de Orden: #${order.id.slice(-8).toUpperCase()}`, 20, 45);
    doc.text(`Fecha: ${formatDate(order.fecha)}`, 20, 52);
    doc.text(`Estado: ${order.estado}`, 20, 59);
    
    // Línea separadora
    doc.setDrawColor(139, 115, 85);
    doc.setLineWidth(0.5);
    doc.line(20, 65, 190, 65);
    
    // Información del cliente
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("INFORMACIÓN DEL CLIENTE", 20, 75);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Nombre: ${order.nombre}`, 20, 82);
    doc.text(`Email: ${order.email}`, 20, 88);
    doc.text(`Teléfono: ${order.telefono}`, 20, 94);
    doc.text(`Dirección: ${order.direccion}`, 20, 100);
    
    // Información del pago
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("INFORMACIÓN DEL PAGO", 20, 112);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Método de Pago: ${order.metodoPago}`, 20, 119);
    if (order.notas) {
      doc.text(`Notas: ${order.notas}`, 20, 125);
    }
    
    // Tabla de productos
    const tableData = order.cartItems.map((item) => [
      item.nombre,
      item.talla_seleccionada,
      item.cantidad.toString(),
  `Q${item.precio.toFixed(2)}`,
  `Q${(item.precio * item.cantidad).toFixed(2)}`
    ]);
    
    autoTable(doc, {
      head: [["Producto", "Talla", "Cantidad", "Precio Unit.", "Subtotal"]],
      body: tableData,
      startY: order.notas ? 132 : 126,
      theme: "grid",
      headStyles: { 
        fillColor: [139, 115, 85],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25, halign: "center" },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 30, halign: "right" }
      }
    });
    
    // Total
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable.finalY || 180;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
  doc.text(`TOTAL: Q${order.total.toFixed(2)}`, 170, finalY + 15, { align: "right" });
    
    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Calzado Santa Catarina Mita - Calzado Artesanal Guatemalteco", 105, finalY + 25, { align: "center" });
    doc.text("Gracias por su confianza", 105, finalY + 30, { align: "center" });
    
    // Abrir en nueva ventana para imprimir
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(pdfUrl);
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedOrders = filteredOrders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 50%)'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: palette.primary, mb: 2 }} size={60} />
          <Typography variant="h6" sx={{ color: palette.primary }}>
            Cargando órdenes...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 50%)'
      }}>
        <Typography variant="h6" sx={{ color: palette.error }}>
          {error}
        </Typography>
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
      <Box sx={{ maxWidth: '1400px', mx: 'auto', px: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin')}
            sx={{
              background: palette.primary,
              color: 'white',
              borderRadius: 3,
              padding: '10px 20px',
              fontWeight: 600,
              mb: 3,
              '&:hover': {
                background: palette.secondary,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(139, 115, 85, 0.3)'
              }
            }}
          >
            Volver al Panel
          </Button>

          <Box sx={{ 
            background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.secondary} 100%)`,
            borderRadius: 4,
            p: 4,
            color: 'white',
            textAlign: 'center',
            mb: 4
          }}>
            <Typography variant="h2" fontWeight="700" sx={{ mb: 2 }}>
              🛍️ Gestión de Órdenes
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Administra y realiza seguimiento de los pedidos de los clientes
            </Typography>
          </Box>
        </Box>

        {/* Filtros */}
        <Card sx={{ 
          background: 'white',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
          border: '1px solid #e8dcc8',
          mb: 4
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Buscar orden..."
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: palette.primary, mr: 1 }} />
                }}
                sx={{ minWidth: 250 }}
              />

              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Estado</InputLabel>
                <Select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} label="Estado">
                  <MenuItem value="">Todos los estados</MenuItem>
                  {estados.map(estado => (
                    <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Fecha inicio"
                type="date"
                value={fechaInicio}
                onChange={e => setFechaInicio(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />

              <TextField
                size="small"
                label="Fecha fin"
                type="date"
                value={fechaFin}
                onChange={e => setFechaFin(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />

              <Chip 
                icon={<FilterList />}
                label={`${filteredOrders.length} órdenes`}
                sx={{ 
                  background: palette.light,
                  color: palette.primary,
                  fontWeight: 600
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Tabla de Órdenes */}
        <Card sx={{ 
          background: 'white',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
          border: '1px solid #e8dcc8',
          overflow: 'hidden'
        }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ background: palette.background }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: palette.dark }}># Orden</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: palette.dark }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: palette.dark }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: palette.dark }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: palette.dark }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: palette.dark }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow 
                    key={order.id}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': { background: palette.background }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" sx={{ color: palette.dark }}>
                        #{order.id.slice(-8).toUpperCase()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="600" sx={{ color: palette.dark }}>
                          {order.nombre}
                        </Typography>
                        <Typography variant="caption" sx={{ color: palette.primary }}>
                          {order.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 16, color: palette.primary }} />
                        <Typography variant="body2" sx={{ color: palette.dark }}>
                          {formatDate(order.fecha)}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getEstadoIcon(order.estado)}
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                          <Select
                            value={order.estado}
                            onChange={e => handleEstadoChange(order.id, e.target.value)}
                            sx={{
                              background: getEstadoColor(order.estado) + '20',
                              color: getEstadoColor(order.estado),
                              fontWeight: 600,
                              borderRadius: 2,
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: getEstadoColor(order.estado)
                              }
                            }}
                          >
                            {estados.map(estado => (
                              <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="700" sx={{ color: palette.secondary }}>
                        Q{order.total?.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Ver detalles">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedOrder(order);
                              setDetailDialog(true);
                            }}
                            sx={{
                              background: palette.light,
                              color: palette.primary,
                              '&:hover': { background: palette.primary, color: 'white' }
                            }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Imprimir orden">
                          <IconButton
                            size="small"
                            onClick={() => downloadOrderPDF(order)}
                            sx={{
                              background: palette.light,
                              color: palette.primary,
                              '&:hover': { background: palette.primary, color: 'white' }
                            }}
                          >
                            <Print />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredOrders.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: palette.primary }}>
                No se encontraron órdenes
              </Typography>
              <Typography variant="body2" sx={{ color: palette.dark, opacity: 0.8 }}>
                Intenta ajustar los filtros de búsqueda
              </Typography>
            </Box>
          )}

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredOrders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Órdenes por página:"
            sx={{
              borderTop: `1px solid ${palette.light}`,
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                color: palette.dark
              }
            }}
          />
        </Card>

        {/* Dialog de Detalles */}
        <Dialog 
          open={detailDialog} 
          onClose={() => setDetailDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ 
            background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.secondary} 100%)`,
            color: 'white'
          }}>
            <Typography variant="h5" fontWeight="700">
              Detalles de la Orden #{selectedOrder?.id.slice(-8).toUpperCase()}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {selectedOrder && (
              <Stack spacing={3}>
                {/* Información del Cliente */}
                <Box>
                  <Typography variant="h6" fontWeight="600" sx={{ color: palette.dark, mb: 2 }}>
                    👤 Información del Cliente
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person sx={{ color: palette.primary }} />
                      <Typography>{selectedOrder.nombre}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email sx={{ color: palette.primary }} />
                      <Typography>{selectedOrder.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ color: palette.primary }} />
                      <Typography>{selectedOrder.telefono}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn sx={{ color: palette.primary }} />
                      <Typography>{selectedOrder.direccion}</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Productos */}
                <Box>
                  <Typography variant="h6" fontWeight="600" sx={{ color: palette.dark, mb: 2 }}>
                    🛒 Productos ({selectedOrder.cartItems.length})
                  </Typography>
                  {selectedOrder.cartItems.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, background: palette.background, borderRadius: 2, mb: 1 }}>
                      <Avatar src={item.imagen} variant="rounded" sx={{ width: 60, height: 60 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight="600">{item.nombre}</Typography>
                        <Typography variant="body2" sx={{ color: palette.primary }}>
                          Talla: {item.talla_seleccionada} • Cantidad: {item.cantidad}
                        </Typography>
                        <Typography variant="body2" sx={{ color: palette.secondary, fontWeight: 600 }}>
                          Q{item.precio} c/u • Q{(item.precio * item.cantidad).toFixed(2)} total
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* Resumen */}
                <Box sx={{ textAlign: 'center', p: 2, background: palette.light, borderRadius: 2 }}>
                  <Typography variant="h5" fontWeight="700" sx={{ color: palette.secondary }}>
                    Total: Q{selectedOrder.total?.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDetailDialog(false)}>
              Cerrar
            </Button>
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={() => selectedOrder && downloadOrderPDF(selectedOrder)}
              sx={{
                background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.secondary} 100%)`,
                color: 'white'
              }}
            >
              Imprimir Orden
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default OrderPage;