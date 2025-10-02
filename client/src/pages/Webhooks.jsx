import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert
} from '@mui/material';
import {
  Webhook as WebhookIcon,
  Schedule as ScheduleIcon,
  Construction as ConstructionIcon
} from '@mui/icons-material';

const Webhooks = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Webhooks
      </Typography>

      <Alert
        severity="info"
        icon={<ConstructionIcon />}
        sx={{ mb: 3 }}
      >
        Webhook configuration is coming soon! This feature will allow you to set up webhooks to receive real-time notifications about WhatsApp events.
      </Alert>

      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <WebhookIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Webhook Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Set up webhooks to receive real-time notifications about messages, status changes, and other WhatsApp events.
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Chip
                label="Coming Soon"
                color="primary"
                variant="outlined"
                icon={<ScheduleIcon />}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Webhooks;

