import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'http://34.59.26.51:3002'  // Production VM URL
  : 'http://localhost:3002';      // Local development URL

// Check if we're in a build/SSR environment
const isBuildTime = () => {
  return process.env.NEXT_PHASE === 'phase-production-build' || 
         process.env.VERCEL_ENV === 'production' && process.env.VERCEL_BUILD_STEP === 'build';
};

export async function GET() {
  // During build time, return a placeholder response
  if (isBuildTime()) {
    console.log('[Frontend API] Build-time status request - returning placeholder');
    return NextResponse.json({
      isConnected: false,
      hasQR: false,
      qrCode: null,
      state: 'BUILD_PLACEHOLDER',
      isPrerendering: true
    });
  }

  try {
    console.log('[Frontend API] Attempting to fetch WhatsApp status from:', BACKEND_URL);

    // Add cache busting timestamp
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/status?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store', // Disable caching to get fresh status
      next: { revalidate: 0 } // Ensure Next.js doesn't cache this request
    });

    console.log('[Frontend API] Response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[Frontend API] WhatsApp status response:', data);
    
    // Always mark the response as not being prerendered
    return NextResponse.json({
      ...data,
      isPrerendering: false
    });
  } catch (error) {
    console.error('[Frontend API] Error getting WhatsApp status:', error);
    
    // Return a status in the expected format for the Settings page
    return NextResponse.json({
      isConnected: false,
      hasQR: true,
      qrCode: null,
      state: 'DISCONNECTED',
      isPrerendering: false
    });
  }
} 