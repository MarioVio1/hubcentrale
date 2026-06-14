'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, Play, Heart, ChevronLeft, ChevronRight, 
  Star, X, Tv, Film, Home, Radio, Menu, Loader2, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import VideoPlayer from '@/components/video-player';

// Types
interface Media {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids?: number[];
  media_type?: string;
}

interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
}

interface TVShowDetails extends Media {
  seasons: Season[];
  number_of_seasons: number;
  number_of_episodes: number;
  genres: { id: number; name: string }[];
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
  };
}

interface MovieDetails extends Media {
  runtime: number;
  genres: { id: number; name: string }[];
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
  };
}

// Image helpers
const getImageUrl = (path: string | null, size = 'w500') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

const getBackdropUrl = (path: string | null, size = 'w1280') => {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Main App Component
export default function TrenityApp() {
  const [trending, setTrending] = useState<Media[]>([]);
  // Movies
  const [popularMovies, setPopularMovies] = useState<Media[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Media[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Media[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Media[]>([]);
  // TV Shows
  const [popularTV, setPopularTV] = useState<Media[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<Media[]>([]);
  const [onTheAirTV, setOnTheAirTV] = useState<Media[]>([]);
  const [airingTodayTV, setAiringTodayTV] = useState<Media[]>([]);
  
  const [favorites, setFavorites] = useState<{ id: string; mediaId: number; mediaType: string; title: string; posterPath: string | null }[]>([]);
  
  // Player state
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerTitle, setPlayerTitle] = useState('');
  const [playerType, setPlayerType] = useState<'movie' | 'tv'>('movie');
  const [playerMediaId, setPlayerMediaId] = useState(0);
  const [playerSeason, setPlayerSeason] = useState(1);
  const [playerEpisode, setPlayerEpisode] = useState(1);
  const [tvDetails, setTvDetails] = useState<TVShowDetails | null>(null);
  
  // Preloaded stream for faster playback
  const [preloadedStream, setPreloadedStream] = useState<{streams: any[], mediaId: number, type: string} | null>(null);
  
  // UI state
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [selectedType, setSelectedType] = useState<string>('movie');
  const [mediaDetails, setMediaDetails] = useState<MovieDetails | TVShowDetails | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Media[]>([]);
  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'tv'>('home');
  const [loading, setLoading] = useState(true);

  // Fetch trending content
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/tmdb/trending');
        
        if (!res.ok) {
          console.error('API returned error:', res.status);
          return;
        }
        
        const data = await res.json();
        
        // Check if data has error
        if (data.error) {
          console.error('API error:', data.error);
          return;
        }
        
        // Trending (mixed)
        const trendingMoviesWithType = (data.trendingMovies || []).map((m: Media) => ({ ...m, media_type: 'movie' }));
        const trendingTVWithType = (data.trendingTV || []).map((t: Media) => ({ ...t, media_type: 'tv' }));
        setTrending([...trendingMoviesWithType, ...trendingTVWithType]);
        
        // Movies
        setPopularMovies((data.popularMovies || []).map((m: Media) => ({ ...m, media_type: 'movie' })));
        setTopRatedMovies((data.topRatedMovies || []).map((m: Media) => ({ ...m, media_type: 'movie' })));
        setNowPlayingMovies((data.nowPlayingMovies || []).map((m: Media) => ({ ...m, media_type: 'movie' })));
        setUpcomingMovies((data.upcomingMovies || []).map((m: Media) => ({ ...m, media_type: 'movie' })));
        
        // TV Shows
        setPopularTV((data.popularTV || []).map((t: Media) => ({ ...t, media_type: 'tv' })));
        setTopRatedTV((data.topRatedTV || []).map((t: Media) => ({ ...t, media_type: 'tv' })));
        setOnTheAirTV((data.onTheAirTV || []).map((t: Media) => ({ ...t, media_type: 'tv' })));
        setAiringTodayTV((data.airingTodayTV || []).map((t: Media) => ({ ...t, media_type: 'tv' })));
      } catch (error) {
        console.error('Failed to fetch trending:', error);
      }
    };
    fetchTrending();
  }, []);

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch('/api/favorites');
        const data = await res.json();
        setFavorites(data || []);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
      }
    };
    fetchFavorites();
  }, []);

  // Search
  useEffect(() => {
    if (searchQuery.length < 2) {
      const timer = setTimeout(() => setSearchResults([]), 0);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults((data.results || []).filter((r: Media) => r.media_type === 'movie' || r.media_type === 'tv'));
      } catch (error) {
        console.error('Search failed:', error);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle media selection
  const handleSelectMedia = async (media: Media, type: string) => {
    setSelectedMedia(media);
    setSelectedType(type);
    setPreloadedStream(null);
    
    try {
      // Fetch details first
      const res = await fetch(`/api/tmdb/${type}/${media.id}`);
      const data = await res.json();
      setMediaDetails(data);
      setShowDetail(true);
      
      // Preload stream in background (non-blocking)
      fetch(`/api/stream?type=${type}&id=${media.id}&s=1&e=1`)
        .then(r => r.json())
        .then(streamData => {
          if (streamData.streams) {
            setPreloadedStream({ streams: streamData.streams, mediaId: media.id, type });
          }
        })
        .catch(() => {});
    } catch (error) {
      console.error('Failed to fetch details:', error);
    }
  };

  // Open player
  const openPlayer = async (media: Media | null, type: string, season?: number, episode?: number) => {
    if (!media) return;
    
    const s = season || 1;
    const e = episode || 1;
    
    setPlayerTitle(media.title || media.name || '');
    setPlayerType(type as 'movie' | 'tv');
    setPlayerMediaId(media.id);
    setPlayerSeason(s);
    setPlayerEpisode(e);
    
    // For TV shows, ensure we have tvDetails
    if (type === 'tv') {
      if (mediaDetails && 'seasons' in mediaDetails && mediaDetails.id === media.id) {
        // Already have details for this show
        setTvDetails(mediaDetails as TVShowDetails);
      } else {
        // Need to fetch TV details
        try {
          const res = await fetch(`/api/tmdb/tv/${media.id}`);
          const data = await res.json();
          setTvDetails(data);
        } catch {
          setTvDetails(null);
        }
      }
    } else {
      setTvDetails(null);
    }
    
    setShowDetail(false);
    setPlayerOpen(true);
  };

  // Handle season/episode change from VideoPlayer
  const handlePlayerSeasonChange = useCallback((season: number, episode: number) => {
    setPlayerSeason(season);
    setPlayerEpisode(episode);
  }, []);

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!mediaDetails) return;
    const isFav = favorites.some(f => f.mediaId === mediaDetails.id && f.mediaType === selectedType);
    
    try {
      if (isFav) {
        await fetch(`/api/favorites?mediaId=${mediaDetails.id}&mediaType=${selectedType}`, { method: 'DELETE' });
        setFavorites(prev => prev.filter(f => !(f.mediaId === mediaDetails.id && f.mediaType === selectedType)));
        toast.success('Rimosso dai preferiti');
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaId: mediaDetails.id,
            mediaType: selectedType,
            title: mediaDetails.title || mediaDetails.name,
            posterPath: mediaDetails.poster_path,
          }),
        });
        setFavorites(prev => [...prev, {
          id: `${mediaDetails.id}-${selectedType}`,
          mediaId: mediaDetails.id,
          mediaType: selectedType,
          title: mediaDetails.title || mediaDetails.name || '',
          posterPath: mediaDetails.poster_path,
        }]);
        toast.success('Aggiunto ai preferiti');
      }
    } catch {
      toast.error('Errore');
    }
  };

  const heroItem = trending[0];
  const isFav = mediaDetails && favorites.some(f => f.mediaId === mediaDetails.id && f.mediaType === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f171e] via-[#1a242f] to-black text-white">
      {/* Header - Amazon Prime Style */}
      <header className="sticky top-0 z-40 bg-[#0f171e]/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setShowMobileMenu(true)} 
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition"
            >
              <Menu className="w-6 h-6" />
            </button>
            {/* CheRoba Logo with Glow */}
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center glow-logo-icon"
                style={{
                  background: 'linear-gradient(135deg, #00a8e1 0%, #f0b90b 100%)',
                }}
              >
                <Radio className="w-4 h-4 text-black" />
              </div>
              <h1 className="text-2xl font-black gradient-text-animated">CheRoba</h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => setActiveTab('home')} className={`flex items-center gap-2 transition ${activeTab === 'home' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                <Home className="w-4 h-4" /> Home
              </button>
              <button onClick={() => setActiveTab('movies')} className={`flex items-center gap-2 transition ${activeTab === 'movies' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                <Film className="w-4 h-4" /> Film
              </button>
              <button onClick={() => setActiveTab('tv')} className={`flex items-center gap-2 transition ${activeTab === 'tv' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                <Tv className="w-4 h-4" /> Serie TV
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {/* Live TV Link */}
            <a 
              href="https://hub-livetv.vercel.app/" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all duration-300 hover:scale-105 glow-btn"
              style={{
                background: 'linear-gradient(135deg, #00a8e1 0%, #f0b90b 100%)',
              }}
            >
              <div className="relative">
                <Radio className="w-4 h-4 text-black" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
              <span className="text-black hidden sm:inline">Live TV</span>
              <ExternalLink className="w-3 h-3 text-black/60 hidden sm:inline" />
            </a>
            
            <button onClick={() => setShowSearch(true)} className="p-2 hover:bg-white/10 rounded-full transition">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={() => setShowFavorites(true)} className="p-2 hover:bg-white/10 rounded-full transition relative">
              <Heart className="w-5 h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#f0b90b] text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0f171e] shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-xl font-bold bg-gradient-to-r from-[#00a8e1] to-[#f0b90b] bg-clip-text text-transparent">Menu</h2>
              <button onClick={() => setShowMobileMenu(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              <button onClick={() => { setActiveTab('home'); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition">
                <Home className="w-5 h-5" /> <span>Home</span>
              </button>
              <button onClick={() => { setActiveTab('movies'); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition">
                <Film className="w-5 h-5" /> <span>Film</span>
              </button>
              <button onClick={() => { setActiveTab('tv'); setShowMobileMenu(false); }} className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-white/5 transition">
                <Tv className="w-5 h-5" /> <span>Serie TV</span>
              </button>
            </nav>
            
            {/* Live TV - Highlighted in Mobile Menu */}
            <div className="p-4 border-t border-white/10">
              <a 
                href="https://hub-livetv.vercel.app/" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 p-4 rounded-xl font-bold transition-all glow-btn"
                style={{
                  background: 'linear-gradient(135deg, #00a8e1 0%, #f0b90b 100%)',
                }}
              >
                <div className="relative">
                  <Radio className="w-5 h-5 text-black" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
                <span className="text-black">Live TV</span>
                <ExternalLink className="w-3 h-3 text-black/60" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      {heroItem && activeTab === 'home' && (
        <div className="relative h-[70vh] md:h-[85vh]">
          {heroItem.backdrop_path ? (
            <img
              src={getBackdropUrl(heroItem.backdrop_path, 'original') || ''}
              alt={heroItem.title || heroItem.name || ''}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute bottom-20 md:bottom-32 left-4 md:left-12 max-w-xl">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">{heroItem.title || heroItem.name}</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                <span className="font-semibold">{heroItem.vote_average?.toFixed(1)}</span>
              </div>
              <span className="text-gray-400">{(heroItem.release_date || heroItem.first_air_date)?.split('-')[0]}</span>
            </div>
            <p className="text-gray-300 mb-6 line-clamp-3">{heroItem.overview}</p>
            <div className="flex gap-4">
              <Button size="lg" onClick={() => openPlayer(heroItem, heroItem.media_type || 'movie')} className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold">
                <Play className="w-5 h-5 fill-current" /> Riproduci
              </Button>
              <Button size="lg" variant="outline" onClick={() => handleSelectMedia(heroItem, heroItem.media_type || 'movie')} className="gap-2 border-purple-500 text-white hover:bg-purple-800/50">
                <Heart className="w-5 h-5" /> La Mia Lista
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content Rows */}
      <main className={`relative ${activeTab === 'home' ? '-mt-20' : 'pt-24'} pb-20 z-10`}>
        {/* Home Tab - All Content */}
        {activeTab === 'home' && (
          <>
            <ContentRow title="Di Tendenza" items={trending} onSelect={(m) => handleSelectMedia(m, m.media_type || 'movie')} />
            <ContentRow title="Al Cinema" items={nowPlayingMovies} onSelect={(m) => handleSelectMedia(m, 'movie')} />
            <ContentRow title="In Arrivo" items={upcomingMovies} onSelect={(m) => handleSelectMedia(m, 'movie')} />
            <ContentRow title="Film Popolari" items={popularMovies} onSelect={(m) => handleSelectMedia(m, 'movie')} />
            <ContentRow title="Film Più Votati" items={topRatedMovies} onSelect={(m) => handleSelectMedia(m, 'movie')} />
            <ContentRow title="Serie TV Popolari" items={popularTV} onSelect={(m) => handleSelectMedia(m, 'tv')} />
            <ContentRow title="Serie TV Più Votate" items={topRatedTV} onSelect={(m) => handleSelectMedia(m, 'tv')} />
            <ContentRow title="In Onda" items={onTheAirTV} onSelect={(m) => handleSelectMedia(m, 'tv')} />
            <ContentRow title="In TV Oggi" items={airingTodayTV} onSelect={(m) => handleSelectMedia(m, 'tv')} />
          </>
        )}
        
        {/* Movies Tab */}
        {activeTab === 'movies' && (
          <>
            <ContentRow title="Al Cinema" items={nowPlayingMovies} onSelect={(m) => handleSelectMedia(m, 'movie')} />
            <ContentRow title="In Arrivo" items={upcomingMovies} onSelect={(m) => handleSelectMedia(m, 'movie')} />
            <ContentRow title="Film Popolari" items={popularMovies} onSelect={(m) => handleSelectMedia(m, 'movie')} />
            <ContentRow title="Film Più Votati" items={topRatedMovies} onSelect={(m) => handleSelectMedia(m, 'movie')} />
          </>
        )}
        
        {/* TV Tab */}
        {activeTab === 'tv' && (
          <>
            <ContentRow title="Serie TV Popolari" items={popularTV} onSelect={(m) => handleSelectMedia(m, 'tv')} />
            <ContentRow title="Serie TV Più Votate" items={topRatedTV} onSelect={(m) => handleSelectMedia(m, 'tv')} />
            <ContentRow title="In Onda" items={onTheAirTV} onSelect={(m) => handleSelectMedia(m, 'tv')} />
            <ContentRow title="In TV Oggi" items={airingTodayTV} onSelect={(m) => handleSelectMedia(m, 'tv')} />
          </>
        )}
      </main>

      {/* PLAYER FULLSCREEN - EasyFlix Style */}
      {playerOpen && (
        <VideoPlayer
          mediaId={playerMediaId}
          title={playerTitle}
          type={playerType}
          tvDetails={tvDetails}
          initialSeason={playerSeason}
          initialEpisode={playerEpisode}
          preloadedStreams={preloadedStream?.mediaId === playerMediaId ? preloadedStream.streams : null}
          onClose={() => setPlayerOpen(false)}
          onSeasonChange={handlePlayerSeasonChange}
        />
      )}

      {/* Detail Modal */}
      {showDetail && mediaDetails && (
        <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
          <button onClick={() => setShowDetail(false)} className="fixed top-4 right-4 z-50 p-3 bg-black/50 rounded-full hover:bg-black/70">
            <X className="w-6 h-6" />
          </button>

          <div className="relative h-[60vh] md:h-[70vh]">
            {mediaDetails.backdrop_path && (
              <img
                src={getBackdropUrl(mediaDetails.backdrop_path, 'original') || ''}
                alt={mediaDetails.title || mediaDetails.name || ''}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary" className="text-sm bg-gray-800">
                    {selectedType === 'movie' ? <><Film className="w-4 h-4 mr-1 inline" /> Film</> : <><Tv className="w-4 h-4 mr-1 inline" /> Serie TV</>}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span>{mediaDetails.vote_average?.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-400">{(mediaDetails.release_date || mediaDetails.first_air_date)?.split('-')[0]}</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">{mediaDetails.title || mediaDetails.name}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {mediaDetails.genres?.map(g => <Badge key={g.id} variant="outline" className="border-gray-600">{g.name}</Badge>)}
                </div>
                <p className="text-gray-300 mb-6 line-clamp-3">{mediaDetails.overview}</p>
                <div className="flex gap-4">
                  <Button size="lg" onClick={() => openPlayer(mediaDetails, selectedType)} className="gap-2 bg-white text-black hover:bg-gray-200">
                    <Play className="w-5 h-5 fill-current" /> Riproduci
                  </Button>
                  <Button size="lg" variant="outline" onClick={toggleFavorite} className="gap-2 border-gray-600 hover:bg-gray-800">
                    <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
                    {isFav ? 'Salvato' : 'La Mia Lista'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-12 py-8">
            {selectedType === 'tv' && 'seasons' in mediaDetails && mediaDetails.seasons && (
              <div className="max-w-4xl">
                <h3 className="text-xl font-semibold mb-4">Stagioni</h3>
                <div className="space-y-3">
                  {mediaDetails.seasons.filter(s => s.season_number > 0).map(s => (
                    <div 
                      key={s.id}
                      onClick={() => openPlayer(mediaDetails, 'tv', s.season_number, 1)}
                      className="flex gap-4 p-4 rounded-lg bg-gray-900 hover:bg-gray-800 cursor-pointer transition"
                    >
                      <div className="w-16 h-24 rounded bg-gray-800 flex-shrink-0 overflow-hidden">
                        {s.poster_path ? <img src={getImageUrl(s.poster_path, 'w185') || ''} alt={s.name} className="w-full h-full object-cover" /> : <Tv className="w-8 h-8 m-auto mt-8 text-gray-600" />}
                      </div>
                      <div>
                        <h4 className="font-semibold">{s.name}</h4>
                        <p className="text-sm text-gray-400">{s.episode_count} episodi</p>
                        {s.air_date && <p className="text-xs text-gray-500">{s.air_date.split('-')[0]}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex items-center gap-4 p-4 border-b border-gray-800">
            <Search className="w-5 h-5 text-gray-500" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cerca film e serie TV..." className="flex-1 text-lg bg-transparent border-0 focus-visible:ring-0 text-white placeholder-gray-500" autoFocus />
            <Button variant="ghost" onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-gray-400 hover:text-white">Annulla</Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {searchResults.map(item => (
                  <div key={item.id} onClick={() => { handleSelectMedia(item, item.media_type || 'movie'); setShowSearch(false); setSearchQuery(''); }} className="cursor-pointer group">
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                      {item.poster_path ? <img src={getImageUrl(item.poster_path, 'w342') || ''} alt={item.title || item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <Film className="w-12 h-12 m-auto mt-16 text-gray-600" />}
                    </div>
                    <p className="mt-2 text-sm font-medium truncate">{item.title || item.name}</p>
                    <p className="text-xs text-gray-500">{(item.release_date || item.first_air_date)?.split('-')[0]}</p>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 2 ? <p className="text-center text-gray-500 mt-8">Nessun risultato</p> : <p className="text-center text-gray-500 mt-8">Digita per cercare</p>}
          </ScrollArea>
        </div>
      )}

      {/* Favorites Modal */}
      {showFavorites && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold flex items-center gap-2"><Heart className="w-5 h-5 text-pink-500" /> La Mia Lista</h2>
            <Button variant="ghost" onClick={() => setShowFavorites(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            {favorites.length > 0 ? (
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                {favorites.map(fav => (
                  <div key={fav.id} className="group relative cursor-pointer" onClick={async () => {
                    const res = await fetch(`/api/tmdb/${fav.mediaType}/${fav.mediaId}`);
                    const data = await res.json();
                    setMediaDetails(data);
                    setSelectedType(fav.mediaType);
                    setShowFavorites(false);
                    setShowDetail(true);
                  }}>
                    <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
                      {fav.posterPath ? <img src={getImageUrl(fav.posterPath, 'w342') || ''} alt={fav.title} className="w-full h-full object-cover" /> : <Film className="w-12 h-12 m-auto mt-16 text-gray-600" />}
                    </div>
                    <p className="mt-2 text-sm font-medium truncate">{fav.title}</p>
                    <button onClick={async (e) => { e.stopPropagation(); await fetch(`/api/favorites?mediaId=${fav.mediaId}&mediaType=${fav.mediaType}`, { method: 'DELETE' }); setFavorites(prev => prev.filter(f => !(f.mediaId === fav.mediaId && f.mediaType === fav.mediaType))); toast.success('Rimosso'); }} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            ) : <p className="text-center text-gray-500 mt-8">La tua lista è vuota</p>}
          </ScrollArea>
        </div>
      )}
      
      {/* CSS Animations & Styles */}
      <style jsx global>{`
        .glow-logo-icon {
          box-shadow: 0 0 15px rgba(0, 168, 225, 0.6), 0 0 30px rgba(240, 185, 11, 0.4);
          animation-name: logo-glow;
          animation-duration: 2s;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
        }
        .glow-btn {
          box-shadow: 0 0 20px rgba(0, 168, 225, 0.5), 0 0 40px rgba(240, 185, 11, 0.3);
        }
        .glow-btn:hover {
          box-shadow: 0 0 30px rgba(0, 168, 225, 0.7), 0 0 60px rgba(240, 185, 11, 0.5);
        }
        .gradient-text-animated {
          background: linear-gradient(135deg, #00a8e1 0%, #00d4ff 25%, #f0b90b 50%, #ffdd00 75%, #00a8e1 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation-name: text-gradient;
          animation-duration: 3s;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes logo-glow {
          0% { box-shadow: 0 0 15px rgba(0, 168, 225, 0.6), 0 0 30px rgba(240, 185, 11, 0.4); }
          100% { box-shadow: 0 0 25px rgba(0, 168, 225, 0.8), 0 0 50px rgba(240, 185, 11, 0.6); }
        }
        @keyframes text-gradient {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}

// Content Row Component
function ContentRow({ title, items, onSelect }: { title: string; items: Media[]; onSelect: (m: Media, t: string) => void }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (rowRef.current) {
      setCanScrollLeft(rowRef.current.scrollLeft > 0);
      setCanScrollRight(rowRef.current.scrollLeft < rowRef.current.scrollWidth - rowRef.current.clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const el = rowRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => { el.removeEventListener('scroll', checkScroll); window.removeEventListener('resize', checkScroll); };
    }
  }, [checkScroll]);

  const scroll = (dir: 'left' | 'right') => {
    if (rowRef.current) rowRef.current.scrollBy({ left: dir === 'left' ? -rowRef.current.clientWidth * 0.8 : rowRef.current.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <div className="relative mb-6 group/row">
      <h3 className="text-lg md:text-xl font-semibold mb-3 px-4 md:px-8">{title}</h3>
      <button onClick={() => scroll('left')} className={`absolute left-0 top-1/2 z-10 p-2 bg-black/50 rounded-r-lg transition ${canScrollLeft ? 'opacity-0 group-hover/row:opacity-100' : 'opacity-0'}`} style={{ transform: 'translateY(-50%)', marginTop: '12px' }}><ChevronLeft className="w-6 h-6" /></button>
      <div ref={rowRef} className="flex gap-2 md:gap-3 overflow-x-auto px-4 md:px-8 pb-2 scrollbar-hide">
        {items.map(item => (
          <div key={item.id} onClick={() => onSelect(item, item.media_type || (item.title ? 'movie' : 'tv'))} className="flex-shrink-0 w-28 md:w-36 cursor-pointer group/card">
            <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-gray-800">
              {item.poster_path ? <img src={getImageUrl(item.poster_path, 'w342') || ''} alt={item.title || item.name || ''} className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300" /> : <Film className="w-8 h-8 m-auto mt-12 text-gray-600" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex items-end p-2">
                <div>
                  <div className="flex items-center gap-1 text-xs"><Star className="w-3 h-3 fill-yellow-500 text-yellow-500" /><span>{item.vote_average?.toFixed(1)}</span></div>
                  <p className="text-xs truncate">{item.title || item.name}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => scroll('right')} className={`absolute right-0 top-1/2 z-10 p-2 bg-black/50 rounded-l-lg transition ${canScrollRight ? 'opacity-0 group-hover/row:opacity-100' : 'opacity-0'}`} style={{ transform: 'translateY(-50%)', marginTop: '12px' }}><ChevronRight className="w-6 h-6" /></button>
    </div>
  );
}
// Force rebuild Sat Feb 28 14:05:04 UTC 2026
// rebuild 1773064667
