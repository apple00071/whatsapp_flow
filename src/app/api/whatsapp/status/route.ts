import { NextResponse } from 'next/server';

export async function GET() {
  // Skip actual API calls during build time
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
    try {
      // During runtime on Vercel, use the environment variable
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://34.45.239.220:3001';
      const response = await fetch(`${apiUrl}/api/whatsapp/status`);
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error getting WhatsApp status:', error);
      return NextResponse.json({
        isConnected: false,
        hasQR: false,
        qrCode: null,
        state: 'DISCONNECTED'
      }, { status: 500 });
    }
  }
  
  // During build time, return mock data
  return NextResponse.json({
    isConnected: false,
    hasQR: false,
    qrCode: null,
    state: 'DISCONNECTED'
  });
} 