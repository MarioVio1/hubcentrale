/**
 * ManyBooks API Integration
 * Piattaforma con molti libri gratuiti in varie lingue incluso l'italiano
 */

export interface ManyBooksBook {
  id: string;
  title: string;
  author: string;
  cover?: string;
  year?: number;
  description?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  cover?: string;
  year?: number;
  description?: string;
  source: 'manybooks';
  sourceUrl: string;
  downloadUrl?: string;
}

export async function searchManyBooks(query: string, language: string = 'it'): Promise<SearchResult[]> {
  console.log('🔍 ManyBooks: Searching for:', query, 'language:', language);
  try {
    // ManyBooks API
    const response = await fetch(
      `https://manybooks.net/search-api/books?q=${encodeURIComponent(query)}&language=${language}&limit=10`
    );

    console.log(`🔍 ManyBooks: returned status ${response.status}`);

    if (!response.ok) {
      // If API fails, return empty array (ManyBooks may not have a public API)
      console.log('⚠️ ManyBooks: API not available, trying scraping...');
      return scrapeManyBooks(query);
    }

    const data = await response.json();
    const books = data.books || data.results || [];

    const results = books.map((book: any, index: number) => ({
      id: `manybooks-${index}`,
      title: book.title || 'Untitled',
      author: book.author || 'Unknown',
      cover: book.cover_image || book.cover,
      description: book.description ? book.description.substring(0, 150) + '...' : undefined,
      year: book.year || book.published_year || undefined,
      source: 'manybooks' as const,
      sourceUrl: `https://manybooks.net/titles/${book.slug || book.id}`,
      downloadUrl: book.download_url || `https://manybooks.net/titles/${book.slug || book.id}.epub`,
    }));

    console.log(`✅ ManyBooks: Found ${results.length} results`);
    return results;
  } catch (error) {
    console.error('❌ Error searching ManyBooks:', error);
    // Try scraping as fallback
    return scrapeManyBooks(query);
  }
}

async function scrapeManyBooks(query: string): Promise<SearchResult[]> {
  console.log('🔍 ManyBooks: Trying scraping for:', query);
  try {
    const response = await fetch(
      `https://manybooks.net/search/${encodeURIComponent(query)}`
    );

    console.log(`🔍 ManyBooks (scrape): returned status ${response.status}`);

    if (!response.ok) {
      return [];
    }

    const html = await response.text();
    const results: SearchResult[] = [];

    // Parse book cards from the search results
    const bookCardRegex = /<div[^>]*class="[^"]*book-card[^"]*"[^>]*>[\s\S]*?<\/div>/gi;
    const matches = html.matchAll(bookCardRegex);

    let count = 0;
    for (const match of matches) {
      if (count >= 10) break;

      const cardHTML = match[0];

      // Extract title
      const titleMatch = cardHTML.match(/<h3[^>]*><a[^>]*>([^<]+)<\/a><\/h3>/i);
      const title = titleMatch?.[1]?.trim();

      // Extract author
      const authorMatch = cardHTML.match(/by\s+<a[^>]*>([^<]+)<\/a>/i);
      const author = authorMatch?.[1]?.trim();

      // Extract link
      const linkMatch = cardHTML.match(/<h3[^>]*><a[^>]*href="([^"]+)"/i);
      const link = linkMatch?.[1];

      // Extract cover
      const coverMatch = cardHTML.match(/<img[^>]*src="([^"]+)"/i);
      const cover = coverMatch?.[1];

      if (title && link) {
        results.push({
          id: `manybooks-${count}`,
          title: title.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'),
          author: author?.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&') || 'Unknown',
          cover: cover?.startsWith('http') ? cover : undefined,
          description: 'Libro gratuito da ManyBooks',
          year: undefined,
          source: 'manybooks' as const,
          sourceUrl: link.startsWith('http') ? link : `https://manybooks.net${link}`,
          downloadUrl: undefined, // Download available on book page
        });
        count++;
      }
    }

    console.log(`✅ ManyBooks (scrape): Found ${results.length} results`);
    return results;
  } catch (error) {
    console.error('❌ Error scraping ManyBooks:', error);
    return [];
  }
}
