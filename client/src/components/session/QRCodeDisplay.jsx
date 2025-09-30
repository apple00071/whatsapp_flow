import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { useDispatch } from 'react-redux';
import { getQRCode } from '../../store/slices/sessionSlice';

const QRCodeDisplay = ({ open, onClose, sessionId, sessionName }) => {
  const dispatch = useDispatch();
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (open && sessionId) {
      fetchQRCode();
      
      // Auto-refresh QR code every 60 seconds
      const refreshInterval = setInterval(() => {
        fetchQRCode();
        setCountdown(60);
      }, 60000);

      // Countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 60));
      }, 1000);

      return () => {
        clearInterval(refreshInterval);
        clearInterval(countdownInterval);
      };
    }
  }, [open, sessionId]);

  const fetchQRCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await dispatch(getQRCode(sessionId)).unwrap();
      setQrCode(result.qr);
    } catch (err) {
      setError(err || 'Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setCountdown(60);
    fetchQRCode();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Scan QR Code - {sessionName}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          {loading ? (
            <Box sx={{ py: 4 }}>
              <CircularProgress size={60} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading QR Code...
              </Typography>
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : qrCode ? (
            <>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  p: 3,
                  bgcolor: 'white',
                  borderRadius: 2,
                  mb: 2,
                }}
              >
                <QRCodeSVG
                  value={qrCode}
                  size={280}
                  level="H"
                  includeMargin={true}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Open WhatsApp on your phone and scan this QR code
              </Typography>
              <Typography variant="caption" color="text.secondary">
                QR code refreshes in {countdown} seconds
              </Typography>
            </>
          ) : (
            <Alert severity="info">
              No QR code available. The session may already be connected.
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              How to scan:
            </Typography>
            <Typography variant="body2" color="text.secondary" align="left">
              1. Open WhatsApp on your phone
              <br />
              2. Tap Menu or Settings and select Linked Devices
              <br />
              3. Tap on Link a Device
              <br />
              4. Point your phone at this screen to capture the QR code
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleRefresh} disabled={loading}>
          Refresh QR Code
        </Button>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeDisplay;

