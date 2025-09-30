/**
 * Auth Layout Component
 * Layout for authentication pages (login, register, etc.)
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';
import { WhatsApp } from '@mui/icons-material';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <WhatsApp sx={{ fontSize: 60, color: 'white', mb: 2 }} />
          <Typography variant="h4" component="h1" sx={{ color: 'white', fontWeight: 600 }}>
            WhatsApp API Platform
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mt: 1 }}>
            Programmable Messaging for Developers
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          <Outlet />
        </Paper>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            © 2025 WhatsApp API Platform. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

