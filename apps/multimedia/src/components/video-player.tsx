'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2, Server, RefreshCw, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
}

interface TVDetails {
  seasons: Season[];
  name?: string;
}

interface Stream {
  name: string;
  url: string;
  quality?: string;
  type: 'hls' | 'embed';
}

interface VideoPlayerProps {
  mediaId: number;
  title: string;
  type: 'movie' | 'tv';
  tvDetails?: TVDetails | null;
  initialSeason?: number;
  initialEpisode?: number;
  preloadedStreams?: Stream[] | null;
  onClose: () => void;
  onSeasonChange?: (season: number, episode: number) => void;
}

const PROXY_BASE = '/api/proxy/embed?url=';

const proxyUrl = (url: string) => `${PROXY_BASE}${encodeURIComponent(url)}`;

// Instant embed URL generators
const getVidSrcUrl = (type: string, id: number, season: number, episode: number) => 
  type === 'tv'
    ? `https://vidsrc.net/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`
    : `https://vidsrc.net/embed/movie?tmdb=${id}`;

const getAutoEmbedUrl = (type: string, id: number, season: number, episode: number) =>
  type === 'tv'
    ? `https://autoembed.cc/tv/tmdb/${id}-${season}-${episode}`
    : `https://autoembed.cc/movie/tmdb/${id}`;

const get2EmbedUrl = (type: string, id: number, season: number, episode: number) =>
  type === 'tv'
    ? `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`
    : `https://www.2embed.cc/embed/${id}`;

const getEmbedsuUrl = (type: string, id: number, season: number, episode: number) =>
  type === 'tv'
    ? `https://embedsu.com/play/tv/${id}/${season}/${episode}`
    : `https://embedsu.com/play/movie/${id}`;

const getStreams = (type: string, id: number, season: number, episode: number): Stream[] => {
  const direct = (name: string, url: string) => ({ name, url, quality: 'HD' as const, type: 'embed' as const });
  const proxied = (name: string, url: string) => ({ name: name + ' (Proxy)', url: proxyUrl(url), quality: 'HD' as const, type: 'embed' as const });

  return [
    direct('2Embed', get2EmbedUrl(type, id, season, episode)),
    proxied('2Embed', get2EmbedUrl(type, id, season, episode)),
    direct('VidSrc', getVidSrcUrl(type, id, season, episode)),
    proxied('VidSrc', getVidSrcUrl(type, id, season, episode)),
    direct('AutoEmbed', getAutoEmbedUrl(type, id, season, episode)),
    proxied('AutoEmbed', getAutoEmbedUrl(type, id, season, episode)),
    direct('Embedsu', getEmbedsuUrl(type, id, season, episode)),
    proxied('Embedsu', getEmbedsuUrl(type, id, season, episode)),
  ];
};

export default function VideoPlayer({ mediaId, title, type, tvDetails, initialSeason = 1, initialEpisode = 1, preloadedStreams, onClose, onSeasonChange }: VideoPlayerProps) {
  const [season, setSeason] = useState(initialSeason);
  const [episode, setEpisode] = useState(initialEpisode);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [hlsStreams, setHlsStreams] = useState<Stream[]>([]);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Combine HLS streams with embed streams (memoized)
  const streams = useMemo(() => {
    const embed = getStreams(type, mediaId, season, episode);
    return [...hlsStreams, ...embed];
  }, [type, mediaId, season, episode, hlsStreams]);

  const currentStream = streams[currentStreamIndex] || streams[0];

  // Fetch HLS streams in background
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchHls = async () => {
      try {
        const res = await fetch(`/api/stream?type=${type}&id=${mediaId}&s=${season}&e=${episode}`, {
          signal: controller.signal
        });
        const data = await res.json();
        
        if (data.streams) {
          const hls = data.streams.filter((s: Stream) => s.type === 'hls');
          if (hls.length > 0) {
            setHlsStreams(hls);
          }
        }
      } catch {
        // Ignore errors
      }
    };

    // Delay fetch to not block initial render
    const timer = setTimeout(fetchHls, 500);
    
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [mediaId, type, season, episode]);

  // Controls visibility
  useEffect(() => {
    const handleMove = () => {
      setShowControls(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShowControls(false), 4000);
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener('mousemove', handleMove);
      el.addEventListener('touchstart', handleMove);
      timeoutRef.current = setTimeout(() => setShowControls(false), 4000);
      return () => {
        el.removeEventListener('mousemove', handleMove);
        el.removeEventListener('touchstart', handleMove);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const changeStream = (index: number) => {
    setCurrentStreamIndex(index);
    setLoading(true);
    setLoadError(false);
    setShowSettings(false);
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    loadTimeoutRef.current = setTimeout(() => {
      setLoadError(true);
      setLoading(false);
    }, 15000);
  };

  // Set load timeout on mount and when stream changes
  useEffect(() => {
    setLoading(true);
    setLoadError(false);
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    loadTimeoutRef.current = setTimeout(() => {
      setLoadError(true);
      setLoading(false);
    }, 15000);
  }, [currentStreamIndex, season, episode]);

  useEffect(() => {
    return () => { if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current); };
  }, []);

  const changeSeason = (s: number) => {
    setSeason(s);
    setEpisode(1);
    onSeasonChange?.(s, 1);
    changeStream(0);
  };

  const changeEpisode = (e: number) => {
    setEpisode(e);
    onSeasonChange?.(season, e);
    changeStream(0);
  };

  const prevEp = () => episode > 1 && changeEpisode(episode - 1);
  const nextEp = () => {
    const max = tvDetails?.seasons?.find(s => s.season_number === season)?.episode_count || 1;
    if (episode < max) changeEpisode(episode + 1);
  };

  const maxEps = tvDetails?.seasons?.find(s => s.season_number === season)?.episode_count || 1;

  const nextStream = () => {
    const next = (currentStreamIndex + 1) % streams.length;
    changeStream(next);
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-black">
      {/* Controls Overlay */}
      <div className={`absolute inset-0 z-30 pointer-events-none transition duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-4 md:p-6 pointer-events-auto">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg md:text-2xl font-bold">{title}</h2>
              {type === 'tv' && <p className="text-purple-300 text-sm">Stagione {season} • Episodio {episode}</p>}
              {currentStream && <p className="text-gray-400 text-xs mt-1">{currentStream.name}</p>}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setLoading(true)} variant="outline" size="sm" className="border-purple-500 text-white hover:bg-purple-800">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={nextStream} variant="outline" size="sm" className="border-purple-500 text-white hover:bg-purple-800" disabled={streams.length <= 1}>
                <Server className="w-4 h-4" />
              </Button>
              <Button onClick={() => setShowSettings(true)} variant="outline" size="sm" className="border-purple-500 text-white hover:bg-purple-800">
                <Settings className="w-4 h-4" />
              </Button>
              <Button onClick={onClose} size="sm" className="bg-red-600 hover:bg-red-700">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Episode Navigation */}
        {type === 'tv' && (
          <>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto">
              <button 
                onClick={prevEp} 
                disabled={episode <= 1} 
                className="p-3 bg-purple-800/80 rounded-full disabled:opacity-30 hover:bg-purple-700 transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto">
              <button 
                onClick={nextEp} 
                disabled={episode >= maxEps} 
                className="p-3 bg-purple-800/80 rounded-full disabled:opacity-30 hover:bg-purple-700 transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </>
        )}

        {/* Bottom Controls - Season/Episode Selectors */}
        {type === 'tv' && tvDetails?.seasons && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent pt-16 pb-4 px-4 pointer-events-auto">
            <div className="max-w-2xl mx-auto flex justify-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">S:</span>
                <Select value={season.toString()} onValueChange={(v) => changeSeason(parseInt(v))}>
                  <SelectTrigger className="w-28 bg-purple-900 border-purple-600 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tvDetails.seasons.filter(s => s.season_number > 0).map(s => (
                      <SelectItem key={s.id} value={s.season_number.toString()}>Stagione {s.season_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Ep:</span>
                <Select value={episode.toString()} onValueChange={(v) => changeEpisode(parseInt(v))}>
                  <SelectTrigger className="w-20 bg-purple-900 border-purple-600 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: maxEps }, (_, i) => i + 1).map(e => (
                      <SelectItem key={e} value={e.toString()}>Ep {e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-40">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="font-bold text-lg">Avvio player...</p>
            <p className="text-gray-400 text-sm mt-2">{currentStream.name}</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-40">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <p className="font-bold text-xl text-red-400 mb-2">Fonte non disponibile</p>
            <p className="text-gray-400 mb-6">{currentStream.name} non risponde. Prova con un'altra fonte.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {streams.map((s, i) => (
                <button
                  key={i}
                  onClick={() => changeStream(i)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    i === currentStreamIndex ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Iframe - Instant playback */}
      <iframe
        key={`${currentStream.name}-${season}-${episode}`}
        src={currentStream.url}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        onLoad={() => { setLoading(false); setLoadError(false); if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current); }}
      />

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/95 z-[110] p-4 md:p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Fonti</h3>
            <Button variant="ghost" onClick={() => setShowSettings(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {streams.map((s, i) => (
              <button
                key={i}
                onClick={() => changeStream(i)}
                className={`w-full p-3 rounded-lg text-left transition ${
                  i === currentStreamIndex ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{s.name}</span>
                  <span className="text-xs bg-purple-800 px-2 py-1 rounded">{s.type === 'hls' ? 'HLS' : 'EMBED'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
