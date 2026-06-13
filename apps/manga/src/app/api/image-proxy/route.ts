import { NextRequest, NextResponse } from 'next/server';

// Image proxy endpoint to bypass CORS and hotlink protection
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    console.log('[Image Proxy] Fetching:', imageUrl);

    // Determine the appropriate referer based on the image URL
    const url = new URL(imageUrl);
    let referer = 'https://www.mangaworld.mx/';

    if (url.hostname.includes('mangadex.org') || url.hostname.includes('uploads.mangadex.org')) {
      referer = 'https://mangadex.org/';
    } else if (url.hostname.includes('mangaworldadult.net')) {
      referer = 'https://www.mangaworldadult.net/';
    } else if (url.hostname.includes('comick.app')) {
      referer = 'https://comick.app/';
    } else if (url.hostname.includes('mangalife')) {
      referer = 'https://mangalife.net/';
    }

    // Fetch the image with appropriate headers
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,it;q=0.8',
        'Referer': referer,
        'Origin': referer,
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      console.error('[Image Proxy] Failed to fetch image:', imageUrl, response.status);

      // Check if response is HTML (error page)
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        const text = await response.text();
        console.error('[Image Proxy] Received HTML instead of image:', text.substring(0, 200));
      }

      // Return a placeholder image for errors
      const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
        <rect width="300" height="450" fill="#1a1a2e"/>
        <text x="150" y="200" text-anchor="middle" fill="#4a4a6a" font-size="48" font-family="Arial, sans-serif" font-weight="bold">📚</text>
        <text x="150" y="250" text-anchor="middle" fill="#4a4a6a" font-size="16" font-family="Arial, sans-serif">Copertina non disponibile</text>
      </svg>`;
      return new NextResponse(Buffer.from(placeholderSvg), {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    // Get image data
    const imageBuffer = await response.arrayBuffer();
    const responseContentType = response.headers.get('content-type');

    // Validate that we received an image
    if (!responseContentType || !responseContentType.startsWith('image/')) {
      console.error('[Image Proxy] Invalid content type:', responseContentType);

      const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
        <rect width="300" height="450" fill="#1a1a2e"/>
        <text x="150" y="200" text-anchor="middle" fill="#4a4a6a" font-size="48" font-family="Arial, sans-serif" font-weight="bold">📚</text>
        <text x="150" y="250" text-anchor="middle" fill="#4a4a6a" font-size="16" font-family="Arial, sans-serif">Immagine non valida</text>
      </svg>`;
      return new NextResponse(Buffer.from(placeholderSvg), {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    // Cache for 1 hour
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': responseContentType,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('[Image Proxy] Error:', error);

    const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
      <rect width="300" height="450" fill="#1a1a2e"/>
      <text x="150" y="200" text-anchor="middle" fill="#4a4a6a" font-size="48" font-family="Arial, sans-serif" font-weight="bold">📚</text>
      <text x="150" y="250" text-anchor="middle" fill="#4a4a6a" font-size="16" font-family="Arial, sans-serif">Errore di caricamento</text>
    </svg>`;
    return new NextResponse(Buffer.from(placeholderSvg), {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
}
