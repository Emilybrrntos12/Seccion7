import React from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, InputBase, Avatar, Button, Badge } from "@mui/material";
import { Menu, MenuItem } from "@mui/material";
import { ShoppingCart, Favorite, Person } from "@mui/icons-material";
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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const navigate = useNavigate();
  const { logout } = useAuthActions();

  // Estado de búsqueda global
  const [search, setSearch] = React.useState("");
  // Guardar el texto en localStorage para persistencia entre páginas
  React.useEffect(() => {
    localStorage.setItem("searchText", search);
  }, [search]);

  return (
    <AppBar position="static" color="inherit" elevation={1}>
      <Toolbar
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: { xs: 1, md: 2 },
          px: { xs: 1, md: 3 },
        }}
      >
        {/* Logo / Nombre */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 120 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ cursor: "pointer", color: "primary.main", fontSize: { xs: "1.1rem", md: "1.5rem" } }}
            onClick={() => navigate("/")}
          >
            MiTienda
          </Typography>
        </Box>

        {/* Menú principal - ocultar en xs */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          {menuItems.map((item) => (
            <Button
              key={item.label}
              color="inherit"
              onClick={() => navigate(item.path)}
              sx={{ fontWeight: "bold", textTransform: "none", fontSize: { xs: "0.9rem", md: "1rem" } }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Barra de búsqueda - ocupa toda la fila en xs */}
        <Box sx={{
          display: "flex",
          alignItems: "center",
          mx: { xs: 0, md: 2 },
          flex: 1,
          maxWidth: { xs: "100%", md: 300 },
          minWidth: { xs: "100%", md: 200 },
          my: { xs: 1, md: 0 },
        }}>
          <InputBase
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{
              backgroundColor: "#f1f3f4",
              px: 2,
              py: 0.5,
              borderRadius: 2,
              width: "100%",
              fontSize: { xs: "0.95rem", md: "1rem" },
            }}
            inputProps={{ 'aria-label': 'buscar' }}
          />
        </Box>

        {/* Íconos */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1 }, minWidth: 120 }}>
          <IconButton color="primary" onClick={() => navigate("/favoritos")}> 
            <Favorite />
          </IconButton>
          <IconButton color="primary" onClick={() => navigate("/cart")}> 
            <Badge badgeContent={0} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
          {user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1 } }}>
              <Avatar src={user.photoURL || undefined} sx={{ width: { xs: 28, md: 32 }, height: { xs: 28, md: 32 } }} />
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ fontSize: { xs: "0.85rem", md: "1rem" }, cursor: "pointer" }}
                onClick={handleMenuOpen}
              >
                {user.displayName || "Usuario"}
              </Typography>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {/* Solo mostrar si el usuario se autenticó por Google */}
                {user.providerData?.some((prov: { providerId: string }) => prov.providerId === "google.com") && (
                  <MenuItem onClick={() => { handleMenuClose(); navigate("/perfil"); }}>Editar perfil</MenuItem>
                )}
                <MenuItem onClick={() => { handleMenuClose(); logout(); }}>Cerrar sesión</MenuItem>
              </Menu>
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
