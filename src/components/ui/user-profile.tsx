import { imprimirOrdenFirebase } from "../../lib/imprimirOrdenFirebase";
import type { FirebaseOrder } from "../../lib/imprimirOrdenFirebase";
// Imprimir orden en formato Firebase (cartItems)
import React, { useEffect, useState } from "react";
import { useSigninCheck, useFirebaseApp, useUser, useAuth } from "reactfire";
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore/lite";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper as MuiPaper,
  Avatar,
} from "@mui/material";
import {
  Person,
  ShoppingBag,
  ExitToApp,
  Edit,
  Save,
  Cancel,
  LocalShipping,
  CheckCircle,
  Schedule,
  Email,
  Phone,
  LocationOn
} from "@mui/icons-material";

const MySwal = withReactContent(Swal);

// Paleta de colores tierra
const palette = {
  primary: "#8B7355",
  secondary: "#A0522D",
  background: "#fffdf9",
  light: "#e8dcc8",
  dark: "#5d4037",
  accent: "#c2a77d"
};

export const UserProfile: React.FC = () => {
  // Imprimir orden de compra en PDF
  const { data: signInCheckResult } = useSigninCheck();
  const { data: user } = useUser();
  const app = useFirebaseApp();
  const [section, setSection] = useState(0);
  const [profile, setProfile] = useState({ 
    nombre: "", 
    telefono: "", 
    municipio: "", 
    departamento: "", 
    email: "" 
  });
  const [form, setForm] = useState(profile);
  const [editing, setEditing] = useState(false);
  

interface Product {
  imagen: string;
  nombre: string;
  talla: string;
  precio: number;
}

interface Order {
  id: string;
  fecha?: { seconds: number };
  estado?: string;
  productos?: Product[];
  total?: number;
  metodoPago?: string;
}
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfileAndOrders = async () => {
      if (!signInCheckResult?.signedIn) return;
      setLoading(true);
      const firestore = getFirestore(app);
      const userId = signInCheckResult.user.uid;
      
      // Perfil
      const userRef = doc(firestore, "users", userId);
      const userSnap = await getDoc(userRef);
      const data = userSnap.exists() ? userSnap.data() : {};
      
      setProfile({
        nombre: data.nombre || (user?.displayName ?? ""),
        telefono: data.telefono || "",
        municipio: data.municipio || "",
        departamento: data.departamento || "",
        email: data.email || (user?.email ?? "")
      });
      
      setForm({
        nombre: data.nombre || (user?.displayName ?? ""),
        telefono: data.telefono || "",
        municipio: data.municipio || "",
        departamento: data.departamento || "",
        email: data.email || (user?.email ?? "")
      });
      
      // Pedidos
      const ordersRef = collection(firestore, "orders");
      const q = query(ordersRef, where("id_usuario", "==", userId));
      const ordersSnap = await getDocs(q);
      setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    };
    
    fetchProfileAndOrders();
  }, [app, signInCheckResult, user]);

  const validate = () => {
    if (!form.nombre.trim()) return "El nombre es obligatorio.";
    if (!form.telefono.match(/^\d{8}$/)) return "El teléfono debe tener 8 dígitos.";
    if (!form.municipio.trim()) return "El municipio es obligatorio.";
    if (!form.departamento.trim()) return "El departamento es obligatorio.";
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      await MySwal.fire({ 
        icon: "error", 
        title: "Error de validación", 
        text: error, 
        confirmButtonColor: palette.primary 
      });
      return;
    }
    
    setSaving(true);
    try {
      if (!signInCheckResult?.user) throw new Error("Usuario no autenticado");
      const firestore = getFirestore(app);
      const userId = signInCheckResult.user.uid;
      
      await updateDoc(doc(firestore, "users", userId), {
        nombre: form.nombre,
        telefono: form.telefono,
        municipio: form.municipio,
        departamento: form.departamento
      });
      
      setProfile({ ...form, email: profile.email });
      setEditing(false);
      
      await MySwal.fire({ 
        icon: "success", 
        title: "¡Guardado!", 
        text: "Tus datos han sido actualizados.", 
        confirmButtonColor: palette.primary 
      });
    } catch {
      await MySwal.fire({ 
        icon: "error", 
        title: "Error", 
        text: "No se pudo guardar la información.", 
        confirmButtonColor: palette.primary 
      });
    }
    setSaving(false);
  };

  const auth = useAuth();
  const handleLogout = async () => {
    const result = await MySwal.fire({
      icon: "warning",
      title: "¿Cerrar sesión?",
      text: "¿Seguro que deseas cerrar sesión?",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      confirmButtonColor: palette.primary,
      cancelButtonColor: palette.light
    });
    if (result.isConfirmed) {
      try {
        await auth.signOut();
        window.location.href = "/";
      } catch {
        await MySwal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cerrar la sesión.",
          confirmButtonColor: palette.primary
        });
      }
    }
  };

  const getOrderStatusColor = (estado: string) => {
    switch (estado) {
      case "completado":
        return "#4caf50";
      case "enviado":
        return "#2196f3";
      case "procesando":
        return "#ff9800";
      default:
        return palette.primary;
    }
  };

  const getOrderStatusIcon = (estado: string) => {
    switch (estado) {
      case "completado":
        return <CheckCircle sx={{ color: "#4caf50" }} />;
      case "enviado":
        return <LocalShipping sx={{ color: "#2196f3" }} />;
      default:
        return <Schedule sx={{ color: "#ff9800" }} />;
    }
  };

  if (loading) return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 50%)'
    }}>
      <CircularProgress sx={{ color: palette.primary }} size={60} />
    </Box>
  );
  
  if (!signInCheckResult?.signedIn) return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 50%)',
      textAlign: 'center'
    }}>
      <Typography variant="h5" sx={{ color: palette.primary }}>
        Debes iniciar sesión para ver tu perfil.
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 100%)',
      paddingTop: '80px',
      py: 4
    }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 3 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" fontWeight="700" sx={{ color: palette.dark, mb: 2 }}>
            Mi Cuenta
          </Typography>
          <Typography variant="h6" sx={{ color: palette.primary, opacity: 0.8 }}>
            Gestiona tu información personal y pedidos
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          {/* Sidebar de Navegación */}
          <Box sx={{ width: { xs: '100%', lg: 300 } }}>
            <Card sx={{ 
              background: 'white',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
              border: '1px solid #e8dcc8',
              overflow: 'hidden'
            }}>
              {/* Header del perfil */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)', 
                color: 'white', 
                p: 3,
                textAlign: 'center'
              }}>
                <Avatar
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    mx: 'auto', 
                    mb: 2,
                    background: 'rgba(255,255,255,0.2)',
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {profile.nombre.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h6" fontWeight="700">
                  {profile.nombre}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {profile.email}
                </Typography>
              </Box>

              {/* Menú de navegación */}
              <Box sx={{ p: 2 }}>
                <List>
                  <ListItemButton
                    selected={section === 0}
                    onClick={() => setSection(0)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      background: section === 0 ? palette.light : 'transparent',
                      '&:hover': {
                        background: palette.light + '40'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Person sx={{ color: section === 0 ? palette.primary : palette.dark }} />
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Información Personal"
                      primaryTypographyProps={{
                        fontWeight: section === 0 ? 600 : 400,
                        color: section === 0 ? palette.primary : palette.dark
                      }}
                    />
                  </ListItemButton>
                  <ListItemButton
                    selected={section === 1}
                    onClick={() => setSection(1)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      background: section === 1 ? palette.light : 'transparent',
                      '&:hover': {
                        background: palette.light + '40'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <ShoppingBag sx={{ color: section === 1 ? palette.primary : palette.dark }} />
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Historial de Pedidos"
                      primaryTypographyProps={{
                        fontWeight: section === 1 ? 600 : 400,
                        color: section === 1 ? palette.primary : palette.dark
                      }}
                    />
                  </ListItemButton>
                  <ListItemButton
                    selected={section === 2}
                    onClick={() => setSection(2)}
                    sx={{
                      borderRadius: 2,
                      background: section === 2 ? palette.light : 'transparent',
                      '&:hover': {
                        background: palette.light + '40'
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <ExitToApp sx={{ color: section === 2 ? palette.primary : palette.dark }} />
                    </ListItemAvatar>
                    <ListItemText 
                      primary="Cerrar Sesión"
                      primaryTypographyProps={{
                        fontWeight: section === 2 ? 600 : 400,
                        color: section === 2 ? palette.primary : palette.dark
                      }}
                    />
                  </ListItemButton>
                </List>
              </Box>
            </Card>
          </Box>

          {/* Contenido Principal */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ 
              background: 'white',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
              border: '1px solid #e8dcc8',
              minHeight: '500px'
            }}>
              {/* Información Personal */}
              {section === 0 && (
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight="700" sx={{ color: palette.dark }}>
                      Información Personal
                    </Typography>
                    {!editing && (
                      <Button
                        startIcon={<Edit />}
                        onClick={() => setEditing(true)}
                        sx={{
                          background: palette.light,
                          color: palette.primary,
                          borderRadius: 3,
                          px: 3,
                          '&:hover': {
                            background: palette.light,
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        Editar
                      </Button>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      label="Nombre completo"
                      value={editing ? form.nombre : profile.nombre}
                      disabled={!editing}
                      onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                      InputProps={{
                        startAdornment: <Person sx={{ color: palette.primary, mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: editing ? 'white' : palette.background
                        }
                      }}
                    />

                    <TextField
                      label="Teléfono"
                      value={editing ? form.telefono : profile.telefono}
                      disabled={!editing}
                      onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                      placeholder="8 dígitos"
                      InputProps={{
                        startAdornment: <Phone sx={{ color: palette.primary, mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: editing ? 'white' : palette.background
                        }
                      }}
                    />

                    <TextField
                      label="Municipio"
                      value={editing ? form.municipio : profile.municipio}
                      disabled={!editing}
                      onChange={e => setForm(f => ({ ...f, municipio: e.target.value }))}
                      InputProps={{
                        startAdornment: <LocationOn sx={{ color: palette.primary, mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: editing ? 'white' : palette.background
                        }
                      }}
                    />

                    <TextField
                      label="Departamento"
                      value={editing ? form.departamento : profile.departamento}
                      disabled={!editing}
                      onChange={e => setForm(f => ({ ...f, departamento: e.target.value }))}
                      InputProps={{
                        startAdornment: <LocationOn sx={{ color: palette.primary, mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: editing ? 'white' : palette.background
                        }
                      }}
                    />

                    <TextField
                      label="Correo electrónico"
                      value={profile.email}
                      disabled
                      InputProps={{
                        startAdornment: <Email sx={{ color: palette.primary, mr: 1 }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          background: palette.background
                        }
                      }}
                      helperText="El correo electrónico no se puede modificar desde aquí"
                    />
                  </Box>

                  {editing && (
                    <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                      <Button
                        startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                        onClick={handleSave}
                        disabled={saving}
                        sx={{
                          background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
                          color: 'white',
                          borderRadius: 3,
                          px: 4,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #A0522D 0%, #8B7355 100%)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                      <Button
                        startIcon={<Cancel />}
                        onClick={() => { setEditing(false); setForm(profile); }}
                        sx={{
                          border: `2px solid ${palette.primary}`,
                          color: palette.primary,
                          borderRadius: 3,
                          px: 4,
                          '&:hover': {
                            background: palette.light
                          }
                        }}
                      >
                        Cancelar
                      </Button>
                    </Box>
                  )}
                </CardContent>
              )}

              {/* Historial de Pedidos */}
              {section === 1 && (
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" fontWeight="700" sx={{ color: palette.dark, mb: 4 }}>
                    Historial de Pedidos
                  </Typography>
                  {orders.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <ShoppingBag sx={{ fontSize: 80, color: palette.light, mb: 3 }} />
                      <Typography variant="h5" sx={{ color: palette.primary, mb: 2 }}>
                        No tienes pedidos
                      </Typography>
                      <Typography variant="body1" sx={{ color: palette.dark, mb: 4, opacity: 0.8 }}>
                        Cuando realices tu primer pedido, aparecerá aquí.
                      </Typography>
                      <Button
                        href="/"
                        sx={{
                          background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
                          color: 'white',
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #A0522D 0%, #8B7355 100%)'
                          }
                        }}
                      >
                        Continuar Comprando
                      </Button>
                    </Box>
                  ) : (
                    <TableContainer component={MuiPaper} sx={{ maxHeight: 400, borderRadius: 3, border: '1px solid', borderColor: palette.light, background: palette.background }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: palette.primary }}># Pedido</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: palette.primary }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: palette.primary }}>Estado</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: palette.primary }}>Total</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: palette.primary }}>Método de pago</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: palette.primary }}>Ver Detalles</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {[...orders]
                            .sort((a, b) => {
                              const fechaA = a.fecha?.seconds || 0;
                              const fechaB = b.fecha?.seconds || 0;
                              return fechaB - fechaA;
                            })
                            .map((order) => (
                              <TableRow key={order.id} hover>
                              <TableCell sx={{ fontWeight: 600, color: palette.dark }}>
                                {order.id.slice(-8).toUpperCase()}
                              </TableCell>
                              <TableCell>
                                {order.fecha ? new Date(order.fecha.seconds * 1000).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha no disponible'}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={getOrderStatusIcon(order.estado || 'procesando')}
                                  label={order.estado || 'Procesando'}
                                  sx={{
                                    background: getOrderStatusColor(order.estado || 'procesando') + '20',
                                    color: getOrderStatusColor(order.estado || 'procesando'),
                                    fontWeight: 600
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700, color: palette.secondary }}>
                                Q{order.total?.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {order.metodoPago === 'efectivo' ? 'Efectivo' : 'Transferencia'}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  sx={{ color: palette.primary, '&:hover': { background: palette.light } }}
                                  onClick={() => {
                                    // Adaptar la orden al formato FirebaseOrder
                                    const firebaseOrder: FirebaseOrder = {
                                      id: order.id,
                                      fecha: order.fecha,
                                      estado: order.estado,
                                      metodoPago: order.metodoPago,
                                      total: order.total,
                                      nombre: profile.nombre,
                                      telefono: profile.telefono,
                                      email: profile.email,
                                      direccion: profile.municipio + ', ' + profile.departamento,
                                      notas: '',
                                      cartItems: (order.productos || []).map((p: Product & { id_producto?: string; talla_seleccionada?: string }) => ({
                                        cantidad: 1,
                                        id_producto: p.id_producto || '',
                                        imagen: p.imagen,
                                        nombre: p.nombre,
                                        precio: p.precio,
                                        talla_seleccionada: p.talla || p.talla_seleccionada || ''
                                      }))
                                    };
                                    imprimirOrdenFirebase(firebaseOrder);
                                  }}
                                >
                                  Imprimir orden
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              )}

              {/* Cerrar Sesión */}
              {section === 2 && (
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        mx: 'auto',
                        mb: 3,
                        background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)'
                      }}
                    >
                      <ExitToApp sx={{ fontSize: 40 }} />
                    </Avatar>

                    <Typography variant="h4" fontWeight="700" sx={{ color: palette.dark, mb: 2 }}>
                      Cerrar Sesión
                    </Typography>
                    <Typography variant="body1" sx={{ color: palette.primary, mb: 4, opacity: 0.8 }}>
                      ¿Estás seguro de que deseas cerrar tu sesión? Podrás volver a iniciar sesión en cualquier momento.
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
                      <Button
                        startIcon={<ExitToApp />}
                        onClick={handleLogout}
                        sx={{
                          background: 'linear-gradient(135deg, #8B7355 0%, #A0522D 100%)',
                          color: 'white',
                          borderRadius: 3,
                          px: 4,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #A0522D 0%, #8B7355 100%)'
                          }
                        }}
                      >
                        Sí, cerrar sesión
                      </Button>
                      <Button
                        onClick={() => setSection(0)}
                        sx={{
                          border: `2px solid ${palette.primary}`,
                          color: palette.primary,
                          borderRadius: 3,
                          px: 4,
                          '&:hover': {
                            background: palette.light
                          }
                        }}
                      >
                        Cancelar
                      </Button>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="body2" sx={{ color: palette.primary, opacity: 0.7 }}>
                      Para gestionar tu contraseña, visita tu{' '}
                      <a 
                        href="https://myaccount.google.com/security" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{ color: palette.secondary, textDecoration: 'underline' }}
                      >
                        cuenta de Google
                      </a>.
                    </Typography>
                  </Box>
                </CardContent>
              )}
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};