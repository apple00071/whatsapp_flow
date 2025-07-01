// add-qr-endpoint.js
// This script adds a /api/whatsapp/qr endpoint to the server.js file

const fs = require('fs');
const path = require('path');

// Path to the server.js file
const serverFilePath = path.join(__dirname, 'server.js');

async function addQrEndpoint() {
  try {
    console.log('Reading server.js file...');
    const serverContent = await fs.promises.readFile(serverFilePath, 'utf8');

    // Check if the endpoint already exists
    if (serverContent.includes("app.get('/api/whatsapp/qr'")) {
      console.log('QR endpoint already exists in server.js');
      return;
    }

    // Find a good position to add the new endpoint - after the status endpoint
    const statusEndpointIndex = serverContent.indexOf("app.get('/api/whatsapp/status'");
    if (statusEndpointIndex === -1) {
      console.error('Could not find /api/whatsapp/status endpoint in server.js');
      return;
    }

    // Find the end of the status endpoint function
    const endIndex = serverContent.indexOf('});', statusEndpointIndex) + 3;

    // Create the QR endpoint code
    const qrEndpointCode = `

// QR Code endpoint
app.get('/api/whatsapp/qr', (req, res) => {
  if (!qrCodeDataURL) {
    return res.status(404).json({ 
      success: false, 
      error: 'QR code not available' 
    });
  }
  
  res.json({
    success: true,
    qrCode: qrCodeDataURL,
    expiry: Date.now() + 60000 // Expires in 1 minute
  });
});`;

    // Insert the QR endpoint code after the status endpoint
    const newServerContent = 
      serverContent.substring(0, endIndex) + 
      qrEndpointCode + 
      serverContent.substring(endIndex);

    // Write the updated content back to the file
    console.log('Writing updated server.js file...');
    await fs.promises.writeFile(serverFilePath, newServerContent, 'utf8');

    console.log('QR endpoint added successfully');
  } catch (error) {
    console.error('Error adding QR endpoint:', error);
  }
}

// Execute the function
addQrEndpoint(); 