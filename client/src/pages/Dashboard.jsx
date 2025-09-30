/**
 * Dashboard Page
 * Main dashboard with statistics and overview
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  PhoneAndroid,
  Message,
  Contacts,
  Group,
  TrendingUp,
  Add,
} from '@mui/icons-material';
import { fetchSessions } from '../store/slices/sessionSlice';
import { fetchMessages } from '../store/slices/messageSlice';
import { openModal } from '../store/slices/uiSlice';

export default function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sessions, loading: sessionsLoading } = useSelector((state) => state.sessions);
  const { messages } = useSelector((state) => state.messages);
  const { contacts } = useSelector((state) => state.contacts);
  const { groups } = useSelector((state) => state.groups);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchSessions({ limit: 10 }));
    dispatch(fetchMessages({ limit: 10 }));
  }, [dispatch]);

  const stats = [
    {
      title: 'Active Sessions',
      value: sessions.filter(s => s.status === 'connected').length,
      total: sessions.length,
      icon: <PhoneAndroid sx={{ fontSize: 40 }} />,
      color: '#25D366',
      action: () => navigate('/sessions'),
    },
    {
      title: 'Messages Sent',
      value: messages.filter(m => m.direction === 'outgoing').length,
      total: messages.length,
      icon: <Message sx={{ fontSize: 40 }} />,
      color: '#128C7E',
      action: () => navigate('/chat'),
    },
    {
      title: 'Contacts',
      value: contacts.length,
      icon: <Contacts sx={{ fontSize: 40 }} />,
      color: '#34B7F1',
      action: () => navigate('/contacts'),
    },
    {
      title: 'Groups',
      value: groups.length,
      icon: <Group sx={{ fontSize: 40 }} />,
      color: '#FFA000',
      action: () => navigate('/groups'),
    },
  ];

  if (sessionsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Welcome back, {user?.firstName}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your WhatsApp API today
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => dispatch(openModal('createSession'))}
          size="large"
        >
          New Session
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
              onClick={stat.action}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                  {stat.total !== undefined && (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {stat.total}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="h4" fontWeight={600}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Sessions
                </Typography>
                <Button size="small" onClick={() => navigate('/sessions')}>
                  View All
                </Button>
              </Box>
              {sessions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No sessions yet. Create your first session to get started!
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => dispatch(openModal('createSession'))}
                    sx={{ mt: 2 }}
                  >
                    Create Session
                  </Button>
                </Box>
              ) : (
                <Box>
                  {sessions.slice(0, 5).map((session) => (
                    <Box
                      key={session.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {session.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {session.phone || 'Not connected'}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: session.status === 'connected' ? 'success.light' : 'warning.light',
                          color: session.status === 'connected' ? 'success.dark' : 'warning.dark',
                        }}
                      >
                        <Typography variant="caption" fontWeight={600}>
                          {session.status}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Recent Messages
                </Typography>
                <Button size="small" onClick={() => navigate('/chat')}>
                  View All
                </Button>
              </Box>
              {messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No messages yet. Start sending messages through your sessions!
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {messages.slice(0, 5).map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        py: 1.5,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={500}>
                          {message.direction === 'outgoing' ? `To: ${message.to}` : `From: ${message.from}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {message.body || message.type}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

