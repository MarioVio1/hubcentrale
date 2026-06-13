/**
 * Book Search Aggregator
 * Unifica i risultati da multiple fonti di libri
 */

import { searchOpenLibrary } from './open-library';
import { searchGutenberg } from './gutenberg';
import { searchGoogleBooks } from './google-books';
import { searchAnnasArchive } from './annas-archive';
import { searchLibGen } from './libgen';
import { searchLiberLiber } from './liber-liber';
import { searchInternetArchive } from './internet-archive';
import { searchManyBooks } from './manybooks';
import { searchFeedbooks } from './feedbooks';
import { searchZLibrary } from './zlibrary';
import { searchEbookSpy } from './ebookspy';
import { searchEurekaDDL } from './eurekaddl';
import { searchUnblocked } from './unblocked';
import { getSourceLabel } from './types';

// Re-export types and utilities from types.ts for client-side use
export type { BookSource, SearchResult } from './types';
export {
  getSourceLabel,
  getSourceColor,
  supportsDirectDownload,
  isItalianSource,
  isDirectorySource,
  ANNAS_ARCHIVE_WARNING,
  LEGAL_WARNING
} from './types';

export interface SearchOptions {
  sources?: BookSource[];
  maxResults?: number;
  googleBooksApiKey?: string;
}

/**
 * Cerca libri su multiple fonti in parallelo
 */
export async function searchBooks(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const {
    sources = [
      // Fonti con download diretto (priorità)
      'gutenberg',
      'libgen',
      'zlibrary',
      // Fonti italiane
      'liber-liber',
      'eurekaddl',
      'ebookspy',
      // Altre fonti
      'internet-archive',
      'manybooks',
      'feedbooks',
      'open-library',
      'google-books',
      'annas-archive',
      'unblocked'
    ],
    maxResults = 50,
    googleBooksApiKey,
  } = options;

  // Crea array di promesse per le ricerche
  const searchPromises: Promise<SearchResult[]>[] = [];

  console.log(`\n========== INIZIO RICERCA: "${query}" ==========`);
  console.log(`Fonti selezionate:`, sources);

  if (sources.includes('open-library')) {
    console.log('📋 Adding Open Library to search queue');
    searchPromises.push(searchOpenLibrary(query));
  }

  if (sources.includes('gutenberg')) {
    console.log('📋 Adding Project Gutenberg to search queue');
    searchPromises.push(searchGutenberg(query));
  }

  if (sources.includes('libgen')) {
    console.log('📋 Adding LibGen to search queue');
    searchPromises.push(searchLibGen(query));
  }

  if (sources.includes('google-books') && googleBooksApiKey) {
    console.log('📋 Adding Google Books to search queue');
    searchPromises.push(searchGoogleBooks(query, googleBooksApiKey));
  }

  if (sources.includes('annas-archive')) {
    console.log('📋 Adding Anna\'s Archive to search queue');
    searchPromises.push(searchAnnasArchive(query));
  }

  if (sources.includes('liber-liber')) {
    console.log('📋 Adding Liber Liber to search queue');
    searchPromises.push(searchLiberLiber(query));
  }

  if (sources.includes('internet-archive')) {
    console.log('📋 Adding Internet Archive to search queue');
    searchPromises.push(searchInternetArchive(query));
  }

  if (sources.includes('manybooks')) {
    console.log('📋 Adding ManyBooks to search queue');
    searchPromises.push(searchManyBooks(query));
  }

  if (sources.includes('feedbooks')) {
    console.log('📋 Adding Feedbooks to search queue');
    searchPromises.push(searchFeedbooks(query));
  }

  if (sources.includes('zlibrary')) {
    console.log('📋 Adding Z-Library to search queue');
    searchPromises.push(searchZLibrary(query));
  }

  if (sources.includes('ebookspy')) {
    console.log('📋 Adding EbookSpy to search queue');
    searchPromises.push(searchEbookSpy(query));
  }

  if (sources.includes('eurekaddl')) {
    console.log('📋 Adding EUREKAddl to search queue');
    searchPromises.push(searchEurekaDDL(query));
  }

  if (sources.includes('unblocked')) {
    console.log('📋 Adding Unblockit.date to search queue');
    searchPromises.push(searchUnblocked(query));
  }

  console.log(`📊 Queueing ${searchPromises.length} sources for parallel search`);

  // Esegui tutte le ricerche in parallelo con timeout individuale
  console.log(`⚡ Starting parallel search on ${searchPromises.length} sources...`);

  // Aggiungi timeout individuale per ogni fonte
  const TIMEOUT_MS = 10000; // 10 secondi per fonte
  const timeoutPromises = searchPromises.map((promise, idx) =>
    Promise.race([
      promise,
      new Promise<SearchResult[]>((resolve) =>
        setTimeout(() => {
          console.log(`⏱️ Timeout for source: ${sources[idx]}`);
          resolve([]);
        }, TIMEOUT_MS)
      )
    ])
  );

  const resultsArrays = await Promise.allSettled(timeoutPromises);

  // Estrai i risultati dalle promesse, ignorando quelli che hanno fallito
  const successfulResults: SearchResult[][] = [];
  resultsArrays.forEach((result, idx) => {
    if (result.status === 'fulfilled') {
      successfulResults.push(result.value);
      if (result.value.length > 0) {
        console.log(`✅ ${sources[idx]}: ${result.value.length} results`);
      }
    } else {
      console.log(`❌ ${sources[idx]}: Failed - ${result.reason?.message || 'Unknown error'}`);
    }
  });

  // Unisci tutti i risultati
  const allResults = successfulResults.flat();

  console.log(`\n📊 RISULTATI RIEPILOGO: ${allResults.length} totali`);

  // Mostra risultati per fonte
  const bySource = resultsArrays.map((result, idx) => {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      return {
        source: sources[idx],
        count: result.value.length
      };
    }
    return null;
  }).filter(Boolean);

  if (bySource.length > 0) {
    console.log('📈 Risultati per fonte:');
    bySource.forEach((item: any) => {
      console.log(`   - ${getSourceLabel(item.source as any)}: ${item.count} risultati`);
    });
  }

  // Rimuovi duplicati basandoti su titolo e autore
  const uniqueResults = removeDuplicates(allResults);
  console.log(`🔀 Rimossi ${allResults.length - uniqueResults.length} duplicati`);

  // Limita i risultati
  const finalResults = uniqueResults.slice(0, maxResults);
  console.log(`✅ Restituiti ${finalResults.length} risultati (limite: ${maxResults})`);
  console.log(`========== FINE RICERCA ==========\n`);

  return finalResults;
}

/**
 * Rimuovi risultati duplicati
 */
function removeDuplicates(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  const unique: SearchResult[] = [];

  for (const result of results) {
    const key = `${result.title.toLowerCase()}-${result.author.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(result);
    }
  }

  return unique;
}
