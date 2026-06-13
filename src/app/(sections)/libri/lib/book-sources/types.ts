/**
 * Types and utilities for book search
 * This module can be safely imported in client components
 */

export type BookSource =
  | 'all'
  | 'open-library'
  | 'gutenberg'
  | 'google-books'
  | 'annas-archive'
  | 'libgen'
  | 'liber-liber'
  | 'internet-archive'
  | 'manybooks'
  | 'feedbooks'
  | 'zlibrary'
  | 'ebookspy'
  | 'eurekaddl'
  | 'unblocked';

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  cover?: string;
  year?: number;
  description?: string;
  source:
    | 'open-library'
    | 'gutenberg'
    | 'google-books'
    | 'annas-archive'
    | 'libgen'
    | 'liber-liber'
    | 'internet-archive'
    | 'manybooks'
    | 'feedbooks'
    | 'zlibrary'
    | 'ebookspy'
    | 'eurekaddl'
    | 'unblocked';
  sourceUrl: string;
  downloadUrl?: string;
  md5?: string;
}

/**
 * Ottieni il nome formattato della fonte
 */
export function getSourceLabel(source: SearchResult['source']): string {
  switch (source) {
    case 'open-library':
      return 'Open Library';
    case 'gutenberg':
      return 'Project Gutenberg';
    case 'google-books':
      return 'Google Books';
    case 'annas-archive':
      return "Anna's Archive";
    case 'libgen':
      return 'LibGen';
    case 'liber-liber':
      return 'Liber Liber (Italiano)';
    case 'internet-archive':
      return 'Internet Archive';
    case 'manybooks':
      return 'ManyBooks';
    case 'feedbooks':
      return 'Feedbooks';
    case 'zlibrary':
      return 'Z-Library';
    case 'ebookspy':
      return 'EbookSpy';
    case 'eurekaddl':
      return 'EUREKAddl (Italiano)';
    case 'unblocked':
      return 'Unblockit.date';
    default:
      return source;
  }
}

/**
 * Ottieni il colore del badge della fonte
 */
export function getSourceColor(source: SearchResult['source']): string {
  switch (source) {
    case 'open-library':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    case 'gutenberg':
      return 'bg-green-500/10 text-green-500 border-green-500/30';
    case 'google-books':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
    case 'annas-archive':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
    case 'libgen':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
    case 'liber-liber':
      return 'bg-teal-500/10 text-teal-500 border-teal-500/30';
    case 'internet-archive':
      return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30';
    case 'manybooks':
      return 'bg-pink-500/10 text-pink-500 border-pink-500/30';
    case 'feedbooks':
      return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
    case 'zlibrary':
      return 'bg-red-500/10 text-red-500 border-red-500/30';
    case 'ebookspy':
      return 'bg-violet-500/10 text-violet-500 border-violet-500/30';
    case 'eurekaddl':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
    case 'unblocked':
      return 'bg-lime-500/10 text-lime-600 border-lime-500/30';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
  }
}

/**
 * Controlla se una fonte supporta download diretto
 */
export function supportsDirectDownload(
  source: SearchResult['source']
): boolean {
  return source === 'gutenberg' || source === 'libgen' || source === 'zlibrary';
}

/**
 * Controlla se una fonte è principalmente italiana
 */
export function isItalianSource(
  source: SearchResult['source']
): boolean {
  return ['liber-liber', 'eurekaddl', 'ebookspy'].includes(source);
}

/**
 * Controlla se una fonte è una directory o aggregatore
 */
export function isDirectorySource(
  source: SearchResult['source']
): boolean {
  return source === 'unblocked';
}

/**
 * Avviso legale per Anna's Archive
 */
export const ANNAS_ARCHIVE_WARNING =
  '⚠️ AVVERTENZA IMPORTANTE: Anna\'s Archive è una shadow library. L\'uso di questa fonte deve rispettare le leggi locali sul copyright. Gli utenti sono responsabili di assicurarsi di essere in conformità legale.';

/**
 * Avviso per fonti di dubbia legalità
 */
export const LEGAL_WARNING =
  '⚠️ ATTENZIONE: Alcune di queste fonti potrebbero contenere materiale protetto da copyright. Verifica sempre la legalità del download nella tua giurisdizione.';
