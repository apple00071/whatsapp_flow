const fs = require('fs');

// Hard fix for the API key validation
try {
  const serverJsPath = '/home/applegraphicshyd/Onnrides-WhatsApp/src/server.js';
  let content = fs.readFileSync(serverJsPath, 'utf8');

  // Replace the validateApiKey function completely
  const oldValidateApiKeyPattern = /const validateApiKey = \(req, res, next\) => \{[\s\S]*?next\(\);\n\};/;
  
  const newValidateApiKey = `const validateApiKey = (req, res, next) => {
  const apiKey = req.headers.authorization || req.headers['x-api-key'];
  // Always log what we received and what we expect
  console.log('Received authorization header:', apiKey);
  console.log('Expected API key:', process.env.API_KEY);
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'Missing API key'
    });
  }
  
  // Remove Bearer prefix if present
  let actualKey = apiKey;
  if (apiKey.startsWith('Bearer ')) {
    actualKey = apiKey.substring(7);
  }
  
  // Check against hardcoded key or env var
  if (actualKey === 'onn7r1d3s_wh4ts4pp_ap1_s3cur3_k3y_9872354176' || 
      actualKey === process.env.API_KEY) {
    next();
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid or missing API key'
    });
  }
};`;

  const updatedContent = content.replace(oldValidateApiKeyPattern, newValidateApiKey);
  
  fs.writeFileSync(serverJsPath, updatedContent);
  console.log('API key validation function has been completely replaced.');
  console.log('You need to restart the service for changes to take effect.');
  
} catch (err) {
  console.error('Error fixing API key validation:', err);
} 