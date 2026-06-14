import { NextRequest, NextResponse } from 'next/server';

const PROXY_URL = 'https://hushed-brett-annualetesina-2b360535.koyeb.app';
const LOCAL_PROXY = '/api/proxy/embed?url=';

interface Stream {
  name: string;
  url: string;
  quality?: string;
  type: 'hls' | 'embed';
}

const USER_AGENT = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36';

const proxyUrl = (url: string) => `${LOCAL_PROXY}${encodeURIComponent(url)}`;

// Embed URL generators
const addAuto = (url: string) => url + (url.includes('?') ? '&' : '?') + 'autoplay=1';

const get2EmbedUrl = (type: string, id: number, season: number, episode: number) => addAuto(
  type === 'tv'
    ? `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`
    : `https://www.2embed.cc/embed/${id}`
);

const getVidSrcUrl = (type: string, id: number, season: number, episode: number) => addAuto(
  type === 'tv'
    ? `https://vidsrc.net/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`
    : `https://vidsrc.net/embed/movie?tmdb=${id}`
);

const getAutoEmbedUrl = (type: string, id: number, season: number, episode: number) => addAuto(
  type === 'tv'
    ? `https://autoembed.cc/tv/tmdb/${id}-${season}-${episode}`
    : `https://autoembed.cc/movie/tmdb/${id}`
);

const getEmbedsuUrl = (type: string, id: number, season: number, episode: number) => addAuto(
  type === 'tv'
    ? `https://embedsu.com/play/tv/${id}/${season}/${episode}`
    : `https://embedsu.com/play/movie/${id}`
);

const getVixSrcUrl = (type: string, id: number, season: number, episode: number) =>
  type === 'tv'
    ? `https://vixsrc.to/tv/${id}/${season}/${episode}?autoplay=true&primaryColor=8b5cf6`
    : `https://vixsrc.to/movie/${id}?autoplay=true&primaryColor=8b5cf6`;

function buildEmbedStreams(type: string, id: number, season: number, episode: number): Stream[] {
  const direct = (name: string, url: string) => ({ name, url, quality: 'HD' as const, type: 'embed' as const });
  const proxied = (name: string, url: string) => ({ name, url: proxyUrl(url), quality: 'HD' as const, type: 'embed' as const });

  return [
    direct('VixSrc', getVixSrcUrl(type, id, season, episode)),
    direct('2Embed', get2EmbedUrl(type, id, season, episode)),
    proxied('2Embed', get2EmbedUrl(type, id, season, episode)),
    direct('VidSrc', getVidSrcUrl(type, id, season, episode)),
    direct('AutoEmbed', getAutoEmbedUrl(type, id, season, episode)),
    direct('Embedsu', getEmbedsuUrl(type, id, season, episode)),
    proxied('VidSrc', getVidSrcUrl(type, id, season, episode)),
    proxied('AutoEmbed', getAutoEmbedUrl(type, id, season, episode)),
    proxied('Embedsu', getEmbedsuUrl(type, id, season, episode)),
  ];
}

// In-memory cache for HLS streams
let hlsCache: Map<string, Stream[]> = new Map();

async function fetchHlsStreams(type: string, id: number, season: number, episode: number): Promise<Stream[]> {
  const cacheKey = `${type}-${id}-${season}-${episode}`;
  try {
    const vixUrl = type === 'tv'
      ? `https://vixsrc.to/tv/${id}-${season}-${episode}`
      : `https://vixsrc.to/movie/${id}/`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${PROXY_URL}/extractor/video?url=${encodeURIComponent(vixUrl)}&redirect_stream=false`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data.destination_url) {
        let playlistUrl = data.destination_url;
        if (!playlistUrl.includes('lang=')) {
          playlistUrl += (playlistUrl.includes('?') ? '&' : '?') + 'lang=it';
        }

        const hls: Stream[] = [
          {
            name: 'StreamVix HLS',
            url: `https://streamvix.hayd.uk/vixsynthetic.m3u8?src=${encodeURIComponent(playlistUrl)}&lang=it&max=1&multi=1`,
            quality: 'HD',
            type: 'hls'
          },
          {
            name: 'VixSrc HLS',
            url: `${PROXY_URL}/proxy/hls/manifest.m3u8?url=${encodeURIComponent(playlistUrl)}`,
            quality: 'HD',
            type: 'hls'
          }
        ];
        hlsCache.set(cacheKey, hls);
        return hls;
      }
    }
  } catch {
    // Ignore errors
  }
  return [];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'movie';
  const id = searchParams.get('id');
  const season = parseInt(searchParams.get('s') || '1');
  const episode = parseInt(searchParams.get('e') || '1');

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  const mediaId = parseInt(id);

  // Build embed streams instantly (no blocking)
  const embedStreams = buildEmbedStreams(type, mediaId, season, episode);
  const streams: Stream[] = [...embedStreams];

  // Check cache for HLS streams
  const cacheKey = `${type}-${mediaId}-${season}-${episode}`;
  const cached = hlsCache.get(cacheKey);
  if (cached) {
    streams.unshift(...cached);
  }

  // Fire-and-forget HLS extraction (doesn't block response)
  if (!cached) {
    fetchHlsStreams(type, mediaId, season, episode).then(hls => {
      if (hls.length > 0) {
        hlsCache.set(cacheKey, hls);
      }
    });
  }

  return NextResponse.json({
    streams,
    mediaId: id,
    type,
    season,
    episode,
    hasHLS: streams.some(s => s.type === 'hls'),
  });
}
