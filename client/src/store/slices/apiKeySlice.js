/**
 * API Key Redux Slice
 * Handles API key state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  apiKeys: [],
  currentApiKey: null,
  newApiKey: null, // Store newly created/regenerated key (shown only once)
  stats: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchApiKeys = createAsyncThunk(
  'apiKeys/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/v1/api-keys');
      return response.data.data.apiKeys || [];
    } catch (error) {
      // Handle structured error response from backend
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      // Handle generic error
      return rejectWithValue({
        code: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to fetch API keys',
        details: error.response?.data?.details || []
      });
    }
  }
);

export const getApiKey = createAsyncThunk(
  'apiKeys/getOne',
  async (apiKeyId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/api-keys/${apiKeyId}`);
      return response.data.data;
    } catch (error) {
      // Handle structured error response from backend
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      // Handle generic error
      return rejectWithValue({
        code: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to fetch API key',
        details: error.response?.data?.details || []
      });
    }
  }
);

export const createApiKey = createAsyncThunk(
  'apiKeys/create',
  async (apiKeyData, { rejectWithValue }) => {
    try {
      // Add default scopes if not provided
      const payload = {
        name: apiKeyData.name,
        scopes: apiKeyData.scopes || [
          'messages:read',
          'messages:write',
          'sessions:read',
          'sessions:write',
          'contacts:read',
          'contacts:write',
          'groups:read',
          'groups:write',
          'webhooks:read',
          'webhooks:write',
        ],
        ...apiKeyData
      };

      const response = await api.post('/api/v1/api-keys', payload);
      return response.data.data;
    } catch (error) {
      // Handle structured error response from backend
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      // Handle generic error
      return rejectWithValue({
        code: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to create API key',
        details: error.response?.data?.details || []
      });
    }
  }
);

export const updateApiKey = createAsyncThunk(
  'apiKeys/update',
  async ({ apiKeyId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/api-keys/${apiKeyId}`, data);
      return response.data.data;
    } catch (error) {
      // Handle structured error response from backend
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      // Handle generic error
      return rejectWithValue({
        code: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to update API key',
        details: error.response?.data?.details || []
      });
    }
  }
);

export const deleteApiKey = createAsyncThunk(
  'apiKeys/delete',
  async (apiKeyId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/v1/api-keys/${apiKeyId}`);
      return apiKeyId;
    } catch (error) {
      // Handle structured error response from backend
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      // Handle generic error
      return rejectWithValue({
        code: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to delete API key',
        details: error.response?.data?.details || []
      });
    }
  }
);

export const revokeApiKey = createAsyncThunk(
  'apiKeys/revoke',
  async (apiKeyId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/api-keys/${apiKeyId}/revoke`);
      return response.data.data;
    } catch (error) {
      // Handle structured error response from backend
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      // Handle generic error
      return rejectWithValue({
        code: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to revoke API key',
        details: error.response?.data?.details || []
      });
    }
  }
);

export const regenerateApiKey = createAsyncThunk(
  'apiKeys/regenerate',
  async (apiKeyId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/api-keys/${apiKeyId}/regenerate`);
      return response.data.data;
    } catch (error) {
      // Handle structured error response from backend
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      // Handle generic error
      return rejectWithValue({
        code: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to regenerate API key',
        details: error.response?.data?.details || []
      });
    }
  }
);

export const getApiKeyStats = createAsyncThunk(
  'apiKeys/getStats',
  async (apiKeyId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/api-keys/${apiKeyId}/stats`);
      return response.data.data;
    } catch (error) {
      // Handle structured error response from backend
      if (error.response?.data?.error) {
        return rejectWithValue(error.response.data.error);
      }
      // Handle generic error
      return rejectWithValue({
        code: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to fetch API key stats',
        details: error.response?.data?.details || []
      });
    }
  }
);

// Slice
const apiKeySlice = createSlice({
  name: 'apiKeys',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearNewApiKey: (state) => {
      state.newApiKey = null;
    },
    setCurrentApiKey: (state, action) => {
      state.currentApiKey = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch API keys
      .addCase(fetchApiKeys.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApiKeys.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure apiKeys is always an array
        state.apiKeys = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchApiKeys.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get API key
      .addCase(getApiKey.fulfilled, (state, action) => {
        state.currentApiKey = action.payload;
      })
      // Create API key
      .addCase(createApiKey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createApiKey.fulfilled, (state, action) => {
        state.loading = false;
        state.apiKeys.push(action.payload.apiKey);
        state.newApiKey = action.payload.key; // Store the actual key (shown only once)
        state.currentApiKey = action.payload.apiKey;
      })
      .addCase(createApiKey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update API key
      .addCase(updateApiKey.fulfilled, (state, action) => {
        const index = state.apiKeys.findIndex(k => k.id === action.payload.id);
        if (index !== -1) {
          state.apiKeys[index] = action.payload;
        }
        if (state.currentApiKey?.id === action.payload.id) {
          state.currentApiKey = action.payload;
        }
      })
      // Delete API key
      .addCase(deleteApiKey.fulfilled, (state, action) => {
        state.apiKeys = state.apiKeys.filter(k => k.id !== action.payload);
        if (state.currentApiKey?.id === action.payload) {
          state.currentApiKey = null;
        }
      })
      // Revoke API key
      .addCase(revokeApiKey.fulfilled, (state, action) => {
        const index = state.apiKeys.findIndex(k => k.id === action.payload.id);
        if (index !== -1) {
          state.apiKeys[index] = action.payload;
        }
        if (state.currentApiKey?.id === action.payload.id) {
          state.currentApiKey = action.payload;
        }
      })
      // Regenerate API key
      .addCase(regenerateApiKey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(regenerateApiKey.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.apiKeys.findIndex(k => k.id === action.payload.apiKey.id);
        if (index !== -1) {
          state.apiKeys[index] = action.payload.apiKey;
        }
        state.newApiKey = action.payload.key; // Store the new key (shown only once)
        state.currentApiKey = action.payload.apiKey;
      })
      .addCase(regenerateApiKey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get API key stats
      .addCase(getApiKeyStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearError, clearNewApiKey, setCurrentApiKey } = apiKeySlice.actions;
export default apiKeySlice.reducer;

