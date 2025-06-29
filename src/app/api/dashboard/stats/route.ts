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
  try {
    const messages = await loadMessages();
    const templates = await loadTemplates();

    // Calculate message statistics
    const totalMessages = messages.length;
    const messagesByStatus = messages.reduce((acc: any, msg: any) => {
      acc[msg.status] = (acc[msg.status] || 0) + 1;
      return acc;
    }, {});

    // Get messages from the last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentMessages = messages.filter((msg: any) => 
      new Date(msg.timestamp) > sevenDaysAgo
    );

    // Calculate daily message counts for the last 7 days
    const dailyMessageCounts = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = recentMessages.filter((msg: any) => 
        msg.timestamp.split('T')[0] === dateStr
      ).length;
      return { date: dateStr, count };
    }).reverse();

    // Calculate template statistics
    const totalTemplates = templates.length;
    const templatesByCategory = templates.reduce((acc: any, template: any) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      messages: {
        total: totalMessages,
        byStatus: messagesByStatus,
        dailyCounts: dailyMessageCounts
      },
      templates: {
        total: totalTemplates,
        byCategory: templatesByCategory
      }
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error in GET /api/dashboard/stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
} 