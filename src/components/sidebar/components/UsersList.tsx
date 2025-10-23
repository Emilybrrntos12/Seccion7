import { useEffect, useState } from "react";
import { getFirestore, collection, Timestamp } from "firebase/firestore";
import { getApp } from "firebase/app";
import { 
  Box, 
  Typography, 
  Avatar, 
  CircularProgress, 
  Chip,
  alpha,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
} from '@mui/material';
import {
  People,
  Email,
  Phone,
  ArrowBack
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";

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
  brownLight: "#d7ccc8",
  brownMedium: "#a1887f"
};

interface User {
  email: string;
  nombre: string;
  foto?: string;
  telefono?: string;
  fechaRegistro?: Timestamp;
  estado?: string;
  ultimaVezEnLinea?: string;
}

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const firestore = getFirestore(getApp());
    const usersRef = collection(firestore, "users");
    // Importar onSnapshot dinámicamente para evitar problemas SSR
    let unsubscribe: (() => void) | undefined;
    import('firebase/firestore').then(({ onSnapshot }) => {
      unsubscribe = onSnapshot(usersRef, (snapshot) => {
        const usersList: User[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            email: data.email,
            nombre: data.nombre,
            foto: data.foto,
            telefono: data.telefono,
            fechaRegistro: data.fechaRegistro || data.fecha || null,
            estado: data.estado,
            ultimaVezEnLinea: data.ultimaVezEnLinea
          };
        });
        setUsers(usersList);
        setLoading(false);
      });
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 100%)'
    }}>
      
      {/* Main Content */}
      <Box sx={{ flex: 1, p: 2 }}>
        {/* Header Compacto */}
        <Card sx={{
          background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.secondary} 100%)`,
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(139, 115, 85, 0.3)',
          mb: 3,
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)'
                  }
                }}
              >
                <ArrowBack />
              </IconButton>
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="800" sx={{ 
                  color: 'white', 
                  mb: 0.5
                }}>
                  Usuarios Registrados
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: palette.light, 
                  opacity: 0.9
                }}>
                  {users.length} usuarios en la plataforma
                </Typography>
              </Box>

              <Chip
                icon={<People />}
                label={`${users.length} Usuarios`}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: 300,
            background: 'white',
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(139, 115, 85, 0.1)',
            border: `1px solid ${palette.light}`
          }}>
            <CircularProgress 
              size={50} 
              sx={{ 
                color: palette.primary,
                mb: 2 
              }} 
            />
            <Typography variant="body1" fontWeight="600" sx={{ color: palette.dark }}>
              Cargando usuarios...
            </Typography>
          </Box>
        ) : (
          <TableContainer 
            component={Paper}
            sx={{
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(139, 115, 85, 0.1)',
              border: `1px solid ${palette.light}`,
              background: 'white'
            }}
          >
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ 
                  background: `linear-gradient(135deg, ${palette.light} 0%, ${palette.background} 100%)` 
                }}>
                  <TableCell sx={{ fontWeight: '800', color: palette.dark, fontSize: '0.9rem' }}>
                    Usuario
                  </TableCell>
                  <TableCell sx={{ fontWeight: '800', color: palette.dark, fontSize: '0.9rem' }}>
                    Contacto
                  </TableCell>
                  <TableCell sx={{ fontWeight: '800', color: palette.dark, fontSize: '0.9rem' }}>
                    Teléfono
                  </TableCell>
                  <TableCell sx={{ fontWeight: '800', color: palette.dark, fontSize: '0.9rem' }}>
                    Estado
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <People sx={{ fontSize: 48, color: palette.primary, opacity: 0.4, mb: 1 }} />
                        <Typography variant="h6" fontWeight="600" sx={{ color: palette.dark, mb: 1 }}>
                          No hay usuarios registrados
                        </Typography>
                        <Typography variant="body2" sx={{ color: palette.primary, opacity: 0.8 }}>
                          Los usuarios aparecerán aquí cuando se registren
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, idx) => (
                    <TableRow 
                      key={idx}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(palette.primary, 0.04)
                        }
                      }}
                    >
                      {/* Columna Usuario */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={user.foto}
                            sx={{
                              width: 40,
                              height: 40,
                              border: `2px solid ${palette.primary}`,
                              backgroundColor: user.foto ? 'transparent' : palette.primary,
                              color: 'white',
                              fontSize: '0.9rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {getInitials(user.nombre)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="700" sx={{ color: palette.dark }}>
                              {user.nombre}
                            </Typography>
                            <Typography variant="caption" sx={{ color: palette.primary, fontWeight: '500' }}>
                              ID: {idx + 1}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Columna Contacto */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Email sx={{ fontSize: 16, color: palette.primary }} />
                          <Typography variant="body2" sx={{ color: palette.dark, fontSize: '0.85rem' }}>
                            {user.email}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Columna Teléfono */}
                      <TableCell>
                        {user.telefono ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Phone sx={{ fontSize: 16, color: palette.primary }} />
                            <Typography variant="body2" sx={{ color: palette.dark, fontSize: '0.85rem' }}>
                              {user.telefono}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: palette.primary, opacity: 0.6, fontSize: '0.85rem' }}>
                            No proporcionado
                          </Typography>
                        )}
                      </TableCell>

                      {/* Columna Estado */}
                      <TableCell>
                        {user.estado === 'activo' ? (
                          <Chip
                            label="Activo"
                            size="small"
                            sx={{
                              bgcolor: `${palette.success}20`,
                              color: palette.success,
                              fontWeight: '600',
                              fontSize: '0.75rem',
                              border: `1px solid ${palette.success}30`
                            }}
                          />
                        ) : user.estado === 'inactivo' ? (
                          <Chip
                            label="Inactivo"
                            size="small"
                            sx={{
                              bgcolor: `${palette.error}20`,
                              color: palette.error,
                              fontWeight: '600',
                              fontSize: '0.75rem',
                              border: `1px solid ${palette.error}30`
                            }}
                          />
                        ) : user.ultimaVezEnLinea ? (
                          <Chip
                            label={`Última vez: ${new Date(user.ultimaVezEnLinea).toLocaleString('es-ES')}`}
                            size="small"
                            sx={{
                              bgcolor: `${palette.warning}20`,
                              color: palette.warning,
                              fontWeight: '600',
                              fontSize: '0.75rem',
                              border: `1px solid ${palette.warning}30`
                            }}
                          />
                        ) : (
                          <Chip
                            label="Sin estado"
                            size="small"
                            sx={{
                              bgcolor: `${palette.brownLight}20`,
                              color: palette.brownMedium,
                              fontWeight: '600',
                              fontSize: '0.75rem',
                              border: `1px solid ${palette.brownLight}30`
                            }}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default UsersList;