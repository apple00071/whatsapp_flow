const fs = require('fs').promises;
const path = require('path');

async function cleanupMessages() {
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
    
    // Update the status of queued messages to sent
    let updated = 0;
    for (const message of messages) {
      if (message.status === 'queued') {
        message.status = 'sent';
        message.sentAt = new Date().toISOString();
        updated++;
    }
  }
    
    // Save the updated messages
    await fs.writeFile(messagesFile, JSON.stringify(messages, null, 2));
    
    console.log(`Updated ${updated} messages from 'queued' to 'sent'`);
  } catch (error) {
    console.error('Error cleaning up messages:', error);
  }
}

cleanupMessages(); 