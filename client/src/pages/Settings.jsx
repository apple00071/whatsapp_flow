import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Schedule as ScheduleIcon,
  Construction as ConstructionIcon
} from '@mui/icons-material';

const Settings = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Alert
        severity="info"
        icon={<ConstructionIcon />}
        sx={{ mb: 3 }}
      >
        User settings are coming soon! This feature will allow you to configure your account preferences, notification settings, and API configurations.
      </Alert>

      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SettingsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              User Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Configure your account preferences, notifications, and API settings.
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

export default Settings;

