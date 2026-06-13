import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get progress for a book or all progress
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const bookId = searchParams.get('bookId');

    if (bookId) {
      const progress = await db.readingProgress.findUnique({
        where: {
          bookId,
        },
        include: {
          book: true,
        },
      });

      return NextResponse.json({ progress });
    }

    const progress = await db.readingProgress.findMany({
      include: {
        book: true,
      },
      orderBy: { lastReadAt: 'desc' },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

// Create or update reading progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, currentPage, totalPages, percentage, cfi, lastPosition } = body;

    // Check if progress already exists
    const existingProgress = await db.readingProgress.findUnique({
      where: {
        bookId,
      },
    });

    let progress;

    if (existingProgress) {
      // Update existing progress
      progress = await db.readingProgress.update({
        where: { bookId },
        data: {
          currentPage: currentPage ?? existingProgress.currentPage,
          totalPages: totalPages ?? existingProgress.totalPages,
          percentage: percentage ?? existingProgress.percentage,
          cfi: cfi ?? existingProgress.cfi,
          lastPosition: lastPosition ?? existingProgress.lastPosition,
          lastReadAt: new Date(),
        },
      });
    } else {
      // Create new progress
      progress = await db.readingProgress.create({
        data: {
          bookId,
          currentPage: currentPage || 0,
          totalPages,
          percentage: percentage || 0,
          cfi,
          lastPosition,
        },
      });
    }

    // Update book category based on percentage
    if (percentage >= 100) {
      await db.book.update({
        where: { id: bookId },
        data: { category: 'completed' },
      });
    } else if (percentage > 0) {
      await db.book.update({
        where: { id: bookId },
        data: { category: 'reading' },
      });
    }

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error saving progress:', error);
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}
