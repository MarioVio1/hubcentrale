/**
 * Anna's Archive Integration
 * ⚠️ AVVERTENZA IMPORTANTE:
 * - Anna's Archive è una shadow library
 * - L'uso di questa fonte deve rispettare le leggi locali sul copyright
 * - Gli utenti sono responsabili di assicurarsi di essere in conformità legale
 * - A causa delle anti-bot measures, utilizziamo un approccio ibrido con proxy
 */

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  cover?: string;
  year?: number;
  description?: string;
  source: 'annas-archive';
  sourceUrl: string;
  downloadUrl?: string;
  md5?: string;
}

/**
 * Cerca libri su Anna's Archive
 * Utilizziamo un approccio ibrido con proxy e fallback intelligente
 */
export async function searchAnnasArchive(
  query: string
): Promise<SearchResult[]> {
  console.log('🔍 Anna\'s Archive: Searching for:', query);
  try {
    // Prova prima lo scraping tramite proxy
    const scrapedResults = await tryScrapeWithProxy(query);
    if (scrapedResults.length > 0) {
      console.log(`✅ Anna's Archive: trovati ${scrapedResults.length} risultati via scraping`);
      return scrapedResults;
    }

    // Fallback: genera risultati con link diretti ai mirror
    console.log('Anna\'s Archive: scraping fallito, usando fallback con mirror');
    const mirrorResults = generateMirrorResults(query);
    console.log(`✅ Anna's Archive: generated ${mirrorResults.length} mirror links`);
    return mirrorResults;
  } catch (error) {
    console.error('❌ Error in Anna\'s Archive search:', error);
    const mirrorResults = generateMirrorResults(query);
    console.log(`✅ Anna's Archive: generated ${mirrorResults.length} mirror links (error fallback)`);
    return mirrorResults;
  }
}

/**
 * Tenta lo scraping di Anna's Archive tramite proxy service
 */
async function tryScrapeWithProxy(query: string): Promise<SearchResult[]> {
  // Solo mirror testati e funzionanti (aprile 2025)
  const mirrors = [
    { url: 'https://annas-archive.pk', name: 'pk' },
    { url: 'https://annas-archive.gs', name: 'gs' }, // Restituisce 302 redirect
  ];

  for (const mirror of mirrors) {
    try {
      const searchUrl = `${mirror.url}/search?q=${encodeURIComponent(query)}&ext=epub&sort=&lang=it&filetype=`;

      console.log(`Trying Anna's Archive ${mirror.name}: ${searchUrl}`);

      // Prova a usare il proxy service
      let html: string;
      try {
        const proxyResponse = await fetch(`/?XTransformPort=3031/proxy?url=${encodeURIComponent(searchUrl)}&cache=false`);

        if (proxyResponse.ok) {
          html = await proxyResponse.text();
          console.log(`Proxy success for ${mirror.name}`);
        } else {
          throw new Error(`Proxy returned ${proxyResponse.status}`);
        }
      } catch (proxyError) {
        console.log(`Proxy failed for ${mirror.name}, trying direct: ${proxyError}`);

        // Fallback a richiesta diretta se il proxy non funziona
        const directResponse = await fetch(searchUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
          },
          signal: AbortSignal.timeout(10000),
          redirect: 'follow'
        });

        if (!directResponse.ok) {
          console.log(`Direct request failed for ${mirror.name}: ${directResponse.status}`);
          continue;
        }

        html = await directResponse.text();
        console.log(`Direct request success for ${mirror.name}`);
      }

      const results = parseAnnaHTML(html);

      if (results.length > 0) {
        console.log(`Found ${results.length} results via ${mirror.name}`);
        return results;
      } else {
        console.log(`No results found in HTML from ${mirror.name}`);
      }
    } catch (error) {
      console.warn(`Anna's Archive (${mirror.name}): ${error}`);
      continue;
    }
  }

  console.log('All mirrors failed for scraping');
  return [];
}

/**
 * Genera risultati con link diretti ai mirror (fallback sempre funzionante)
 */
function generateMirrorResults(query: string): SearchResult[] {
  // Solo mirror testati e funzionanti
  const mirrors = [
    { url: 'https://annas-archive.pk', name: 'Mirror Principale', icon: '📚' },
    { url: 'https://annas-archive.gs', name: 'Mirror GS', icon: '🌐' },
  ];

  const results: SearchResult[] = [];

  mirrors.forEach((mirror, index) => {
    const searchUrl = `${mirror.url}/search?q=${encodeURIComponent(query)}&ext=epub&sort=&lang=it&filetype=`;

    results.push({
      id: `annas-mirror-${index}`,
      title: `${mirror.icon} Cerca "${query}" - ${mirror.name}`,
      author: "Anna's Archive",
      description: `Cerca "${query}" direttamente su Anna's Archive (${mirror.name}). Scopri milioni di libri, articoli accademici e documenti. Clicca per aprire la ricerca e trovare il tuo libro.`,
      source: 'annas-archive',
      sourceUrl: searchUrl,
      downloadUrl: undefined,
    });
  });

  return results;
}

/**
 * Parsa HTML di Anna's Archive con multi-pattern
 */
function parseAnnaHTML(html: string): SearchResult[] {
  const results: SearchResult[] = [];

  try {
    // Pulisci l'HTML
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, '');

    // Pattern 1: Cerca card dei libri con link MD5
    const md5LinkRegex = /<a[^>]*href="([^"]*\/md5\/[^"]*)"[^>]*>([^<]+)<\/a>/gi;
    const md5Matches = [...cleanHtml.matchAll(md5LinkRegex)];

    if (md5Matches.length > 0) {
      for (let i = 0; i < Math.min(md5Matches.length, 10); i++) {
        const match = md5Matches[i];
        const href = match[1];
        let title = match[2].replace(/&amp;/g, '&').trim();

        // Pulisci il titolo
        title = title.replace(/<[^>]+>/g, '').trim();

        if (title.length > 200) {
          title = title.substring(0, 200) + '...';
        }

        // Cerca autore nel contesto (ampio range)
        const contextStart = Math.max(0, match.index - 500);
        const contextEnd = match.index + match[0].length + 300;
        const context = cleanHtml.substring(contextStart, contextEnd);

        // Estrai autore da vari pattern
        let author = 'Unknown';
        const authorPatterns = [
          /<span[^>]*(?:class="[^"]*author[^"]*"|data-testid="author")[^>]*>([^<]+)<\/span>/i,
          /(?:author|by)[^>]*>([^<\n]+)<\//i,
          />([^<\n]{5,50})\s*<\/a>\s*<br/i,
          /<div[^>]*author[^>]*>([^<]+)<\/div>/i,
        ];

        for (const pattern of authorPatterns) {
          const authorMatch = context.match(pattern);
          if (authorMatch && authorMatch[1]) {
            let cleanAuthor = authorMatch[1].replace(/&amp;/g, '&').trim();
            cleanAuthor = cleanAuthor.replace(/<[^>]+>/g, '').trim();
            if (cleanAuthor.length > 5 && cleanAuthor.length < 100) {
              author = cleanAuthor;
              break;
            }
          }
        }

        // Cerca anno
        const yearMatch = context.match(/\b(19|20)\d{2}\b/);
        const year = yearMatch ? parseInt(yearMatch[0]) : undefined;

        // Cerca cover
        const coverMatch = context.match(/<img[^>]*src="([^"]*\/(?:cover|thumb)[^"]*)"[^>]*>/i);
        let cover = coverMatch?.[1];
        if (cover && !cover.startsWith('http')) {
          cover = `https://annas-archive.pk${cover}`;
        }

        // Tenta di generare un URL di download diretto
        // Anna's Archive ha vari mirror per download, proviamo a costruire l'URL
        const downloadUrl = href.startsWith('http') ? href : `https://annas-archive.pk${href}`;

        results.push({
          id: `annas-${i}`,
          title,
          author,
          cover,
          year,
          source: 'annas-archive',
          sourceUrl: downloadUrl,
          downloadUrl: undefined, // Non possiamo garantire link diretti funzionanti
        });

        if (results.length >= 10) break;
      }

      if (results.length > 0) {
        console.log(`Found ${results.length} results using MD5 link pattern`);
        return results;
      }
    }

    // Pattern 2: Cerca link standard di libri con classi
    const bookLinkRegex = /<a[^>]*href="([^"]*)"[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/gi;
    const bookMatches = [...cleanHtml.matchAll(bookLinkRegex)];

    if (bookMatches.length > 0) {
      for (let i = 0; i < Math.min(bookMatches.length, 10); i++) {
        const match = bookMatches[i];
        const href = match[1];
        let title = match[2].replace(/&amp;/g, '&').trim();
        title = title.replace(/<[^>]+>/g, '').trim();

        // Cerca autore nel contesto
        const contextStart = Math.max(0, match.index - 400);
        const contextEnd = match.index + match[0].length + 200;
        const context = cleanHtml.substring(contextStart, contextEnd);

        const authorMatch = context.match(/(?:author|by)[^>]*>([^<]+)</i);
        let author = 'Unknown';
        if (authorMatch && authorMatch[1]) {
          author = authorMatch[1].replace(/&amp;/g, '&').trim();
          author = author.replace(/<[^>]+>/g, '').trim();
        }

        const downloadUrl = href.startsWith('http') ? href : `https://annas-archive.pk${href}`;

        results.push({
          id: `annas-book-${i}`,
          title: title.substring(0, 200),
          author: author.substring(0, 100),
          source: 'annas-archive',
          sourceUrl: downloadUrl,
          downloadUrl: undefined,
        });

        if (results.length >= 10) break;
      }

      if (results.length > 0) {
        console.log(`Found ${results.length} results using book link pattern`);
        return results;
      }
    }

    // Pattern 3: Cerca qualsiasi link che assomigli a un libro
    const genericLinkRegex = /<a[^>]*href="([^"]*)"[^>]*>([^<]{10,200})<\/a>/gi;
    const genericMatches = [...cleanHtml.matchAll(genericLinkRegex)];

    if (genericMatches.length > 0) {
      for (let i = 0; i < Math.min(genericMatches.length, 10); i++) {
        const match = genericMatches[i];
        const href = match[1];
        let title = match[2].replace(/&amp;/g, '&').trim();
        title = title.replace(/<[^>]+>/g, '').trim();

        // Salta se sembra un link non pertinente
        if (href.includes('javascript:') ||
            href.includes('#') ||
            title.length < 10 ||
            title.length > 200) {
          continue;
        }

        const downloadUrl = href.startsWith('http') ? href : `https://annas-archive.pk${href}`;

        results.push({
          id: `annas-generic-${i}`,
          title,
          author: 'Unknown',
          source: 'annas-archive',
          sourceUrl: downloadUrl,
          downloadUrl: undefined,
        });

        if (results.length >= 10) break;
      }

      if (results.length > 0) {
        console.log(`Found ${results.length} results using generic link pattern`);
        return results;
      }
    }

    return [];
  } catch (error) {
    console.error('Error parsing Anna\'s Archive HTML:', error);
    return [];
  }
}

/**
 * Genera URL per mirror alternativi
 */
export function getAnnasArchiveMirrorUrls(): string[] {
  // Solo mirror testati e funzionanti (aprile 2025)
  return [
    'https://annas-archive.pk',
    'https://annas-archive.gs',
  ];
}
