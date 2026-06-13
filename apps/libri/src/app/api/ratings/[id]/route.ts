import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * API per ottenere o aggiornare il rating di un libro
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rating = await db.bookRating.findUnique({
      where: { bookId: params.id },
      include: { book: true }
    });

    if (!rating) {
      return NextResponse.json(
        { success: true, rating: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      rating
    });
  } catch (error) {
    console.error('Error fetching rating:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch rating',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { rating, review } = body;

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Verifica che il libro esista
    const book = await db.book.findUnique({
      where: { id: params.id }
    });

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    const ratingRecord = await db.bookRating.upsert({
      where: { bookId: params.id },
      update: { rating, review },
      create: {
        bookId: params.id,
        rating,
        review
      }
    });

    return NextResponse.json({
      success: true,
      rating: ratingRecord
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    return NextResponse.json(
      {
        error: 'Failed to update rating',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.bookRating.delete({
      where: { bookId: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting rating:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete rating',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
