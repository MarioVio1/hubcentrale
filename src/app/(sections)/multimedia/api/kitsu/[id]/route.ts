import { NextRequest, NextResponse } from 'next/server';

const KITSU_API = 'https://kitsu.io/api/edge';
const MAPPING_API = 'https://animemapping.stremio.dpdns.org';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: kitsuId } = await params;

  if (!kitsuId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    // Fetch anime details
    const response = await fetch(`${KITSU_API}/anime/${kitsuId}`, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Kitsu API error: ${response.status}`);
    }

    const data = await response.json();
    const anime = data.data as KitsuAnime;

    // Fetch genres
    let genres: string[] = [];
    try {
      const genresResponse = await fetch(
        `${KITSU_API}/anime/${kitsuId}/genres`,
        {
          headers: { 'Accept': 'application/vnd.api+json' },
          signal: AbortSignal.timeout(5000),
        }
      );
      if (genresResponse.ok) {
        const genresData = await genresResponse.json();
        genres = (genresData.data || []).map((g: { attributes?: { name?: string } }) => g.attributes?.name).filter(Boolean);
      }
    } catch {
      // Ignore genre fetch errors
    }

    // Fetch episodes if available
    let episodes: { number: number; title: string; thumbnail?: string }[] = [];
    if (anime.attributes.episodeCount && anime.attributes.episodeCount > 0) {
      try {
        const epsResponse = await fetch(
          `${KITSU_API}/anime/${kitsuId}/episodes?page[limit]=50`,
          {
            headers: { 'Accept': 'application/vnd.api+json' },
            signal: AbortSignal.timeout(5000),
          }
        );
        if (epsResponse.ok) {
          const epsData = await epsResponse.json();
          episodes = (epsData.data || []).map((ep: { attributes?: { number?: number; canonicalTitle?: string; titles?: { en_jp?: string }; thumbnail?: { original?: string } } }) => ({
            number: ep.attributes?.number || 0,
            title: ep.attributes?.canonicalTitle || ep.attributes?.titles?.en_jp || `Episode ${ep.attributes?.number}`,
            thumbnail: ep.attributes?.thumbnail?.original,
          })).sort((a: { number: number }, b: { number: number }) => a.number - b.number);
        }
      } catch {
        // Ignore episode fetch errors
      }
    }

    // Try to get TMDB mapping
    let tmdbId: string | null = null;
    try {
      const mappingResponse = await fetch(
        `${MAPPING_API}/kitsu/${kitsuId}`,
        { signal: AbortSignal.timeout(3000) }
      );
      if (mappingResponse.ok) {
        const mappingData = await mappingResponse.json();
        tmdbId = mappingData.mappings?.ids?.tmdb || null;
      }
    } catch {
      // Ignore mapping errors
    }

    const result = {
      id: anime.id,
      kitsu_id: parseInt(anime.id),
      tmdb_id: tmdbId,
      title: anime.attributes.canonicalTitle || anime.attributes.titles?.en || anime.attributes.titles?.en_jp,
      titles: anime.attributes.titles,
      synopsis: anime.attributes.synopsis,
      poster: anime.attributes.posterImage?.small || anime.attributes.posterImage?.medium,
      cover: anime.attributes.coverImage?.large || anime.attributes.coverImage?.original,
      rating: anime.attributes.averageRating,
      popularityRank: anime.attributes.popularityRank,
      ratingRank: anime.attributes.ratingRank,
      episodeCount: anime.attributes.episodeCount,
      episodeLength: anime.attributes.episodeLength,
      status: anime.attributes.status,
      startDate: anime.attributes.startDate,
      endDate: anime.attributes.endDate,
      subtype: anime.attributes.subtype,
      youtubeVideoId: anime.attributes.youtubeVideoId,
      ageRating: anime.attributes.ageRating,
      genres,
      episodes,
      media_type: 'anime',
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('[Kitsu Detail] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch anime details' }, { status: 500 });
  }
}
