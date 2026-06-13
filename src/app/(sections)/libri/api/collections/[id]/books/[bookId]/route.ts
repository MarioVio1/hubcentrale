import { NextRequest, NextResponse } from 'next/server';
import { db } from '@libri/lib/db';

/**
 * API per rimuovere un libro da una collection
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; bookId: string } }
) {
  try {
    await db.bookCollection.deleteMany({
      where: {
        collectionId: params.id,
        bookId: params.bookId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Book removed from collection successfully'
    });
  } catch (error) {
    console.error('Error removing book from collection:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove book from collection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
