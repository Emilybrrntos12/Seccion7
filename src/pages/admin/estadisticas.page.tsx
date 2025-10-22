import React, { useEffect, useState } from "react";
import { useFirebaseApp } from "reactfire";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ResponsiveContainer, 
  LabelList,
  Cell,
} from "recharts";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Button,
} from "@mui/material";
import {
  TrendingUp,
  Analytics,
  ArrowBack,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const EstadisticasPage: React.FC = () => {
  const app = useFirebaseApp();
  const navigate = useNavigate();
  const [data, setData] = useState([
    { puntuacion: 1, cantidad: 0, nombre: "1 Estrella" },
    { puntuacion: 2, cantidad: 0, nombre: "2 Estrellas" },
    { puntuacion: 3, cantidad: 0, nombre: "3 Estrellas" },
    { puntuacion: 4, cantidad: 0, nombre: "4 Estrellas" },
    { puntuacion: 5, cantidad: 0, nombre: "5 Estrellas" },
  ]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Para la gráfica de confianza
  const [confianzaData, setConfianzaData] = useState([
    { confianza: 1, cantidad: 0, nombre: "Muy Baja" },
    { confianza: 2, cantidad: 0, nombre: "Baja" },
    { confianza: 3, cantidad: 0, nombre: "Media" },
    { confianza: 4, cantidad: 0, nombre: "Alta" },
    { confianza: 5, cantidad: 0, nombre: "Muy Alta" },
  ]);
  const [loadingConfianza, setLoadingConfianza] = useState(true);
  const [confianzaTotal, setConfianzaTotal] = useState(0);

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
    error: "#f44336"
  };

  const COLORS = [palette.error, palette.warning, "#ffc107", "#8bc34a", palette.success];

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const firestore = getFirestore(app);
      const snapshot = await getDocs(collection(firestore, "reviews"));
      const puntuaciones = [0, 0, 0, 0, 0];
      let totalReviews = 0;

      snapshot.forEach(doc => {
        const r = doc.data();
        if (r.puntuacion >= 1 && r.puntuacion <= 5) {
          puntuaciones[r.puntuacion - 1]++;
          totalReviews++;
        }
      });


      setData([
        { puntuacion: 1, cantidad: puntuaciones[0], nombre: "1 Estrella" },
        { puntuacion: 2, cantidad: puntuaciones[1], nombre: "2 Estrellas" },
        { puntuacion: 3, cantidad: puntuaciones[2], nombre: "3 Estrellas" },
        { puntuacion: 4, cantidad: puntuaciones[3], nombre: "4 Estrellas" },
        { puntuacion: 5, cantidad: puntuaciones[4], nombre: "5 Estrellas" },
      ]);
      setTotal(totalReviews);
      setLoading(false);
    };
    fetchReviews();
  }, [app]);

  useEffect(() => {
    const fetchConfianza = async () => {
      setLoadingConfianza(true);
      const firestore = getFirestore(app);
      const snapshot = await getDocs(collection(firestore, "encuestas"));
      const confianzaArr = [0, 0, 0, 0, 0];
      let totalConf = 0;

      snapshot.forEach(doc => {
        const r = doc.data();
        if (r.confianza >= 1 && r.confianza <= 5) {
          confianzaArr[r.confianza - 1]++;
          totalConf++;
        }
      });

      setConfianzaData([
        { confianza: 1, cantidad: confianzaArr[0], nombre: "Muy Baja" },
        { confianza: 2, cantidad: confianzaArr[1], nombre: "Baja" },
        { confianza: 3, cantidad: confianzaArr[2], nombre: "Media" },
        { confianza: 4, cantidad: confianzaArr[3], nombre: "Alta" },
        { confianza: 5, cantidad: confianzaArr[4], nombre: "Muy Alta" },
      ]);
      setConfianzaTotal(totalConf);
      setLoadingConfianza(false);
    };
    fetchConfianza();
  }, [app]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { nombre: string }; value: number }> }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, background: 'white', border: `1px solid ${palette.light}` }}>
          <Typography variant="body2" sx={{ color: palette.dark, fontWeight: 600 }}>
            {payload[0].payload.nombre}
          </Typography>
          <Typography variant="body2" sx={{ color: palette.primary }}>
            {payload[0].value} respuestas
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fffdf9 0%, #e8dcc8 100%)',
      paddingTop: '80px',
      py: 4
    }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto', px: 3 }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 6,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/admin")}
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
              },
              transition: 'all 0.3s ease'
            }}
          >
          </Button>
            
            <Box>
              <Typography variant="h2" fontWeight="700" sx={{ color: palette.dark, mb: 1 }}>
                Dashboard de Estadísticas
              </Typography>
              <Typography variant="h6" sx={{ color: palette.primary, opacity: 0.8 }}>
                Análisis de satisfacción y confianza de los clientes
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Gráfica de Reseñas y Gráfica Circular */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 6 }}>
          {/* Gráfica de Barras de Reseñas */}
          <Card sx={{ 
            background: 'white',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
            border: '1px solid #e8dcc8',
            flex: '1 1 600px',
            minWidth: { xs: '100%', md: '600px' }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <TrendingUp sx={{ color: palette.primary, fontSize: 32 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" fontWeight="700" sx={{ color: palette.dark }}>
                    Distribución de Reseñas
                  </Typography>
                  <Typography variant="body2" sx={{ color: palette.primary }}>
                    Puntuaciones de los usuarios sobre los productos
                  </Typography>
                </Box>
                <Chip 
                  label={`Total: ${total} reseñas`}
                  sx={{ 
                    bgcolor: palette.primary, 
                    color: 'white',
                    fontWeight: 600,
                    fontSize: 14,
                    px: 2
                  }}
                />
              </Box>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                  <CircularProgress sx={{ color: palette.primary }} />
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={palette.light} />
                    <XAxis 
                      dataKey="puntuacion" 
                      tick={{ fontSize: 14, fill: palette.dark }}
                      label={{ 
                        value: "Puntuación (Estrellas)", 
                        position: "insideBottom", 
                        offset: -10,
                        style: { fill: palette.dark, fontSize: 14 }
                      }} 
                    />
                    <YAxis 
                      allowDecimals={false} 
                      tick={{ fontSize: 14, fill: palette.dark }}
                      label={{ 
                        value: "Cantidad de Reseñas", 
                        angle: -90, 
                        position: "insideLeft",
                        style: { fill: palette.dark, fontSize: 14 }
                      }} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                      {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                      <LabelList 
                        dataKey="cantidad" 
                        position="top" 
                        style={{ fill: palette.dark, fontWeight: 600, fontSize: 12 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Gráfica de Confianza */}
        <Card sx={{ 
          background: 'white',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(139, 115, 85, 0.1)',
          border: '1px solid #e8dcc8',
          mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Analytics sx={{ color: palette.secondary, fontSize: 32 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="700" sx={{ color: palette.dark }}>
                  Niveles de Confianza
                </Typography>
                <Typography variant="body2" sx={{ color: palette.primary }}>
                  ¿Qué tan seguro se sintió el usuario al realizar su compra?
                </Typography>
              </Box>
              <Chip 
                label={`Total: ${confianzaTotal} respuestas`}
                sx={{ 
                  bgcolor: palette.secondary, 
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 14,
                  px: 2
                }}
              />
            </Box>

            {loadingConfianza ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
                <CircularProgress sx={{ color: palette.primary }} />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={confianzaData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={palette.light} />
                  <XAxis 
                    dataKey="confianza" 
                    tick={{ fontSize: 14, fill: palette.dark }}
                    label={{ 
                      value: "Nivel de Confianza", 
                      position: "insideBottom", 
                      offset: -10,
                      style: { fill: palette.dark, fontSize: 14 }
                    }} 
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fontSize: 14, fill: palette.dark }}
                    label={{ 
                      value: "Cantidad de Respuestas", 
                      angle: -90, 
                      position: "insideLeft",
                      style: { fill: palette.dark, fontSize: 14 }
                    }} 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="cantidad" radius={[4, 4, 0, 0]} fill={palette.secondary}>
                    <LabelList 
                      dataKey="cantidad" 
                      position="top" 
                      style={{ fill: palette.dark, fontWeight: 600, fontSize: 12 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default EstadisticasPage;