/**
 * Unblocked (Unblockit.date) API Integration
 * Directory di siti per il download di libri, film, serie TV
 * Eccellente per libri in inglese e altre lingue internazionali
 */

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  cover?: string;
  year?: number;
  description?: string;
  source: 'unblocked';
  sourceUrl: string;
  downloadUrl?: string;
}

/**
 * Cerca libri usando Unblocked
 * Unblocked è principalmente una directory, quindi cercherà link a siti di libri
 */
export async function searchUnblocked(query: string): Promise<SearchResult[]> {
  console.log('🔍 Unblockit.date: Searching for:', query);
  try {
    // Unblocked ha diversi domini mirror
    const domains = [
      'https://unblockit.date',
      'https://unblockit.lol',
      'https://unblockit.tv',
      'https://unblockit.wtf',
    ];

    let results: SearchResult[] = [];

    for (const domain of domains) {
      try {
        // Unblocked ha una sezione specifica per ebooks
        const searchUrl = `${domain}/ebooks/?search=${encodeURIComponent(query)}`;
        console.log(`🔍 Unblockit.date: Trying domain ${domain}`);

        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });

        console.log(`🔍 Unblockit.date: ${domain} returned status ${response.status}`);

        if (response.ok) {
          const html = await response.text();
          results = parseUnblockedHTML(html, domain);
          console.log(`🔍 Unblockit.date: ${domain} found ${results.length} results`);
          if (results.length > 0) {
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Unblockit.date: Failed to connect to ${domain}:`, error);
        continue;
      }
    }

    console.log(`✅ Unblockit.date: Total results: ${results.length}`);
    return results;
  } catch (error) {
    console.error('❌ Error searching Unblocked:', error);
    return [];
  }
}

function parseUnblockedHTML(html: string, baseUrl: string): SearchResult[] {
  const results: SearchResult[] = [];

  try {
    // Unblocked mostra una lista di siti e risorse
    // Cerca link a siti di libri o direttamente a libri
    const bookLinkRegex = /<a[^>]*href="([^"]*)"[^>]*class="[^"]*(?:link|site|resource)[^"]*"[^>]*>([^<]+)<\/a>/gi;
    const matches = html.matchAll(bookLinkRegex);

    let count = 0;
    for (const match of matches) {
      if (count >= 10) break;

      const href = match[1];
      const title = match[2]?.trim();

      if (href && title) {
        // Filtra per assicurarsi che siano link a libri o siti di libri
        const isBookRelated =
          /(?:book|ebook|library|z-lib|libgen|project\s+gutenberg|archive\.org)/i.test(href) ||
          /(?:book|ebook|libro|download)/i.test(title);

        if (!isBookRelated) continue;

        const fullUrl = href.startsWith('http') ? href : baseUrl + href;

        // Cerca di estrarre un possibile autore dal titolo
        const authorMatch = title.match(/by\s+([A-Z][^<,]{5,30})/i) ||
                           title.match(/di\s+([A-Z][^<,]{5,30})/i);
        const author = authorMatch?.[1]?.trim() || 'Unknown';

        results.push({
          id: `unblocked-${count}`,
          title: title.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'),
          author,
          cover: undefined,
          year: undefined,
          description: fullUrl.includes('unblockit') ? 'Directory di risorse per libri' : 'Link a sito di libri',
          source: 'unblocked',
          sourceUrl: fullUrl,
          downloadUrl: fullUrl, // Porta al sito o al libro
        });

        count++;
      }
    }

    return results;
  } catch (error) {
    console.error('Error parsing Unblocked HTML:', error);
    return [];
  }
}

/**
 * Estrai ulteriori dettagli da una pagina Unblocked
 */
export async function extractUnblockedResources(pageUrl: string): Promise<string[]> {
  try {
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return [];
    }

    const html = await response.text();
    const links: string[] = [];

    // Cerca tutti i link nella pagina
    const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>/gi;
    const matches = html.matchAll(linkRegex);

    for (const match of matches) {
      const href = match[1];

      // Filtra link esterni interessanti
      if (href && href.startsWith('http') && !links.includes(href)) {
        // Evita link alla stessa pagina o a pagine di navigazione
        if (!href.match(/(?:unblockit|facebook|twitter|instagram)/i)) {
          links.push(href);
        }
      }
    }

    return links.slice(0, 20); // Limita ai primi 20 link
  } catch (error) {
    console.error('Error extracting Unblocked resources:', error);
    return [];
  }
}
