import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, Timestamp } from "firebase/firestore";
import { getApp } from "firebase/app";
import { Box, Typography, Avatar, Paper, CircularProgress } from '@mui/material';

interface User {
  email: string;
  nombre: string;
  foto?: string;
  telefono?: string;
  fechaRegistro?: Timestamp;
}

const UsersList = () => {
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

  return (
    <Box sx={{ maxWidth: 700, margin: '0 auto', p: 3 }}>
      <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ mb: 2 }}>
        Usuarios Registrados
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 2 }}>
          {users.length === 0 ? (
            <Typography color="text.secondary">No hay usuarios registrados.</Typography>
          ) : (
            users.map((user, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
                <Avatar src={user.foto} sx={{ width: 48, height: 48 }} />
                <Box>
                  <Typography fontWeight="bold">{user.nombre}</Typography>
                  <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                  {user.telefono && <Typography variant="body2" color="text.secondary">{user.telefono}</Typography>}
                </Box>
              </Box>
            ))
          )}
        </Paper>
      )}
    </Box>
  );
};

export default UsersList;
