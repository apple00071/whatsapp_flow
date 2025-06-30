// API test script
const express = require('express');
const app = express();
const port = 3002;

// Simple middleware to check API key
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Authorization header:', authHeader); // Log the auth header
  const expectedKey = 'onn7r1d3s_wh4ts4pp_ap1_s3cur3_k3y_9872354176';
  
  if (!authHeader) {
    console.log('No authorization header provided');
    return res.status(401).json({ success: false, message: 'Missing API key' });
  }
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    console.log('Invalid authorization format:', authHeader);
    return res.status(401).json({ success: false, message: 'Invalid API key format' });
  }
  
  const token = parts[1];
  console.log('Provided token:', token);
  console.log('Expected token:', expectedKey);
  console.log('Match:', token === expectedKey);
  
  if (token !== expectedKey) {
    return res.status(401).json({ success: false, message: 'Invalid API key' });
  }
  
  next();
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API authorization working!' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Test server running on port ${port}`);
}); 