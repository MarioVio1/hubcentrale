import { NextRequest, NextResponse } from 'next/server';

/**
 * Anna's Archive Integration API
 *
 * SECURITY WARNING:
 * This integration connects to shadow libraries (Anna's Archive).
 * Users should be aware of their local laws regarding copyright and the legal
 * implications of using shadow libraries.
 *
 * DISCLAIMER: This software does not host or distribute copyrighted material.
 * It only provides links to external resources. Users are responsible for
 * ensuring they comply with applicable copyright laws in their jurisdiction.
 */

const ANNAS_ARCHIVE_MIRRORS = [
  'https://annas-archive.pk',
  'https://annas-archive.org',
];

const getMirrorUrl = () => {
  return ANNAS_ARCHIVE_MIRRORS[0]; // Default to first mirror
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const action = searchParams.get('action'); // 'search' or 'download'
  const md5 = searchParams.get('md5'); // For direct download

  if (action === 'search' && query) {
    // Generate search URL for Anna's Archive
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `${getMirrorUrl()}/search?q=${encodedQuery}`;

    return NextResponse.json({
      success: true,
      searchUrl,
      query,
      mirrors: ANNAS_ARCHIVE_MIRRORS,
      disclaimer: 'Please respect copyright laws in your jurisdiction.',
    });
  }

  if (action === 'download' && md5) {
    // Generate direct download URL
    const downloadUrl = `${getMirrorUrl()}/slow_download/${md5}`;

    return NextResponse.json({
      success: true,
      downloadUrl,
      md5,
      disclaimer: 'Please respect copyright laws in your jurisdiction.',
    });
  }

  // Return available mirrors if no action specified
  return NextResponse.json({
    success: true,
    mirrors: ANNAS_ARCHIVE_MIRRORS,
    currentMirror: getMirrorUrl(),
    disclaimer: 'Please respect copyright laws in your jurisdiction.',
    supportedActions: ['search', 'download'],
    usage: {
      search: '/api/shadowlib/annas-archive?action=search&q=book+title',
      download: '/api/shadowlib/annas-archive?action=download&md5=MD5_HASH',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, author } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Build search query
    const query = author ? `${title} ${author}` : title;
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `${getMirrorUrl()}/search?q=${encodedQuery}`;

    return NextResponse.json({
      success: true,
      searchUrl,
      query,
      directDownloadPage: 'https://shadowlibraries.github.io/DirectDownloads/AnnasArchive/',
      mirrors: ANNAS_ARCHIVE_MIRRORS,
      disclaimer: 'Please respect copyright laws in your jurisdiction.',
      instructions: [
        '1. Visit the search URL to find the book',
        '2. Copy the MD5 hash of the book you want',
        '3. Use the download endpoint with the MD5 hash',
        '4. Download and import the file to your local library',
      ],
    });
  } catch (error) {
    console.error('Error in Anna\'s Archive integration:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
