import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'http://34.59.26.51:3002'  // Production VM URL
  : 'http://localhost:3002';      // Local development URL

// Use environment variable with fallback
const QR_API_URL = process.env.QR_API_URL || 'http://34.59.26.51:3003';

// Check if we're in a build/SSR environment
const isBuildTime = () => {
  return process.env.NEXT_PHASE === 'phase-production-build' || 
         process.env.VERCEL_ENV === 'production' && process.env.VERCEL_BUILD_STEP === 'build';
};

export async function GET() {
  // Log which URL we're using for QR API
  console.log('[Frontend API] QR API URL:', QR_API_URL);
  
  // During build time, return a placeholder response
  if (isBuildTime()) {
    console.log('[Frontend API] Build-time QR code request - returning placeholder');
    return NextResponse.json({
      success: false,
      error: 'QR code is only available at runtime',
      isPrerendering: true
    });
  }

  try {
    const timestamp = Date.now();
    const apiUrl = `${QR_API_URL}/api/whatsapp/qr?t=${timestamp}`;
    console.log('[Frontend API] Attempting to fetch WhatsApp QR code from:', apiUrl);

    // Add cache busting timestamp
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store', // Disable caching to get fresh QR code
      next: { revalidate: 0 } // Ensure Next.js doesn't cache this request
    });

    console.log('[Frontend API] QR code response status:', response.status);

    // Get response body as text first to avoid JSON parsing errors
    const responseText = await response.text();
    console.log('[Frontend API] Raw response:', responseText.substring(0, 100) + '...');

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Frontend API] Error parsing QR response as JSON:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid QR code response format', rawResponse: responseText.substring(0, 500) },
        { status: 200 }
      );
    }

    if (!response.ok) {
      console.error('[Frontend API] QR code endpoint error:', data);
      return NextResponse.json(
        { success: false, error: `QR code endpoint returned status: ${response.status}`, details: data },
        { status: 200 } // Return 200 so the client can handle it properly
      );
    }
    
    console.log('[Frontend API] WhatsApp QR code received, success:', data.success);
    
    // Return the QR data to the client
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Frontend API] Error getting WhatsApp QR code:', error);
    
    // Return a proper response format with error details
    return NextResponse.json(
      { success: false, error: 'Failed to fetch QR code', details: error instanceof Error ? error.message : String(error) },
      { status: 200 } // Return 200 so the client can handle it properly
    );
  }
} 