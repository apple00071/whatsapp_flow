/**
 * Webhook Redux Slice
 * Handles webhook state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  webhooks: [],
  currentWebhook: null,
  logs: [],
  loading: false,
  testing: false,
  error: null,
};

// Async thunks
export const fetchWebhooks = createAsyncThunk(
  'webhooks/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/webhooks');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch webhooks');
    }
  }
);

export const getWebhook = createAsyncThunk(
  'webhooks/getOne',
  async (webhookId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/webhooks/${webhookId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch webhook');
    }
  }
);

export const createWebhook = createAsyncThunk(
  'webhooks/create',
  async (webhookData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/webhooks', webhookData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create webhook');
    }
  }
);

export const updateWebhook = createAsyncThunk(
  'webhooks/update',
  async ({ webhookId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/webhooks/${webhookId}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update webhook');
    }
  }
);

export const deleteWebhook = createAsyncThunk(
  'webhooks/delete',
  async (webhookId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/webhooks/${webhookId}`);
      return webhookId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete webhook');
    }
  }
);

export const regenerateSecret = createAsyncThunk(
  'webhooks/regenerateSecret',
  async (webhookId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/webhooks/${webhookId}/regenerate-secret`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to regenerate secret');
    }
  }
);

export const testWebhook = createAsyncThunk(
  'webhooks/test',
  async (webhookId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/webhooks/${webhookId}/test`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to test webhook');
    }
  }
);

export const fetchWebhookLogs = createAsyncThunk(
  'webhooks/fetchLogs',
  async ({ webhookId, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/webhooks/${webhookId}/logs`, {
        params: { page, limit },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch webhook logs');
    }
  }
);

export const resetFailures = createAsyncThunk(
  'webhooks/resetFailures',
  async (webhookId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/webhooks/${webhookId}/reset-failures`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reset failures');
    }
  }
);

// Slice
const webhookSlice = createSlice({
  name: 'webhooks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentWebhook: (state, action) => {
      state.currentWebhook = action.payload;
    },
    clearLogs: (state) => {
      state.logs = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch webhooks
      .addCase(fetchWebhooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWebhooks.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure webhooks is always an array
        state.webhooks = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchWebhooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get webhook
      .addCase(getWebhook.fulfilled, (state, action) => {
        state.currentWebhook = action.payload;
      })
      // Create webhook
      .addCase(createWebhook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWebhook.fulfilled, (state, action) => {
        state.loading = false;
        state.webhooks.push(action.payload);
        state.currentWebhook = action.payload;
      })
      .addCase(createWebhook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update webhook
      .addCase(updateWebhook.fulfilled, (state, action) => {
        const index = state.webhooks.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.webhooks[index] = action.payload;
        }
        if (state.currentWebhook?.id === action.payload.id) {
          state.currentWebhook = action.payload;
        }
      })
      // Delete webhook
      .addCase(deleteWebhook.fulfilled, (state, action) => {
        state.webhooks = state.webhooks.filter(w => w.id !== action.payload);
        if (state.currentWebhook?.id === action.payload) {
          state.currentWebhook = null;
        }
      })
      // Regenerate secret
      .addCase(regenerateSecret.fulfilled, (state, action) => {
        const index = state.webhooks.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.webhooks[index] = action.payload;
        }
        if (state.currentWebhook?.id === action.payload.id) {
          state.currentWebhook = action.payload;
        }
      })
      // Test webhook
      .addCase(testWebhook.pending, (state) => {
        state.testing = true;
        state.error = null;
      })
      .addCase(testWebhook.fulfilled, (state) => {
        state.testing = false;
      })
      .addCase(testWebhook.rejected, (state, action) => {
        state.testing = false;
        state.error = action.payload;
      })
      // Fetch logs
      .addCase(fetchWebhookLogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWebhookLogs.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure logs is always an array
        state.logs = Array.isArray(action.payload.logs) ? action.payload.logs : [];
      })
      .addCase(fetchWebhookLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset failures
      .addCase(resetFailures.fulfilled, (state, action) => {
        const index = state.webhooks.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.webhooks[index] = action.payload;
        }
        if (state.currentWebhook?.id === action.payload.id) {
          state.currentWebhook = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentWebhook, clearLogs } = webhookSlice.actions;
export default webhookSlice.reducer;

