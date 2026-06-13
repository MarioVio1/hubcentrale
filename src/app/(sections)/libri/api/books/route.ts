import { NextRequest, NextResponse } from 'next/server';
import { db } from '@libri/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category'); // reading, completed, wishlist
    const search = searchParams.get('search'); // search by title or author

    const where: any = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    const books = await db.book.findMany({
      where,
      orderBy: { addedAt: 'desc' },
      include: {
        progress: {
          orderBy: { lastReadAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({ books });
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}
