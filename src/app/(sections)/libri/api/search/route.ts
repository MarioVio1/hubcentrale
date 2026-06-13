import { NextRequest, NextResponse } from 'next/server';
import { searchBooks, getSourceLabel, ANNAS_ARCHIVE_WARNING } from '@libri/lib/book-sources';

/**
 * API per cercare libri su multiple fonti
 *
 * ⚠️ AVVERTENZA IMPORTANTE:
 * - Anna's Archive è una shadow library
 * - L'uso di questa fonte deve rispettare le leggi locali sul copyright
 * - Gli utenti sono responsabili di assicurarsi di essere in conformità legale
 * - Gli sviluppatori non sono responsabili per l'uso improprio di questa funzionalità
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const sources = searchParams.get('sources')?.split(',') || [
      // Download diretto
      'gutenberg',
      'libgen',
      'zlibrary',
      // Fonti italiane
      'liber-liber',
      'eurekaddl',
      'ebookspy',
      // Altre fonti
      'internet-archive',
      'manybooks',
      'feedbooks',
      'open-library',
      'google-books',
      'annas-archive',
      'unblocked'
    ];

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    console.log('Searching books with query:', query);
    console.log('Sources to search:', sources);

    // Esegui la ricerca
    const results = await searchBooks(query, {
      sources: sources as any,
      maxResults: 50,
      googleBooksApiKey: process.env.GOOGLE_BOOKS_API_KEY,
    });

    console.log(`Found ${results.length} results total`);
    console.log('Results by source:', results.reduce((acc, r) => {
      acc[r.source] = (acc[r.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>));

    return NextResponse.json({
      success: true,
      query,
      results,
      sources: sources,
      count: results.length,
      warnings: {
        annasArchive: ANNAS_ARCHIVE_WARNING,
      },
    });
  } catch (error) {
    console.error('Error searching books:', error);
    return NextResponse.json(
      {
        error: 'Failed to search books',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
