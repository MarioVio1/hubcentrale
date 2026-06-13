/**
 * Google Books API Integration
 * Google Books API richiede una API key ma offre ottimi risultati
 * Se non è configurata, ritorna vuoto
 */

export interface GoogleBook {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    previewLink?: string;
    infoLink?: string;
  };
}

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  cover?: string;
  year?: number;
  description?: string;
  source: 'google-books';
  sourceUrl: string;
  downloadUrl?: string;
}

export async function searchGoogleBooks(
  query: string,
  apiKey?: string
): Promise<SearchResult[]> {
  console.log('🔍 Google Books: Searching for:', query);
  if (!apiKey) {
    console.log('⚠️ Google Books API key not configured, skipping');
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&maxResults=20&key=${apiKey}`
    );

    console.log(`🔍 Google Books: returned status ${response.status}`);

    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data = await response.json();
    const books: GoogleBook[] = data.items || [];

    const results = books.map((book) => ({
      id: book.id,
      title: book.volumeInfo.title || 'Untitled',
      author: book.volumeInfo.authors?.join(', ') || 'Unknown',
      cover:
        book.volumeInfo.imageLinks?.thumbnail ||
        book.volumeInfo.imageLinks?.smallThumbnail,
      year: book.volumeInfo.publishedDate
        ? parseInt(book.volumeInfo.publishedDate.substring(0, 4))
        : undefined,
      description: book.volumeInfo.description,
      source: 'google-books' as const,
      sourceUrl: book.volumeInfo.infoLink || '',
      downloadUrl: undefined, // Google Books ha preview ma non download diretto
    }));

    console.log(`✅ Google Books: Found ${results.length} results`);
    return results;
  } catch (error) {
    console.error('❌ Error searching Google Books:', error);
    return [];
  }
}
