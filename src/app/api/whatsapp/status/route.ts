import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'http://34.45.239.220:3001'  // Production VM URL
  : 'http://localhost:3001';      // Local development URL

export async function GET() {
  try {
    console.log('[Frontend API] Attempting to fetch WhatsApp status from:', BACKEND_URL);

    const response = await fetch(`${BACKEND_URL}/api/whatsapp/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store' // Disable caching to get fresh status
    });

    console.log('[Frontend API] Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Frontend API] WhatsApp status response:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Frontend API] Error getting WhatsApp status:', error);
    return NextResponse.json({
      isConnected: false,
      hasQR: false,
      qrCode: null,
      state: 'DISCONNECTED',
      error: error instanceof Error ? error.message : 'Failed to fetch WhatsApp status'
    }, { status: 500 });
  }
} 