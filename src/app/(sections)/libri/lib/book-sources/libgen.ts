/**
 * LibGen.rs API Integration
 * LibGen.rs è un API che ricerca attraverso multiple fonti scientifiche
 */

export interface LibGenBook {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: string;
  cover_url?: string;
  extension: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  cover?: string;
  year?: number;
  description?: string;
  source: 'libgen';
  sourceUrl: string;
  downloadUrl?: string;
}

export async function searchLibGen(query: string): Promise<SearchResult[]> {
  console.log('🔍 LibGen: Searching for:', query);
  try {
    const response = await fetch(
      `https://libgen.rs/search.php?req=${encodeURIComponent(query)}&columns[]=[]&objects[]=&objects[]=topic&objects[]=author&objects[]=extension&objects[]=language&objects[]=year`
    );

    console.log(`🔍 LibGen: returned status ${response.status}`);

    if (!response.ok) {
      throw new Error(`LibGen API error: ${response.status}`);
    }

    const html = await response.text();
    const results = parseLibGenHTML(html);

    console.log(`✅ LibGen: Found ${results.length} results`);
    return results;
  } catch (error) {
    console.error('❌ Error searching LibGen:', error);
    return [];
  }
}

function parseLibGenHTML(html: string): SearchResult[] {
  const results: SearchResult[] = [];

  try {
    // LibGen.rs ritorna HTML semplice da parsare
    // Usiamo regex per estrarre i dati dalla tabella (server-side)

    // Estrai tutte le righe della tabella
    const tableRegex = /<table[^>]*>[\s\S]*?<\/table>/i;
    const tableMatch = html.match(tableRegex);

    if (!tableMatch) {
      return [];
    }

    const tableHTML = tableMatch[0];

    // Estrai le righe <tr>
    const rowRegex = /<tr[^>]*>[\s\S]*?<\/tr>/gi;
    const rows = tableHTML.match(rowRegex);

    if (!rows) {
      return [];
    }

    // Skip header row, process results rows (limit to 10)
    for (let i = 1; i < rows.length && i <= 11; i++) {
      const row = rows[i];

      try {
        // Estrai le celle <td>
        const cellRegex = /<td[^>]*>[\s\S]*?<\/td>/gi;
        const cells = row.match(cellRegex);

        if (!cells || cells.length < 6) {
          continue;
        }

        // Cell[0]: Author
        const authorCell = cells[0].replace(/<[^>]+>/g, '').trim();
        const author = authorCell || 'Unknown';

        // Cell[1]: Publisher
        const publisherCell = cells[1].replace(/<[^>]+>/g, '').trim();

        // Cell[2]: Title with link
        const titleMatch = cells[2].match(/<a[^>]+>([^<]+)<\/a>/i);
        const title = titleMatch?.[1]?.replace(/&nbsp;/g, ' ').trim() || 'Unknown';

        const linkMatch = cells[2].match(/<a[^>]+href="([^"]+)"/i);
        const linkUrl = linkMatch?.[1];
        const sourceUrl = linkUrl?.startsWith('http') ? linkUrl : `https://libgen.rs${linkUrl || ''}`;

        // Cell[3]: Year
        const yearCell = cells[3].replace(/<[^>]+>/g, '').trim();
        const year = yearCell ? parseInt(yearCell) : undefined;

        // Cell[4]: Language
        const language = cells[4].replace(/<[^>]+>/g, '').trim();

        // Cell[5]: Extension/Format
        const extension = cells[5].replace(/<[^>]+>/g, '').trim();

        results.push({
          id: `libgen-${i}`,
          title,
          author,
          description: publisher || language || extension
            ? `Publisher: ${publisher || 'N/A'} | Language: ${language || 'N/A'} | Format: ${extension || 'N/A'}`
            : undefined,
          year,
          cover: undefined,
          source: 'libgen',
          sourceUrl,
          downloadUrl: sourceUrl, // LibGen supporta download diretto
        });
      } catch (error) {
        console.error('Error parsing individual LibGen row:', error);
        continue;
      }
    }

    return results;
  } catch (error) {
    console.error('Error parsing LibGen HTML:', error);
    return [];
  }
}
