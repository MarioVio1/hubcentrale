'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Loader2, AlertCircle, Volume2, VolumeX, Maximize } from 'lucide-react';

interface LiveTVPlayerProps {
  url: string;
  title: string;
  logo?: string;
  onClose: () => void;
}

export default function LiveTVPlayer({ url, title, logo, onClose }: LiveTVPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Initialize HLS player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    // Check if it's an m3u8 stream
    const isHLS = url.includes('.m3u8') || url.includes('m3u8');
    
    if (isHLS) {
      // Dynamic import of HLS.js
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
            video.play().catch(() => {
              // Autoplay blocked, user needs to interact
            });
          });
          
          hls.on(Hls.Events.ERROR, (event: any, data: any) => {
            if (data.fatal) {
              switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                  setError('Errore di rete - Impossibile caricare lo stream');
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
            video.play().catch(() => {});
          });
        }
      }).catch(() => {
        // HLS.js not loaded, try direct
        video.src = url;
        video.addEventListener('loadeddata', () => {
          setLoading(false);
        });
      });
    } else {
      // Direct video URL
      video.src = url;
      video.addEventListener('loadeddata', () => {
        setLoading(false);
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [url]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-b from-purple-900/95 to-transparent z-20">
        <div className="flex items-center gap-3">
          {logo && (
            <img 
              src={logo} 
              alt={title} 
              className="w-9 h-9 rounded-lg object-contain bg-white/10 p-1" 
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
            />
          )}
          <div>
            <h2 className="text-base md:text-lg font-bold">{title}</h2>
            <p className="text-pink-400 text-xs font-semibold flex items-center gap-1">
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" /> LIVE TV
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMute}
            className="p-2 bg-purple-800/50 hover:bg-purple-700 rounded-lg transition"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button 
            onClick={toggleFullscreen}
            className="p-2 bg-purple-800/50 hover:bg-purple-700 rounded-lg transition"
          >
            <Maximize className="w-5 h-5" />
          </button>
          <button 
            onClick={onClose} 
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-4 py-2 rounded-xl text-white font-bold flex items-center gap-2"
          >
            <X className="w-5 h-5" /> Chiudi
          </button>
        </div>
      </div>

      {/* Video Player */}
      <div className="flex-1 relative bg-black flex items-center justify-center">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          autoPlay
          muted={isMuted}
          controls
        />

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-30">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-lg font-bold">Caricamento stream...</p>
              <p className="text-gray-500 text-sm mt-1">{title}</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-30">
            <div className="text-center p-6 max-w-md">
              <AlertCircle className="w-16 h-16 text-pink-500 mx-auto mb-4" />
              <p className="text-xl font-bold text-pink-400 mb-2">{error}</p>
              <p className="text-gray-400 mb-6">Prova un altro canale</p>
              <button 
                onClick={onClose} 
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-bold transition"
              >
                Torna ai canali
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
