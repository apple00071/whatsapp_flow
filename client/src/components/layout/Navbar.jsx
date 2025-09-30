/**
 * Navbar Component
 * Top navigation bar with user menu and notifications
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications,
  Settings,
  Logout,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar, toggleTheme } from '../../store/slices/uiSlice';

export default function Navbar({ drawerWidth }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme, notifications } = useSelector((state) => state.ui);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotifMenu = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/settings');
  };

  const handleSettings = () => {
    handleClose();
    navigate('/settings');
  };

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        color: 'text.primary',
      }}
      elevation={1}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          edge="start"
          onClick={() => dispatch(toggleSidebar())}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          WhatsApp API Platform
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme Toggle */}
          <IconButton onClick={handleToggleTheme} color="inherit">
            {theme === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>

          {/* Notifications */}
          <IconButton
            color="inherit"
            onClick={handleNotifMenu}
          >
            <Badge badgeContent={notifications.length} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={handleNotifClose}
            PaperProps={{
              sx: { width: 320, maxHeight: 400 },
            }}
          >
            <MenuItem disabled>
              <Typography variant="subtitle2">Notifications</Typography>
            </MenuItem>
            <Divider />
            {notifications.length === 0 ? (
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  No new notifications
                </Typography>
              </MenuItem>
            ) : (
              notifications.map((notif) => (
                <MenuItem key={notif.id} onClick={handleNotifClose}>
                  <Typography variant="body2">{notif.message}</Typography>
                </MenuItem>
              ))
            )}
          </Menu>

          {/* User Menu */}
          <IconButton
            onClick={handleMenu}
            color="inherit"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
              }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              sx: { width: 220 },
            }}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profile</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

