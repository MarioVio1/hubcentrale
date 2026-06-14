import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  let url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter required' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Icy-MetaData': '1',
        'Referer': url,
      },
    });

    clearTimeout(timeoutId);
    const finalUrl = response.url;

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'application/vnd.apple.mpegurl';
    let content = await response.text();

    if (contentType.includes('mpegurl') || url.includes('.m3u8') || content.includes('#EXTM3U')) {
      const baseUrl = finalUrl.substring(0, finalUrl.lastIndexOf('/') + 1);
      
      content = content.split('\n').map(line => {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('#') || trimmed === '') {
          if (trimmed.includes('URI="')) {
            return trimmed.replace(/URI="([^"]+)"/, (match, uri) => {
              const absoluteUri = uri.startsWith('http') ? uri : baseUrl + uri;
              return `URI="/api/hls?url=${encodeURIComponent(absoluteUri)}"`;
            });
          }
          return trimmed;
        }
        
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          return `/api/hls?url=${encodeURIComponent(trimmed)}`;
        }
        
        const absoluteUrl = baseUrl + trimmed;
        return `/api/hls?url=${encodeURIComponent(absoluteUrl)}`;
      }).join('\n');

      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Cache-Control': 'no-cache',
        },
      });
    }
    
    const buffer = await response.arrayBuffer();
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('HLS Proxy error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch stream',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
