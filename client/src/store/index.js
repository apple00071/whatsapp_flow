/**
 * Redux Store Configuration
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sessionReducer from './slices/sessionSlice';
import messageReducer from './slices/messageSlice';
import contactReducer from './slices/contactSlice';
import groupReducer from './slices/groupSlice';
import webhookReducer from './slices/webhookSlice';
import apiKeyReducer from './slices/apiKeySlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    sessions: sessionReducer,
    messages: messageReducer,
    contacts: contactReducer,
    groups: groupReducer,
    webhooks: webhookReducer,
    apiKeys: apiKeyReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types and paths
        ignoredActions: ['persist/PERSIST'],
        ignoredPaths: ['sessions.qrCode'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

export default store;

