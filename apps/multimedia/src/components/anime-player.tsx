'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, ChevronLeft, ChevronRight, Loader2, Server, RefreshCw, Settings, Volume2, VolumeX, Maximize, Play, Pause, Star } from 'lucide-react';

interface AnimeDetails {
  id: string;
  kitsu_id: number;
  title: string;
  synopsis?: string;
  poster?: string;
  cover?: string;
  rating?: number;
  episodeCount?: number;
  status?: string;
  subtype?: string;
  episodes?: { number: number; title: string; thumbnail?: string }[];
  genres?: string[];
}

interface AnimePlayerProps {
  kitsuId: string;
  title: string;
  episodeCount?: number;
  initialEpisode?: number;
  animeDetails?: AnimeDetails | null;
  onClose: () => void;
  onEpisodeChange?: (episode: number) => void;
}

interface Stream {
  name: string;
  url: string;
  quality?: string;
  type: 'hls' | 'embed';
}

export default function AnimePlayer({ kitsuId, title, episodeCount = 1, initialEpisode = 1, animeDetails, onClose, onEpisodeChange }: AnimePlayerProps) {
  const [episode, setEpisode] = useState(initialEpisode);
  const [loading, setLoading] = useState(true);
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [currentStreamIndex, setCurrentStreamIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasHLS, setHasHLS] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch anime streams
  useEffect(() => {
    const fetchStreams = async () => {
      setLoadingStreams(true);
      setError(null);
      setLoading(true);

      try {
        const res = await fetch(`/api/anime?kitsu_id=${kitsuId}&e=${episode}`);
        const data = await res.json();

        if (data.streams && data.streams.length > 0) {
          setStreams(data.streams);
          setCurrentStreamIndex(0);
          const hasHlsStreams = data.streams.some((s: Stream) => s.type === 'hls');
          setHasHLS(hasHlsStreams);
          
          // For embed streams, set loading to false after a short delay
          // since iframe onLoad can be unreliable
          if (!hasHlsStreams) {
            setTimeout(() => setLoading(false), 500);
          }
        } else {
          setError('Nessuno stream trovato per questo anime');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching anime streams:', err);
        setError('Errore caricamento stream anime');
        setLoading(false);
      } finally {
        setLoadingStreams(false);
      }
    };

    fetchStreams();
  }, [kitsuId, episode]);

  // Initialize HLS player for m3u8 streams
  useEffect(() => {
    const video = videoRef.current;
    if (!video || streams.length === 0) return;

    const currentStream = streams[currentStreamIndex];
    if (!currentStream || currentStream.type !== 'hls') return;

    const url = currentStream.url;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    setLoading(true);
    setError(null);

    // Dynamic import HLS.js
    import('hls.js').then((Hls) => {
      if (Hls.default.isSupported()) {
        const hls = new Hls.default({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setLoading(false);
          video.play().then(() => {
            setIsPlaying(true);
            setIsMuted(false);
          }).catch(() => {
            // Autoplay blocked
          });
        });

        hls.on(Hls.Events.ERROR, (event: any, data: any) => {
          // Only handle fatal errors, ignore non-fatal ones
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError('Errore di rete - prova un\'altra fonte');
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                setError('Errore durante la riproduzione');
                break;
            }
            setLoading(false);
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari native HLS support
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          setLoading(false);
          video.play().then(() => {
            setIsPlaying(true);
            setIsMuted(false);
          }).catch(() => {});
        });
      } else {
        setError('HLS non supportato');
        setLoading(false);
      }
    }).catch(() => {
      setError('Impossibile caricare il player HLS');
      setLoading(false);
    });

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streams, currentStreamIndex]);

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
      if (e.key === ' ' && videoRef.current) {
        e.preventDefault();
        if (videoRef.current.paused) {
          videoRef.current.play();
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const changeStream = (index: number) => {
    setCurrentStreamIndex(index);
    setLoading(true);
    setError(null);
    setIsPlaying(false);
    setShowSettings(false);
  };

  const changeEpisode = (e: number) => {
    setEpisode(e);
    onEpisodeChange?.(e);
  };

  const prevEp = () => episode > 1 && changeEpisode(episode - 1);
  const nextEp = () => episode < episodeCount && changeEpisode(episode + 1);

  const retry = () => {
    setLoading(true);
    setError(null);
    if (hlsRef.current) {
      hlsRef.current.startLoad();
    }
  };

  const nextStream = () => {
    const next = (currentStreamIndex + 1) % streams.length;
    changeStream(next);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const currentStream = streams[currentStreamIndex];
  const isHLSStream = currentStream?.type === 'hls';

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-black">
      {/* Controls Overlay */}
      <div className={`absolute inset-0 z-30 pointer-events-none transition duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-pink-950/90 to-transparent p-4 md:p-6 pointer-events-auto">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                {title}
                <span className="text-xs bg-pink-600 px-2 py-0.5 rounded">ANIME</span>
              </h2>
              <p className="text-pink-300 text-sm">Episodio {episode} di {episodeCount}</p>
              {currentStream && (
                <p className="text-gray-400 text-xs mt-1 flex items-center gap-2">
                  {currentStream.name}
                  {currentStream.type === 'hls' && (
                    <span className="bg-green-600 px-1.5 py-0.5 rounded text-[10px]">HLS</span>
                  )}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={retry} variant="outline" size="sm" className="border-pink-500 text-white hover:bg-pink-800">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={nextStream} variant="outline" size="sm" className="border-pink-500 text-white hover:bg-pink-800" disabled={streams.length <= 1}>
                <Server className="w-4 h-4" />
              </Button>
              <Button onClick={() => setShowSettings(true)} variant="outline" size="sm" className="border-pink-500 text-white hover:bg-pink-800">
                <Settings className="w-4 h-4" />
              </Button>
              <Button onClick={onClose} size="sm" className="bg-red-600 hover:bg-red-700">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* HLS Player Controls */}
        {isHLSStream && (
          <>
            {/* Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button onClick={togglePlay} className="p-5 bg-pink-600/80 rounded-full hover:bg-pink-500 transition pointer-events-auto">
                {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 fill-current" />}
              </button>
            </div>

            {/* Episode Navigation */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto">
              <button
                onClick={prevEp}
                disabled={episode <= 1}
                className="p-3 bg-pink-800/80 rounded-full disabled:opacity-30 hover:bg-pink-700 transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto">
              <button
                onClick={nextEp}
                disabled={episode >= episodeCount}
                className="p-3 bg-pink-800/80 rounded-full disabled:opacity-30 hover:bg-pink-700 transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pink-950/90 to-transparent pt-16 pb-4 px-4 pointer-events-auto">
              <div className="flex items-center justify-center gap-4">
                <button onClick={toggleMute} className="p-2 bg-pink-800/50 hover:bg-pink-700 rounded-lg transition">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button onClick={toggleFullscreen} className="p-2 bg-pink-800/50 hover:bg-pink-700 rounded-lg transition">
                  <Maximize className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Ep:</span>
                  <Select value={episode.toString()} onValueChange={(v) => changeEpisode(parseInt(v))}>
                    <SelectTrigger className="w-20 bg-pink-900 border-pink-600 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: episodeCount }, (_, i) => i + 1).map(e => (
                        <SelectItem key={e} value={e.toString()}>Ep {e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Embed Episode Navigation */}
        {!isHLSStream && (
          <>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto">
              <button
                onClick={prevEp}
                disabled={episode <= 1}
                className="p-3 bg-pink-800/80 rounded-full disabled:opacity-30 hover:bg-pink-700 transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto">
              <button
                onClick={nextEp}
                disabled={episode >= episodeCount}
                className="p-3 bg-pink-800/80 rounded-full disabled:opacity-30 hover:bg-pink-700 transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-pink-950/90 to-transparent pt-16 pb-4 px-4 pointer-events-auto">
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Ep:</span>
                  <Select value={episode.toString()} onValueChange={(v) => changeEpisode(parseInt(v))}>
                    <SelectTrigger className="w-20 bg-pink-900 border-pink-600 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: episodeCount }, (_, i) => i + 1).map(e => (
                        <SelectItem key={e} value={e.toString()}>Ep {e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Loading */}
      {(loading || loadingStreams) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-40">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
            <p className="font-bold text-lg">{loadingStreams ? 'Ricerca stream anime...' : 'Caricamento video...'}</p>
            {hasHLS && !loadingStreams && <p className="text-green-400 text-sm mt-1">Stream HLS diretto</p>}
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-40">
          <div className="text-center p-6 max-w-md">
            <p className="text-red-400 font-bold text-xl mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={retry} className="bg-pink-600 hover:bg-pink-700">Riprova</Button>
              <Button onClick={nextStream} variant="outline" className="border-pink-500 text-white">Altro stream</Button>
            </div>
          </div>
        </div>
      )}

      {/* Video Element for HLS */}
      {currentStream && isHLSStream && !loadingStreams && (
        <video
          ref={videoRef}
          className="w-full h-full bg-black"
          playsInline
          muted={isMuted}
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
        />
      )}

      {/* Iframe for Embed URLs */}
      {currentStream && !isHLSStream && !loadingStreams && (
        <iframe
          key={`${currentStreamIndex}-${episode}`}
          src={currentStream.url}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
          allowFullScreen
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/95 z-[110] p-4 md:p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Impostazioni Anime</h3>
            <Button variant="ghost" onClick={() => setShowSettings(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="mb-6">
            <h4 className="font-semibold mb-2 text-pink-300">Fonti disponibili ({streams.length})</h4>
            <div className="space-y-2">
              {streams.map((s, i) => (
                <button
                  key={i}
                  onClick={() => changeStream(i)}
                  className={`w-full p-3 rounded-lg text-left transition ${
                    i === currentStreamIndex ? 'bg-pink-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.name}</span>
                      {s.type === 'hls' && (
                        <span className="bg-green-600 px-1.5 py-0.5 rounded text-[10px]">HLS</span>
                      )}
                    </div>
                    {s.quality && <span className="text-xs bg-pink-800 px-2 py-1 rounded">{s.quality}</span>}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              🎌 Gli stream anime provengono da AnimeUnity, AnimeSaturn e altri provider italiani
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
