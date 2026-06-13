import { NextResponse } from 'next/server';
import { db } from '@multimedia/lib/db';

export async function GET() {
  try {
    const history = await db.watchHistory.findMany({
      orderBy: { watchedAt: 'desc' },
      take: 50,
    });
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching watch history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watch history' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mediaId, mediaType, title, posterPath, overview, voteAverage, releaseDate, season, episode, progress } = body;

    const existing = await db.watchHistory.findUnique({
      where: {
        mediaId_mediaType: {
          mediaId,
          mediaType,
        },
      },
    });

    if (existing) {
      const updated = await db.watchHistory.update({
        where: {
          mediaId_mediaType: {
            mediaId,
            mediaType,
          },
        },
        data: {
          title,
          posterPath,
          overview,
          voteAverage,
          releaseDate,
          season,
          episode,
          progress,
          watchedAt: new Date(),
        },
      });
      return NextResponse.json(updated);
    }

    const history = await db.watchHistory.create({
      data: {
        mediaId,
        mediaType,
        title,
        posterPath,
        overview,
        voteAverage,
        releaseDate,
        season,
        episode,
        progress,
      },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error updating watch history:', error);
    return NextResponse.json(
      { error: 'Failed to update watch history' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    await db.watchHistory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from history:', error);
    return NextResponse.json(
      { error: 'Failed to remove from history' },
      { status: 500 }
    );
  }
}
