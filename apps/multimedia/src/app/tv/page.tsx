'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, ArrowLeft, Tv, Loader2, 
  Volume2, VolumeX, Radio
} from 'lucide-react';

// M3U Lists
const M3U_LISTS = [
  { id: 'lista', name: 'Lista Principale', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/lista.m3u' },
  { id: 'static', name: 'Canali Statici', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/static.m3u' },
  { id: 'dlhd', name: 'DLHD', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/dlhd.m3u' },
  { id: 'sports99', name: 'Sports 99', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/sports99.m3u' },
  { id: 'vavoo', name: 'Vavoo', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/vavoo.m3u' },
];

interface TVChannel {
  id: string;
  name: string;
  url: string;
  logo?: string;
  group?: string;
}

export default function TVPage() {
  const [channels, setChannels] = useState<TVChannel[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedChannelIndex, setSelectedChannelIndex] = useState(0);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [selectedListIndex, setSelectedListIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'lists' | 'channels' | 'player'>('lists');
  const [playerLoading, setPlayerLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);

  // Filter channels by category
  const filteredChannels = selectedCategory === 'all' 
    ? channels 
    : channels.filter(c => c.group === selectedCategory);

  // Get current selected items
  const currentChannel = filteredChannels[selectedChannelIndex];
  const currentList = M3U_LISTS[selectedListIndex];

  // Load M3U list
  const loadList = async (url: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/m3u?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.channels) {
        const parsed = data.channels.map((ch: any, i: number) => ({
          ...ch,
          id: `ch-${i}`,
        }));
        setChannels(parsed);
        
        const cats = new Set(parsed.map((c: TVChannel) => c.group).filter(Boolean));
        setCategories(['all', ...Array.from(cats).sort()]);
        setSelectedCategoryIndex(0);
        setSelectedCategory('all');
        setSelectedChannelIndex(0);
        setView('channels');
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (view === 'lists') {
      if (e.key === 'ArrowUp') {
        setSelectedListIndex(i => Math.max(0, i - 1));
      } else if (e.key === 'ArrowDown') {
        setSelectedListIndex(i => Math.min(M3U_LISTS.length - 1, i + 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        loadList(currentList.url);
      }
    } else if (view === 'channels') {
      const cols = 6;
      
      if (e.key === 'ArrowUp') {
        if (selectedChannelIndex >= cols) {
          setSelectedChannelIndex(i => i - cols);
        }
      } else if (e.key === 'ArrowDown') {
        setSelectedChannelIndex(i => Math.min(filteredChannels.length - 1, i + cols));
      } else if (e.key === 'ArrowLeft') {
        if (selectedChannelIndex === 0 && selectedCategoryIndex > 0) {
          setSelectedCategoryIndex(i => i - 1);
          setSelectedCategory(categories[selectedCategoryIndex - 1] || 'all');
          setSelectedChannelIndex(0);
        } else {
          setSelectedChannelIndex(i => Math.max(0, i - 1));
        }
      } else if (e.key === 'ArrowRight') {
        setSelectedChannelIndex(i => Math.min(filteredChannels.length - 1, i + 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (currentChannel) playChannel(currentChannel);
      } else if (e.key === 'Escape' || e.key === 'Backspace') {
        setView('lists');
        setChannels([]);
      }
    } else if (view === 'player') {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        closePlayer();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    }
    
    e.preventDefault();
  }, [view, selectedListIndex, selectedChannelIndex, selectedCategoryIndex, filteredChannels, categories, currentList, currentChannel]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Play channel
  const playChannel = (channel: TVChannel) => {
    setView('player');
    setPlayerLoading(true);
    
    const video = videoRef.current;
    if (!video) return;
    
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }
    
    const isHLS = channel.url.includes('.m3u8') || channel.url.includes('m3u8');
    
    if (isHLS) {
      import('hls.js').then((Hls) => {
        if (Hls.default.isSupported()) {
          const hls = new Hls.default({ enableWorker: true });
          hls.loadSource(channel.url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setPlayerLoading(false);
            video.play().catch(() => {});
          });
          hls.on(Hls.Events.ERROR, () => setPlayerLoading(false));
          hlsRef.current = hls;
        }
      });
    } else {
      video.src = channel.url;
      video.onloadeddata = () => {
        setPlayerLoading(false);
        video.play().catch(() => {});
      };
    }
  };

  const closePlayer = () => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }
    setView('channels');
  };

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

  // Player View
  if (view === 'player') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <video ref={videoRef} className="w-full h-full object-contain" autoPlay muted={isMuted} />
        
        <div className="absolute top-4 left-4 text-white bg-black/50 px-4 py-2 rounded-lg">
          <p className="font-bold">{currentChannel?.name}</p>
          <p className="text-sm text-red-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> LIVE
          </p>
        </div>
        
        {playerLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <Loader2 className="w-16 h-16 animate-spin text-yellow-500" />
          </div>
        )}
        
        <div className="absolute bottom-4 left-4 text-white/50 text-sm">
          ESC = Esci | M = Muto | F = Fullscreen
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="bg-[#111] p-6 flex items-center gap-4 border-b border-white/10">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center">
          <Radio className="w-6 h-6 text-black" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">CheRoba TV</h1>
          <p className="text-gray-400">Usa le frecce per navigare • Enter per selezionare</p>
        </div>
      </header>

      {/* Lists View */}
      {view === 'lists' && (
        <div className="flex-1 p-8">
          <h2 className="text-xl mb-6 text-gray-300">Seleziona una lista:</h2>
          <div className="grid gap-3 max-w-2xl">
            {M3U_LISTS.map((list, index) => (
              <div
                key={list.id}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedListIndex === index
                    ? 'border-yellow-500 bg-yellow-500/20 scale-105'
                    : 'border-white/10 bg-white/5 hover:border-white/30'
                }`}
                onClick={() => { setSelectedListIndex(index); loadList(list.url); }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-medium">{list.name}</span>
                  {selectedListIndex === index && (
                    <Play className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-gray-500 text-sm">
            <p>↑↓ = Sposta • Enter = Seleziona</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-yellow-500 mx-auto mb-4" />
            <p className="text-xl">Caricamento canali...</p>
          </div>
        </div>
      )}

      {/* Channels View */}
      {view === 'channels' && !loading && (
        <div className="flex-1 flex">
          {/* Categories Sidebar */}
          <div className="w-48 bg-[#111] border-r border-white/10 p-4 overflow-y-auto">
            <h3 className="text-sm text-gray-400 mb-3 uppercase">Categorie</h3>
            <div className="space-y-1">
              {categories.map((cat, index) => (
                <div
                  key={cat}
                  className={`p-2 rounded-lg cursor-pointer transition ${
                    selectedCategoryIndex === index
                      ? 'bg-yellow-500 text-black font-bold'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => {
                    setSelectedCategoryIndex(index);
                    setSelectedCategory(cat);
                    setSelectedChannelIndex(0);
                  }}
                >
                  {cat === 'all' ? '📺 Tutti' : cat}
                </div>
              ))}
            </div>
          </div>

          {/* Channels Grid */}
          <div className="flex-1 p-4 overflow-hidden">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {selectedCategory === 'all' ? 'Tutti i Canali' : selectedCategory}
              </h2>
              <span className="text-gray-400">{filteredChannels.length} canali</span>
            </div>
            
            <div className="grid grid-cols-6 gap-3 overflow-y-auto max-h-[calc(100vh-220px)]">
              {filteredChannels.map((channel, index) => (
                <div
                  key={channel.id}
                  className={`aspect-video rounded-lg overflow-hidden relative transition-all cursor-pointer ${
                    selectedChannelIndex === index
                      ? 'ring-4 ring-yellow-500 scale-110 z-10'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: selectedChannelIndex === index ? '#1a1a1a' : '#111' }}
                  onClick={() => playChannel(channel)}
                >
                  <div className="absolute inset-0 flex items-center justify-center p-2">
                    {channel.logo ? (
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <Tv className="w-8 h-8 text-gray-600" />
                    )}
                  </div>
                  
                  <div className="absolute top-1 left-1 px-1 bg-red-600 rounded text-[10px] font-bold">
                    LIVE
                  </div>
                  
                  {selectedChannelIndex === index && (
                    <div className="absolute bottom-0 left-0 right-0 bg-yellow-500 text-black text-xs p-1 text-center font-bold truncate">
                      {channel.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {currentChannel && (
              <div className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-lg">{currentChannel.name}</p>
                    <p className="text-gray-400">{currentChannel.group}</p>
                  </div>
                  <div className="text-right text-gray-400 text-sm">
                    <p>Canale {selectedChannelIndex + 1} di {filteredChannels.length}</p>
                    <p>↑↓←→ = Naviga • Enter = Guarda • ESC = Indietro</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
