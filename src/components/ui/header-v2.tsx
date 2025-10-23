import React from "react";
import { AppBar, Toolbar, Typography, Box, IconButton, InputBase, Avatar, Button, Badge, Drawer, List, ListItem, ListItemText, ListItemButton, Divider } from "@mui/material";
import { Menu, MenuItem } from "@mui/material";
import { ShoppingCart, Favorite, Person, Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import ForumIcon from '@mui/icons-material/Forum';
import { useUser } from "reactfire";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from '@/hooks/use-auth-actions';
import { useUnreadMessages } from '@/hooks/use-unread-messages';

const menuItems = [
  { label: "Inicio", path: "/" },
  { label: "Nosotros", path: "/nosotros" },
  { label: "Contacto", path: "/contacto" },
];

const Header2: React.FC = () => {
  const { data: user } = useUser();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Responsive Drawer
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  const navigate = useNavigate();
  const { logout } = useAuthActions();
  const unreadCount = useUnreadMessages(false);

  const [search, setSearch] = React.useState("");
  React.useEffect(() => {
    localStorage.setItem("searchText", search);
    window.dispatchEvent(new Event("storage")); // Notifica el cambio a otros componentes
  }, [search]);

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={1}
      sx={{
        background: 'transparent',
        border: '1px solid transparent',
        boxShadow: 'none',
        position: 'absolute',
        top: 10,
        left: 0,
        right: 0,
        zIndex: 1000
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: { xs: 1, md: 2 },
          px: { xs: 1, md: 3 },
          py: 1,
          minHeight: { xs: 56, md: 64 }
        }}
      >
        {/* Logo y menú hamburguesa */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 120 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerOpen}
            sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
          >
            <MenuIcon sx={{ color: '#8B7355', fontSize: 28 }} />
          </IconButton>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              cursor: "pointer",
              background: 'linear-gradient(45deg, #8B7355, #A0522D)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              fontSize: { xs: "1.1rem", md: "1.5rem" },
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-1px)'
              }
            }}
            onClick={() => navigate("/")}
          >
            ZABARR
          </Typography>
        </Box>

        {/* Menú principal - ocultar en xs, Drawer en xs */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          {menuItems.map((item) => (
            <Button
              key={item.label}
              color="inherit"
              onClick={() => navigate(item.path)}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.95rem',
                color: '#8B7355',
                borderRadius: 2,
                px: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerClose}
          sx={{ display: { xs: 'block', md: 'none' } }}
          PaperProps={{ sx: { width: 240, background: '#fffdf9', borderRight: '1px solid #e8dcc8' } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#8B7355' }}>Menú</Typography>
            <IconButton onClick={handleDrawerClose}>
              <CloseIcon sx={{ color: '#8B7355' }} />
            </IconButton>
          </Box>
          <Divider />
          <List>
            {menuItems.map((item) => (
              <ListItem disablePadding key={item.label}>
                <ListItemButton onClick={() => { navigate(item.path); handleDrawerClose(); }}>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600, color: '#8B7355' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Barra de búsqueda */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mx: { xs: 0, md: 2 },
          flex: 1,
          maxWidth: { xs: '100%', md: 400 },
          minWidth: { xs: '100%', md: 250 },
          my: { xs: 1, md: 0 },
          order: { xs: 3, md: 2 },
        }}>
          <InputBase
            placeholder="Buscar productos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{
              backgroundColor: "#fffdf9",
              border: '1px solid #e8dcc8',
              px: 2,
              py: 1,
              borderRadius: 2,
              width: "100%",
              fontSize: "0.95rem",
              color: '#8B7355',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#8B7355',
              },
              '&:focus-within': {
                borderColor: '#8B7355',
                borderWidth: '2px'
              },
              '&::placeholder': {
                color: '#D2C1B0'
              }
            }}
            inputProps={{ 'aria-label': 'buscar' }}
          />
        </Box>

        {/* Íconos */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 0.5, md: 1.5 },
          minWidth: 120,
          justifyContent: 'flex-end',
          order: { xs: 2, md: 3 }
        }}>
          <IconButton
            onClick={() => navigate("/chat")}
            sx={{
              color: '#8B7355',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#A0522D',
                background: 'rgba(139, 115, 85, 0.08)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <ForumIcon />
            </Badge>
          </IconButton>
          <IconButton
            onClick={() => navigate("/favoritos")}
            sx={{
              color: '#8B7355',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#A0522D',
                background: 'rgba(139, 115, 85, 0.08)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <Favorite />
          </IconButton>
          <IconButton
            onClick={() => navigate("/cart")}
            sx={{
              color: '#8B7355',
              transition: 'all 0.2s ease',
              '&:hover': {
                color: '#A0522D',
                background: 'rgba(139, 115, 85, 0.08)',
                transform: 'scale(1.1)'
              }
            }}
          >
            <Badge badgeContent={0} color="error">
              <ShoppingCart />
            </Badge>
          </IconButton>
          {user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                src={user.photoURL || undefined}
                sx={{
                  width: { xs: 32, md: 36 },
                  height: { xs: 32, md: 36 },
                  border: '2px solid #e8dcc8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#8B7355',
                    transform: 'scale(1.05)'
                  }
                }}
                onClick={handleMenuOpen}
              />
              <Typography
                variant="body2"
                fontWeight="600"
                sx={{
                  fontSize: { xs: "0.85rem", md: "0.95rem" },
                  cursor: "pointer",
                  color: '#8B7355',
                  display: { xs: 'none', sm: 'block' }
                }}
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
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    border: '1px solid #e8dcc8',
                    background: '#fffdf9',
                    mt: 1,
                    minWidth: 160
                  }
                }}
              >
                {user.providerData?.some((prov: { providerId: string }) => prov.providerId === "google.com") && (
                  <MenuItem
                    onClick={() => { handleMenuClose(); navigate("/perfil"); }}
                    sx={{
                      color: '#8B7355',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      '&:hover': {
                        background: 'rgba(139, 115, 85, 0.08)',
                        color: '#A0522D'
                      }
                    }}
                  >
                    Ver perfil
                  </MenuItem>
                )}
                <MenuItem
                  onClick={() => { handleMenuClose(); logout(); }}
                  sx={{
                    color: '#8B7355',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    '&:hover': {
                      background: 'rgba(139, 115, 85, 0.08)',
                      color: '#A0522D'
                    }
                  }}
                >
                  Cerrar sesión
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <IconButton
              onClick={() => navigate("/auth/login")}
              sx={{
                color: '#8B7355',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: '#A0522D',
                  background: 'rgba(139, 115, 85, 0.08)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Person />
            </IconButton>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header2;