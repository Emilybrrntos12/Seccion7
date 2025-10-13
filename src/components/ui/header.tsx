import React from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, InputBase, Avatar, Button, Badge } from "@mui/material";
import { ShoppingCart, Favorite, Person } from "@mui/icons-material";
import LogoutIcon from '@mui/icons-material/Logout';
import { useUser } from "reactfire";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from '@/hooks/use-auth-actions';

const menuItems = [
  { label: "Inicio", path: "/" },
  { label: "Catálogo", path: "/catalogo" },
  { label: "Nosotros", path: "/nosotros" },
  { label: "Contacto", path: "/contacto" },
];

const Header: React.FC = () => {
  const { data: user } = useUser();
  const navigate = useNavigate();
  const { logout } = useAuthActions();

  return (
    <AppBar position="static" color="inherit" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo / Nombre */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ cursor: "pointer", color: "primary.main" }}
            onClick={() => navigate("/")}
          >
            MiTienda
          </Typography>
        </Box>

        {/* Menú principal */}
        <Box sx={{ display: "flex", gap: 2 }}>
          {menuItems.map((item) => (
            <Button
              key={item.label}
              color="inherit"
              onClick={() => navigate(item.path)}
              sx={{ fontWeight: "bold", textTransform: "none" }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Barra de búsqueda */}
        <Box sx={{ display: "flex", alignItems: "center", mx: 2, flex: 1, maxWidth: 300 }}>
          <InputBase
            placeholder="Buscar productos..."
            sx={{
              backgroundColor: "#f1f3f4",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              width: "100%",
              fontSize: "0.95rem",
            }}
            inputProps={{ 'aria-label': 'buscar' }}
          />
        </Box>

        {/* Íconos */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton color="primary" onClick={() => navigate("/favoritos")}>
            <Favorite />
          </IconButton>
          <IconButton color="primary" onClick={() => navigate("/cart")}>
            <Badge badgeContent={0} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
          {user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar src={user.photoURL || undefined} sx={{ width: 32, height: 32 }} />
              <Typography variant="body2" fontWeight="bold">
                {user.displayName || "Usuario"}
              </Typography>
              <IconButton color="error" onClick={logout} title="Cerrar sesión">
                <LogoutIcon />
              </IconButton>
            </Box>
          ) : (
            <IconButton color="primary" onClick={() => navigate("/auth/login")}> <Person /> </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
