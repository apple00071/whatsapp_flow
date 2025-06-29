import { NextResponse } from 'next/server';
import { consumeRateLimits } from '@/lib/rateLimiter';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Check rate limits first
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await consumeRateLimits(ip);
    
    if (!rateLimitResult.success) {
      const timeToWait = rateLimitResult.msBeforeNext ? 
        Math.ceil(rateLimitResult.msBeforeNext / 1000) : 60;
      
      return NextResponse.json(
        { error: `Rate limit exceeded. Try again in ${timeToWait} seconds.` },
        { status: 429 }
      );
    }

    // Send message through backend server
    const response = await fetch(`${BACKEND_URL}/api/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': ip // Pass client IP for rate limiting
      },
      body: JSON.stringify({ to, message }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to send message' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 