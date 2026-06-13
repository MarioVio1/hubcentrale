/**
 * Feedbooks API Integration
 * Catalogo di libri di dominio pubblico e gratuiti in varie lingue
 */

export interface FeedbooksBook {
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
  source: 'feedbooks';
  sourceUrl: string;
  downloadUrl?: string;
}

export async function searchFeedbooks(query: string, language: string = 'it'): Promise<SearchResult[]> {
  console.log('🔍 Feedbooks: Searching for:', query, 'language:', language);
  try {
    // Feedbooks Catalog API
    const response = await fetch(
      `https://www.feedbooks.com/catalog/search.json?query=${encodeURIComponent(query)}&lang=${language}&limit=10`
    );

    console.log(`🔍 Feedbooks: returned status ${response.status}`);

    if (!response.ok) {
      // If API fails, try scraping
      console.log('⚠️ Feedbooks: API not available, trying scraping...');
      return scrapeFeedbooks(query, language);
    }

    const data = await response.json();
    const books = data.books || [];

    const results = books.map((book: any, index: number) => ({
      id: `feedbooks-${index}`,
      title: book.title || 'Untitled',
      author: Array.isArray(book.author) ? book.author.map((a: any) => a.name).join(', ') : (book.author?.name || 'Unknown'),
      cover: book.cover || undefined,
      description: book.summary ? book.summary.substring(0, 150) + '...' : undefined,
      year: undefined,
      source: 'feedbooks' as const,
      sourceUrl: book.website || `https://www.feedbooks.com/book/${book.id}`,
      downloadUrl: book.epub || book.download,
    }));

    console.log(`✅ Feedbooks: Found ${results.length} results`);
    return results;
  } catch (error) {
    console.error('❌ Error searching Feedbooks:', error);
    return scrapeFeedbooks(query, language);
  }
}

async function scrapeFeedbooks(query: string, language: string): Promise<SearchResult[]> {
  console.log('🔍 Feedbooks: Trying scraping for:', query);
  try {
    const response = await fetch(
      `https://www.feedbooks.com/catalog/search?query=${encodeURIComponent(query)}&lang=${language}`
    );

    console.log(`🔍 Feedbooks (scrape): returned status ${response.status}`);

    if (!response.ok) {
      return [];
    }

    const html = await response.text();
    const results: SearchResult[] = [];

    // Parse book entries
    const bookRegex = /<article[^>]*class="[^"]*book[^"]*"[^>]*>[\s\S]*?<\/article>/gi;
    const matches = html.matchAll(bookRegex);

    let count = 0;
    for (const match of matches) {
      if (count >= 10) break;

      const bookHTML = match[0];

      // Extract title
      const titleMatch = bookHTML.match(/<h2[^>]*><a[^>]*>([^<]+)<\/a><\/h2>/i);
      const title = titleMatch?.[1]?.trim();

      // Extract author
      const authorMatch = bookHTML.match(/<p[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/p>/i);
      const author = authorMatch?.[1]?.trim();

      // Extract link
      const linkMatch = bookHTML.match(/<h2[^>]*><a[^>]*href="([^"]+)"/i);
      const link = linkMatch?.[1];

      // Extract cover
      const coverMatch = bookHTML.match(/<img[^>]*src="([^"]+)"/i);
      const cover = coverMatch?.[1];

      if (title && link) {
        results.push({
          id: `feedbooks-${count}`,
          title: title.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'),
          author: author?.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&') || 'Unknown',
          cover: cover?.startsWith('http') ? cover : undefined,
          description: 'Libro di dominio pubblico da Feedbooks',
          year: undefined,
          source: 'feedbooks' as const,
          sourceUrl: link.startsWith('http') ? link : `https://www.feedbooks.com${link}`,
          downloadUrl: undefined, // Download available on book page
        });
        count++;
      }
    }

    console.log(`✅ Feedbooks (scrape): Found ${results.length} results`);
    return results;
  } catch (error) {
    console.error('❌ Error scraping Feedbooks:', error);
    return [];
  }
}
