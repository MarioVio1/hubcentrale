/**
 * EbookSpy API Integration
 * Motore di ricerca di eBook gratuito
 */

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  cover?: string;
  year?: number;
  description?: string;
  source: 'ebookspy';
  sourceUrl: string;
  downloadUrl?: string;
}

/**
 * Cerca libri su EbookSpy
 */
export async function searchEbookSpy(query: string): Promise<SearchResult[]> {
  console.log('🔍 EbookSpy: Searching for:', query);
  try {
    // EbookSpy ha diversi domini, proviamo i principali
    const domains = [
      'https://ebookspy.it',
      'https://www.ebookspy.it',
      'https://ebookspy.net',
    ];

    let results: SearchResult[] = [];

    for (const domain of domains) {
      try {
        const searchUrl = `${domain}/search?q=${encodeURIComponent(query)}`;
        console.log(`🔍 EbookSpy: Trying domain ${domain}`);

        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        });

        console.log(`🔍 EbookSpy: ${domain} returned status ${response.status}`);

        if (response.ok) {
          const html = await response.text();
          results = parseEbookSpyHTML(html, domain);
          console.log(`🔍 EbookSpy: ${domain} found ${results.length} results`);
          if (results.length > 0) {
            break;
          }
        }
      } catch (error) {
        console.log(`❌ EbookSpy: Failed to connect to ${domain}:`, error);
        continue;
      }
    }

    console.log(`✅ EbookSpy: Total results: ${results.length}`);
    return results;
  } catch (error) {
    console.error('❌ Error searching EbookSpy:', error);
    return [];
  }
}

function parseEbookSpyHTML(html: string, baseUrl: string): SearchResult[] {
  const results: SearchResult[] = [];

  try {
    // EbookSpy usa una struttura con card o list items
    // Cerca gli elementi dei libri
    const bookItemRegex = /<div[^>]*class="[^"]*(?:book|result|item)[^"]*"[^>]*>[\s\S]*?<\/div>/gi;
    const matches = html.matchAll(bookItemRegex);

    let count = 0;
    for (const match of matches) {
      if (count >= 10) break;

      const itemHTML = match[0];

      // Estrai il titolo dal link
      const titleLinkMatch = itemHTML.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/i) ||
                              itemHTML.match(/<h[2-4][^>]*><a[^>]*>([^<]+)<\/a><\/h[2-4]>/i);
      const title = titleLinkMatch?.[1]?.trim();

      // Estrai l'autore
      const authorMatch = itemHTML.match(/<span[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/span>/i) ||
                          itemHTML.match(/<p[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/p>/i);
      const author = authorMatch?.[1]?.trim() || 'Unknown';

      // Estrai il link
      const linkMatch = itemHTML.match(/<a[^>]*href="([^"]+)"[^>]*>/i);
      let link = linkMatch?.[1];

      // Estrai l'anno
      const yearMatch = itemHTML.match(/(20\d{2}|19\d{2})/);
      const year = yearMatch ? parseInt(yearMatch[1]) : undefined;

      // Estrai la copertina
      const coverMatch = itemHTML.match(/<img[^>]*src="([^"]+\.(?:jpg|jpeg|png|gif))"[^>]*>/i);
      let cover = coverMatch?.[1];
      if (cover && !cover.startsWith('http')) {
        cover = cover.startsWith('//') ? 'https:' + cover : baseUrl + cover;
      }

      // Estrai il formato
      const formatMatch = itemHTML.match(/\b(EPUB|PDF|MOBI|AZW3)\b/i);
      const format = formatMatch?.[1]?.toUpperCase();

      if (title && link) {
        const fullUrl = link.startsWith('http') ? link : baseUrl + link;

        results.push({
          id: `ebookspy-${count}`,
          title: title.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'),
          author: author.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'),
          cover,
          year,
          description: format ? `Formato: ${format}` : undefined,
          source: 'ebookspy',
          sourceUrl: fullUrl,
          downloadUrl: fullUrl, // La pagina del libro contiene i link di download
        });

        count++;
      }
    }

    return results;
  } catch (error) {
    console.error('Error parsing EbookSpy HTML:', error);
    return [];
  }
}

/**
 * Estrai link di download dalla pagina del libro
 */
export async function extractEbookSpyDownloadLinks(bookUrl: string): Promise<string[]> {
  try {
    const response = await fetch(bookUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      return [];
    }

    const html = await response.text();
    const links: string[] = [];

    // Cerca link di download
    const downloadLinkRegex = /<a[^>]*href="([^"]*(?:download|rapidgator|uploadgig|mega|drive)[^"]*)"[^>]*>/gi;
    const matches = html.matchAll(downloadLinkRegex);

    for (const match of matches) {
      const href = match[1];
      if (href && !links.includes(href)) {
        links.push(href.startsWith('http') ? href : new URL(href, bookUrl).href);
      }
    }

    return links;
  } catch (error) {
    console.error('Error extracting EbookSpy download links:', error);
    return [];
  }
}
