import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import {
  fetchApiKeys,
  createApiKey,
  deleteApiKey,
  revokeApiKey,
} from '../store/slices/apiKeySlice';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Loading from '../components/common/Loading';

const ApiKeys = () => {
  const dispatch = useDispatch();
  const { apiKeys, newApiKey, loading, error } = useSelector((state) => state.apiKeys);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [showKey, setShowKey] = useState({});

  useEffect(() => {
    dispatch(fetchApiKeys());
  }, [dispatch]);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    
    try {
      await dispatch(createApiKey({ name: newKeyName })).unwrap();
      setNewKeyName('');
    } catch (err) {
      console.error('Failed to create API key:', err);
    }
  };

  const handleDeleteKey = async () => {
    if (!selectedKey) return;
    
    try {
      await dispatch(deleteApiKey(selectedKey.id)).unwrap();
      setDeleteDialogOpen(false);
      setSelectedKey(null);
    } catch (err) {
      console.error('Failed to delete API key:', err);
    }
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
  };

  const toggleShowKey = (keyId) => {
    setShowKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskKey = (key) => {
    if (!key) return '';
    return key.substring(0, 8) + '...' + key.substring(key.length - 8);
  };

  if (loading && apiKeys.length === 0) {
    return <Loading message="Loading API keys..." />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">API Keys</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create API Key
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {newApiKey && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            API Key Created Successfully!
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {newApiKey}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Make sure to copy this key now. You won't be able to see it again!
          </Typography>
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Key</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Last Used</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apiKeys.map((apiKey) => (
              <TableRow key={apiKey.id}>
                <TableCell>{apiKey.name}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {showKey[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                    </Typography>
                    <Tooltip title={showKey[apiKey.id] ? 'Hide' : 'Show'}>
                      <IconButton size="small" onClick={() => toggleShowKey(apiKey.id)}>
                        {showKey[apiKey.id] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Copy">
                      <IconButton size="small" onClick={() => handleCopyKey(apiKey.key)}>
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={apiKey.isActive ? 'Active' : 'Revoked'}
                    color={apiKey.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(apiKey.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {apiKey.lastUsedAt
                    ? new Date(apiKey.lastUsedAt).toLocaleDateString()
                    : 'Never'}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      setSelectedKey(apiKey);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {apiKeys.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No API keys yet
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Create an API key to access the WhatsApp API programmatically
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create API Key
          </Button>
        </Box>
      )}

      {/* Create API Key Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New API Key</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Key Name"
            fullWidth
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="e.g., Production API Key"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Choose a descriptive name to identify this API key
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateKey} variant="contained" disabled={!newKeyName.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete API Key"
        message={`Are you sure you want to delete "${selectedKey?.name}"? Applications using this key will no longer be able to access the API.`}
        onConfirm={handleDeleteKey}
        onCancel={() => setDeleteDialogOpen(false)}
        confirmText="Delete"
        confirmColor="error"
      />
    </Box>
  );
};

export default ApiKeys;

