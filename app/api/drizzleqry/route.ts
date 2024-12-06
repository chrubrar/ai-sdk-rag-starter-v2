import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resources } from '@/lib/db/schema/resources';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Query all resources, ordered by creation date
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
