import { NextRequest, NextResponse } from 'next/server';

const PROXY_URL = 'https://hushed-brett-annualetesina-2b360535.koyeb.app';

interface TVChannel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
}

function parseM3U(content: string): TVChannel[] {
  const lines = content.split('\n');
  const channels: TVChannel[] = [];
  let currentChannel: Partial<TVChannel> = {};
  let idCounter = 1;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('#EXTINF:')) {
      const nameMatch = trimmedLine.match(/,(.+)$/);
      const logoMatch = trimmedLine.match(/tvg-logo="([^"]+)"/);
      const groupMatch = trimmedLine.match(/group-title="([^"]+)"/);
      currentChannel = {
        id: `channel-${idCounter}`,
        name: nameMatch ? nameMatch[1].trim() : `Channel ${idCounter}`,
        logo: logoMatch ? logoMatch[1] : undefined,
        group: groupMatch ? groupMatch[1] : 'Altro',
      };
    } else if (trimmedLine && !trimmedLine.startsWith('#') && currentChannel.name) {
      currentChannel.url = trimmedLine;
      channels.push(currentChannel as TVChannel);
      currentChannel = {};
      idCounter++;
    }
  }
  return channels;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  try {
    let response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      signal: AbortSignal.timeout(10000)
    }).catch(() => null);

    if (!response || !response.ok) {
      console.log('[M3U] Direct fetch failed, using proxy...');
      response = await fetch(`${PROXY_URL}/proxy/raw?url=${encodeURIComponent(url)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000)
      });
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch M3U: ${response.status}`);
    }

    const content = await response.text();
    
    if (!content.includes('#EXTM3U') && !content.includes('#EXTINF')) {
      throw new Error('Invalid M3U content');
    }
    
    const channels = parseM3U(content);

    return NextResponse.json({ 
      channels,
      count: channels.length,
    });
  } catch (error) {
    console.error('[M3U] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch M3U file',
      details: error instanceof Error ? error.message : 'Unknown error',
      channels: [],
      count: 0,
    }, { status: 500 });
  }
}
