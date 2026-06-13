import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * API per creare una nuova sessione di lettura
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, duration, pagesRead, startCfi, endCfi } = body;

    if (!bookId || !duration) {
      return NextResponse.json(
        { error: 'bookId and duration are required' },
        { status: 400 }
      );
    }

    // Verifica che il libro esista
    const book = await db.book.findUnique({
      where: { id: bookId }
    });

    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    const session = await db.readingSession.create({
      data: {
        bookId,
        duration,
        pagesRead: pagesRead || 0,
        startCfi,
        endCfi
      }
    });

    return NextResponse.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error creating reading session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create reading session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * API per ottenere le sessioni di lettura
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookId = searchParams.get('bookId');
    const limit = parseInt(searchParams.get('limit') || '10');

    const sessions = await db.readingSession.findMany({
      where: bookId ? { bookId } : undefined,
      include: {
        book: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return NextResponse.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Error fetching reading sessions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch reading sessions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
