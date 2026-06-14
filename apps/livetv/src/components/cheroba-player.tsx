'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, Play, ArrowLeft, Tv, Loader2, X, 
  Volume2, VolumeX, Maximize, Radio, 
  ChevronRight, Link, Plus, Globe, Swords
} from 'lucide-react';

const M3U_LISTS = [
  { id: 'lista', name: 'Lista Principale', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/lista.m3u', icon: '📺' },
  { id: 'static', name: 'Canali Statici', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/static.m3u', icon: '📡' },
  { id: 'staticestero', name: 'Canali Estero', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/staticestero.m3u', icon: '🌍' },
  { id: 'dlhd', name: 'DLHD', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/dlhd.m3u', icon: '🎬' },
  { id: 'sports99', name: 'Sports 99', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/sports99.m3u', icon: '⚽' },
  { id: 'sportsonline', name: 'Sports Online', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/sportsonline.m3u', icon: '🏀' },
  { id: 'eventi_dlhd', name: 'Eventi', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/eventi_dlhd.m3u', icon: '🎉' },
  { id: 'streamed', name: 'Streamed', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/streamed.m3u', icon: '🔴' },
  { id: 'vavoo', name: 'Vavoo', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/vavoo.m3u', icon: '🎯' },
  { id: 'mpd', name: 'MPD', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/mpd.m3u', icon: '💿' },
];

interface TVChannel { id: string; name: string; url: string; logo?: string; group?: string; listId: string; listName: string; sourceType?: 'm3u' | 'damitv'; embedUrl?: string; }
interface ItalianChannel { id: string; name: string; slug: string; group: string; logo: string; embedUrl: string; }
interface SportEvent { id: string; name: string; category: string; league: string; status: string; startsAt: number; endsAt: number; teams: { home: { name: string; badge: string }; away: { name: string; badge: string } }; viewers: number; poster: string; iframe: string; embed: string; }
interface CustomList { id: string; name: string; url: string; }
interface CheRobaPlayerProps { onClose: () => void; }

export default function CheRobaPlayer({ onClose }: CheRobaPlayerProps) {
  const [channels, setChannels] = useState<TVChannel[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 0 });
  const [selectedChannel, setSelectedChannel] = useState<TVChannel | null>(null);
  const [view, setView] = useState<'lists' | 'channels'>('lists');
  
  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customLists, setCustomLists] = useState<CustomList[]>([]);
  
  const [italianChannels, setItalianChannels] = useState<ItalianChannel[]>([]);
  const [sportEvents, setSportEvents] = useState<SportEvent[]>([]);
  const [damiView, setDamiView] = useState<'channels' | 'sports'>('channels');
  const [sportFilter, setSportFilter] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<SportEvent | null>(null);
  
  const [playerLoading, setPlayerLoading] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hlsRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('customM3ULists');
    if (saved) setCustomLists(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('customM3ULists', JSON.stringify(customLists));
  }, [customLists]);

  const categories = useMemo(() => {
    const cats = new Set(channels.map(c => c.group).filter(Boolean));
    return ['all', ...Array.from(cats).sort()] as string[];
  }, [channels]);

  const filteredChannels = useMemo(() => {
    let filtered = channels;
    if (selectedCategory !== 'all') filtered = filtered.filter(c => c.group === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.group?.toLowerCase().includes(q));
    }
    return filtered;
  }, [channels, selectedCategory, searchQuery]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery) return sportEvents;
    const q = searchQuery.toLowerCase();
    return sportEvents.filter(e => e.name.toLowerCase().includes(q) || e.league?.toLowerCase().includes(q) || e.category.toLowerCase().includes(q));
  }, [sportEvents, searchQuery]);

  const loadAllLists = async () => {
    setLoading(true);
    setChannels([]);
    setLoadingProgress({ loaded: 0, total: M3U_LISTS.length });
    const allChannels: TVChannel[] = [];
    let globalCounter = 0;
    for (let i = 0; i < M3U_LISTS.length; i++) {
      const list = M3U_LISTS[i];
      try {
        const res = await fetch(`/api/m3u-fetch?url=${encodeURIComponent(list.url)}`);
        const data = await res.json();
        if (data.channels) {
          const parsedChannels = data.channels.map((ch: any) => ({ ...ch, id: `channel-${globalCounter++}`, listId: list.id, listName: list.name }));
          allChannels.push(...parsedChannels);
        }
      } catch (error) { console.error(`Failed to load ${list.name}:`, error); }
      setLoadingProgress({ loaded: i + 1, total: M3U_LISTS.length });
    }
    setChannels(allChannels);
    setLoading(false);
    setView('channels');
  };

  const loadSingleList = async (listId: string, listUrl: string, listName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/m3u-fetch?url=${encodeURIComponent(listUrl)}`);
      const data = await res.json();
      if (data.channels) {
        setChannels(data.channels.map((ch: any, index: number) => ({ ...ch, id: `${listId}-${index}`, listId, listName })));
      }
    } catch (error) { console.error(`Failed to load ${listName}:`, error); }
    setLoading(false);
    setView('channels');
  };

  const addCustomList = () => {
    if (!customUrl.trim()) return;
    const name = customName.trim() || 'Lista Personalizzata';
    const id = `custom-${Date.now()}`;
    const newList = { id, name, url: customUrl.trim() };
    setCustomLists(prev => [...prev, newList]);
    loadSingleList(id, newList.url, newList.name);
    setCustomUrl('');
    setCustomName('');
    setShowCustomInput(false);
  };

  const removeCustomList = (id: string) => setCustomLists(prev => prev.filter(l => l.id !== id));

  const loadItalianChannels = async () => {
    setLoading(true);
    setChannels([]);
    setDamiView('channels');
    try {
      const res = await fetch('/api/damitv/channels');
      const data = await res.json();
      if (data.channels) {
        const mapped: TVChannel[] = data.channels.map((ch: ItalianChannel, i: number) => ({
          id: `damitv-${i}`, name: ch.name, url: ch.embedUrl, logo: ch.logo || undefined,
          group: ch.group, listId: 'damitv', listName: 'DAMI TV', sourceType: 'damitv', embedUrl: ch.embedUrl,
        }));
        setChannels(mapped);
        setItalianChannels(data.channels);
      }
    } catch (error) { console.error('Failed to load DAMI TV channels:', error); }
    setLoading(false);
    setView('channels');
  };

  const loadSportEvents = async (sport?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sport) params.set('sport', sport);
      params.set('status', 'live');
      const res = await fetch(`/api/damitv/events?${params}`);
      const data = await res.json();
      if (data.events) setSportEvents(data.events);
    } catch (error) { console.error('Failed to load DAMI TV events:', error); }
    setLoading(false);
  };

  const playChannel = (channel: TVChannel) => { setSelectedChannel(channel); setPlayerLoading(true); setPlayerError(null); setSelectedEvent(null); };
  const playEvent = (event: SportEvent) => { setSelectedEvent(event); setPlayerLoading(true); setPlayerError(null); setSelectedChannel(null); };

  useEffect(() => {
    if (!selectedChannel?.url || selectedChannel.sourceType === 'damitv') return;
    const video = videoRef.current;
    if (!video) return;
    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
    const isHLS = selectedChannel.url.includes('.m3u8') || selectedChannel.url.includes('m3u8');
    if (isHLS) {
      import('hls.js').then((Hls) => {
        if (Hls.default.isSupported()) {
          const hls = new Hls.default({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(selectedChannel.url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => { setPlayerLoading(false); video.play().catch(() => {}); });
          hls.on(Hls.Events.ERROR, (event: any, data: any) => { if (data.fatal) { setPlayerError('Errore caricamento stream'); setPlayerLoading(false); } });
          hlsRef.current = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = selectedChannel.url;
          video.addEventListener('loadedmetadata', () => { setPlayerLoading(false); video.play().catch(() => {}); });
        }
      });
    } else {
      video.src = selectedChannel.url;
      video.addEventListener('loadeddata', () => { setPlayerLoading(false); video.play().catch(() => {}); });
    }
    return () => { if (hlsRef.current) hlsRef.current.destroy(); };
  }, [selectedChannel]);

  useEffect(() => {
    const handleMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 4000);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchstart', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedChannel) setSelectedChannel(null);
        else if (selectedEvent) setSelectedEvent(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedChannel, selectedEvent, onClose]);

  const toggleMute = () => { if (videoRef.current) { videoRef.current.muted = !videoRef.current.muted; setIsMuted(videoRef.current.muted); } };
  const toggleFullscreen = () => { if (videoRef.current) { if (document.fullscreenElement) document.exitFullscreen(); else videoRef.current.requestFullscreen(); } };

  const isIframeSource = selectedChannel?.sourceType === 'damitv' || selectedEvent;
  const playerTitle = selectedChannel?.name || selectedEvent?.name || '';
  const playerEmbedUrl = selectedEvent?.iframe || selectedChannel?.embedUrl || '';

  if (selectedChannel || selectedEvent) {
    if (isIframeSource && playerEmbedUrl) {
      return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="flex items-center justify-between p-3 bg-gradient-to-b from-black/90 to-transparent z-20">
            <div className="flex items-center gap-3">
              <button onClick={() => { setSelectedChannel(null); setSelectedEvent(null); }} className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg">
                <ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">Indietro</span>
              </button>
              <div>
                <h2 className="text-lg font-bold">{playerTitle}</h2>
                <div className="flex items-center gap-2 text-sm text-orange-400">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  {selectedEvent ? selectedEvent.status.toUpperCase() : 'LIVE'}
                  {selectedEvent && selectedEvent.viewers > 0 && <span className="text-gray-400 text-xs">● {selectedEvent.viewers} watching</span>}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 relative">
            <iframe ref={iframeRef} src={playerEmbedUrl} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" onLoad={() => setPlayerLoading(false)} />
            {playerLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="text-center"><Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" /><p className="text-lg">Caricamento...</p></div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return (
      <div className="fixed inset-0 z-[100] bg-black">
        <video ref={videoRef} className="w-full h-full object-contain" playsInline autoPlay muted={isMuted} />
        <div className={`absolute inset-0 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedChannel(null)} className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg"><ArrowLeft className="w-5 h-5" /><span className="hidden sm:inline">Indietro</span></button>
                {selectedChannel?.logo && <img src={selectedChannel.logo} alt={selectedChannel.name} className="w-10 h-10 rounded object-contain bg-white/10" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                <div>
                  <h2 className="text-lg font-bold">{selectedChannel?.name}</h2>
                  <div className="flex items-center gap-2 text-sm text-orange-400"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />LIVE</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg">{isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</button>
                <button onClick={toggleFullscreen} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"><Maximize className="w-5 h-5" /></button>
                <button onClick={onClose} className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>
        {playerLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center"><Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" /><p className="text-lg">Caricamento...</p></div>
          </div>
        )}
        {playerError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <div className="text-center p-6">
              <p className="text-red-400 text-xl mb-4">{playerError}</p>
              <Button onClick={() => setSelectedChannel(null)} className="bg-orange-500 hover:bg-orange-600">Torna ai canali</Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0f171e]">
      <header className="sticky top-0 z-40 bg-[#0f171e] border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg"><ArrowLeft className="w-6 h-6" /></button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-[#00a8e1] to-[#f0b90b]"><Radio className="w-4 h-4 text-black" /></div>
              <h1 className="text-xl font-bold">Live TV</h1>
            </div>
          </div>
          {damiView === 'sports' && filteredEvents.length > 0 && <div className="text-sm text-gray-400"><span className="text-red-400 font-bold">{filteredEvents.length}</span> eventi</div>}
          {channels.length > 0 && damiView !== 'sports' && <div className="text-sm text-gray-400"><span className="text-[#f0b90b] font-bold">{filteredChannels.length}</span> canali</div>}
        </div>
        {(channels.length > 0 || sportEvents.length > 0) && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={damiView === 'sports' ? "Cerca eventi..." : "Cerca canali..."} className="pl-10 bg-white/5 border-white/10 text-white" />
            </div>
          </div>
        )}
      </header>

      {view === 'lists' && !loading && channels.length === 0 && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6 py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center bg-gradient-to-r from-[#00a8e1] to-[#f0b90b]"><Tv className="w-8 h-8 text-black" /></div>
              <h2 className="text-2xl font-bold mb-2">Live TV</h2>
              <p className="text-gray-400">Oltre 10.000 canali gratis</p>
            </div>
            <div className="mb-6 p-4 bg-gradient-to-r from-[#00a8e1]/20 to-[#f0b90b]/20 rounded-xl border border-[#00a8e1]/30">
              <div className="flex items-center gap-2 mb-3"><Link className="w-5 h-5 text-[#00a8e1]" /><span className="font-semibold">Collega la tua TV</span></div>
              {!showCustomInput ? (
                <button onClick={() => setShowCustomInput(true)} className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center gap-2 transition"><Plus className="w-5 h-5" />Aggiungi lista M3U personalizzata</button>
              ) : (
                <div className="space-y-3">
                  <Input value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Nome lista (es: Sky, Mediaset...)" className="bg-white/5 border-white/10 text-white" />
                  <Input value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} placeholder="URL lista M3U (es: http://esempio.com/lista.m3u)" className="bg-white/5 border-white/10 text-white" />
                  <div className="flex gap-2">
                    <Button onClick={addCustomList} className="flex-1 bg-gradient-to-r from-[#00a8e1] to-[#f0b90b] text-black font-bold"><Plus className="w-4 h-4 mr-2" /> Aggiungi</Button>
                    <Button onClick={() => { setShowCustomInput(false); setCustomUrl(''); setCustomName(''); }} variant="outline" className="border-white/20">Annulla</Button>
                  </div>
                </div>
              )}
              {customLists.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-400">Le tue liste:</p>
                  {customLists.map((list) => (
                    <div key={list.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <button onClick={() => loadSingleList(list.id, list.url, list.name)} className="flex-1 text-left hover:text-[#f0b90b] transition"><span className="font-medium">{list.name}</span><span className="text-xs text-gray-500 block truncate">{list.url}</span></button>
                      <button onClick={() => removeCustomList(list.id)} className="p-1 hover:bg-red-500/20 rounded text-red-400"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={loadAllLists} className="w-full mb-3 p-3 rounded-xl font-bold flex items-center justify-center gap-2 bg-gradient-to-r from-[#00a8e1] to-[#f0b90b] text-black"><Play className="w-5 h-5 fill-black" />Carica Tutti i Canali</button>

            <div className="mb-6 p-4 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-xl border border-orange-500/30">
              <div className="flex items-center gap-2 mb-3"><Globe className="w-5 h-5 text-orange-400" /><span className="font-semibold">DAMI TV</span><span className="text-xs text-orange-400/60">Canali Italiani</span></div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={loadItalianChannels} className="flex items-center gap-2 p-3 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-left"><Tv className="w-5 h-5 text-orange-400" /><span className="text-sm font-medium">Canali Italiani</span></button>
                <button onClick={() => { loadSportEvents(); setDamiView('sports'); setView('channels'); }} className="flex items-center gap-2 p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-left"><Swords className="w-5 h-5 text-red-400" /><span className="text-sm font-medium">Sport Live</span></button>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-3">Oppure scegli una lista:</p>
            <div className="grid grid-cols-2 gap-2">
              {M3U_LISTS.map((list) => (
                <button key={list.id} onClick={() => loadSingleList(list.id, list.url, list.name)} className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left"><span className="text-xl">{list.icon}</span><span className="text-sm font-medium truncate">{list.name}</span></button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center"><Loader2 className="w-10 h-10 animate-spin text-[#f0b90b] mx-auto mb-4" /><p>Caricamento...</p><p className="text-gray-500 text-sm mt-2">{loadingProgress.loaded} / {loadingProgress.total} liste</p></div>
        </div>
      )}

      {view === 'channels' && !loading && channels.length > 0 && damiView !== 'sports' && (
        <>
          <div className="bg-[#0f171e] border-b border-white/10 px-4 py-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button onClick={() => setView('lists')} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm whitespace-nowrap">← Liste</button>
              {categories.slice(0, 15).map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${selectedCategory === cat ? 'bg-[#f0b90b] text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}>{cat === 'all' ? 'Tutti' : cat}</button>
              ))}
            </div>
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
              {filteredChannels.map((channel) => (
                <div key={channel.id} onClick={() => playChannel(channel)} className="cursor-pointer group">
                  <div className="aspect-video rounded-lg overflow-hidden bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition relative">
                    {channel.logo ? <img src={channel.logo} alt={channel.name} className="max-w-[70%] max-h-[70%] object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <Tv className="w-6 h-6 text-gray-500" />}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"><Play className="w-6 h-6 fill-white text-white" /></div>
                    <div className="absolute top-1 left-1 px-1 bg-red-600 rounded text-[10px] font-bold">LIVE</div>
                  </div>
                  <p className="mt-1 text-xs text-center truncate">{channel.name}</p>
                </div>
              ))}
            </div>
            {filteredChannels.length === 0 && <div className="text-center py-16"><p className="text-gray-400">Nessun canale trovato</p></div>}
          </ScrollArea>
        </>
      )}

      {view === 'channels' && !loading && damiView === 'sports' && (
        <>
          <div className="bg-[#0f171e] border-b border-white/10 px-4 py-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button onClick={() => { setDamiView('channels'); setView('lists'); setSportEvents([]); }} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm whitespace-nowrap">← DAMI TV</button>
              {['all', 'football', 'basketball', 'tennis', 'fight', 'cricket', 'motor-sports', 'baseball', 'hockey', 'rugby', 'darts', 'golf', 'american-football', 'afl'].map((sport) => (
                <button key={sport} onClick={() => { setSportFilter(sport); loadSportEvents(sport === 'all' ? undefined : sport); }} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${(sportFilter === sport || (!sportFilter && sport === 'all')) ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>{sport === 'all' ? 'Tutti' : sport.charAt(0).toUpperCase() + sport.slice(1).replace('-', ' ')}</button>
              ))}
            </div>
          </div>
          <ScrollArea className="flex-1 p-3">
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredEvents.map((event) => (
                  <div key={event.id} onClick={() => playEvent(event)} className="cursor-pointer group bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden border border-white/10 transition">
                    {event.poster ? (
                      <div className="aspect-video relative overflow-hidden">
                        <img src={event.poster} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        {event.status === 'live' && <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 rounded text-xs font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE</div>}
                        {event.viewers > 0 && <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 rounded text-xs">● {event.viewers}</div>}
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-red-900/30 to-orange-900/30 flex items-center justify-center relative">
                        <Swords className="w-12 h-12 text-red-500/50" />
                        {event.status === 'live' && <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 rounded text-xs font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE</div>}
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2">{event.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400 capitalize">{event.league || event.category}</span>
                        {event.status === 'upcoming' && event.startsAt > 0 && <span className="text-xs text-gray-500">{new Date(event.startsAt * 1000).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Swords className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">{searchQuery ? 'Nessun evento trovato' : 'Nessun evento live'}</p>
                <p className="text-gray-600 text-sm">{searchQuery ? 'Prova con altri termini' : 'Prova a selezionare uno sport diverso'}</p>
              </div>
            )}
          </ScrollArea>
        </>
      )}
    </div>
  );
}
