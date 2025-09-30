/**
 * WebSocket Service
 * Socket.IO client for real-time updates
 */

import { io } from 'socket.io-client';
import store from '../store';
import { updateSessionStatus } from '../store/slices/sessionSlice';
import { addMessage, updateMessageStatus } from '../store/slices/messageSlice';
import { addNotification } from '../store/slices/uiSlice';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  /**
   * Connect to WebSocket server
   */
  connect(token) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connected = true;
      store.dispatch(addNotification({
        type: 'success',
        message: 'Connected to real-time updates',
        duration: 2000,
      }));
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.connected = false;
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      store.dispatch(addNotification({
        type: 'error',
        message: 'WebSocket connection error',
      }));
    });

    // Session events
    this.socket.on('session:status', (data) => {
      console.log('Session status update:', data);
      store.dispatch(updateSessionStatus({
        sessionId: data.sessionId,
        status: data.status,
      }));
      
      store.dispatch(addNotification({
        type: 'info',
        message: `Session ${data.sessionName || data.sessionId} is now ${data.status}`,
      }));
    });

    this.socket.on('session:qr', (data) => {
      console.log('QR code received for session:', data.sessionId);
      // QR code will be fetched via API when needed
    });

    // Message events
    this.socket.on('message:received', (data) => {
      console.log('Message received:', data);
      store.dispatch(addMessage(data.message));
      
      store.dispatch(addNotification({
        type: 'info',
        message: `New message from ${data.message.from}`,
      }));
    });

    this.socket.on('message:sent', (data) => {
      console.log('Message sent:', data);
      store.dispatch(addMessage(data.message));
    });

    this.socket.on('message:status', (data) => {
      console.log('Message status update:', data);
      store.dispatch(updateMessageStatus({
        messageId: data.messageId,
        status: data.status,
      }));
    });

    // Group events
    this.socket.on('group:update', (data) => {
      console.log('Group update:', data);
      store.dispatch(addNotification({
        type: 'info',
        message: `Group ${data.groupName} was updated`,
      }));
    });

    // Webhook events
    this.socket.on('webhook:delivery', (data) => {
      console.log('Webhook delivery:', data);
      if (data.success) {
        store.dispatch(addNotification({
          type: 'success',
          message: `Webhook delivered successfully`,
          duration: 2000,
        }));
      } else {
        store.dispatch(addNotification({
          type: 'error',
          message: `Webhook delivery failed: ${data.error}`,
        }));
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Join a session room for real-time updates
   */
  joinSession(sessionId) {
    if (this.socket?.connected) {
      this.socket.emit('join:session', { sessionId });
    }
  }

  /**
   * Leave a session room
   */
  leaveSession(sessionId) {
    if (this.socket?.connected) {
      this.socket.emit('leave:session', { sessionId });
    }
  }

  /**
   * Send a message via WebSocket
   */
  sendMessage(data) {
    if (this.socket?.connected) {
      this.socket.emit('message:send', data);
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;

