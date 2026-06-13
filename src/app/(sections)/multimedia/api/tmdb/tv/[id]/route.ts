import { NextResponse } from 'next/server';
import { tvShows } from '@multimedia/lib/tmdb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tvShow = await tvShows.getDetails(parseInt(id));
    return NextResponse.json(tvShow);
  } catch (error) {
    console.error('Error fetching TV show:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TV show details' },
      { status: 500 }
    );
  }
}
