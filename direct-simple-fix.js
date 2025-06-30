const fs = require('fs');

// Very simple quick fix for API key validation
try {
  const serverJsPath = '/home/applegraphicshyd/Onnrides-WhatsApp/src/server.js';
  let content = fs.readFileSync(serverJsPath, 'utf8');
  
  // Complete fix
  // Find the validation line
  const validationLine = "  if (actualKey !== expectedKey) {";
  const fixedValidationLine = "  if (actualKey !== 'onn7r1d3s_wh4ts4pp_ap1_s3cur3_k3y_9872354176') {";
  
  content = content.replace(validationLine, fixedValidationLine);
  
  fs.writeFileSync(serverJsPath, content);
  console.log('API key validation hardcoded successfully.');
} catch (err) {
  console.error('Error fixing API key validation:', err);
} 