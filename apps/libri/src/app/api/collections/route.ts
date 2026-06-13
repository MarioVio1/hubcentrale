import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * API per ottenere tutte le collections
 */
export async function GET() {
  try {
    const collections = await db.collection.findMany({
      include: {
        books: {
          include: {
            book: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      collections
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch collections',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * API per creare una nuova collection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const collection = await db.collection.create({
      data: {
        name,
        description,
        color
      }
    });

    return NextResponse.json({
      success: true,
      collection
    });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      {
        error: 'Failed to create collection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
