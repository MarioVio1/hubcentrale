import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST update reading progress
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chapterId, currentPage, totalPages } = body;

    if (!chapterId) {
      return NextResponse.json(
        { error: 'Chapter ID is required' },
        { status: 400 }
      );
    }

    // Update or create progress
    const progress = await db.readingProgress.upsert({
      where: { chapterId },
      update: {
        currentPage: currentPage || 0,
        totalPages: totalPages || undefined,
        lastReadAt: new Date(),
      },
      create: {
        chapterId,
        currentPage: currentPage || 0,
        totalPages,
        lastReadAt: new Date(),
      },
    });

    // Update chapter lastPageRead
    await db.chapter.update({
      where: { id: chapterId },
      data: { lastPageRead: currentPage || 0 },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update reading progress' },
      { status: 500 }
    );
  }
}

// GET reading progress for a chapter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get('chapterId');

    if (!chapterId) {
      return NextResponse.json(
        { error: 'Chapter ID is required' },
        { status: 400 }
      );
    }

    const progress = await db.readingProgress.findUnique({
      where: { chapterId },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reading progress' },
      { status: 500 }
    );
  }
}
