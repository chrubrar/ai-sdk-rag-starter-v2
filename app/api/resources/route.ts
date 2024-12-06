import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resources } from '@/lib/db/schema/resources';
import { desc, eq } from 'drizzle-orm';
import { nanoid } from '@/lib/utils';

// GET all resources
export async function GET() {
  try {
    const allResources = await db
      .select()
      .from(resources)
      .orderBy(desc(resources.createdAt));
    
    return NextResponse.json(allResources);
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST new resource
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const newResource = await db
      .insert(resources)
      .values({
        id: nanoid(),
        content,
      })
      .returning();

    return NextResponse.json(newResource[0], { status: 201 });
  } catch (error) {
    console.error('Database insert error:', error);
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}

// PUT update resource
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content } = body;

    if (!id || !content) {
      return NextResponse.json(
        { error: 'ID and content are required' },
        { status: 400 }
      );
    }

    const updatedResource = await db
      .update(resources)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(resources.id, id))
      .returning();

    if (!updatedResource.length) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedResource[0]);
  } catch (error) {
    console.error('Database update error:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

// DELETE resource
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const deletedResource = await db
      .delete(resources)
      .where(eq(resources.id, id))
      .returning();

    if (!deletedResource.length) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(deletedResource[0]);
  } catch (error) {
    console.error('Database delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
