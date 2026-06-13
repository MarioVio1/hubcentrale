import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * API per ottenere le statistiche di lettura
 */
export async function GET(request: NextRequest) {
  try {
    // Statistiche generali
    const totalBooks = await db.book.count();

    const readingBooks = await db.book.count({
      where: { category: 'reading' }
    });

    const completedBooks = await db.book.count({
      where: { category: 'completed' }
    });

    const wishlistBooks = await db.book.count({
      where: { category: 'wishlist' }
    });

    // Statistiche sui ratings
    const ratings = await db.bookRating.findMany({
      include: { book: true }
    });

    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    // Statistiche sulle sessioni di lettura
    const sessions = await db.readingSession.findMany();

    const totalReadingTime = sessions.reduce((sum, s) => sum + s.duration, 0); // in seconds
    const totalReadingMinutes = Math.floor(totalReadingTime / 60);
    const totalReadingHours = (totalReadingMinutes / 60).toFixed(1);

    const totalPagesRead = sessions.reduce((sum, s) => sum + (s.pagesRead || 0), 0);

    // Libri con più sessioni
    const booksWithSessionCount = await db.readingSession.groupBy({
      by: ['bookId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    const topBooks = await Promise.all(
      booksWithSessionCount.map(async (b) => {
        const book = await db.book.findUnique({
          where: { id: b.bookId }
        });
        return {
          book,
          sessionCount: b._count.id
        };
      })
    );

    // Statistiche recenti (ultimi 7 giorni)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSessions = await db.readingSession.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    });

    const recentReadingTime = recentSessions.reduce((sum, s) => sum + s.duration, 0);
    const recentReadingMinutes = Math.floor(recentReadingTime / 60);

    return NextResponse.json({
      success: true,
      statistics: {
        books: {
          total: totalBooks,
          reading: readingBooks,
          completed: completedBooks,
          wishlist: wishlistBooks
        },
        ratings: {
          total: ratings.length,
          average: parseFloat(avgRating.toFixed(1))
        },
        reading: {
          totalMinutes: totalReadingMinutes,
          totalHours: parseFloat(totalReadingHours),
          totalPagesRead,
          sessionsCount: sessions.length
        },
        recent: {
          last7DaysMinutes: recentReadingMinutes,
          last7DaysSessions: recentSessions.length
        },
        topBooks: topBooks.filter((b: any) => b.book !== null).map((b: any) => ({
          id: b.book.id,
          title: b.book.title,
          author: b.book.author,
          sessionCount: b.sessionCount
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
