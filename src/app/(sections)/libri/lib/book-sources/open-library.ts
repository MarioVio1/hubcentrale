/**
 * Open Library API Integration
 * Open Library ha un'API ufficiale e gratuita per cercare libri
 */

export interface OpenLibraryBook {
  key: string;
  title: string;
  authors?: { name: string }[];
  cover_i?: number;
  first_publish_year?: number;
  subject?: string[];
  description?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  cover?: string;
  year?: number;
  description?: string;
  source: 'open-library';
  sourceUrl: string;
  downloadUrl?: string;
}

export async function searchOpenLibrary(query: string): Promise<SearchResult[]> {
  console.log('🔍 Open Library: Searching for:', query);
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20&fields=key,title,author_name,first_publish_year,cover_i,description`
    );

    console.log(`🔍 Open Library: returned status ${response.status}`);

    if (!response.ok) {
      throw new Error(`Open Library API error: ${response.status}`);
    }

    const data = await response.json();
    const books: OpenLibraryBook[] = data.docs || [];

    const results = books.map((book) => ({
      id: book.key,
      title: book.title || 'Untitled',
      author: book.authors?.map((a) => a.name).join(', ') || 'Unknown',
      cover: book.cover_i
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
        : undefined,
      year: book.first_publish_year,
      description: typeof book.description === 'string'
        ? book.description
        : book.description?.value,
      source: 'open-library' as const,
      sourceUrl: `https://openlibrary.org${book.key}`,
      downloadUrl: undefined, // Open Library spesso ha copie digitali ma richiede logica complessa
    }));

    console.log(`✅ Open Library: Found ${results.length} results`);
    return results;
  } catch (error) {
    console.error('❌ Error searching Open Library:', error);
    return [];
  }
}
