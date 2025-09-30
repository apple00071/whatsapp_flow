import { Box, Typography, Paper, Avatar } from '@mui/material';
import {
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const MessageBubble = ({ message, isOwn = false }) => {
  const getStatusIcon = () => {
    if (!isOwn) return null;

    switch (message.status) {
      case 'pending':
        return <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />;
      case 'sent':
        return <DoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />;
      case 'delivered':
        return <DoneAllIcon sx={{ fontSize: 16, color: 'text.secondary' }} />;
      case 'read':
        return <DoneAllIcon sx={{ fontSize: 16, color: 'primary.main' }} />;
      case 'failed':
        return <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />;
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {message.content || message.message}
          </Typography>
        );
      
      case 'image':
        return (
          <Box>
            {message.mediaUrl && (
              <img
                src={message.mediaUrl}
                alt="Message attachment"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px',
                  marginBottom: message.caption ? '8px' : 0,
                }}
              />
            )}
            {message.caption && (
              <Typography variant="body2">{message.caption}</Typography>
            )}
          </Box>
        );
      
      case 'video':
        return (
          <Box>
            {message.mediaUrl && (
              <video
                controls
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '8px',
                  marginBottom: message.caption ? '8px' : 0,
                }}
              >
                <source src={message.mediaUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            {message.caption && (
              <Typography variant="body2">{message.caption}</Typography>
            )}
          </Box>
        );
      
      case 'audio':
        return (
          <Box>
            {message.mediaUrl && (
              <audio controls style={{ maxWidth: '100%' }}>
                <source src={message.mediaUrl} type="audio/mpeg" />
                Your browser does not support the audio tag.
              </audio>
            )}
          </Box>
        );
      
      case 'document':
        return (
          <Box>
            <Typography variant="body2" color="primary">
              📄 {message.fileName || 'Document'}
            </Typography>
            {message.caption && (
              <Typography variant="body2" sx={{ mt: 1 }}>{message.caption}</Typography>
            )}
          </Box>
        );
      
      case 'location':
        return (
          <Box>
            <Typography variant="body2">
              📍 Location: {message.latitude}, {message.longitude}
            </Typography>
            {message.address && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {message.address}
              </Typography>
            )}
          </Box>
        );
      
      default:
        return (
          <Typography variant="body2" color="text.secondary">
            Unsupported message type: {message.type}
          </Typography>
        );
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        mb: 1,
      }}
    >
      {!isOwn && (
        <Avatar
          sx={{
            width: 32,
            height: 32,
            mr: 1,
            bgcolor: 'primary.main',
          }}
        >
          {message.from?.charAt(0) || 'U'}
        </Avatar>
      )}
      
      <Paper
        elevation={1}
        sx={{
          maxWidth: '70%',
          p: 1.5,
          bgcolor: isOwn ? 'primary.main' : 'background.paper',
          color: isOwn ? 'primary.contrastText' : 'text.primary',
          borderRadius: 2,
          borderTopRightRadius: isOwn ? 0 : 2,
          borderTopLeftRadius: isOwn ? 2 : 0,
        }}
      >
        {!isOwn && message.from && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 'bold',
              color: isOwn ? 'primary.contrastText' : 'primary.main',
              display: 'block',
              mb: 0.5,
            }}
          >
            {message.from}
          </Typography>
        )}
        
        {renderMessageContent()}
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 0.5,
            mt: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.7rem',
              color: isOwn ? 'primary.contrastText' : 'text.secondary',
              opacity: 0.8,
            }}
          >
            {message.timestamp
              ? format(new Date(message.timestamp), 'HH:mm')
              : format(new Date(message.createdAt || Date.now()), 'HH:mm')}
          </Typography>
          {getStatusIcon()}
        </Box>
      </Paper>
    </Box>
  );
};

export default MessageBubble;

