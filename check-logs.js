const fs = require('fs').promises;
const path = require('path');

async function checkLogs() {
  try {
    const messagesFile = path.join(__dirname, 'data', 'messages.json');
    
    // Check if the file exists
    try {
      await fs.access(messagesFile);
    } catch (error) {
      console.log('Messages file does not exist yet');
      return;
    }
    
    // Read the messages file
    const data = await fs.readFile(messagesFile, 'utf8');
    const messages = JSON.parse(data);
    
    console.log(`Found ${messages.length} messages in history`);
    
    // Display the last 5 messages (or all if less than 5)
    const lastMessages = messages.slice(-5);
    console.log('\nLast messages:');
    lastMessages.forEach((msg, i) => {
      console.log(`\nMessage ${i + 1}:`);
      console.log(`To: ${msg.to}`);
      console.log(`Message: ${msg.message}`);
      console.log(`Status: ${msg.status}`);
      console.log(`Timestamp: ${msg.timestamp}`);
      if (msg.error) {
        console.log(`Error: ${msg.error}`);
      }
    });
  } catch (error) {
    console.error('Error checking logs:', error);
  }
}

checkLogs(); 