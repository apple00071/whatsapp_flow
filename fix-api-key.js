const fs = require('fs');
const path = require('path');

console.log('Fixing API key validation...');

// Script to fix the API key validation in server.js
try {
  const serverJsPath = '/home/applegraphicshyd/Onnrides-WhatsApp/src/server.js';
  let content = fs.readFileSync(serverJsPath, 'utf8');
  
  // Fix the validateApiKey middleware
  const oldValidation = "const validateApiKey = (req, res, next) => {\n  const apiKey = req.headers.authorization || req.headers['x-api-key'];\n  \n  if (!apiKey || apiKey !== 'onn7r1d3s_wh4ts4pp_ap1_s3cur3_k3y_9872354176') {";
  
  const newValidation = "const validateApiKey = (req, res, next) => {\n  const apiKey = req.headers.authorization || req.headers['x-api-key'];\n  const expectedKey = process.env.API_KEY;\n  \n  // Log for debugging\n  console.log('Received API key:', apiKey);\n  console.log('Expected API key:', expectedKey);\n  \n  if (!apiKey) {\n    return res.status(401).json({\n      success: false,\n      message: 'Missing API key'\n    });\n  }\n  \n  // Handle 'Bearer ' prefix\n  const actualKey = apiKey.startsWith('Bearer ') ? apiKey.substring(7) : apiKey;\n  \n  if (actualKey !== expectedKey) {";
  
  content = content.replace(oldValidation, newValidation);
  
  fs.writeFileSync(serverJsPath, content);
  console.log('API key validation fixed successfully.');
} catch (err) {
  console.error('Error fixing API key validation:', err);
} 