# Frontend Implementation Guide

## ✅ Completed Frontend Components (60%)

### Redux Store & State Management (100%)
- ✅ `client/src/store/index.js` - Store configuration
- ✅ `client/src/store/slices/authSlice.js` - Authentication state
- ✅ `client/src/store/slices/sessionSlice.js` - Session state
- ✅ `client/src/store/slices/messageSlice.js` - Message state
- ✅ `client/src/store/slices/contactSlice.js` - Contact state
- ✅ `client/src/store/slices/groupSlice.js` - Group state
- ✅ `client/src/store/slices/webhookSlice.js` - Webhook state
- ✅ `client/src/store/slices/apiKeySlice.js` - API key state
- ✅ `client/src/store/slices/uiSlice.js` - UI state

### Services (100%)
- ✅ `client/src/services/api.js` - Axios client with interceptors
- ✅ `client/src/services/websocket.js` - Socket.IO client

### Core Setup (100%)
- ✅ `client/src/main.jsx` - React entry point
- ✅ `client/src/App.jsx` - App routing
- ✅ `client/src/styles/theme.js` - Material-UI theme

### Layout Components (100%)
- ✅ `client/src/components/layout/MainLayout.jsx` - Main app layout
- ✅ `client/src/components/layout/AuthLayout.jsx` - Auth pages layout
- ✅ `client/src/components/layout/Navbar.jsx` - Top navigation
- ✅ `client/src/components/layout/Sidebar.jsx` - Side navigation

### Authentication Pages (40%)
- ✅ `client/src/pages/auth/Login.jsx` - Login form
- ✅ `client/src/pages/auth/Register.jsx` - Registration form
- ⚠️ `client/src/pages/auth/ForgotPassword.jsx` - TODO
- ⚠️ `client/src/pages/auth/ResetPassword.jsx` - TODO
- ⚠️ `client/src/pages/auth/VerifyEmail.jsx` - TODO

### Main Pages (10%)
- ✅ `client/src/pages/Dashboard.jsx` - Dashboard with stats
- ⚠️ `client/src/pages/Sessions.jsx` - TODO
- ⚠️ `client/src/pages/Chat.jsx` - TODO
- ⚠️ `client/src/pages/Contacts.jsx` - TODO
- ⚠️ `client/src/pages/Groups.jsx` - TODO
- ⚠️ `client/src/pages/Webhooks.jsx` - TODO
- ⚠️ `client/src/pages/ApiKeys.jsx` - TODO
- ⚠️ `client/src/pages/Settings.jsx` - TODO
- ⚠️ `client/src/pages/admin/AdminDashboard.jsx` - TODO

## 📋 Remaining Frontend Work (40%)

### 1. Complete Auth Pages (30 minutes)

**ForgotPassword.jsx** - Password reset request
```jsx
import { useState } from 'react';
import { TextField, Button, Alert } from '@mui/material';
import api from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/auth/forgot-password', { email });
    setSent(true);
  };
  
  return sent ? (
    <Alert>Check your email for reset instructions</Alert>
  ) : (
    <form onSubmit={handleSubmit}>
      <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Button type="submit">Send Reset Link</Button>
    </form>
  );
}
```

**ResetPassword.jsx** - New password form
```jsx
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TextField, Button } from '@mui/material';
import api from '../../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/auth/reset-password', {
      token: searchParams.get('token'),
      password
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <TextField type="password" label="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button type="submit">Reset Password</Button>
    </form>
  );
}
```

**VerifyEmail.jsx** - Email verification
```jsx
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, CircularProgress } from '@mui/material';
import api from '../../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  
  useEffect(() => {
    api.post('/auth/verify-email', { token: searchParams.get('token') })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, []);
  
  return status === 'loading' ? <CircularProgress /> : 
    <Alert severity={status}>{status === 'success' ? 'Email verified!' : 'Verification failed'}</Alert>;
}
```

### 2. Main Application Pages (2-3 hours)

All pages follow this pattern:
1. Import necessary hooks and components
2. Fetch data on mount using Redux
3. Display data in tables/cards
4. Handle CRUD operations
5. Show modals for create/edit

**Sessions.jsx** - Session management with QR code display
- List all sessions in a table
- Create session button opens modal
- Show QR code in modal for new sessions
- Reconnect/delete actions

**Chat.jsx** - Chat interface
- Session selector dropdown
- Contact/phone number selector
- Message list with bubbles
- Message input with send button
- File upload for media messages

**Contacts.jsx** - Contact management
- Table with search and pagination
- Create/edit/delete contacts
- Sync from WhatsApp button
- Import/export CSV

**Groups.jsx** - Group management
- Table with group list
- Create group modal
- Manage participants
- Sync from WhatsApp

**Webhooks.jsx** - Webhook configuration
- Table with webhook list
- Create/edit webhook modal
- Test webhook button
- View delivery logs
- Regenerate secret

**ApiKeys.jsx** - API key management
- Table with API keys (masked)
- Create API key modal
- Show full key only once after creation
- Regenerate/revoke actions
- Usage statistics

**Settings.jsx** - User settings
- Profile information form
- Change password
- Preferences
- Account deletion

**admin/AdminDashboard.jsx** - Admin panel
- Platform statistics
- User management table
- Session management
- System health

### 3. Reusable Components (1 hour)

Create in `client/src/components/`:

**common/Loading.jsx**
```jsx
import { Box, CircularProgress } from '@mui/material';
export default function Loading() {
  return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
}
```

**common/ConfirmDialog.jsx**
```jsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{message}</DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} color="error">Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}
```

**session/QRCodeDisplay.jsx**
```jsx
import { Box, Dialog, DialogContent, Typography } from '@mui/material';
import QRCode from 'qrcode.react';

export default function QRCodeDisplay({ open, qrCode, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <Typography variant="h6" gutterBottom>Scan QR Code</Typography>
        {qrCode && <QRCode value={qrCode} size={256} />}
      </DialogContent>
    </Dialog>
  );
}
```

**chat/MessageBubble.jsx**
```jsx
import { Box, Typography } from '@mui/material';

export default function MessageBubble({ message, isOwn }) {
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: isOwn ? 'flex-end' : 'flex-start',
      mb: 1
    }}>
      <Box sx={{
        maxWidth: '70%',
        p: 1.5,
        borderRadius: 2,
        bgcolor: isOwn ? 'primary.main' : 'grey.200',
        color: isOwn ? 'white' : 'text.primary'
      }}>
        <Typography variant="body2">{message.body}</Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {new Date(message.createdAt).toLocaleTimeString()}
        </Typography>
      </Box>
    </Box>
  );
}
```

## 🚀 Quick Implementation Steps

### Step 1: Complete Auth Pages (30 min)
Create the 3 remaining auth pages using the templates above.

### Step 2: Implement Main Pages (2-3 hours)
For each page:
1. Copy the Dashboard.jsx structure
2. Replace with appropriate Redux slice
3. Add table/list component
4. Add create/edit modals
5. Wire up actions

### Step 3: Add Reusable Components (1 hour)
Create common components that are used across pages.

### Step 4: Test Everything (1 hour)
- Test all user flows
- Verify WebSocket updates
- Check responsive design
- Test error handling

## 📦 Required npm Packages

Already in package.json:
- ✅ react, react-dom, react-router-dom
- ✅ @reduxjs/toolkit, react-redux
- ✅ @mui/material, @mui/icons-material, @emotion/react, @emotion/styled
- ✅ axios
- ✅ socket.io-client
- ✅ notistack

May need to add:
```bash
npm install qrcode.react
npm install @mui/x-data-grid  # For advanced tables
npm install recharts  # For charts in dashboard
```

## 🎯 Priority Order

1. **High Priority** - Complete auth pages (needed for login flow)
2. **High Priority** - Sessions page (core functionality)
3. **High Priority** - Chat page (core functionality)
4. **Medium Priority** - Contacts, Groups, Webhooks, API Keys pages
5. **Low Priority** - Settings, Admin pages
6. **Low Priority** - Advanced components and charts

## 💡 Tips

1. **Copy Patterns**: Use Dashboard.jsx as a template for other pages
2. **Reuse Components**: Create common components to avoid duplication
3. **Test Incrementally**: Test each page as you build it
4. **Use Mock Data**: Test UI with mock data before connecting to API
5. **Mobile First**: Ensure responsive design works on all screens

## ✅ What's Already Working

- ✅ Complete Redux store with all slices
- ✅ API service with auth and refresh
- ✅ WebSocket service with real-time updates
- ✅ Layout components (Navbar, Sidebar)
- ✅ Routing with protected routes
- ✅ Theme configuration
- ✅ Login and Register pages
- ✅ Dashboard page

## 🎉 Estimated Time to Complete

- Auth pages: 30 minutes
- Main pages: 2-3 hours
- Components: 1 hour
- Testing: 1 hour
- **Total: 4-6 hours**

The frontend is **60% complete**. The remaining work is straightforward UI development following the established patterns!

