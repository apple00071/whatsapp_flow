import { NextResponse } from 'next/server';

// The direct URL to our QR API server
const QR_API_URL = 'http://34.59.26.51:3003';

export async function GET() {
  try {
    console.log('[QR Proxy] Forwarding request to:', `${QR_API_URL}/api/whatsapp/qr`);
    
    // Forward the request to our QR API server
    const response = await fetch(`${QR_API_URL}/api/whatsapp/qr?t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      console.error(`[QR Proxy] Error status ${response.status} from QR API`);
      return NextResponse.json(
        { success: false, error: `QR API server error: ${response.status}` },
        { status: 200 }
      );
    }
    
    // Get response as text first to avoid parsing errors
    const responseText = await response.text();
    
    try {
      // Try to parse as JSON
      const data = JSON.parse(responseText);
      console.log('[QR Proxy] Successfully forwarded QR code');
      
      // Return the data directly
      return NextResponse.json(data);
    } catch (parseError) {
      console.error('[QR Proxy] Failed to parse response as JSON:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid response from QR API server' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('[QR Proxy] Error forwarding to QR API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to connect to QR API server',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 200 }
    );
  }
} 