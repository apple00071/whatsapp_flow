import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Helper function to load messages
async function loadMessages() {
  try {
    const messagesFile = path.join(process.cwd(), 'data', 'messages.json');
    const data = await fs.readFile(messagesFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Error loading messages:', error);
    return [];
  }
}

// Helper function to load templates
async function loadTemplates() {
  try {
    const templatesFile = path.join(process.cwd(), 'data', 'templates.json');
    const data = await fs.readFile(templatesFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('Error loading templates:', error);
    return [];
  }
}

export async function GET() {
  // Skip actual API calls during build time
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://34.45.239.220:3001';
      const response = await fetch(`${apiUrl}/api/dashboard/stats`);
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      // Return mock data on error
      return NextResponse.json({
        totalMessages: 0,
        deliveredMessages: 0,
        failedMessages: 0,
        activeContacts: 0,
        isConnected: false
      });
    }
  }
  
  // During build time, return mock data
  return NextResponse.json({
    totalMessages: 0,
    deliveredMessages: 0,
    failedMessages: 0,
    activeContacts: 0,
    isConnected: false
  });
} 