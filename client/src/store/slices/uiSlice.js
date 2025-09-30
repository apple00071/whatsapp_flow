/**
 * UI Redux Slice
 * Handles UI state (sidebar, modals, notifications, etc.)
 */

import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  sidebarOpen: true,
  theme: localStorage.getItem('theme') || 'light',
  modals: {
    createSession: false,
    qrCode: false,
    createContact: false,
    createGroup: false,
    createWebhook: false,
    createApiKey: false,
    confirmDelete: false,
  },
  notifications: [],
  loading: {
    global: false,
  },
};

// Slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    openModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = true;
      }
    },
    closeModal: (state, action) => {
      const modalName = action.payload;
      if (state.modals.hasOwnProperty(modalName)) {
        state.modals[modalName] = false;
      }
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        type: 'info',
        message: '',
        duration: 3000,
        ...action.payload,
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  toggleTheme,
  openModal,
  closeModal,
  closeAllModals,
  addNotification,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;

