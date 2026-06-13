import { NextRequest, NextResponse } from 'next/server';
import { db } from '@manga/lib/db';

// GET reading history
export async function GET() {
  try {
    const history = await db.readingHistory.findMany({
      include: {
        manga: {
          include: {
            extension: true,
          },
        },
      },
      orderBy: {
        readAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reading history' },
      { status: 500 }
    );
  }
}

// POST add to reading history
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mangaId, chapterId, chapterNum } = body;

    if (!mangaId) {
      return NextResponse.json(
        { error: 'Manga ID is required' },
        { status: 400 }
      );
    }

    // Remove existing entry for this manga
    await db.readingHistory.deleteMany({
      where: { mangaId },
    });

    // Create new entry
    const history = await db.readingHistory.create({
      data: {
        mangaId,
        chapterId,
        chapterNum,
        readAt: new Date(),
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error adding to history:', error);
    return NextResponse.json(
      { error: 'Failed to add to reading history' },
      { status: 500 }
    );
  }
}

// DELETE clear all history or specific manga
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mangaId = searchParams.get('mangaId');

    if (mangaId) {
      // Delete specific manga history
      await db.readingHistory.deleteMany({
        where: { mangaId },
      });
    } else {
      // Delete all history
      await db.readingHistory.deleteMany({});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing history:', error);
    return NextResponse.json(
      { error: 'Failed to clear history history' },
      { status: 500 }
    );
  }
}
