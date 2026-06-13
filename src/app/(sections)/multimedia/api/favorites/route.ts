import { NextResponse } from 'next/server';
import { db } from '@multimedia/lib/db';

export async function GET() {
  try {
    const favorites = await db.favorite.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mediaId, mediaType, title, posterPath, overview, voteAverage, releaseDate } = body;

    const favorite = await db.favorite.create({
      data: {
        mediaId,
        mediaType,
        title,
        posterPath,
        overview,
        voteAverage,
        releaseDate,
      },
    });

    return NextResponse.json(favorite);
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mediaId = searchParams.get('mediaId');
    const mediaType = searchParams.get('mediaType');

    if (!mediaId || !mediaType) {
      return NextResponse.json(
        { error: 'mediaId and mediaType are required' },
        { status: 400 }
      );
    }

    await db.favorite.delete({
      where: {
        mediaId_mediaType: {
          mediaId: parseInt(mediaId),
          mediaType,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
