/**
 * Contact Redux Slice
 * Handles contact state
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Initial state
const initialState = {
  contacts: [],
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
export const fetchContacts = createAsyncThunk(
  'contacts/fetchAll',
  async ({ page = 1, limit = 50, search, sessionId } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (sessionId) params.sessionId = sessionId;
      
      const response = await api.get('/contacts', { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch contacts');
    }
  }
);

export const createContact = createAsyncThunk(
  'contacts/create',
  async (contactData, { rejectWithValue }) => {
    try {
      const response = await api.post('/contacts', contactData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create contact');
    }
  }
);

export const updateContact = createAsyncThunk(
  'contacts/update',
  async ({ contactId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/contacts/${contactId}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update contact');
    }
  }
);

export const deleteContact = createAsyncThunk(
  'contacts/delete',
  async (contactId, { rejectWithValue }) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      return contactId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete contact');
    }
  }
);

export const syncContacts = createAsyncThunk(
  'contacts/sync',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.post('/contacts/sync', { sessionId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to sync contacts');
    }
  }
);

export const importContacts = createAsyncThunk(
  'contacts/import',
  async ({ sessionId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('sessionId', sessionId);
      formData.append('file', file);

      const response = await api.post('/contacts/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to import contacts');
    }
  }
);

export const exportContacts = createAsyncThunk(
  'contacts/export',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.get('/contacts/export', {
        params: { sessionId },
        responseType: 'blob',
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contacts-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to export contacts');
    }
  }
);

// Slice
const contactSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearContacts: (state) => {
      state.contacts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch contacts
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = action.payload.contacts;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create contact
      .addCase(createContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts.unshift(action.payload);
      })
      .addCase(createContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update contact
      .addCase(updateContact.fulfilled, (state, action) => {
        const index = state.contacts.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
      })
      // Delete contact
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.contacts = state.contacts.filter(c => c.id !== action.payload);
      })
      // Sync contacts
      .addCase(syncContacts.pending, (state) => {
        state.syncing = true;
        state.error = null;
      })
      .addCase(syncContacts.fulfilled, (state, action) => {
        state.syncing = false;
        // Merge synced contacts
        action.payload.contacts.forEach(contact => {
          const index = state.contacts.findIndex(c => c.phone === contact.phone);
          if (index !== -1) {
            state.contacts[index] = contact;
          } else {
            state.contacts.push(contact);
          }
        });
      })
      .addCase(syncContacts.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload;
      })
      // Import contacts
      .addCase(importContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importContacts.fulfilled, (state, action) => {
        state.loading = false;
        // Add imported contacts
        state.contacts = [...state.contacts, ...action.payload.contacts];
      })
      .addCase(importContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Export contacts
      .addCase(exportContacts.pending, (state) => {
        state.loading = true;
      })
      .addCase(exportContacts.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(exportContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearContacts } = contactSlice.actions;
export default contactSlice.reducer;

