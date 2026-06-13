import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get all bookmarks for a book
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

    const bookmarks = await db.bookmark.findMany({
      where: { bookId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}

// Create a new bookmark
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, title, cfi, pageNumber, note } = body;

    if (!bookId) {
      return NextResponse.json(
        { error: 'bookId is required' },
        { status: 400 }
      );
    }

    const bookmark = await db.bookmark.create({
      data: {
        bookId,
        title: title || 'Untitled Bookmark',
        cfi,
        pageNumber,
        note,
      },
    });

    return NextResponse.json({ bookmark });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    );
  }
}

// Delete a bookmark
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

    await db.bookmark.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    );
  }
}
