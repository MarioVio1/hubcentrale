/**
 * Project Gutenberg API Integration
 * Project Gutenberg offre libri di dominio pubblico gratuiti
 */

export interface GutenbergBook {
  id: number;
  title: string;
  author?: { name: string }[];
  language?: string[];
  cover?: string;
  download_count: number;
  media_type: string;
  formats: Record<string, string>;
}

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  cover?: string;
  year?: number;
  description?: string;
  source: 'gutenberg';
  sourceUrl: string;
  downloadUrl?: string;
}

export async function searchGutenberg(query: string): Promise<SearchResult[]> {
  console.log('🔍 Project Gutenberg: Searching for:', query);
  try {
    const response = await fetch(
      `https://gutendex.com/books?search=${encodeURIComponent(query)}&limit=20`
    );

    console.log(`🔍 Project Gutenberg: returned status ${response.status}`);

    if (!response.ok) {
      throw new Error(`Gutenberg API error: ${response.status}`);
    }

    const data = await response.json();
    const books: GutenbergBook[] = data.results || [];

    const results = books.map((book) => ({
      id: book.id.toString(),
      title: book.title || 'Untitled',
      author: book.authors?.map((a) => a.name).join(', ') || 'Unknown',
      cover: book.cover,
      description: undefined,
      source: 'gutenberg' as const,
      sourceUrl: `https://www.gutenberg.org/ebooks/${book.id}`,
      downloadUrl: book.formats['application/epub+zip'] || book.formats['text/html'] || book.formats['text/plain'],
    }));

    console.log(`✅ Project Gutenberg: Found ${results.length} results`);
    return results;
  } catch (error) {
    console.error('❌ Error searching Gutenberg:', error);
    return [];
  }
}
