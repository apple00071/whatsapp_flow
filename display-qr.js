const qrcode = require('qrcode-terminal');
const https = require('https');
const http = require('http');

// The QR code from the API
const qrData = "2@svtdlZvnINuVi7/Z1g/WheZHmOM9kLYsKfI4JSCezU0WNFqQ6LMpSwTcOGvzsPebbIORAWV1h4z2Do0c0cCA+uhQ68yAcB5Alfc=,bYdlRqNhFhO0FghiCrsOlpTwQZqOVfmcoPAhdmTD/GM=,XKUonXE9+z8ytzHC6PZeReUcvjX37ZFVI4r6qp1uY3k=,rIwPlClXQPBzUUz5vogTddwO9Xr9nhgjj6wk7zPx4ZQ=,1";

console.log("Generating WhatsApp QR code for scanning:");
console.log("----------------------------------------");
qrcode.generate(qrData, { small: true });
console.log("----------------------------------------");
console.log("\nScan this QR code with your WhatsApp mobile app:");
console.log("1. Open WhatsApp on your phone");
console.log("2. Tap Menu or Settings");
console.log("3. Select Linked Devices");
console.log("4. Tap on 'Link a Device'");
console.log("5. Point your phone to scan the QR code above");
console.log("\nOnce scanned, the WhatsApp API should be authenticated and ready to use.");
console.log("\nIf you need to get a new QR code from the API, run:");
console.log("curl -H 'Authorization: Bearer onn7r1d3s_wh4ts4pp_ap1_s3cur3_k3y_9872354176' http://34.45.239.220:3001/api/qr"); 