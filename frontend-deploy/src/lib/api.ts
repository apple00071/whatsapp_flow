const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://34.45.239.220:3001';

export async function sendMessage(phoneNumber: string, message: string) {
  try {
    const response = await fetch(`${API_URL}/api/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phoneNumber,
        message,
      }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export async function getStatus() {
  try {
    const response = await fetch(`${API_URL}/api/whatsapp/status`);
    return await response.json();
  } catch (error) {
    console.error('Error getting status:', error);
    throw error;
  }
}

export async function getBulkStatus() {
  try {
    const response = await fetch(`${API_URL}/api/whatsapp/bulk/status`);
    return await response.json();
  } catch (error) {
    console.error('Error getting bulk status:', error);
    throw error;
  }
} 