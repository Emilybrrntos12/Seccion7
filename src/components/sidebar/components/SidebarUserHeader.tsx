import { Box, Badge, Chip, Avatar, Typography, IconButton } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

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
  const theme = useTheme();
  return (
    <Box sx={{ p: 3, pb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <Chip
                label="Online"
                size="small"
                sx={{
                  height: 16,
                  fontSize: '0.6rem',
                  backgroundColor: theme.palette.success.main,
                  color: 'white',
                  '& .MuiChip-label': { px: 1 }
                }}
              />
            }
          >
            <Avatar
              src={user?.photoURL || undefined}
              sx={{
                width: 60,
                height: 60,
                border: `2px solid ${theme.palette.primary.main}`,
                backgroundColor: user?.photoURL ? 'transparent' : theme.palette.primary.main,
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}
            >
              {getInitials(user?.displayName || 'Usuario')}
            </Avatar>
          </Badge>

          <Box>
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              {user?.displayName || "Usuario"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.18),
            }
          }}
        >
          <ArrowBackIosIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default SidebarUserHeader;
