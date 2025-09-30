/**
 * Sidebar Component
 * Side navigation menu
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  PhoneAndroid,
  Chat,
  Contacts,
  Group,
  Webhook,
  Key,
  Settings,
  AdminPanelSettings,
} from '@mui/icons-material';

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Sessions', icon: <PhoneAndroid />, path: '/sessions' },
  { text: 'Chat', icon: <Chat />, path: '/chat' },
  { text: 'Contacts', icon: <Contacts />, path: '/contacts' },
  { text: 'Groups', icon: <Group />, path: '/groups' },
  { text: 'Webhooks', icon: <Webhook />, path: '/webhooks' },
  { text: 'API Keys', icon: <Key />, path: '/api-keys' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

const adminItems = [
  { text: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin', badge: 'Admin' },
];

export default function Sidebar({ drawerWidth }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="persistent"
      open={sidebarOpen}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', py: 2 }}>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 0.5 }}>
              <ListItemButton
                selected={isActive(item.path)}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive(item.path) ? 'white' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive(item.path) ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <>
            <Divider sx={{ my: 2 }} />
            <List>
              {adminItems.map((item) => (
                <ListItem key={item.text} disablePadding sx={{ px: 2, mb: 0.5 }}>
                  <ListItemButton
                    selected={isActive(item.path)}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 2,
                      '&.Mui-selected': {
                        backgroundColor: 'secondary.main',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'secondary.dark',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive(item.path) ? 'white' : 'text.secondary',
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive(item.path) ? 600 : 400,
                      }}
                    />
                    {item.badge && (
                      <Chip
                        label={item.badge}
                        size="small"
                        color="secondary"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Box>
    </Drawer>
  );
}

