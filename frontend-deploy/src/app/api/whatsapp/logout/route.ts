import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3002';

export async function POST() {
  try {
    // Call disconnect endpoint on the backend server
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/disconnect`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to disconnect from backend');
    }
    
    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error disconnecting from WhatsApp:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect from WhatsApp' },
      { status: 500 }
    );
  }
} 