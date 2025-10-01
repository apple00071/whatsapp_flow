/**
 * Message Redux Slice
 * Handles message state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  messages: [],
  loading: false,
  sending: false,
  error: null,
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetchAll',
  async ({ sessionId, page = 1, limit = 50, phone } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (sessionId) params.sessionId = sessionId;
      if (phone) params.phone = phone;
      
      const response = await api.get('/api/v1/messages', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch messages');
    }
  }
);

export const sendTextMessage = createAsyncThunk(
  'messages/sendText',
  async (messageData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/messages/send', messageData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send message');
    }
  }
);

export const sendMediaMessage = createAsyncThunk(
  'messages/sendMedia',
  async ({ sessionId, to, file, caption, type }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('to', to);
      formData.append('file', file);
      if (caption) formData.append('caption', caption);
      if (type) formData.append('type', type);

      const response = await api.post('/api/v1/messages/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send media');
    }
  }
);

export const sendLocationMessage = createAsyncThunk(
  'messages/sendLocation',
  async (locationData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/messages/location', locationData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to send location');
    }
  }
);

export const getMessage = createAsyncThunk(
  'messages/getOne',
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/messages/${messageId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch message');
    }
  }
);

export const getMessageStatus = createAsyncThunk(
  'messages/getStatus',
  async (messageId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/messages/${messageId}/status`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch message status');
    }
  }
);

// Slice
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;
      const message = state.messages.find(m => m.id === messageId);
      if (message) {
        message.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure messages is always an array
        state.messages = Array.isArray(action.payload.messages) ? action.payload.messages : [];
        state.pagination = action.payload.pagination || {};
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send text message
      .addCase(sendTextMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendTextMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.messages.push(action.payload);
      })
      .addCase(sendTextMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })
      // Send media message
      .addCase(sendMediaMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendMediaMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMediaMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })
      // Send location message
      .addCase(sendLocationMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendLocationMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.messages.push(action.payload);
      })
      .addCase(sendLocationMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })
      // Get message
      .addCase(getMessage.fulfilled, (state, action) => {
        const index = state.messages.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        } else {
          state.messages.push(action.payload);
        }
      })
      // Get message status
      .addCase(getMessageStatus.fulfilled, (state, action) => {
        const message = state.messages.find(m => m.id === action.payload.messageId);
        if (message) {
          message.status = action.payload.status;
        }
      });
  },
});

export const { clearError, clearMessages, addMessage, updateMessageStatus } = messageSlice.actions;
export default messageSlice.reducer;

