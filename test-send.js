const { getWhatsAppClient } = require('./src/lib/whatsappClient');

async function testSendMessage() {
  try {
    console.log('Getting WhatsApp client...');
    const client = getWhatsAppClient();
    
    if (!client) {
      console.error('Failed to get WhatsApp client');
      return;
    }
    
    console.log('Initializing client if needed...');
    if (!client.isInitialized()) {
      console.log('Client not initialized, initializing now...');
      await client.initialize();
      console.log('Initialization complete');
    }
    
    console.log('Client initialized:', client.isInitialized());
    console.log('Client ready:', client.isReady);
    
    if (!client.isReady) {
      console.log('Waiting for client to be ready...');
      // Wait for up to 30 seconds for the client to be ready
      for (let i = 0; i < 15; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`Check ${i+1}/15: Client ready:`, client.isReady);
        if (client.isReady) break;
      }
    }
    
    if (!client.isReady) {
      console.error('Client still not ready after waiting. Cannot send message.');
      return;
    }
    
    console.log('Sending test message...');
    const result = await client.sendMessage('918247494622', 'Test message from WhatsApp Flow');
    console.log('Message sent successfully:', result);
  } catch (error) {
    console.error('Error in test send:', error);
  }
}

testSendMessage(); 