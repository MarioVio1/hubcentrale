import { NextRequest, NextResponse } from 'next/server';

const MAPPING_API = 'https://animemapping.stremio.dpdns.org';
const KITSU_API = 'https://kitsu.io/api/edge';
const PROXY_URL = 'https://hushed-brett-annualetesina-2b360535.koyeb.app';

interface Stream {
  name: string;
  url: string;
  quality?: string;
  type: 'hls' | 'embed';
}

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36';

// Get TMDB ID from Kitsu ID
async function getTmdbFromKitsu(kitsuId: string): Promise<string | null> {
  try {
    const url = `${MAPPING_API}/kitsu/${kitsuId}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return null;
    const data = await response.json();
    return data.mappings?.ids?.tmdb || null;
  } catch {
    return null;
  }
}

// Extract HLS from VixSrc
async function extractVixSrcHls(tmdbId: string, episode: number): Promise<Stream[]> {
  const streams: Stream[] = [];
  
  try {
    const vixUrl = `https://vixsrc.to/tv/${tmdbId}-1-${episode}`;
    console.log('[VixSrc Anime] Extracting:', vixUrl);

    const response = await fetch(`${PROXY_URL}/extractor/video?url=${encodeURIComponent(vixUrl)}&redirect_stream=false`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(15000)
    });

    if (response.ok) {
      const data = await response.json();

      if (data.destination_url) {
        let playlistUrl = data.destination_url;
        if (!playlistUrl.includes('lang=')) {
          playlistUrl += (playlistUrl.includes('?') ? '&' : '?') + 'lang=it';
        }

        // StreamVix proxy
        streams.push({
          name: 'StreamVix',
          url: `https://streamvix.hayd.uk/vixsynthetic.m3u8?src=${encodeURIComponent(playlistUrl)}&lang=it&max=1&multi=1`,
          quality: 'HD',
          type: 'hls'
        });

        // Koyeb proxy
        streams.push({
          name: 'VixSrc HLS',
          url: `${PROXY_URL}/proxy/hls/manifest.m3u8?url=${encodeURIComponent(playlistUrl)}`,
          quality: 'HD',
          type: 'hls'
        });

        // Direct
        streams.push({
          name: 'VixSrc Direct',
          url: playlistUrl,
          quality: 'HD',
          type: 'hls'
        });
      }
    }
  } catch (error) {
    console.error('[VixSrc Anime] Error:', error);
  }

  return streams;
}

// Main handler
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kitsuId = searchParams.get('kitsu_id') || searchParams.get('id');
  const episode = parseInt(searchParams.get('e') || '1');

  if (!kitsuId) {
    return NextResponse.json({ error: 'Missing kitsu_id parameter' }, { status: 400 });
  }

  console.log(`[Anime Stream] Kitsu ID: ${kitsuId}, Episode: ${episode}`);

  try {
    // Get TMDB mapping
    const tmdbId = await getTmdbFromKitsu(kitsuId);
    console.log(`[Anime Stream] TMDB mapping: ${tmdbId || 'not found'}`);

    const streams: Stream[] = [];

    // Try VixSrc HLS if we have TMDB ID
    if (tmdbId) {
      const hlsStreams = await extractVixSrcHls(tmdbId, episode);
      streams.push(...hlsStreams);
    }

    // Fallback embed if no HLS
    if (streams.length === 0 && tmdbId) {
      streams.push({
        name: 'VidSrc',
        url: `https://vidsrc.net/embed/tv?tmdb=${tmdbId}&season=1&episode=${episode}`,
        quality: 'HD',
        type: 'embed'
      });
    }

    const hasHLS = streams.some(s => s.type === 'hls');

    return NextResponse.json({
      streams,
      kitsu_id: kitsuId,
      tmdb_id: tmdbId,
      episode,
      hasHLS,
    });

  } catch (error) {
    console.error('[Anime Stream] Error:', error);

    return NextResponse.json({
      streams: [{
        name: 'VidSrc',
        url: `https://vidsrc.net/embed/tv?tmdb=${kitsuId}&season=1&episode=${episode}`,
        quality: 'HD',
        type: 'embed'
      }],
      kitsu_id: kitsuId,
      episode,
      hasHLS: false,
    });
  }
}
