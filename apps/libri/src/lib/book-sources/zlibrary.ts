/**
 * ZLibrary API Integration
 * Uno dei più grandi archivi di libri digitali gratuiti
 */

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  cover?: string;
  year?: number;
  description?: string;
  source: 'zlibrary';
  sourceUrl: string;
  downloadUrl?: string;
}

/**
 * Cerca libri su ZLibrary usando scraping
 * ZLibrary ha spesso bisogno di proxy e cambia frequentemente dominio
 */
export async function searchZLibrary(query: string): Promise<SearchResult[]> {
  console.log('🔍 Z-Library: Searching for:', query);
  try {
    // ZLibrary usa più domini, proviamo i principali
    const domains = [
      'https://z-library.rs',
      'https://z-lib.org',
      'https://zlibrary-be.se',
    ];

    let results: SearchResult[] = [];

    for (const domain of domains) {
      try {
        // Prova a fare una ricerca
        const searchUrl = `${domain}/s/${encodeURIComponent(query)}/?lang=it&yearFrom=&yearTo=&extension=&order=popular`;
        console.log(`🔍 Z-Library: Trying domain ${domain}`);

        const response = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        });

        console.log(`🔍 Z-Library: ${domain} returned status ${response.status}`);

        if (response.ok) {
          const html = await response.text();
          results = parseZLibraryHTML(html, domain);
          console.log(`🔍 Z-Library: ${domain} found ${results.length} results`);
          if (results.length > 0) {
            break; // Abbiamo trovato risultati, non provare altri domini
          }
        }
      } catch (error) {
        console.log(`❌ Z-Library: Failed to connect to ${domain}:`, error);
        continue; // Prova il prossimo dominio
      }
    }

    console.log(`✅ Z-Library: Total results: ${results.length}`);
    return results;
  } catch (error) {
    console.error('❌ Error searching ZLibrary:', error);
    return [];
  }
}

function parseZLibraryHTML(html: string, baseUrl: string): SearchResult[] {
  const results: SearchResult[] = [];

  try {
    // ZLibrary usa una struttura con div che contengono le info dei libri
    // Cerca i book items
    const bookItemRegex = /<div[^>]*class="[^"]*bookItem[^"]*"[^>]*>[\s\S]*?<\/div>/gi;
    const matches = html.matchAll(bookItemRegex);

    let count = 0;
    for (const match of matches) {
      if (count >= 10) break;

      const itemHTML = match[0];

      // Estrai il titolo
      const titleMatch = itemHTML.match(/<h3[^>]*class="[^"]*[^>]*"><a[^>]*>([^<]+)<\/a><\/h3>/i);
      const title = titleMatch?.[1]?.trim();

      // Estrai l'autore
      const authorMatch = itemHTML.match(/<div[^>]*class="[^"]*author[^"]*"[^>]*>([^<]+)<\/div>/i);
      const author = authorMatch?.[1]?.trim() || 'Unknown';

      // Estrai il link al libro
      const linkMatch = itemHTML.match(/<h3[^>]*class="[^"]*[^>]*"><a[^>]*href="([^"]+)"/i);
      const bookPath = linkMatch?.[1];

      // Estrai l'anno
      const yearMatch = itemHTML.match(/(\d{4})/i);
      const year = yearMatch ? parseInt(yearMatch[1]) : undefined;

      // Estrai la copertina
      const coverMatch = itemHTML.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*cover[^"]*"/i);
      let cover = coverMatch?.[1];
      if (cover && !cover.startsWith('http')) {
        cover = cover.startsWith('//') ? 'https:' + cover : baseUrl + cover;
      }

      // Estrai la lingua
      const langMatch = itemHTML.match(/<span[^>]*class="[^"]*language[^"]*"[^>]*>([^<]+)<\/span>/i);
      const language = langMatch?.[1]?.trim();

      if (title && bookPath) {
        const fullUrl = bookPath.startsWith('http') ? bookPath : baseUrl + bookPath;

        results.push({
          id: `zlibrary-${count}`,
          title: title.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'),
          author: author.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&'),
          cover,
          year,
          description: language ? `Lingua: ${language}` : undefined,
          source: 'zlibrary',
          sourceUrl: fullUrl,
          downloadUrl: fullUrl, // La pagina del libro contiene i link di download
        });

        count++;
      }
    }

    return results;
  } catch (error) {
    console.error('Error parsing ZLibrary HTML:', error);
    return [];
  }
}

/**
 * Estrai link di download dalla pagina del libro
 */
export async function extractZLibraryDownloadLinks(bookUrl: string): Promise<string[]> {
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

    // Cerca link di download nella pagina
    const downloadLinkRegex = /<a[^>]*href="([^"]*\/book\/[^"]*\/download[^"]*)"[^>]*>/gi;
    const matches = html.matchAll(downloadLinkRegex);

    for (const match of matches) {
      const href = match[1];
      if (href && !links.includes(href)) {
        links.push(href.startsWith('http') ? href : new URL(href, bookUrl).href);
      }
    }

    return links;
  } catch (error) {
    console.error('Error extracting ZLibrary download links:', error);
    return [];
  }
}
