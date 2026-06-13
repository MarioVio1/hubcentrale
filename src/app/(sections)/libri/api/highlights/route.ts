import { NextRequest, NextResponse } from 'next/server';
import { db } from '@libri/lib/db';

// Get all highlights for a book
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookId = searchParams.get('bookId');

    if (!bookId) {
      return NextResponse.json(
        { error: 'bookId is required' },
        { status: 400 }
      );
    }

    const highlights = await db.highlight.findMany({
      where: { bookId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ highlights });
  } catch (error) {
    console.error('Error fetching highlights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch highlights' },
      { status: 500 }
    );
  }
}

// Create a new highlight
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, text, cfi, color, note } = body;

    if (!bookId || !text) {
      return NextResponse.json(
        { error: 'bookId and text are required' },
        { status: 400 }
      );
    }

    const highlight = await db.highlight.create({
      data: {
        bookId,
        text,
        cfi,
        color: color || '#ffff00',
        note,
      },
    });

    return NextResponse.json({ highlight });
  } catch (error) {
    console.error('Error creating highlight:', error);
    return NextResponse.json(
      { error: 'Failed to create highlight' },
      { status: 500 }
    );
  }
}

// Delete a highlight
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    await db.highlight.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting highlight:', error);
    return NextResponse.json(
      { error: 'Failed to delete highlight' },
      { status: 500 }
    );
  }
}
