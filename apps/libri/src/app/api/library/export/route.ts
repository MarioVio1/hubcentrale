import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * API per esportare la biblioteca in JSON
 */
export async function GET() {
  try {
    const books = await db.book.findMany({
      include: {
        progress: true,
        bookmarks: true,
        highlights: true,
        rating: true,
        collections: {
          include: {
            collection: true
          }
        }
      },
      orderBy: {
        addedAt: 'desc'
      }
    });

    const collections = await db.collection.findMany();

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      books: books.map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        description: book.description,
        fileType: book.fileType,
        category: book.category,
        totalPages: book.totalPages,
        addedAt: book.addedAt.toISOString(),
        progress: book.progress ? {
          currentPage: book.progress.currentPage,
          percentage: book.progress.percentage,
          cfi: book.progress.cfi,
          lastReadAt: book.progress.lastReadAt.toISOString()
        } : null,
        bookmarks: book.bookmarks.map((b) => ({
          title: b.title,
          cfi: b.cfi,
          note: b.note,
          createdAt: b.createdAt.toISOString()
        })),
        highlights: book.highlights.map((h) => ({
          text: h.text,
          cfi: h.cfi,
          color: h.color,
          note: h.note,
          createdAt: h.createdAt.toISOString()
        })),
        rating: book.rating ? {
          rating: book.rating.rating,
          review: book.rating.review,
          createdAt: book.rating.createdAt.toISOString()
        } : null,
        collections: book.collections.map((c) => c.collection.name)
      })),
      collections: collections.map((c) => ({
        name: c.name,
        description: c.description,
        color: c.color,
        createdAt: c.createdAt.toISOString()
      }))
    };

    return NextResponse.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Error exporting library:', error);
    return NextResponse.json(
      {
        error: 'Failed to export library',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
