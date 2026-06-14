'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import {
  Home,
  Search,
  BookOpen,
  History,
  Settings,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  Share2,
  Star,
  Check,
  Play,
  Package,
  RefreshCw,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  ArrowUpDown,
} from 'lucide-react';

// Types
interface Manga {
  id: string;
  title: string;
  altTitle?: string;
  description?: string;
  author?: string;
  artist?: string;
  genre?: string[];
  status?: string;
  coverUrl?: string;
  rating?: number;
  extensionId: string;
  sourceId: string;
  url: string;
  inLibrary?: boolean;
  category?: string;
}

interface Chapter {
  id: string;
  mangaId: string;
  chapterNum: number;
  name?: string;
  url: string;
  read: boolean;
  lastPageRead: number;
}

interface Repository {
  id: string;
  name: string;
  url: string;
  description?: string;
  icon?: string;
  enabled: boolean;
  extensions?: Extension[];
  lastChecked?: Date;
}

interface Extension {
  id: string;
  name: string;
  pkgName: string;
  versionName: string;
  lang: string;
  iconUrl?: string;
  enabled: boolean;
  repo?: Repository;
  _count?: { mangas: number };
}

interface ReadingHistory {
  id: string;
  mangaId: string;
  chapterNum?: number;
  readAt: Date;
  manga: Manga;
}

interface Source {
  id: string;
  name: string;
  lang: string;
  baseUrl: string;
  nsfw?: number;
  enabled: boolean;
  priority: number;
}

interface ChapterWithManga {
  id: string;
  mangaId: string;
  chapterNum: number;
  name?: string;
  url: string;
  uploadedAt?: Date;
  manga: {
    id: string;
    title: string;
    coverUrl?: string;
    url: string;
    sourceId: string;
  };
}

type Page = 'home' | 'browse' | 'library' | 'history' | 'settings' | 'detail' | 'reader';

export default function MangaFlow() {
  // Navigation state
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentManga, setCurrentManga] = useState<Manga | null>(null);

  // Data state
  const [popularManga, setPopularManga] = useState<Manga[]>([]);
  const [latestManga, setLatestManga] = useState<Manga[]>([]);
  const [trendingChapters, setTrendingChapters] = useState<ChapterWithManga[]>([]);
  const [recentChapters, setRecentChapters] = useState<ChapterWithManga[]>([]);
  const [searchResults, setSearchResults] = useState<Manga[]>([]);
  const [library, setLibrary] = useState<Manga[]>([]);
  const [history, setHistory] = useState<ReadingHistory[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterPages, setChapterPages] = useState<{ url: string; index: number }[]>([]);
  const [chapterSortOrder, setChapterSortOrder] = useState<'desc' | 'asc'>('desc'); // 'desc' = newest first, 'asc' = oldest first
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]); // Now managed automatically

  // Helper function to get proxied image URL
  const getProxiedImageUrl = (url: string | null | undefined): string => {
    if (!url) return '/placeholder-cover.svg';
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  };

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showReaderControls, setShowReaderControls] = useState(true);
  const [repoModalOpen, setRepoModalOpen] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [isLoadingChapter, setIsLoadingChapter] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Reader zoom and pan state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchDistance, setTouchDistance] = useState(0);
  const [touchStartZoom, setTouchStartZoom] = useState(1);

  // Load initial data
  useEffect(() => {
    loadSources();
    loadPopularManga();
    loadLatestManga();
    loadTrendingChapters();
    loadRecentChapters();
    loadRepositories();
    loadExtensions();
    loadLibrary();
    loadHistory();
  }, []);

  // Load popular manga
  const loadPopularManga = async () => {
    try {
      const response = await fetch('/api/manga?type=popular');
      const data = await response.json();
      setPopularManga(data);
    } catch (error) {
      console.error('Error loading popular manga:', error);
    }
  };

  // Load latest manga
  const loadLatestManga = async () => {
    try {
      const response = await fetch('/api/manga?type=latest');
      const data = await response.json();
      setLatestManga(data);
    } catch (error) {
      console.error('Error loading latest manga:', error);
    }
  };

  // Load trending chapters
  const loadTrendingChapters = async () => {
    try {
      const response = await fetch('/api/chapters-home?type=trending');
      const data = await response.json();
      setTrendingChapters(data);
    } catch (error) {
      console.error('Error loading trending chapters:', error);
    }
  };

  // Load recent chapters
  const loadRecentChapters = async () => {
    try {
      const response = await fetch('/api/chapters-home?type=recent');
      const data = await response.json();
      setRecentChapters(data);
    } catch (error) {
      console.error('Error loading recent chapters:', error);
    }
  };

  // Load repositories
  const loadRepositories = async () => {
    try {
      const response = await fetch('/api/repos');
      const data = await response.json();
      setRepositories(data);
    } catch (error) {
      console.error('Error loading repositories:', error);
    }
  };

  // Load extensions
  const loadExtensions = async () => {
    try {
      const response = await fetch('/api/extensions?lang=it');
      const data = await response.json();
      setExtensions(data);
    } catch (error) {
      console.error('Error loading extensions:', error);
    }
  };

  // Load library
  const loadLibrary = async () => {
    try {
      const response = await fetch('/api/library');
      const data = await response.json();
      setLibrary(data.map((entry: any) => entry.manga));
    } catch (error) {
      console.error('Error loading library:', error);
    }
  };

  // Load history
  const loadHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  // Load sources
  const loadSources = async () => {
    try {
      const response = await fetch('/api/sources');
      const data = await response.json();
      setSources(data);
    } catch (error) {
      console.error('Error loading sources:', error);
    }
  };

  // Toggle source selection
  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => {
      if (prev.includes(sourceId)) {
        return prev.filter(id => id !== sourceId);
      } else {
        return [...prev, sourceId];
      }
    });
  };

  // Get source name by ID
  const getSourceName = (sourceId: string): string => {
    const source = sources.find(s => s.id === sourceId);
    return source?.name || sourceId;
  };

  // Search manga
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/manga?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching manga:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load manga details
  const loadMangaDetail = async (manga: Manga) => {
    setCurrentManga(manga);
    try {
      const url = `/api/chapters?mangaUrl=${encodeURIComponent(manga.url)}&sourceId=${manga.sourceId || 'mangaworld'}`;
      const response = await fetch(url);
      const data = await response.json();
      setChapters(data);
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
    setCurrentPage('detail');
  };

  // Open chapter in reader
  const openChapter = async (chapter: Chapter) => {
    setCurrentChapter(chapter);
    setCurrentPageIndex(0);
    setIsLoadingChapter(chapter.id); // Immediate feedback
    setLoading(true);
    // Reset zoom when opening new chapter
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
    try {
      const sourceId = currentManga?.sourceId || 'mangaworld';
      const url = `/api/pages?chapterUrl=${encodeURIComponent(chapter.url)}&sourceId=${sourceId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok || data.error) {
        console.error('Error loading chapter pages:', data.error, data.details);
        alert(`Errore nel caricamento delle pagine: ${data.error || 'Sconosciuto'}\n\n${data.details || 'Riprova più tardi o usa una fonte diversa.'}`);
        return;
      }

      const pages = data;
      setChapterPages(pages);
      setReaderOpen(true);
      setCurrentPage('reader');

      // Add to history
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mangaId: chapter.mangaId,
          chapterId: chapter.id,
          chapterNum: chapter.chapterNum,
        }),
      });

      // Mark chapter as read
      await fetch(`/api/manga/${currentManga?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterId: chapter.id, read: true }),
      });
    } catch (error) {
      console.error('Error loading chapter pages:', error);
      alert('Errore nel caricamento delle pagine. Riprova più tardi.');
    } finally {
      setLoading(false);
      setIsLoadingChapter(null); // Clear loading state
    }
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel(prev => Math.max(prev - 0.25, 1));
      if (zoomLevel - 0.25 <= 1) {
        setImagePosition({ x: 0, y: 0 });
      }
    }
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setImagePosition({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoomLevel(prev => Math.min(Math.max(prev + delta, 1), 3));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      setTouchDistance(
        Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
      );
      setTouchStartZoom(zoomLevel);
    } else if (e.touches.length === 1) {
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistance > 0) {
      e.preventDefault();
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = currentDistance / touchDistance;
      const newZoom = Math.min(Math.max(touchStartZoom * scale, 1), 3);
      setZoomLevel(newZoom);
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - dragStart.x;
      const dy = touch.clientY - dragStart.y;
      setImagePosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
      setDragStart({ x: touch.clientX, y: touch.clientY });
    }
  };

  const handleTouchEnd = () => {
    setTouchDistance(0);
  };

  // Get sorted chapters
  const getSortedChapters = () => {
    return [...chapters].sort((a, b) => {
      const numA = a.chapterNum ?? 0;
      const numB = b.chapterNum ?? 0;
      return chapterSortOrder === 'desc' ? numB - numA : numA - numB;
    });
  };

  // Toggle library
  const toggleLibrary = async (manga: Manga) => {
    console.log('[toggleLibrary] Called with manga:', manga.title);
    console.log('[toggleLibrary] manga.inLibrary:', manga.inLibrary);
    console.log('[toggleLibrary] manga.id:', manga.id);

    if (manga.inLibrary) {
      // Remove from library
      console.log('[toggleLibrary] Removing from library...');
      await fetch(`/api/library?mangaId=${manga.id}`, { method: 'DELETE' });
      manga.inLibrary = false;
    } else {
      // Add to library - send complete manga data
      console.log('[toggleLibrary] Adding to library...');
      const response = await fetch('/api/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mangaData: {
            title: manga.title,
            description: manga.description,
            author: manga.author,
            artist: manga.artist,
            genre: manga.genre,
            status: manga.status,
            thumbnailUrl: manga.coverUrl,
            coverUrl: manga.coverUrl,
            url: manga.url,
            sourceUrl: manga.url,
            extensionId: manga.extensionId,
            sourceId: manga.sourceId,
          },
        }),
      });

      const result = await response.json();
      console.log('[toggleLibrary] Add result:', result);

      if (result.success) {
        manga.inLibrary = true;
        manga.id = result.mangaId;
      } else {
        console.error('[toggleLibrary] Failed to add:', result.error);
        return;
      }
    }
    loadLibrary();
  };

  // Add repository
  const addRepository = async () => {
    if (!newRepoUrl.trim()) return;

    try {
      await fetch('/api/repos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRepoUrl.split('/').pop() || 'New Repo',
          url: newRepoUrl,
          icon: '📦',
        }),
      });
      setNewRepoUrl('');
      loadRepositories();
      setRepoModalOpen(false);
    } catch (error) {
      console.error('Error adding repository:', error);
    }
  };

  // Sync extensions from repository
  const syncExtensions = async (repoId: string) => {
    setLoading(true);
    try {
      await fetch('/api/extensions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId }),
      });
      loadExtensions();
      loadRepositories();
    } catch (error) {
      console.error('Error syncing extensions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle repository
  const toggleRepo = async (repoId: string, enabled: boolean) => {
    try {
      await fetch(`/api/repos/${repoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      loadRepositories();
    } catch (error) {
      console.error('Error toggling repository:', error);
    }
  };

  // Toggle extension
  const toggleExtension = async (extId: string, enabled: boolean) => {
    // In a real app, this would update the extension
    setExtensions(extensions.map(ext =>
      ext.id === extId ? { ...ext, enabled } : ext
    ));
  };

  // Clear history
  const clearHistory = async () => {
    await fetch('/api/history', { method: 'DELETE' });
    loadHistory();
  };

  // Download chapter as PDF
  const downloadChapterPDF = async () => {
    if (!currentChapter || !currentManga) return;

    setIsGeneratingPdf(true);

    try {
      const url = `/api/download-chapter-pdf?chapterUrl=${encodeURIComponent(currentChapter.url)}&sourceId=${currentManga.sourceId || 'mangaworld'}&mangaTitle=${encodeURIComponent(currentManga.title)}&chapterNum=${currentChapter.chapterNum}`;

      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Download failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${currentManga.title.replace(/[^a-zA-Z0-9]/g, '_')}_Cap${currentChapter.chapterNum}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('[Download PDF] Error:', error);
      alert('Errore nel download del PDF: ' + (error instanceof Error ? error.message : 'Sconosciuto'));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Helper functions
  const getStatusText = (status?: string) => {
    const statuses: Record<string, string> = {
      ongoing: 'In corso',
      completed: 'Completato',
      hiatus: 'In pausa',
      cancelled: 'Cancellato',
    };
    return statuses[status || ''] || status || '';
  };

  const formatTimeAgo = (date: Date | string) => {
    const d = new Date(date);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    const intervals = [
      { label: 'anno', seconds: 31536000 },
      { label: 'mese', seconds: 2592000 },
      { label: 'settimana', seconds: 604800 },
      { label: 'giorno', seconds: 86400 },
      { label: 'ora', seconds: 3600 },
      { label: 'minuto', seconds: 60 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 'i' : ''} fa`;
      }
    }
    return 'Adesso';
  };

  // Navigation
  const navigate = (page: Page) => {
    setCurrentPage(page);
    if (page !== 'reader') {
      setReaderOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5] font-sans">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_20%_20%,rgba(0,212,170,0.15),transparent_50%)]" />
      </div>

      {/* Main content */}
      <div className="max-w-md mx-auto pb-20 min-h-screen">
        {currentPage === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
              <div className="p-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">
                  Manga<span className="text-[#8b5cf6]">Flow</span>
                </h1>
              </div>
            </header>

            <main className="p-4 space-y-8">
              {/* Continue Reading */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Continua a leggere</h2>
                  <button
                    onClick={() => navigate('history')}
                    className="text-[#8b5cf6] text-sm font-medium hover:underline"
                  >
                    Vedi tutti
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {history.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadMangaDetail(item.manga)}
                      className="flex-shrink-0 w-28 cursor-pointer group"
                    >
                      <div className="relative mb-2 rounded-lg overflow-hidden aspect-[2/3] bg-white/5">
                        {item.manga.coverUrl ? (
                          <img
                            src={getProxiedImageUrl(item.manga.coverUrl)}
                            alt={item.manga.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-cover.svg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl">📚</span>
                          </div>
                        )}
                        {item.chapterNum && (
                          <div className="absolute bottom-2 left-2 right-2">
                            <span className="text-xs font-semibold text-white drop-shadow-lg bg-black/50 px-2 py-1 rounded">
                              Cap. {item.chapterNum}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium truncate">{item.manga.title}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Trending Chapters - Carousel */}
              {trendingChapters.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Capitoli di tendenza</h2>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                    {trendingChapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        onClick={() => {
                          const manga: Manga = {
                            id: chapter.manga.id,
                            title: chapter.manga.title,
                            coverUrl: chapter.manga.coverUrl,
                            url: chapter.manga.url,
                            extensionId: 'mangaworld-ext',
                            sourceId: chapter.manga.sourceId,
                          };
                          setCurrentManga(manga);
                          openChapter({
                            id: chapter.id,
                            mangaId: chapter.mangaId,
                            chapterNum: chapter.chapterNum,
                            name: chapter.name,
                            url: chapter.url,
                            read: false,
                            lastPageRead: 0,
                          });
                        }}
                        className="flex-shrink-0 w-64 cursor-pointer group snap-start"
                      >
                        <Card className="overflow-hidden border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="relative aspect-[16/9] overflow-hidden">
                            {chapter.manga.coverUrl ? (
                              <img
                                src={getProxiedImageUrl(chapter.manga.coverUrl)}
                                alt={chapter.manga.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-cover.svg';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white/5">
                                <span className="text-4xl">📚</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            <div className="absolute bottom-3 left-3 right-3">
                              <p className="text-sm font-semibold text-white line-clamp-2">{chapter.manga.title}</p>
                              <p className="text-xs text-[#8b5cf6] mt-1">{chapter.name || `Capitolo ${chapter.chapterNum}`}</p>
                            </div>
                          </div>
                        </Card>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Popular This Week */}
              <section>
                <h2 className="text-lg font-semibold mb-4">Popolari</h2>
                <div className="grid grid-cols-3 gap-3">
                  {popularManga.slice(0, 6).map((manga) => (
                    <div
                      key={manga.id}
                      onClick={() => loadMangaDetail(manga)}
                      className="cursor-pointer group"
                    >
                      <div className="relative mb-2 rounded-lg overflow-hidden aspect-[2/3] bg-white/5">
                        {manga.coverUrl ? (
                          <img
                            src={getProxiedImageUrl(manga.coverUrl)}
                            alt={manga.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-cover.svg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl">📚</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium truncate">{manga.title}</p>
                      {manga.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs text-white/60">{manga.rating}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Latest Chapters - List View */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Ultimi capitoli aggiunti</h2>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentChapters.map((chapter) => (
                    <Card
                      key={chapter.id}
                      onClick={() => {
                        const manga: Manga = {
                          id: chapter.manga.id,
                          title: chapter.manga.title,
                          coverUrl: chapter.manga.coverUrl,
                          url: chapter.manga.url,
                          extensionId: 'mangaworld-ext',
                          sourceId: chapter.manga.sourceId,
                        };
                        setCurrentManga(manga);
                        openChapter({
                          id: chapter.id,
                          mangaId: chapter.mangaId,
                          chapterNum: chapter.chapterNum,
                          name: chapter.name,
                          url: chapter.url,
                          read: false,
                          lastPageRead: 0,
                        });
                      }}
                      className="p-0 flex cursor-pointer hover:bg-white/5 transition-colors border-white/10 overflow-hidden"
                    >
                      <div className="w-20 h-28 flex-shrink-0 overflow-hidden bg-white/5">
                        {chapter.manga.coverUrl ? (
                          <img
                            src={getProxiedImageUrl(chapter.manga.coverUrl)}
                            alt={chapter.manga.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-cover.svg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">📚</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 p-3 flex flex-col justify-center">
                        <h3 className="font-semibold text-sm truncate">{chapter.manga.title}</h3>
                        <p className="text-xs text-[#8b5cf6] mt-1">{chapter.name || `Capitolo ${chapter.chapterNum}`}</p>
                        <p className="text-xs text-white/40 mt-2">MangaWorld</p>
                      </div>
                      <div className="p-3 flex items-center">
                        <ChevronRight className="w-5 h-5 text-white/40" />
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            </main>
          </div>
        )}

        {currentPage === 'browse' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Cerca manga, autori..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#8b5cf6]"
                  />
                </div>
              </div>
            </header>

            <main className="p-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#8b5cf6] border-t-transparent" />
                </div>
              ) : searchQuery ? (
                <div className="grid grid-cols-2 gap-4">
                  {searchResults.map((manga) => (
                    <div
                      key={manga.id}
                      onClick={() => loadMangaDetail(manga)}
                      className="cursor-pointer group"
                    >
                      <div className="relative mb-2 rounded-lg overflow-hidden aspect-[2/3] bg-white/5">
                        {manga.coverUrl ? (
                          <img
                            src={getProxiedImageUrl(manga.coverUrl)}
                            alt={manga.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-cover.svg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl">📚</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate group-hover:text-[#8b5cf6] transition-colors">
                        {manga.title}
                      </p>
                      <p className="text-xs text-white/40 truncate">
                        {getSourceName(manga.sourceId)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-white/40">
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Cerca manga per iniziare</p>
                </div>
              )}
            </main>
          </div>
        )}

        {currentPage === 'library' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
              <div className="p-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">La mia libreria</h1>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="hover:bg-white/10"
                  >
                    {viewMode === 'grid' ? (
                      <BookOpen className="w-5 h-5" />
                    ) : (
                      <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
                        <div className="bg-current" />
                        <div className="bg-current" />
                        <div className="bg-current" />
                        <div className="bg-current" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </header>

            <main className="p-4">
              {library.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-white/40" />
                  <h3 className="text-lg font-semibold mb-2">La tua libreria è vuota</h3>
                  <p className="text-sm text-white/60 mb-6">
                    Esplora e aggiungi manga alla tua collezione
                  </p>
                  <Button
                    onClick={() => navigate('browse')}
                    className="bg-[#8b5cf6] text-black hover:bg-[#8b5cf6]/90"
                  >
                    Esplora manga
                  </Button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-3 gap-4">
                  {library.map((manga) => (
                    <div
                      key={manga.id}
                      onClick={() => loadMangaDetail(manga)}
                      className="cursor-pointer group"
                    >
                      <div className="relative mb-2 rounded-lg overflow-hidden aspect-[2/3] bg-white/5">
                        {manga.coverUrl ? (
                          <img
                            src={getProxiedImageUrl(manga.coverUrl)}
                            alt={manga.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-cover.svg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl">📚</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium truncate">{manga.title}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {library.map((manga) => (
                    <Card
                      key={manga.id}
                      onClick={() => loadMangaDetail(manga)}
                      className="p-3 flex gap-3 cursor-pointer hover:bg-white/5 transition-colors border-white/10"
                    >
                      <div className="w-16 h-24 object-cover rounded-lg flex-shrink-0 overflow-hidden bg-white/5">
                        {manga.coverUrl ? (
                          <img
                            src={getProxiedImageUrl(manga.coverUrl)}
                            alt={manga.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-cover.svg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">📚</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{manga.title}</h3>
                        {manga.author && (
                          <p className="text-xs text-white/60 mt-1">{manga.author}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </main>
          </div>
        )}

        {currentPage === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
              <div className="p-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">Cronologia</h1>
                <Button variant="ghost" size="sm" onClick={clearHistory}>
                  Cancella tutto
                </Button>
              </div>
            </header>

            <main className="p-4">
              {history.length === 0 ? (
                <div className="text-center py-16">
                  <History className="w-16 h-16 mx-auto mb-4 text-white/40" />
                  <h3 className="text-lg font-semibold mb-2">Nessuna cronologia</h3>
                  <p className="text-sm text-white/60">
                    I manga che leggerai appariranno qui
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <Card
                      key={item.id}
                      onClick={() => loadMangaDetail(item.manga)}
                      className="p-3 flex gap-3 cursor-pointer hover:bg-white/5 transition-colors border-white/10"
                    >
                      <div className="w-16 h-24 object-cover rounded-lg flex-shrink-0 overflow-hidden bg-white/5">
                        {item.manga.coverUrl ? (
                          <img
                            src={getProxiedImageUrl(item.manga.coverUrl)}
                            alt={item.manga.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-cover.svg';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">📚</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{item.manga.title}</h3>
                        {item.chapterNum && (
                          <p className="text-xs text-[#8b5cf6] mt-1">
                            Capitolo {item.chapterNum}
                          </p>
                        )}
                        <p className="text-xs text-white/60 mt-2">
                          {formatTimeAgo(item.readAt)}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </main>
          </div>
        )}

        {currentPage === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <header className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5">
              <div className="p-4">
                <h1 className="text-xl font-bold">Impostazioni</h1>
              </div>
            </header>

            <main className="p-4 space-y-6">
              {/* Repositories Section */}
              <Card className="p-4 border-white/10 bg-white/5">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#8b5cf6]" />
                  Repository
                </h2>
                <p className="text-sm text-white/60 mb-4">
                  Gestisci le fonti dei manga. Aggiungi repo per accedere a più contenuti.
                </p>
                <Button
                  onClick={() => setRepoModalOpen(true)}
                  className="w-full bg-[#8b5cf6] text-black hover:bg-[#8b5cf6]/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi repository
                </Button>

                <div className="mt-4 space-y-2">
                  {repositories.map((repo) => (
                    <div
                      key={repo.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{repo.icon || '📦'}</span>
                        <div>
                          <p className="text-sm font-medium">{repo.name}</p>
                          <p className="text-xs text-white/60">
                            {repo.extensions?.length || 0} estensioni
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={repo.enabled}
                          onCheckedChange={(checked) => toggleRepo(repo.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => syncExtensions(repo.id)}
                          disabled={loading}
                          className="hover:bg-white/10"
                        >
                          <RefreshCw
                            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                          />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Extensions Section */}
              <Card className="p-4 border-white/10 bg-white/5">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#8b5cf6]" />
                  Estensioni ({extensions.length})
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {extensions.map((ext) => (
                    <div
                      key={ext.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        {ext.iconUrl && (
                          <img
                            src={ext.iconUrl}
                            alt={ext.name}
                            className="w-10 h-10 rounded-lg"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium">{ext.name}</p>
                          <p className="text-xs text-white/60">
                            {ext.versionName} • {ext._count?.mangas || 0} manga
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={ext.enabled}
                        onCheckedChange={(checked) => toggleExtension(ext.id, checked)}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Direct Sources Section */}
              <Card className="p-4 border-white/10 bg-white/5">
                <h2 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#8b5cf6]" />
                  Fonti dirette
                </h2>
                <p className="text-xs text-white/60 mb-4">
                  MangaWorld è la fonte principale. Se non trova, cerca nelle altre fonti.
                </p>
                <div className="space-y-2">
                  {sources.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${source.nsfw === 2 ? 'bg-red-500/20' : 'bg-[#8b5cf6]/20'}`}>
                          {source.nsfw === 2 ? '🔞' : '📖'}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{source.name}</p>
                          <p className="text-xs text-white/60">
                            {source.lang.toUpperCase()} • Priorità {source.priority}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={source.enabled}
                        onCheckedChange={async (checked) => {
                          await fetch('/api/sources', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ sourceId: source.id }),
                          });
                          loadSources();
                        }}
                      />
                    </div>
                  ))}
                </div>
              </Card>
            </main>
          </div>
        )}

        {currentPage === 'detail' && currentManga && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header with cover */}
            <div className="relative">
              {currentManga.coverUrl && (
                <img
                  src={getProxiedImageUrl(currentManga.coverUrl)}
                  alt={currentManga.title}
                  className="w-full h-72 object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('home')}
                className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm hover:bg-black/70 z-20"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-4 -mt-16 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 mr-4">
                  <h1 className="text-2xl font-bold leading-tight">{currentManga.title}</h1>
                  {currentManga.altTitle && (
                    <p className="text-white/60 text-sm mt-1">{currentManga.altTitle}</p>
                  )}
                </div>
                {currentManga.rating && (
                  <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-sm">{currentManga.rating}</span>
                  </div>
                )}
              </div>

              {(() => {
                const genres = Array.isArray(currentManga.genre)
                  ? currentManga.genre
                  : typeof currentManga.genre === 'string'
                  ? JSON.parse(currentManga.genre || '[]')
                  : [];
                return genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {genres.map((g) => (
                      <Badge
                        key={g}
                        variant="outline"
                        className="border-[#8b5cf6]/50 text-[#8b5cf6]"
                      >
                        {g}
                      </Badge>
                    ))}
                    {currentManga.status && (
                      <Badge
                        variant="outline"
                        className={
                          currentManga.status === 'ongoing'
                            ? 'border-[#8b5cf6] text-[#8b5cf6]'
                            : currentManga.status === 'completed'
                            ? 'border-white/30 text-white/60'
                            : 'border-yellow-500 text-yellow-500'
                        }
                      >
                        {getStatusText(currentManga.status)}
                      </Badge>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                {currentManga.author && (
                  <div>
                    <p className="text-white/60">Autore</p>
                    <p className="font-medium">{currentManga.author}</p>
                  </div>
                )}
                {currentManga.artist && (
                  <div>
                    <p className="text-white/60">Artista</p>
                    <p className="font-medium">{currentManga.artist}</p>
                  </div>
                )}
              </div>

              {currentManga.description && (
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  {currentManga.description}
                </p>
              )}

              <div className="flex gap-3 mb-6 relative z-20">
                <Button
                  onClick={() => {
                    const lastChapter = chapters.find((c) => !c.read) || chapters[0];
                    if (lastChapter) openChapter(lastChapter);
                  }}
                  className="flex-1 bg-[#8b5cf6] text-black hover:bg-[#8b5cf6]/90"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Inizia lettura
                </Button>
                <Button
                  variant={currentManga.inLibrary ? 'secondary' : 'outline'}
                  onClick={() => toggleLibrary(currentManga)}
                  className={currentManga.inLibrary ? 'bg-white/10 border-white/10' : 'border-[#8b5cf6] text-[#8b5cf6] hover:bg-[#8b5cf6]/10'}
                >
                  {currentManga.inLibrary ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      In libreria
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi
                    </>
                  )}
                </Button>
              </div>

              {/* Chapters */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Capitoli</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setChapterSortOrder(chapterSortOrder === 'desc' ? 'asc' : 'desc')}
                    className="text-xs"
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    {chapterSortOrder === 'desc' ? 'Nuovi' : 'Vecchi'}
                  </Button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {getSortedChapters().map((chapter) => (
                    <Card
                      key={chapter.id}
                      className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white/5 active:bg-white/10 transition-colors border-white/10 relative ${
                        chapter.read ? 'opacity-60' : ''
                      } ${isLoadingChapter === chapter.id ? 'border-[#8b5cf6] border-2' : ''}`}
                      onClick={() => openChapter(chapter)}
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#8b5cf6]/10 text-[#8b5cf6] flex items-center justify-center font-bold flex-shrink-0">
                        {chapter.chapterNum}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          Capitolo {chapter.chapterNum}
                        </p>
                      </div>
                      {chapter.read && (
                        <Check className="w-5 h-5 text-[#8b5cf6] flex-shrink-0" />
                      )}
                      {isLoadingChapter === chapter.id && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                          <div className="w-4 h-4 border border-[#8b5cf6] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'reader' && readerOpen && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Reader controls */}
            <div
              className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent transition-opacity z-10 ${
                showReaderControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setReaderOpen(false);
                    navigate('detail');
                    // Reset zoom when closing reader
                    setZoomLevel(1);
                    setImagePosition({ x: 0, y: 0 });
                  }}
                  className="text-white hover:bg-white/10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-sm font-medium text-white truncate max-w-[150px]">
                      {currentManga?.title}
                    </p>
                    <p className="text-xs text-[#8b5cf6]">
                      Cap. {currentChapter?.chapterNum}
                    </p>
                  </div>
                  {/* Zoom controls */}
                  <div className="flex items-center gap-1 bg-black/50 rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 1}
                      className="text-white hover:bg-white/20 h-7 w-7"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-white text-xs min-w-[3rem] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 3}
                      className="text-white hover:bg-white/20 h-7 w-7"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    {zoomLevel > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomReset}
                        className="text-white hover:bg-white/20 h-7 w-7"
                      >
                        <Minimize className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  {/* Download PDF */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={downloadChapterPDF}
                    disabled={isGeneratingPdf}
                    className="text-white hover:bg-white/20 h-7 w-7 relative"
                    title="Scarica PDF"
                  >
                    {isGeneratingPdf ? (
                      <div className="w-4 h-4 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Package className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowReaderControls(!showReaderControls)}
                  className="text-white hover:bg-white/10"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Page display */}
            <div
              className="flex-1 overflow-hidden relative flex items-center justify-center"
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#8b5cf6] border-t-transparent" />
                </div>
              ) : chapterPages.length === 0 ? (
                <div className="text-center text-white/60">
                  <p>Nessuna pagina disponibile</p>
                </div>
              ) : (
                <>
                  {/* Page content */}
                  <div
                    className="h-full w-full overflow-hidden"
                    onClick={() => setShowReaderControls(!showReaderControls)}
                    onWheel={handleWheel}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className="h-full flex items-center justify-center p-4">
                      <div
                        className={`relative w-full h-full ${zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onClick={(e) => {
                          if (zoomLevel === 1) {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            if (x < rect.width * 0.4) {
                              // Left side - previous page
                              if (currentPageIndex > 0) {
                                setCurrentPageIndex(currentPageIndex - 1);
                              }
                            } else if (x > rect.width * 0.6) {
                              // Right side - next page
                              if (currentPageIndex < chapterPages.length - 1) {
                                setCurrentPageIndex(currentPageIndex + 1);
                              }
                            }
                          }
                        }}
                      >
                        <img
                          src={chapterPages[currentPageIndex]?.url}
                          alt={`Page ${currentPageIndex + 1}`}
                          className="max-w-full max-h-full object-contain select-none pointer-events-none"
                          style={{
                            transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                            transformOrigin: 'center center',
                            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                          }}
                          draggable={false}
                          onError={(e) => {
                            console.error('Failed to load page:', chapterPages[currentPageIndex]?.url);
                            // Show error indicator
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent(
                              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="#1a1a2e" width="100" height="100"/><text x="50" y="50" text-anchor="middle" fill="#666" font-size="40">?</text><text x="50" y="70" text-anchor="middle" fill="#666" font-size="12">Pagina non disponibile</text></svg>'
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-white/20">
              <Progress
                value={chapterPages.length > 0 ? ((currentPageIndex + 1) / chapterPages.length) * 100 : 0}
                className="h-full bg-transparent"
              />
            </div>

            {/* Page navigation buttons - always visible */}
            <div className="flex justify-center gap-3 px-4 py-3 bg-black/80">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (currentPageIndex > 0) {
                    setCurrentPageIndex(currentPageIndex - 1);
                    setZoomLevel(1);
                    setImagePosition({ x: 0, y: 0 });
                  }
                }}
                disabled={currentPageIndex === 0}
                className="bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 flex-1 max-w-[120px]"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Prec
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (currentPageIndex < chapterPages.length - 1) {
                    setCurrentPageIndex(currentPageIndex + 1);
                    setZoomLevel(1);
                    setImagePosition({ x: 0, y: 0 });
                  }
                }}
                disabled={currentPageIndex === chapterPages.length - 1}
                className="bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 flex-1 max-w-[120px]"
              >
                Succ
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Additional controls (page indicator, chapter navigation) - hidden by default */}
            <div
              className={`absolute bottom-20 left-0 right-0 flex flex-col items-center gap-3 transition-opacity z-30 ${
                showReaderControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Page indicator */}
              <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <p className="text-white text-sm font-medium">
                  Pagina {currentPageIndex + 1} / {chapterPages.length}
                </p>
              </div>

              {/* Chapter navigation */}
              <div className="flex justify-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const currentIndex = chapters.findIndex((c) => c.id === currentChapter?.id);
                    if (currentIndex > 0) {
                      openChapter(chapters[currentIndex - 1]);
                    }
                  }}
                  disabled={!currentChapter || chapters.findIndex((c) => c.id === currentChapter.id) === 0}
                  className="bg-white/5 text-white/70 hover:bg-white/10 text-xs disabled:opacity-30"
                >
                  <ChevronLeft className="w-3 h-3 mr-1" />
                  Cap. prec
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const currentIndex = chapters.findIndex((c) => c.id === currentChapter?.id);
                    if (currentIndex < chapters.length - 1) {
                      openChapter(chapters[currentIndex + 1]);
                    }
                  }}
                  disabled={
                    !currentChapter ||
                    chapters.findIndex((c) => c.id === currentChapter.id) === chapters.length - 1
                  }
                  className="bg-white/5 text-white/70 hover:bg-white/10 text-xs disabled:opacity-30"
                >
                  Cap. succ
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>

              {/* Zoom hint */}
              <div className="text-center text-white/50 text-xs">
                <p>💡 Clicca sui lati dell'immagine • Frecce laterali • Ctrl+Rotella per zoom</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      {!readerOpen && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/5 p-2 z-50">
          <div className="flex justify-around">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('home')}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-4 ${
                currentPage === 'home' ? 'text-[#8b5cf6]' : 'text-white/60'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('browse')}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-4 ${
                currentPage === 'browse' ? 'text-[#8b5cf6]' : 'text-white/60'
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="text-xs">Esplora</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('library')}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-4 ${
                currentPage === 'library' ? 'text-[#8b5cf6]' : 'text-white/60'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-xs">Libreria</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('history')}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-4 ${
                currentPage === 'history' ? 'text-[#8b5cf6]' : 'text-white/60'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-xs">Cronologia</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('settings')}
              className={`flex flex-col items-center gap-1 h-auto py-2 px-4 ${
                currentPage === 'settings' ? 'text-[#8b5cf6]' : 'text-white/60'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs">Impostazioni</span>
            </Button>
          </div>
        </nav>
      )}

      {/* Add Repository Modal */}
      {repoModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setRepoModalOpen(false)}
        >
          <Card
            className="w-full max-w-md bg-[#12121a] border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold">Aggiungi Repository</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRepoModalOpen(false)}
                className="hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">URL del repository</label>
                <Input
                  type="text"
                  placeholder="https://github.com/keiyoushi/extensions"
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
              <div className="text-xs text-white/40">
                I repository contengono estensioni per accedere a diverse fonti di manga.
                Repository consigliati:
              </div>
              <div className="space-y-2">
                {[
                  { url: 'https://github.com/keiyoushi/extensions', name: 'Keiyoushi Extensions' },
                  { url: 'https://github.com/keiyoushi/sources', name: 'Keiyoushi Sources' },
                ].map((repo) => (
                  <Button
                    key={repo.url}
                    variant="outline"
                    onClick={() => setNewRepoUrl(repo.url)}
                    className="w-full justify-start border-white/10 text-white/60 hover:bg-white/5 hover:text-white"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    {repo.name}
                  </Button>
                ))}
              </div>
              <Button
                onClick={addRepository}
                className="w-full bg-[#8b5cf6] text-black hover:bg-[#8b5cf6]/90"
              >
                Aggiungi
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
