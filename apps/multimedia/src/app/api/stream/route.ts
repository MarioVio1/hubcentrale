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

// VidSrc embed - always works instantly
function getVidSrcStream(type: string, id: number, season: number, episode: number): Stream {
  return {
    name: 'VidSrc',
    url: type === 'tv'
      ? `https://vidsrc.net/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`
      : `https://vidsrc.net/embed/movie?tmdb=${id}`,
    quality: 'HD',
    type: 'embed'
  };
}

// AutoEmbed - another fast option
function getAutoEmbedStream(type: string, id: number, season: number, episode: number): Stream {
  return {
    name: 'AutoEmbed',
    url: type === 'tv'
      ? `https://autoembed.cc/tv/tmdb/${id}-${season}-${episode}`
      : `https://autoembed.cc/movie/tmdb/${id}`,
    quality: 'HD',
    type: 'embed'
  };
}

// 2embed - another option
function get2EmbedStream(type: string, id: number, season: number, episode: number): Stream {
  return {
    name: '2Embed',
    url: type === 'tv'
      ? `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`
      : `https://www.2embed.cc/embed/${id}`,
    quality: 'HD',
    type: 'embed'
  };
}

// Embedsu - another option
function getEmbedsuStream(type: string, id: number, season: number, episode: number): Stream {
  return {
    name: 'Embedsu',
    url: type === 'tv'
      ? `https://embedsu.com/play/tv/${id}/${season}/${episode}`
      : `https://embedsu.com/play/movie/${id}`,
    quality: 'HD',
    type: 'embed'
  };
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

  console.log(`[Stream] ${type} ID: ${id}, S${season}E${episode}`);

  const mediaId = parseInt(id);

  // Return embed streams - direct + proxied
  const embedStreams: Stream[] = [
    { name: '2Embed', url: get2EmbedStream(type, mediaId, season, episode).url, quality: 'HD', type: 'embed' },
    { name: '2Embed (Proxy)', url: LOCAL_PROXY + encodeURIComponent(get2EmbedStream(type, mediaId, season, episode).url), quality: 'HD', type: 'embed' },
    { name: 'VidSrc', url: getVidSrcStream(type, mediaId, season, episode).url, quality: 'HD', type: 'embed' },
    { name: 'VidSrc (Proxy)', url: LOCAL_PROXY + encodeURIComponent(getVidSrcStream(type, mediaId, season, episode).url), quality: 'HD', type: 'embed' },
    { name: 'AutoEmbed', url: getAutoEmbedStream(type, mediaId, season, episode).url, quality: 'HD', type: 'embed' },
    { name: 'AutoEmbed (Proxy)', url: LOCAL_PROXY + encodeURIComponent(getAutoEmbedStream(type, mediaId, season, episode).url), quality: 'HD', type: 'embed' },
    { name: 'Embedsu', url: getEmbedsuStream(type, mediaId, season, episode).url, quality: 'HD', type: 'embed' },
    { name: 'Embedsu (Proxy)', url: LOCAL_PROXY + encodeURIComponent(getEmbedsuStream(type, mediaId, season, episode).url), quality: 'HD', type: 'embed' },
  ];
  const streams: Stream[] = [...embedStreams];

  // Try to add HLS streams (quickly, max 2 seconds)
  try {
    const vixUrl = type === 'tv'
      ? `https://vixsrc.to/tv/${mediaId}-${season}-${episode}`
      : `https://vixsrc.to/movie/${mediaId}/`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${PROXY_URL}/extractor/video?url=${encodeURIComponent(vixUrl)}&redirect_stream=false`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeout);

    if (response?.ok) {
      const data = await response.json();
      if (data.destination_url) {
        let playlistUrl = data.destination_url;
        if (!playlistUrl.includes('lang=')) {
          playlistUrl += (playlistUrl.includes('?') ? '&' : '?') + 'lang=it';
        }

        // Add HLS streams at the beginning
        streams.unshift(
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
        );
      }
    }
  } catch {
    // Ignore HLS errors - we already have embed streams
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
