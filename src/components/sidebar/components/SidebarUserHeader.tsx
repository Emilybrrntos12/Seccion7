import { Box, Avatar, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Paleta de colores tierra
const palette = {
  primary: "#8B7355",
  secondary: "#A0522D",
  background: "#fffdf9",
  light: "#e8dcc8",
  dark: "#5d4037",
};

interface User {
  displayName?: string;
  email?: string;
  photoURL?: string;
}

interface SidebarUserHeaderProps {
  user: User;
  onClose: () => void;
  getInitials: (name: string) => string;
}

const SidebarUserHeader = ({ user, onClose, getInitials }: SidebarUserHeaderProps) => {
  return (
    <Box sx={{ p: 2, pb: 1.5 }}>
      <Box display="flex" alignItems="center" gap={1.5}>
        {/* Avatar compacto */}
        <Avatar
          src={user?.photoURL || undefined}
          sx={{
            width: 40,
            height: 40,
            border: `2px solid ${palette.light}`,
            backgroundColor: user?.photoURL ? 'transparent' : palette.primary,
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}
        >
          {getInitials(user?.displayName || 'U')}
        </Avatar>

        {/* Información compacta del usuario */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography 
            variant="subtitle2" 
            fontWeight="600" 
            sx={{ 
              color: palette.dark,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.2
            }}
          >
            {user?.displayName || "Usuario"}
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: palette.primary,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1
            }}
          >
            {user?.email}
          </Typography>
        </Box>

        {/* Botón de cerrar compacto */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: palette.primary,
            padding: 0.5,
            '&:hover': {
              backgroundColor: palette.light,
            }
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default SidebarUserHeader;