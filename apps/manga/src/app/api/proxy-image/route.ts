import { NextRequest, NextResponse } from 'next/server';

// Image proxy to bypass hotlink protection
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    console.log('[Proxy] Image request received');
    console.log('[Proxy] - Full URL length:', imageUrl?.length);
    console.log('[Proxy] - URL (first 200 chars):', imageUrl?.substring(0, 200));
    console.log('[Proxy] - URL (last 100 chars):', imageUrl?.substring(Math.max(0, (imageUrl?.length || 0) - 100)));

    if (!imageUrl) {
      console.error('[Proxy] No URL provided');
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Fetch the image with appropriate headers
    console.log('[Proxy] Fetching image from source...');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.mangaworld.mx/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    console.log('[Proxy] Response status:', response.status);

    if (!response.ok) {
      console.error(`[Proxy] Failed to fetch image: ${response.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch image', status: response.status },
        { status: response.status }
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    console.log('[Proxy] Image fetched successfully, size:', imageBuffer.byteLength, 'content-type:', contentType);

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
