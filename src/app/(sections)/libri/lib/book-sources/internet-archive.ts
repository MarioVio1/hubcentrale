/**
 * Internet Archive API Integration
 * Vasta biblioteca digitale con molti libri italiani gratuiti
 */

export interface InternetArchiveBook {
  identifier: string;
  title: string;
  creator?: string[];
  description?: string;
  year?: string;
  cover?: string;
  format?: Record<string, string>;
}

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  cover?: string;
  year?: number;
  description?: string;
  source: 'internet-archive';
  sourceUrl: string;
  downloadUrl?: string;
}

export async function searchInternetArchive(query: string, language: string = 'ita'): Promise<SearchResult[]> {
  console.log('🔍 Internet Archive: Searching for:', query, 'language:', language);
  try {
    // Internet Archive Search API
    const response = await fetch(
      `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)} AND mediatype:texts AND language:(${language})&fl[]=identifier&fl[]=title&fl[]=creator&fl[]=description&fl[]=year&output=json&rows=20`
    );

    console.log(`🔍 Internet Archive: returned status ${response.status}`);

    if (!response.ok) {
      throw new Error(`Internet Archive API error: ${response.status}`);
    }

    const data = await response.json();
    const docs = data.response?.docs || [];

    const results = docs.map((doc: any, index: number) => ({
      id: `internet-archive-${index}`,
      title: doc.title || 'Untitled',
      author: Array.isArray(doc.creator) ? doc.creator.join(', ') : (doc.creator || 'Unknown'),
      cover: `https://archive.org/services/img/${doc.identifier}`,
      description: typeof doc.description === 'string' && doc.description
        ? (doc.description.length > 200 ? doc.description.substring(0, 200) + '...' : doc.description)
        : undefined,
      year: doc.year ? parseInt(doc.year.toString().split(',')[0]) : undefined,
      source: 'internet-archive' as const,
      sourceUrl: `https://archive.org/details/${doc.identifier}`,
      downloadUrl: `https://archive.org/download/${doc.identifier}/${doc.identifier}_text.pdf`,
    }));

    console.log(`✅ Internet Archive: Found ${results.length} results`);
    return results;
  } catch (error) {
    console.error('❌ Error searching Internet Archive:', error);
    return [];
  }
}
