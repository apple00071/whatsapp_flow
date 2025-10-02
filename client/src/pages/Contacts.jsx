import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert
} from '@mui/material';
import {
  Contacts as ContactsIcon,
  Schedule as ScheduleIcon,
  Construction as ConstructionIcon
} from '@mui/icons-material';

const Contacts = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Contacts
      </Typography>

      <Alert
        severity="info"
        icon={<ConstructionIcon />}
        sx={{ mb: 3 }}
      >
        Contact management is coming soon! This feature will allow you to manage your WhatsApp contacts, create contact lists, and send bulk messages.
      </Alert>

      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ContactsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Contact Management
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Manage your WhatsApp contacts, create groups, and send targeted messages.
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

export default Contacts;

