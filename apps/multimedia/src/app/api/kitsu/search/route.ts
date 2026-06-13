import { NextRequest, NextResponse } from 'next/server';

const KITSU_API = 'https://kitsu.io/api/edge';

interface KitsuAnime {
  id: string;
  type: string;
  attributes: {
    canonicalTitle: string;
    titles: { en?: string; en_jp?: string; ja_jp?: string };
    synopsis: string;
    posterImage: { small: string; medium: string; large: string; original: string } | null;
    coverImage: { small: string; large: string; original: string } | null;
    averageRating: number | null;
    popularityRank: number | null;
    ratingRank: number | null;
    startDate: string | null;
    endDate: string | null;
    status: string;
    episodeCount: number | null;
    episodeLength: number | null;
    youtubeVideoId: string | null;
    ageRating: string | null;
    subtype: string;
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const response = await fetch(
      `${KITSU_API}/anime?filter[text]=${encodeURIComponent(q)}&page[limit]=20&page[offset]=0`,
      {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      throw new Error(`Kitsu API error: ${response.status}`);
    }

    const data = await response.json();
    const results = (data.data || []).map((anime: KitsuAnime) => ({
      id: anime.id,
      kitsu_id: parseInt(anime.id),
      title: anime.attributes.canonicalTitle || anime.attributes.titles?.en || anime.attributes.titles?.en_jp,
      titles: anime.attributes.titles,
      synopsis: anime.attributes.synopsis,
      poster: anime.attributes.posterImage?.small || anime.attributes.posterImage?.medium,
      cover: anime.attributes.coverImage?.large || anime.attributes.coverImage?.original,
      rating: anime.attributes.averageRating,
      popularityRank: anime.attributes.popularityRank,
      episodeCount: anime.attributes.episodeCount,
      status: anime.attributes.status,
      startDate: anime.attributes.startDate,
      subtype: anime.attributes.subtype,
      media_type: 'anime',
    }));

    return NextResponse.json({ results });

  } catch (error) {
    console.error('[Kitsu Search] Error:', error);
    return NextResponse.json({ results: [], error: 'Search failed' });
  }
}
