import { ListItem, ListItemButton, ListItemIcon, ListItemText, Badge } from '@mui/material';
import type { ReactNode } from 'react';

interface SidebarMenuItemProps {
  icon: ReactNode;
  text: string;
  onClick: () => void;
  badgeContent?: number;
  color?: string;
}

const SidebarMenuItem = ({ icon, text, onClick, badgeContent, color }: SidebarMenuItemProps) => (
  <ListItem disablePadding sx={{ mb: 1 }}>
    <ListItemButton 
      onClick={onClick}
      sx={{
        mx: 2,
        borderRadius: 2,
        '&:hover': {
          backgroundColor: color || 'rgba(25, 118, 210, 0.1)',
          transform: 'translateX(4px)',
        },
        transition: 'all 0.2s ease',
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        {badgeContent !== undefined ? (
          <Badge badgeContent={badgeContent} color="primary" sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}>
            {icon}
          </Badge>
        ) : (
          icon
        )}
      </ListItemIcon>
      <ListItemText 
        primary={text} 
        primaryTypographyProps={{ fontSize: '0.95rem', color: 'text.primary' }}
      />
    </ListItemButton>
  </ListItem>
);

export default SidebarMenuItem;
