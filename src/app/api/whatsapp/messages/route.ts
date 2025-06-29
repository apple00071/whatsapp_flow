import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Store messages in a JSON file
const MESSAGES_FILE = path.join(process.cwd(), 'data', 'messages.json');

// Ensure the data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Get all messages
const getMessages = () => {
  ensureDataDir();
  
  if (!fs.existsSync(MESSAGES_FILE)) {
    return [];
  }
  
  try {
    const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read messages file:', error);
    return [];
  }
};

// Save a message
const saveMessage = (message: any) => {
  ensureDataDir();
  
  const messages = getMessages();
  messages.push({
    ...message,
    timestamp: message.timestamp || new Date().toISOString()
  });
  
  try {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Failed to save message:', error);
    return false;
  }
};

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// GET: Retrieve message history
export async function GET() {
  try {
    // Fetch messages from the backend server
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/messages`, {
      cache: 'no-store', // Prevent caching
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch messages from backend');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', messages: [] },
      { status: 500 }
    );
  }
}

// POST: Add a new message to history
export async function POST(request: Request) {
  try {
    const message = await request.json();
    
    if (!message.to || !message.content) {
      return NextResponse.json(
        { error: 'Message recipient and content are required' },
        { status: 400 }
      );
    }
    
    const success = saveMessage({
      id: message.id || Date.now().toString(),
      to: message.to,
      message: message.content || message.message,
      status: message.status || 'sent',
      timestamp: message.timestamp || new Date().toISOString()
    });
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      throw new Error('Failed to save message');
    }
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 