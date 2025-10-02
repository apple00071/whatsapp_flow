import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert
} from '@mui/material';
import {
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  Construction as ConstructionIcon
} from '@mui/icons-material';

const Groups = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Groups
      </Typography>

      <Alert
        severity="info"
        icon={<ConstructionIcon />}
        sx={{ mb: 3 }}
      >
        Group management is coming soon! This feature will allow you to manage WhatsApp groups, add/remove participants, and send group messages.
      </Alert>

      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Group Management
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Manage your WhatsApp groups, add participants, and send group broadcasts.
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

export default Groups;

