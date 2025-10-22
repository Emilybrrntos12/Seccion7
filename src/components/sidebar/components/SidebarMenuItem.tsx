import { ListItem, ListItemButton, ListItemIcon, ListItemText, Badge } from '@mui/material';
import type { ReactNode } from 'react';

interface SidebarMenuItemProps {
  icon: ReactNode;
  text: string;
  onClick: () => void;
  badgeContent?: number;
  color?: string;
  description?: string;
  isHighlighted?: boolean;
  badgeColor?: string;
}

const SidebarMenuItem = ({ icon, text, onClick, badgeContent, color, description, isHighlighted, badgeColor }: SidebarMenuItemProps) => (
  <ListItem disablePadding sx={{ mb: 1 }}>
    <ListItemButton 
      onClick={onClick}
      sx={{
        mx: 2,
        borderRadius: 2,
        backgroundColor: isHighlighted ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
        '&:hover': {
          backgroundColor: color || 'rgba(25, 118, 210, 0.1)',
          transform: 'translateX(4px)',
        },
        transition: 'all 0.2s ease',
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        {badgeContent !== undefined ? (
          <Badge 
            badgeContent={badgeContent} 
            color="primary"
            sx={{ 
              '& .MuiBadge-badge': { 
                fontSize: '0.6rem', 
                height: 16, 
                minWidth: 16,
                backgroundColor: badgeColor || undefined
              } 
            }}
          >
            {icon}
          </Badge>
        ) : (
          icon
        )}
      </ListItemIcon>
      <ListItemText 
        primary={text}
        secondary={description}
        primaryTypographyProps={{ fontSize: '0.95rem', color: 'text.primary' }}
        secondaryTypographyProps={{ fontSize: '0.75rem' }}
      />
    </ListItemButton>
  </ListItem>
);

export default SidebarMenuItem;
