import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const templatesFile = path.join(process.cwd(), 'data', 'templates.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load templates from file
async function loadTemplates() {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(templatesFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    console.error('Error loading templates:', error);
    return [];
  }
}

// Save templates to file
async function saveTemplates(templates: any[]) {
  try {
    await ensureDataDirectory();
    await fs.writeFile(templatesFile, JSON.stringify(templates, null, 2));
  } catch (error) {
    console.error('Error saving templates:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const templates = await loadTemplates();
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error('Error in GET /api/templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, content, category } = body;

    if (!name || !content) {
      return NextResponse.json(
        { success: false, error: 'Name and content are required' },
        { status: 400 }
      );
    }

    const templates = await loadTemplates();
    const newTemplate = {
      id: Date.now().toString(),
      name,
      content,
      category: category || 'General',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    templates.push(newTemplate);
    await saveTemplates(templates);

    return NextResponse.json({ success: true, template: newTemplate });
  } catch (error) {
    console.error('Error in POST /api/templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, content, category } = body;

    if (!id || !name || !content) {
      return NextResponse.json(
        { success: false, error: 'ID, name, and content are required' },
        { status: 400 }
      );
    }

    const templates = await loadTemplates();
    const templateIndex = templates.findIndex((t: any) => t.id === id);

    if (templateIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    templates[templateIndex] = {
      ...templates[templateIndex],
      name,
      content,
      category: category || templates[templateIndex].category,
      updatedAt: new Date().toISOString()
    };

    await saveTemplates(templates);

    return NextResponse.json({ success: true, template: templates[templateIndex] });
  } catch (error) {
    console.error('Error in PUT /api/templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const templates = await loadTemplates();
    const filteredTemplates = templates.filter((t: any) => t.id !== id);

    if (templates.length === filteredTemplates.length) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }

    await saveTemplates(filteredTemplates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    );
  }
} 