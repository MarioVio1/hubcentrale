import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * API per aggiungere un libro a una collection
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { bookId } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: 'bookId is required' },
        { status: 400 }
      );
    }

    const bookCollection = await db.bookCollection.create({
      data: {
        bookId,
        collectionId: params.id
      }
    });

    return NextResponse.json({
      success: true,
      bookCollection
    });
  } catch (error) {
    console.error('Error adding book to collection:', error);
    return NextResponse.json(
      {
        error: 'Failed to add book to collection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
