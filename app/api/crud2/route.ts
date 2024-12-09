import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resources } from '@/lib/db/schema/resources';
import { desc, eq, like } from 'drizzle-orm';
import { nanoid } from '@/lib/utils';
import { sql } from 'drizzle-orm';

// GET resources with optional search and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Base query
    let query = db.select().from(resources);

    // Add search condition if search parameter exists
    if (search) {
      query = query.where(like(resources.content, `%${search}%`));
    }

    // Add pagination and ordering
    const paginatedQuery = query
      .orderBy(desc(resources.createdAt))
      .limit(limit)
      .offset(offset);

    const countQuery = db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(resources)
      .$dynamic();

    if (search) {
      countQuery.where(like(resources.content, `%${search}%`));
    }

    const [data, [{ count }]] = await Promise.all([
      paginatedQuery,
      countQuery,
    ]);

    return NextResponse.json({
      data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST new resource with validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Content must be less than 1000 characters' },
        { status: 400 }
      );
    }

    const now = new Date();
    const newResource = await db
      .insert(resources)
      .values({
        id: nanoid(),
        content: content.trim(),
        createdAt: now,
        updatedAt: now,
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

// PATCH update resource with validation
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Content is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Content must be less than 1000 characters' },
        { status: 400 }
      );
    }

    const updatedResource = await db
      .update(resources)
      .set({
        content: content.trim(),
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

// DELETE resource with soft delete option
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }

    // Check if resource exists
    const existingResource = await db
      .select()
      .from(resources)
      .where(eq(resources.id, id));

    if (!existingResource.length) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      );
    }

    const deletedResource = await db
      .delete(resources)
      .where(eq(resources.id, id))
      .returning();

    return NextResponse.json(deletedResource[0]);
  } catch (error) {
    console.error('Database delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    );
  }
}
