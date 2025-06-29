const { messageQueue, bulkMessageQueue } = require('./src/lib/messageQueue');
const { getWhatsAppClient } = require('./src/lib/whatsappClient');

async function checkQueue() {
  try {
    console.log('Checking WhatsApp client status...');
    const client = getWhatsAppClient();
    
    if (!client) {
      console.log('WhatsApp client is not available');
      return;
    }
    
    console.log('Client initialized:', client.isInitialized());
    console.log('Client ready:', client.isReady);
    
    // Get client status
    const status = await client.getStatus();
    console.log('\nWhatsApp Client Status:');
    console.log(JSON.stringify(status, null, 2));
    
    // Check message queue
    console.log('\nMessage Queue:');
    console.log('Jobs in queue:', messageQueue.jobs ? messageQueue.jobs.length : 'Unknown');
    
    if (messageQueue.jobs && messageQueue.jobs.length > 0) {
      console.log('\nPending jobs:');
      messageQueue.jobs.forEach((job, i) => {
        console.log(`\nJob ${i + 1}:`);
        console.log(`ID: ${job.id}`);
        console.log(`To: ${job.data.to}`);
        console.log(`Message: ${job.data.message}`);
        console.log(`Attempts: ${job.attempts}/${job.maxAttempts}`);
        console.log(`Created at: ${job.createdAt}`);
      });
    } else {
      console.log('No pending jobs in the queue');
    }
    
    // Check bulk message queue
    console.log('\nBulk Message Queue:');
    console.log('Jobs in queue:', bulkMessageQueue.jobs ? bulkMessageQueue.jobs.length : 'Unknown');
    
    if (bulkMessageQueue.jobs && bulkMessageQueue.jobs.length > 0) {
      console.log('\nPending bulk jobs:');
      bulkMessageQueue.jobs.forEach((job, i) => {
        console.log(`\nBulk Job ${i + 1}:`);
        console.log(`ID: ${job.id}`);
        console.log(`To: ${job.data.to}`);
        console.log(`Message: ${job.data.message}`);
        console.log(`Attempts: ${job.attempts}/${job.maxAttempts}`);
        console.log(`Created at: ${job.createdAt}`);
      });
    } else {
      console.log('No pending bulk jobs in the queue');
    }
  } catch (error) {
    console.error('Error checking queue:', error);
  }
}

checkQueue(); 