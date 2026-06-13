/**
 * EUREKAddl API Integration
 * Specializzato in libri in lingua italiana
 */

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  cover?: string;
  year?: number;
  description?: string;
  source: 'eurekaddl';
  sourceUrl: string;
  downloadUrl?: string;
}

/**
 * Cerca libri su EUREKAddl
 */
export async function searchEurekaDDL(query: string): Promise<SearchResult[]> {
  console.log('🔍 EUREKAddl: Searching for:', query);
  try {
    // EUREKAddl ha diversi domini, proviamo i principali
    const domains = [
      'https://eurekaddl.com',
      'https://www.eurekaddl.com',
      'https://eurekaddl.net',
    ];

    let results: SearchResult[] = [];

    for (const domain of domains) {
      try {
        const searchUrl = `${domain}/search/${encodeURIComponent(query)}`;
        console.log(`🔍 EUREKAddl: Trying domain ${domain}`);

        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        });

        console.log(`🔍 EUREKAddl: ${domain} returned status ${response.status}`);

        if (response.ok) {
          const html = await response.text();
          results = parseEurekaDDLHTML(html, domain);
          console.log(`🔍 EUREKAddl: ${domain} found ${results.length} results`);
          if (results.length > 0) {
            break;
          }
        }
      } catch (error) {
        console.log(`❌ EUREKAddl: Failed to connect to ${domain}:`, error);
        continue;
      }
    }

    console.log(`✅ EUREKAddl: Total results: ${results.length}`);
    return results;
  } catch (error) {
    console.error('❌ Error searching EUREKAddl:', error);
    return [];
  }
}

function parseEurekaDDLHTML(html: string, baseUrl: string): SearchResult[] {
  const results: SearchResult[] = [];

  try {
    // EUREKAddl usa una struttura simile a WordPress con post o article
    const bookItemRegex = /<(?:div|article)[^>]*class="[^"]*(?:post|book|item)[^"]*"[^>]*>[\s\S]*?<\/(?:div|article)>/gi;
    const matches = html.matchAll(bookItemRegex);

    let count = 0;
    for (const match of matches) {
      if (count >= 10) break;

      const itemHTML = match[0];

      // Estrai il titolo dal link
      const titleMatch = itemHTML.match(/<h[2-4][^>]*><a[^>]*>([^<]+)<\/a><\/h[2-4]>/i) ||
                        itemHTML.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/i);
      const title = titleMatch?.[1]?.trim();

      // Estrai l'autore (spesso nel contenuto o nel titolo)
      const authorMatch = itemHTML.match(/(?:di|by|autore)[:\s]+([A-Z][^<,]{5,50}?)(?:<|,|\n)/i);
      const author = authorMatch?.[1]?.trim() || 'Unknown';

      // Estrai il link
      const linkMatch = itemHTML.match(/<a[^>]*href="([^"]+)"[^>]*>/i);
      let link = linkMatch?.[1];

      // Estrai l'anno
      const yearMatch = itemHTML.match(/\b(20\d{2}|19\d{2})\b/);
      const year = yearMatch ? parseInt(yearMatch[1]) : undefined;

      // Estrai la copertina (spesso come immagine featured)
      const coverMatch = itemHTML.match(/<img[^>]*(?:class="[^"]*(?:wp-post-image|cover|thumbnail)[^"]*")[^>]*src="([^"]+\.(?:jpg|jpeg|png|gif|webp))"[^>]*>/i);
      let cover = coverMatch?.[1];
      if (cover && !cover.startsWith('http')) {
        cover = cover.startsWith('//') ? 'https:' + cover : baseUrl + cover;
      }

      // Estrai il formato dal contenuto
      const formatMatch = itemHTML.match(/\b(EPUB|PDF|MOBI|AZW3)\b/i);
      const format = formatMatch?.[1]?.toUpperCase();

      // Estrai il linguaggio
      const langMatch = itemHTML.match(/\b(ita|italiano|english|inglês)\b/i);
      const language = langMatch?.[1];

      if (title && link) {
        const fullUrl = link.startsWith('http') ? link : baseUrl + link;

        let description = 'Libro in lingua italiana';
        if (format) description += ` | Formato: ${format}`;
        if (language && language !== 'ita' && language !== 'italiano') {
          description += ` | Lingua: ${language}`;
        }

        results.push({
          id: `eurekaddl-${count}`,
          title: title.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'),
          author: author.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'),
          cover,
          year,
          description,
          source: 'eurekaddl',
          sourceUrl: fullUrl,
          downloadUrl: fullUrl, // La pagina del libro contiene i link di download
        });

        count++;
      }
    }

    return results;
  } catch (error) {
    console.error('Error parsing EUREKAddl HTML:', error);
    return [];
  }
}

/**
 * Estrai link di download dalla pagina del libro
 */
export async function extractEurekaDDLDownloadLinks(bookUrl: string): Promise<string[]> {
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

    // Cerca link di download (spesso su hosting esterni)
    const downloadLinkRegex = /<a[^>]*href="([^"]*(?:download|mediafire|mega|drive|rapidgator|uploaded|uptobox)[^"]*)"[^>]*>/gi;
    const matches = html.matchAll(downloadLinkRegex);

    for (const match of matches) {
      const href = match[1];
      if (href && !links.includes(href)) {
        links.push(href.startsWith('http') ? href : new URL(href, bookUrl).href);
      }
    }

    return links;
  } catch (error) {
    console.error('Error extracting EUREKAddl download links:', error);
    return [];
  }
}
