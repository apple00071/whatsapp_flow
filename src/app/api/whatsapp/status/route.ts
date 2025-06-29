import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function GET() {
  try {
    // Fetch status from the backend server
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/status`, {
      cache: 'no-store', // Prevent caching
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch status from backend');
    }
    
    const status = await response.json();
    console.log('Status from backend:', status);
    
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting WhatsApp status:', error);
    return NextResponse.json(
      { error: 'Failed to get WhatsApp status' },
      { status: 500 }
    );
  }
} 