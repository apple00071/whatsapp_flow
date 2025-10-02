import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  QrCode as QrCodeIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PhoneAndroid as PhoneIcon,
} from '@mui/icons-material';
import {
  fetchSessions,
  createSession,
  deleteSession,
  reconnectSession,
} from '../store/slices/sessionSlice';
import QRCodeDisplay from '../components/session/QRCodeDisplay';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Loading from '../components/common/Loading';

const Sessions = () => {
  const dispatch = useDispatch();
  const { sessions, loading, error } = useSelector((state) => state.sessions);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [newSessionName, setNewSessionName] = useState('');

  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  const [creatingSession, setCreatingSession] = useState(false);

  const handleCreateSession = async () => {
    if (!newSessionName.trim() || creatingSession) return;

    setCreatingSession(true);
    try {
      const result = await dispatch(createSession({ name: newSessionName })).unwrap();
      setCreateDialogOpen(false);
      setNewSessionName('');

      // Automatically show QR code for the newly created session
      setSelectedSession(result);
      setQrDialogOpen(true);
    } catch (err) {
      console.error('Failed to create session:', err);
      // Show error message to user
      alert(`Failed to create session: ${err.message || 'Unknown error'}`);
    } finally {
      setCreatingSession(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!selectedSession) return;
    
    try {
      await dispatch(deleteSession(selectedSession.id)).unwrap();
      setDeleteDialogOpen(false);
      setSelectedSession(null);
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleReconnect = async (sessionId) => {
    try {
      await dispatch(reconnectSession(sessionId)).unwrap();
    } catch (err) {
      console.error('Failed to reconnect session:', err);
    }
  };

  const handleShowQR = (session) => {
    setSelectedSession(session);
    setQrDialogOpen(true);
  };

  const handleDeleteClick = (session) => {
    setSelectedSession(session);
    setDeleteDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'connecting':
        return 'warning';
      case 'disconnected':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading && sessions.length === 0) {
    return <Loading message="Loading sessions..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">WhatsApp Sessions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          New Session
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {Array.isArray(sessions) && sessions.map((session) => (
          <Grid item xs={12} sm={6} md={4} key={session.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {session.name}
                  </Typography>
                  <Chip
                    label={session.status}
                    color={getStatusColor(session.status)}
                    size="small"
                  />
                </Box>
                
                {session.phoneNumber && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {session.phoneNumber}
                    </Typography>
                  </Box>
                )}
                
                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(session.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box>
                  {(session.status === 'disconnected' || session.status === 'qr' || session.status === 'initializing' || session.status === 'failed') && (
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleShowQR(session)}
                      title="Show QR Code"
                    >
                      <QrCodeIcon />
                    </IconButton>
                  )}
                  {session.status === 'connected' && (
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleReconnect(session.id)}
                      title="Reconnect"
                    >
                      <RefreshIcon />
                    </IconButton>
                  )}
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteClick(session)}
                  title="Delete Session"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {sessions.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No sessions yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Create your first WhatsApp session to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Session
          </Button>
        </Box>
      )}

      {/* Create Session Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Session Name"
            fullWidth
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            placeholder="e.g., My WhatsApp Business"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateSession} variant="contained" disabled={!newSessionName.trim() || creatingSession}>
            {creatingSession ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      {selectedSession && (
        <QRCodeDisplay
          open={qrDialogOpen}
          onClose={() => setQrDialogOpen(false)}
          sessionId={selectedSession.id}
          sessionName={selectedSession.name}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Session"
        message={`Are you sure you want to delete "${selectedSession?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteSession}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default Sessions;

