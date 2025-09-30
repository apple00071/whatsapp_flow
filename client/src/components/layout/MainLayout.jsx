/**
 * Main Layout Component
 * Layout for authenticated pages with sidebar and navbar
 */

import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import websocketService from '../../services/websocket';

const DRAWER_WIDTH = 260;

export default function MainLayout() {
  const { sidebarOpen } = useSelector((state) => state.ui);
  const { accessToken } = useSelector((state) => state.auth);

  // Connect to WebSocket on mount
  useEffect(() => {
    if (accessToken) {
      websocketService.connect(accessToken);
    }

    return () => {
      websocketService.disconnect();
    };
  }, [accessToken]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar drawerWidth={DRAWER_WIDTH} />
      <Sidebar drawerWidth={DRAWER_WIDTH} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 0}px)` },
          ml: { sm: sidebarOpen ? 0 : `-${DRAWER_WIDTH}px` },
          transition: (theme) =>
            theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          backgroundColor: (theme) => theme.palette.background.default,
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}

