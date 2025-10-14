import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, Timestamp } from "firebase/firestore";
import { getApp } from "firebase/app";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { Box, Typography, Chip } from '@mui/material';

interface User {
  email: string;
  nombre: string;
  foto?: string;
  telefono?: string;
  fechaRegistro?: Timestamp;
}

function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}
function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // lunes como inicio
  return new Date(d.setDate(diff));
}
function getStartOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

const UsersStats = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const firestore = getFirestore(getApp());
      const usersRef = collection(firestore, "users");
      const snapshot = await getDocs(usersRef);
      const usersList: User[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          email: data.email,
          nombre: data.nombre,
          foto: data.foto,
          telefono: data.telefono,
          fechaRegistro: data.fechaRegistro || data.fecha || null,
        };
      });
      setUsers(usersList);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const now = new Date();
  const startDay = getStartOfDay(now);
  const startWeek = getStartOfWeek(now);
  const startMonth = getStartOfMonth(now);

  const total = users.length;
  const nuevosHoy = users.filter(u => u.fechaRegistro && u.fechaRegistro.toDate() >= startDay).length;
  const nuevosSemana = users.filter(u => u.fechaRegistro && u.fechaRegistro.toDate() >= startWeek).length;
  const nuevosMes = users.filter(u => u.fechaRegistro && u.fechaRegistro.toDate() >= startMonth).length;

  return (
    <Box sx={{ p: 2, mb: 2, borderRadius: 2, backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', gap: 2 }}>
      <PeopleAltIcon color="primary" sx={{ fontSize: 40 }} />
      <Box>
        <Typography variant="h6" fontWeight="bold" color="primary.main">
          {loading ? 'Cargando...' : total}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Usuarios registrados
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
          <Chip label={`Hoy: ${nuevosHoy}`} color="success" size="small" />
          <Chip label={`Semana: ${nuevosSemana}`} color="info" size="small" />
          <Chip label={`Mes: ${nuevosMes}`} color="primary" size="small" />
        </Box>
      </Box>
    </Box>
  );
};

export default UsersStats;
