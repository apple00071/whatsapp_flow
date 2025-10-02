/**
 * Session Redux Slice
 * Handles WhatsApp session state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  sessions: [],
  currentSession: null,
  qrCode: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchSessions = createAsyncThunk(
  'sessions/fetchAll',
  async ({ page = 1, limit = 20, status } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (status) params.status = status;
      
      const response = await api.get('/api/v1/sessions', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch sessions');
    }
  }
);

export const createSession = createAsyncThunk(
  'sessions/create',
  async (sessionData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/sessions', sessionData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create session');
    }
  }
);

export const getSession = createAsyncThunk(
  'sessions/getOne',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/sessions/${sessionId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch session');
    }
  }
);

export const updateSession = createAsyncThunk(
  'sessions/update',
  async ({ sessionId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/sessions/${sessionId}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update session');
    }
  }
);

export const deleteSession = createAsyncThunk(
  'sessions/delete',
  async (sessionId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/sessions/${sessionId}`);
      return sessionId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete session');
    }
  }
);

export const getQRCode = createAsyncThunk(
  'sessions/getQR',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/sessions/${sessionId}/qr`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get QR code');
    }
  }
);

export const reconnectSession = createAsyncThunk(
  'sessions/reconnect',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/sessions/${sessionId}/reconnect`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reconnect session');
    }
  }
);

// Slice
const sessionSlice = createSlice({
  name: 'sessions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearQRCode: (state) => {
      state.qrCode = null;
    },
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    },
    updateSessionStatus: (state, action) => {
      const { sessionId, status, phoneNumber, connectedAt } = action.payload;
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        session.status = status;
        if (phoneNumber) session.phoneNumber = phoneNumber;
        if (connectedAt) session.connectedAt = connectedAt;
      }
      if (state.currentSession?.id === sessionId) {
        state.currentSession.status = status;
        if (phoneNumber) state.currentSession.phoneNumber = phoneNumber;
        if (connectedAt) state.currentSession.connectedAt = connectedAt;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure sessions is always an array
        state.sessions = Array.isArray(action.payload.sessions) ? action.payload.sessions : [];
        state.pagination = action.payload.pagination || {};
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create session
      .addCase(createSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions.unshift(action.payload);
        state.currentSession = action.payload;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get session
      .addCase(getSession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
      })
      // Update session
      .addCase(updateSession.fulfilled, (state, action) => {
        const index = state.sessions.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
        if (state.currentSession?.id === action.payload.id) {
          state.currentSession = action.payload;
        }
      })
      // Delete session
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter(s => s.id !== action.payload);
        if (state.currentSession?.id === action.payload) {
          state.currentSession = null;
        }
      })
      // Get QR code
      .addCase(getQRCode.pending, (state) => {
        state.loading = true;
      })
      .addCase(getQRCode.fulfilled, (state, action) => {
        state.loading = false;
        state.qrCode = action.payload;
      })
      .addCase(getQRCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reconnect session
      .addCase(reconnectSession.fulfilled, (state, action) => {
        const index = state.sessions.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.sessions[index] = action.payload;
        }
        if (state.currentSession?.id === action.payload.id) {
          state.currentSession = action.payload;
        }
      });
  },
});

export const { clearError, clearQRCode, setCurrentSession, updateSessionStatus } = sessionSlice.actions;
export default sessionSlice.reducer;

