/**
 * Main Application Component
 * Handles routing and layout
 */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Main Pages
import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';
import Chat from './pages/Chat';
import Contacts from './pages/Contacts';
import Groups from './pages/Groups';
import Webhooks from './pages/Webhooks';
import ApiKeys from './pages/ApiKeys';
import Settings from './pages/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Actions
import { checkAuth } from './store/slices/authSlice';

/**
 * Protected Route Component
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/**
 * Admin Route Component
 */
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * Main App Component
 */
function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication status on app load
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      {/* Protected Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:sessionId" element={<Chat />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/webhooks" element={<Webhooks />} />
        <Route path="/api-keys" element={<ApiKeys />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <MainLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
      </Route>

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;

