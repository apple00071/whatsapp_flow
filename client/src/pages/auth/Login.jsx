/**
 * Login Page
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { login, clearError } from '../../store/slices/authSlice';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login(formData));
    if (!result.error) {
      navigate('/dashboard');
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom fontWeight={600}>
        Welcome Back
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Sign in to your account to continue
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ textAlign: 'right', mb: 2 }}>
          <Link
            to="/forgot-password"
            style={{ textDecoration: 'none', color: '#25D366', fontSize: '0.875rem' }}
          >
            Forgot Password?
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ textDecoration: 'none', color: '#25D366', fontWeight: 600 }}
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </form>
    </Box>
  );
}

