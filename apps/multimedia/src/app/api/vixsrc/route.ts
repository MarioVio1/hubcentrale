import { NextRequest, NextResponse } from 'next/server';

const PROXY_URL = 'https://hushed-brett-annualetesina-2b360535.koyeb.app';
const VIXSRC_BASE = 'https://vixsrc.to';

interface Stream {
  name: string;
  title: string;
  url: string;
  quality?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'movie';
  const id = searchParams.get('id');
  const season = searchParams.get('s') || '1';
  const episode = searchParams.get('e') || '1';

  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  try {
    const streams: Stream[] = [];

    // Build VixSrc URL
    const vixsrcUrl = type === 'tv' 
      ? `${VIXSRC_BASE}/embed/tv/${id}-${season}-${episode}`
      : `${VIXSRC_BASE}/embed/movie/${id}`;

    console.log('[VixSrc] Fetching:', vixsrcUrl);

    // Method 1: Direct embed through proxy
    streams.push({
      name: 'VixSrc',
      title: 'VixSrc HD',
      url: `${PROXY_URL}/proxy/iframe?url=${encodeURIComponent(vixsrcUrl)}`,
      quality: 'HD'
    });

    // Method 2: Direct embed (fallback)
    streams.push({
      name: 'VixSrc Direct',
      title: 'VixSrc Direct',
      url: vixsrcUrl,
      quality: 'HD'
    });

    return NextResponse.json({
      streams,
      source: 'vixsrc',
      embedUrl: vixsrcUrl
    });

  } catch (error) {
    console.error('[VixSrc] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch streams',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
