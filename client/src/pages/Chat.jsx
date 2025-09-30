import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Divider,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
} from '@mui/icons-material';
import { fetchSessions } from '../store/slices/sessionSlice';
import { fetchMessages, sendTextMessage } from '../store/slices/messageSlice';
import MessageBubble from '../components/chat/MessageBubble';
import Loading from '../components/common/Loading';

const Chat = () => {
  const dispatch = useDispatch();
  const { sessions } = useSelector((state) => state.sessions);
  const { messages, loading, error } = useSelector((state) => state.messages);
  
  const [selectedSession, setSelectedSession] = useState('');
  const [messageText, setMessageText] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  useEffect(() => {
    if (selectedSession) {
      dispatch(fetchMessages({ sessionId: selectedSession, limit: 50 }));
    }
  }, [selectedSession, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !phoneNumber.trim() || !selectedSession) return;

    try {
      await dispatch(sendTextMessage({
        sessionId: selectedSession,
        to: phoneNumber,
        message: messageText,
      })).unwrap();
      
      setMessageText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const connectedSessions = sessions.filter(s => s.status === 'connected');

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Session</InputLabel>
          <Select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            label="Select Session"
          >
            {connectedSessions.map((session) => (
              <MenuItem key={session.id} value={session.id}>
                {session.name} ({session.phoneNumber})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="1234567890"
          sx={{ minWidth: 200 }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!selectedSession ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Select a session to start chatting
          </Typography>
        </Box>
      ) : (
        <>
          <Paper
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 2,
              mb: 2,
              bgcolor: '#f5f5f5',
            }}
          >
            {loading && messages.length === 0 ? (
              <Loading message="Loading messages..." />
            ) : messages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No messages yet. Start a conversation!
                </Typography>
              </Box>
            ) : (
              <>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.direction === 'outgoing'}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
              <IconButton size="small" color="primary">
                <AttachFileIcon />
              </IconButton>
              <IconButton size="small" color="primary">
                <EmojiIcon />
              </IconButton>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!selectedSession || !phoneNumber}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!messageText.trim() || !phoneNumber.trim() || !selectedSession}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default Chat;

