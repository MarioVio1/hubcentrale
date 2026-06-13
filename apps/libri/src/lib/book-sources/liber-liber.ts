/**
 * Liber Liber - Archivio Italiano
 * Progetto di biblioteca digitale italiana con libri di dominio pubblico
 */

export interface LiberLiberBook {
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
  source: 'liber-liber';
  sourceUrl: string;
  downloadUrl?: string;
}

export async function searchLiberLiber(query: string): Promise<SearchResult[]> {
  console.log('🔍 Liber Liber: Searching for:', query);
  try {
    // Liber Liber doesn't have a public API, so we need to scrape their search page
    const response = await fetch(
      `https://www.liberliber.it/online/cerca/?q=${encodeURIComponent(query)}&mod=tutti`
    );

    console.log(`🔍 Liber Liber: returned status ${response.status}`);

    if (!response.ok) {
      throw new Error(`Liber Liber error: ${response.status}`);
    }

    const html = await response.text();
    const results = parseLiberLiberHTML(html);

    console.log(`✅ Liber Liber: Found ${results.length} results`);
    return results;
  } catch (error) {
    console.error('❌ Error searching Liber Liber:', error);
    return [];
  }
}

function parseLiberLiberHTML(html: string): SearchResult[] {
  const results: SearchResult[] = [];

  try {
    // Liber Liber search results are in a list format
    // Parse book entries from the HTML structure

    // Look for book links and titles
    const bookLinkRegex = /<a[^>]*href="([^"]*\/online\/libri\/[^"]*)"[^>]*>([^<]+)<\/a>/gi;
    const matches = html.matchAll(bookLinkRegex);

    let count = 0;
    for (const match of matches) {
      if (count >= 10) break; // Limit to 10 results

      const url = match[1];
      const title = match[2].trim();

      if (url && title) {
        // Try to extract author from surrounding context
        const authorMatch = html.substring(
          Math.max(0, match.index - 200),
          match.index
        ).match(/(?:di|di\s+)([^<,]{5,50}?)(?:<|,|$)/i);

        const author = authorMatch?.[1]?.trim() || 'Autore sconosciuto';

        // Build full URL if relative
        const fullUrl = url.startsWith('http') ? url : `https://www.liberliber.it${url}`;

        results.push({
          id: `liber-liber-${count}`,
          title: title.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'),
          author: author.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'),
          cover: undefined,
          year: undefined,
          description: 'Libro di dominio pubblico italiano',
          source: 'liber-liber',
          sourceUrl: fullUrl,
          downloadUrl: fullUrl, // Download is available on the book page
        });

        count++;
      }
    }

    return results;
  } catch (error) {
    console.error('Error parsing Liber Liber HTML:', error);
    return [];
  }
}
