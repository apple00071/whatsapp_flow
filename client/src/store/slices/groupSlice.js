/**
 * Group Redux Slice
 * Handles WhatsApp group state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  groups: [],
  currentGroup: null,
  loading: false,
  syncing: false,
  error: null,
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchGroups = createAsyncThunk(
  'groups/fetchAll',
  async ({ page = 1, limit = 50, sessionId } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (sessionId) params.sessionId = sessionId;
      
      const response = await api.get('/api/v1/groups', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch groups');
    }
  }
);

export const getGroup = createAsyncThunk(
  'groups/getOne',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/v1/groups/${groupId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch group');
    }
  }
);

export const createGroup = createAsyncThunk(
  'groups/create',
  async (groupData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/groups', groupData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create group');
    }
  }
);

export const updateGroup = createAsyncThunk(
  'groups/update',
  async ({ groupId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/v1/groups/${groupId}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update group');
    }
  }
);

export const syncGroups = createAsyncThunk(
  'groups/sync',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/v1/groups/sync', { sessionId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to sync groups');
    }
  }
);

export const addParticipants = createAsyncThunk(
  'groups/addParticipants',
  async ({ groupId, participants }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/groups/${groupId}/participants`, { participants });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to add participants');
    }
  }
);

export const removeParticipants = createAsyncThunk(
  'groups/removeParticipants',
  async ({ groupId, participants }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/v1/groups/${groupId}/participants`, {
        data: { participants },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to remove participants');
    }
  }
);

export const leaveGroup = createAsyncThunk(
  'groups/leave',
  async (groupId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/v1/groups/${groupId}/leave`);
      return { groupId, ...response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to leave group');
    }
  }
);

// Slice
const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearGroups: (state) => {
      state.groups = [];
    },
    setCurrentGroup: (state, action) => {
      state.currentGroup = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload.groups;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get group
      .addCase(getGroup.fulfilled, (state, action) => {
        state.currentGroup = action.payload;
      })
      // Create group
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groups.unshift(action.payload);
        state.currentGroup = action.payload;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update group
      .addCase(updateGroup.fulfilled, (state, action) => {
        const index = state.groups.findIndex(g => g.id === action.payload.id);
        if (index !== -1) {
          state.groups[index] = action.payload;
        }
        if (state.currentGroup?.id === action.payload.id) {
          state.currentGroup = action.payload;
        }
      })
      // Sync groups
      .addCase(syncGroups.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(syncGroups.fulfilled, (state, action) => {
        state.syncing = false;
        // Merge synced groups
        action.payload.groups.forEach(group => {
          const index = state.groups.findIndex(g => g.whatsappGroupId === group.whatsappGroupId);
          if (index !== -1) {
            state.groups[index] = group;
          } else {
            state.groups.push(group);
          }
        });
      })
      .addCase(syncGroups.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload;
      })
      // Add participants
      .addCase(addParticipants.fulfilled, (state, action) => {
        if (state.currentGroup?.id === action.payload.id) {
          state.currentGroup = action.payload;
        }
      })
      // Remove participants
      .addCase(removeParticipants.fulfilled, (state, action) => {
        if (state.currentGroup?.id === action.payload.id) {
          state.currentGroup = action.payload;
        }
      })
      // Leave group
      .addCase(leaveGroup.fulfilled, (state, action) => {
        state.groups = state.groups.filter(g => g.id !== action.payload.groupId);
        if (state.currentGroup?.id === action.payload.groupId) {
          state.currentGroup = null;
        }
      });
  },
});

export const { clearError, clearGroups, setCurrentGroup } = groupSlice.actions;
export default groupSlice.reducer;

