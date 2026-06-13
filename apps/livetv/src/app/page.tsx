'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Tv, Grid3X3, List, Play, ExternalLink, Loader2, Zap, Star, Flag, Crown, Radio, MonitorPlay, Film, Sparkles, ChevronDown, X, Menu } from 'lucide-react'
import ShakaPlayer from '@/components/shaka-player'

interface Category { id: string; name: string; slug: string; icon: string; color: string; sortOrder: number; isVisible: boolean; _count: { channels: number } }
interface DBChannel { id: string; title: string; categoryId: string; mpdUrl: string | null; drmType: string | null; drmKeyId: string | null; drmKey: string | null; isLive: boolean; useProxy: boolean; proxyUrl: string | null; category: Category }
interface M3UChannel { duration: number; logo: string; tvgId: string; name: string; group: string; url: string; source: string }
interface MatchEvent { id: string; title: string; url: string; image: string; time: string; category: string }
interface FeedChannel { id: string; name: string; group: string; type: 'iframe' | 'hls' | 'mpd' | 'external'; url?: string }
interface SportsonlineEvent { time: string; name: string; url: string }
interface Sportsonline247 { name: string; url: string; group: string }

type TabType = 'db' | 'all' | 'sports' | 'cinema' | 'italian' | 'paytv' | 'franchino' | 'feedtv' | 'live-events' | 'sportsonline-247' | 'dirette'

declare global { interface Window { Hls: any; shaka: any } }

export default function LiveTVPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // DB Channels (LIVEAC)
  const [dbCategories, setDbCategories] = useState<Category[]>([])
  const [dbChannels, setDbChannels] = useState<DBChannel[]>([])
  const [selectedDbCategory, setSelectedDbCategory] = useState<string | null>(null)
  const [selectedDbChannel, setSelectedDbChannel] = useState<DBChannel | null>(null)

  // M3U Channels (Daznfit)
  const [m3uChannels, setM3uChannels] = useState<M3UChannel[]>([])
  const [m3uCategories, setM3uCategories] = useState<string[]>([])
  const [selectedM3uCategory, setSelectedM3uCategory] = useState<string>('')
  const [m3uPage, setM3uPage] = useState(1)
  const [m3uTotal, setM3uTotal] = useState(0)
  const [channelStatus, setChannelStatus] = useState<Map<string, boolean>>(new Map())

  // Player state
  const [currentM3uChannel, setCurrentM3uChannel] = useState<M3UChannel | null>(null)
  const [playerLoading, setPlayerLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const hlsRef = useRef<any>(null)
  const [shakaLoaded, setShakaLoaded] = useState(false)

  // Feed TV (untiled2)
  const [feedChannels, setFeedChannels] = useState<FeedChannel[]>([])
  const [selectedFeedChannel, setSelectedFeedChannel] = useState<FeedChannel | null>(null)

  // Sportsonline
  const [sportsonlineEvents, setSportsonlineEvents] = useState<SportsonlineEvent[]>([])
  const [sportsonline247, setSportsonline247] = useState<Sportsonline247[]>([])
  const [selectedSportsonlineEvent, setSelectedSportsonlineEvent] = useState<SportsonlineEvent | null>(null)

  // DiretteCommunity
  const [diretteMatches, setDiretteMatches] = useState<MatchEvent[]>([])

  // Loading
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.body.classList.add('dark')
  }, [])

  // Load Shaka Player script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.13.0/shaka-player.compiled.min.js'
    script.async = true
    script.onload = () => setShakaLoaded(true)
    document.body.appendChild(script)
  }, [])

  // Load HLS.js
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest'
    script.async = true
    document.head.appendChild(script)
  }, [])

  // Fetch DB categories
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setDbCategories).catch(console.error)
  }, [])

  // Fetch DB channels
  useEffect(() => {
    if (activeTab === 'db') {
      const params = new URLSearchParams()
      if (selectedDbCategory) params.append('categoryId', selectedDbCategory)
      if (searchQuery) params.append('search', searchQuery)
      params.append('limit', '1000')
      fetch(`/api/channels?${params}`).then(r => r.json()).then(data => setDbChannels(data.channels || data)).catch(console.error)
    }
  }, [activeTab, selectedDbCategory, searchQuery])

  // Fetch M3U data (Daznfit)
  const fetchM3UChannels = async (pageNum = 1, category = '') => {
    setLoading(true)
    try {
      let url = `/api/m3u?endpoint=channels&page=${pageNum}&limit=36`
      if (category) url = `/api/m3u?endpoint=channels&page=${pageNum}&limit=144`
      const res = await fetch(url)
      const data = await res.json()
      if (data.channels) {
        const filtered = category ? data.channels.filter((ch: M3UChannel) => ch.group?.toLowerCase().includes(category.toLowerCase())) : data.channels
        setM3uChannels(filtered)
        if (data.pagination) setM3uTotal(data.pagination.total)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fetchM3UCategories = async () => {
    try {
      const res = await fetch('/api/m3u?endpoint=categories')
      const data = await res.json()
      if (data.categories) setM3uCategories(data.categories)
    } catch (e) { console.error(e) }
  }

  const fetchM3UByEndpoint = async (endpoint: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/m3u?endpoint=${endpoint}`)
      const data = await res.json()
      if (data.channels) {
        setM3uChannels(data.channels)
        setM3uTotal(data.total || data.channels.length)
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (activeTab === 'all') { fetchM3UChannels(m3uPage); fetchM3UCategories() }
    else if (activeTab === 'sports') fetchM3UByEndpoint('sports')
    else if (activeTab === 'cinema') fetchM3UByEndpoint('cinema')
    else if (activeTab === 'italian') fetchM3UByEndpoint('italian')
    else if (activeTab === 'paytv') fetchM3UByEndpoint('paytv')
    else if (activeTab === 'franchino') fetchM3UByEndpoint('franchino')
  }, [activeTab, m3uPage])

  // Check M3U channel status
  useEffect(() => {
    if (m3uChannels.length > 0) {
      const checkStatus = async () => {
        const urls = m3uChannels.slice(0, 10).map(ch => ch.url).join(',')
        try {
          const res = await fetch(`/api/channel/status?urls=${encodeURIComponent(urls)}`)
          const data = await res.json()
          if (data.results) {
            const newStatus = new Map(channelStatus)
            data.results.forEach((r: any) => newStatus.set(r.url, r.online))
            setChannelStatus(newStatus)
          }
        } catch (e) { console.error(e) }
      }
      checkStatus()
    }
  }, [m3uChannels])

  // Fetch Feed TV channels (static)
  useEffect(() => {
    const staticChannels: FeedChannel[] = [
      { id: 'SkySportUnoIT', name: 'Sky Sport Uno', group: 'Italia', type: 'iframe', url: 'https://popcdn.day/go.php?stream=SkySportUnoIT&autoplay=1' },
      { id: 'SkySportCalcioIT', name: 'Sky Sport Calcio', group: 'Italia', type: 'iframe', url: 'https://popcdn.day/go.php?stream=SkySportCalcioIT&autoplay=1' },
      { id: 'SkySportF1IT', name: 'Sky Sport F1', group: 'Italia', type: 'iframe', url: 'https://popcdn.day/go.php?stream=SkySportF1IT&autoplay=1' },
      { id: 'SkySport24IT', name: 'Sky Sport 24', group: 'Italia', type: 'iframe', url: 'https://popcdn.day/go.php?stream=SkySport24IT&autoplay=1' },
      { id: 'SkySportArenaIT', name: 'Sky Sport Arena', group: 'Italia', type: 'iframe', url: 'https://popcdn.day/go.php?stream=SkySportArenaIT&autoplay=1' },
      { id: 'SkySportTennisIT', name: 'Sky Sport Tennis', group: 'Italia', type: 'iframe', url: 'https://popcdn.day/go.php?stream=SkySportTennisIT&autoplay=1' },
      { id: 'Euro1IT', name: 'Eurosport 1', group: 'Italia', type: 'iframe', url: 'https://popcdn.day/go.php?stream=Euro1IT&autoplay=1' },
      { id: 'Euro2IT', name: 'Eurosport 2', group: 'Italia', type: 'iframe', url: 'https://popcdn.day/go.php?stream=Euro2IT&autoplay=1' },
      { id: 'ZonaDAZN', name: 'Zona DAZN', group: 'Italia', type: 'iframe', url: 'https://popcdn.day/go.php?stream=ZonaDAZN&autoplay=1' },
      { id: 'Rai-1', name: 'Rai 1', group: 'Italia', type: 'iframe', url: 'https://popcdn.day/go.php?stream=Rai-1&autoplay=1' },
      { id: 'Rai-2', name: 'Rai 2', group: 'Italia', type: 'iframe', url: 'https://popcdn.day/go.php?stream=Rai-2&autoplay=1' },
      { id: 'Rai-3', name: 'Rai 3', group: 'Italia', type: 'iframe', url: 'https://popcdn.day/go.php?stream=Rai-3&autoplay=1' },
      { id: 'Canale5', name: 'Canale 5', group: 'Italia', type: 'iframe', url: 'https://popcdn.day/go.php?stream=Canale5&autoplay=1' },
      { id: 'ElevenSports1PL', name: 'Eleven Sports 1', group: 'Polonia', type: 'iframe', url: 'https://popcdn.day/go.php?stream=ElevenSports1PL&autoplay=1' },
      { id: 'ElevenSports2PL', name: 'Eleven Sports 2', group: 'Polonia', type: 'iframe', url: 'https://popcdn.day/go.php?stream=ElevenSports2PL&autoplay=1' },
      { id: 'NOVASPORTBG', name: 'Nova Sport', group: 'Bulgaria', type: 'iframe', url: 'https://popcdn.day/go.php?stream=NOVASPORTBG&autoplay=1' },
      { id: 'MaxSport1BG', name: 'Max Sport 1', group: 'Bulgaria', type: 'iframe', url: 'https://popcdn.day/go.php?stream=MAXSPORT1BG&autoplay=1' },
      { id: 'DiemaSport', name: 'Diema Sport', group: 'Bulgaria', type: 'iframe', url: 'https://popcdn.day/go.php?stream=DIEMASPORT&autoplay=1' },
    ]

    const iptvItaliaChannels: FeedChannel[] = [
      { id: 'rai1-iptv', name: 'Rai 1', group: 'IPTV Italia', type: 'hls', url: 'http://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=2606803&output=7' },
      { id: 'rai2-iptv', name: 'Rai 2', group: 'IPTV Italia', type: 'hls', url: 'http://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=308718&output=7' },
      { id: 'rai3-iptv', name: 'Rai 3', group: 'IPTV Italia', type: 'hls', url: 'http://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=308709&output=7' },
      { id: 'la7-iptv', name: 'LA7', group: 'IPTV Italia', type: 'hls', url: 'https://d3749synfikwkv.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-74ylxpgd78bpb/Live.m3u8' },
      { id: 'tv8-iptv', name: 'TV8', group: 'IPTV Italia', type: 'hls', url: 'https://hlslive-web-gcdn-skycdn-it.akamaized.net/TACT/11223/tv8web/master.m3u8' },
      { id: 'nove-iptv', name: 'NOVE', group: 'IPTV Italia', type: 'hls', url: 'https://amg16146-wbdi-amg16146c1-samsung-it-1831.playouts.now.amagi.tv/playlist/amg16146-warnerbrosdiscoveryitalia-nove-samsungit/playlist.m3u8' },
      { id: 'realtime-iptv', name: 'Real Time', group: 'IPTV Italia', type: 'hls', url: 'https://amg16146-wbdi-amg16146c2-samsung-it-1835.playouts.now.amagi.tv/playlist/amg16146-warnerbrosdiscoveryitalia-realtime-samsungit/playlist.m3u8' },
      { id: 'foodnetwork-iptv', name: 'Food Network', group: 'IPTV Italia', type: 'hls', url: 'https://amg16146-wbdi-amg16146c3-samsung-it-1836.playouts.now.amagi.tv/playlist/amg16146-warnerbrosdiscoveryitalia-foodnetwork-samsungit/playlist.m3u8' },
      { id: 'k2-iptv', name: 'K2', group: 'IPTV Italia', type: 'hls', url: 'https://amg16146-wbdi-amg16146c6-samsung-it-1839.playouts.now.amagi.tv/playlist/amg16146-warnerbrosdiscoveryitalia-k2-samsungit/playlist.m3u8' },
      { id: 'frisbee-iptv', name: 'Frisbee', group: 'IPTV Italia', type: 'hls', url: 'https://amg16146-wbdi-amg16146c7-samsung-it-1840.playouts.now.amagi.tv/playlist/amg16146-warnerbrosdiscoveryitalia-frisbee-samsungit/playlist.m3u8' },
      { id: 'rainews24-iptv', name: 'Rai News 24', group: 'IPTV Italia', type: 'hls', url: 'http://mediapolis.rai.it/relinker/relinkerServlet.htm?cont=1&output=7' },
    ]

    const mixedChannels: FeedChannel[] = Array.from({ length: 50 }, (_, i) => ({
      id: `canale-${i + 1}`, name: `Canale ${i + 1}`, group: 'Mista', type: 'hls',
      url: `https://1nyaler.streamhostingcdn.top/stream/${i + 1}/index.m3u8?token=aN7QrmHIoz60HOhI`
    }))

    setFeedChannels([...staticChannels, ...iptvItaliaChannels, ...mixedChannels])
  }, [])

  // Fetch sportsonline
  useEffect(() => {
    if (activeTab === 'live-events') {
      fetch('/api/sportsonline-feed').then(r => r.json()).then(d => setSportsonlineEvents(d.events || [])).catch(console.error)
    }
    if (activeTab === 'sportsonline-247') {
      fetch('/api/sportsonline-247').then(r => r.json()).then(d => setSportsonline247(d.channels || [])).catch(console.error)
    }
    if (activeTab === 'dirette') {
      fetch('/api/dirette').then(r => r.json()).then(d => setDiretteMatches(d.matches || [])).catch(console.error)
    }
  }, [activeTab])

  // Play M3U channel with HLS.js
  const playM3UChannel = async (channel: M3UChannel) => {
    setCurrentM3uChannel(channel)
    setSelectedDbChannel(null)
    setSelectedFeedChannel(null)
    setSelectedSportsonlineEvent(null)
    setPlayerLoading(true)

    const playUrl = channel.url
    const video = videoRef.current
    if (!video) return

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }

    if (playUrl.includes('.m3u8') && typeof window.Hls !== 'undefined' && window.Hls.isSupported()) {
      const hls = new window.Hls({ enableWorker: true, lowLatencyMode: true })
      hls.loadSource(playUrl)
      hls.attachMedia(video)
      hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
        setPlayerLoading(false)
        video.play().catch(console.error)
      })
      hls.on(window.Hls.Events.ERROR, (event: any, data: any) => {
        if (data.fatal) { setPlayerLoading(false) }
      })
      hlsRef.current = hls
    } else {
      video.src = playUrl
      video.play().then(() => setPlayerLoading(false)).catch(() => setPlayerLoading(false))
    }
  }

  const playFeedChannel = (channel: FeedChannel) => {
    setSelectedFeedChannel(channel)
    setCurrentM3uChannel(null)
    setSelectedDbChannel(null)
    setSelectedSportsonlineEvent(null)
  }

  const playDbChannel = (channel: DBChannel) => {
    if (!shakaLoaded) { alert('Shaka Player non ancora caricato'); return }
    setSelectedDbChannel(channel)
    setCurrentM3uChannel(null)
    setSelectedFeedChannel(null)
    setSelectedSportsonlineEvent(null)
  }

  const tabs = [
    { id: 'all' as TabType, label: 'Tutti', icon: Grid3X3, color: 'from-blue-500/20 to-blue-600/20' },
    { id: 'sports' as TabType, label: 'Sport', icon: Zap, color: 'from-orange-500/20 to-orange-600/20' },
    { id: 'cinema' as TabType, label: 'Cinema', icon: Film, color: 'from-red-500/20 to-red-600/20' },
    { id: 'italian' as TabType, label: 'Italiani', icon: Flag, color: 'from-green-500/20 to-green-600/20' },
    { id: 'paytv' as TabType, label: 'Pay TV', icon: Crown, color: 'from-yellow-500/20 to-yellow-600/20' },
    { id: 'franchino' as TabType, label: 'Franchino', icon: Star, color: 'from-pink-500/20 to-pink-600/20' },
    { id: 'feedtv' as TabType, label: 'Feed TV', icon: Tv, color: 'from-violet-500/20 to-violet-600/20' },
    { id: 'live-events' as TabType, label: 'Eventi Live', icon: Play, color: 'from-emerald-500/20 to-emerald-600/20' },
    { id: 'dirette' as TabType, label: 'Dirette', icon: Radio, color: 'from-cyan-500/20 to-cyan-600/20' },
    { id: 'db' as TabType, label: 'DB Canali', icon: MonitorPlay, color: 'from-red-500/20 to-red-600/20' },
  ]

  const renderPlayer = () => {
    if (selectedDbChannel) {
      return (
        <div className="border-b border-border bg-black">
          <div className="p-4">
            {!shakaLoaded ? (
              <div className="relative w-full bg-black aspect-video flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-t-red-500 border-gray-700 rounded-full animate-spin" />
                  <span className="text-sm text-gray-400">Caricamento Shaka Player...</span>
                </div>
              </div>
            ) : (
              <ShakaPlayer
                channel={selectedDbChannel}
                onError={(e) => console.error(e)}
              />
            )}
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium">{selectedDbChannel.title}</span>
              {selectedDbChannel.drmType && <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-600 rounded-full">{selectedDbChannel.drmType.toUpperCase()}</span>}
            </div>
          </div>
        </div>
      )
    }

    if (currentM3uChannel) {
      return (
        <div className="border-b border-border bg-black">
          <div className="p-4">
            <video ref={videoRef} className="w-full aspect-video bg-black" controls autoPlay playsInline />
            {playerLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            )}
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium">{currentM3uChannel.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">{currentM3uChannel.source}</span>
            </div>
          </div>
        </div>
      )
    }

    if (selectedFeedChannel) {
      return (
        <div className="border-b border-border bg-black">
          <div className="p-4">
            {selectedFeedChannel.type === 'iframe' ? (
              <iframe
                key={selectedFeedChannel.url}
                ref={iframeRef}
                src={selectedFeedChannel.url}
                allow="autoplay; fullscreen"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                className="w-full aspect-video border-0 bg-black"
                title={selectedFeedChannel.name}
              />
            ) : selectedFeedChannel.type === 'hls' ? (
              <video
                key={selectedFeedChannel.url}
                controls autoPlay playsInline
                className="w-full aspect-video bg-black"
                src={selectedFeedChannel.url}
              />
            ) : (
              <div className="w-full aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center">
                <ExternalLink className="w-12 h-12 text-violet-400 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">{selectedFeedChannel.name}</h2>
                <p className="text-slate-400 mb-4">Apri in nuova finestra</p>
                <button onClick={() => window.open(selectedFeedChannel.url, '_blank')} className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl font-semibold">
                  <ExternalLink className="w-5 h-5 inline mr-2" />Apri Canale
                </button>
              </div>
            )}
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="font-medium">{selectedFeedChannel.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">{selectedFeedChannel.group}</span>
            </div>
          </div>
        </div>
      )
    }

    if (selectedSportsonlineEvent) {
      return (
        <div className="border-b border-border bg-black">
          <div className="p-4">
            <div className="w-full aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-center">
              <Play className="w-12 h-12 text-emerald-400 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">{selectedSportsonlineEvent.name}</h2>
              <p className="text-slate-400 mb-2">{selectedSportsonlineEvent.time}</p>
              <button onClick={() => window.open(selectedSportsonlineEvent.url, '_blank')} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl font-semibold">
                <ExternalLink className="w-5 h-5 inline mr-2" />Apri Evento
              </button>
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  const renderChannelGrid = () => {
    if (activeTab === 'feedtv') {
      const filtered = feedChannels.filter(ch => ch.name.toLowerCase().includes(searchQuery.toLowerCase()))
      const grouped = filtered.reduce((acc, ch) => {
        if (!acc[ch.group]) acc[ch.group] = []
        acc[ch.group].push(ch)
        return acc
      }, {} as Record<string, FeedChannel[]>)

      return (
        <div className="space-y-6">
          {Object.entries(grouped).map(([group, channels]) => (
            <div key={group}>
              <h3 className="text-lg font-semibold text-white mb-3">{group} ({channels.length})</h3>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {channels.map(ch => (
                  <button key={ch.id} onClick={() => playFeedChannel(ch)}
                    className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-violet-500/50 rounded-2xl transition-all text-center"
                  >
                    <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-2">
                      <Tv className="w-6 h-6 text-violet-400" />
                    </div>
                    <p className="text-sm font-medium text-white truncate">{ch.name}</p>
                    <p className="text-xs text-slate-500 mt-1">{ch.type.toUpperCase()}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (activeTab === 'live-events') {
      return (
        <div className="space-y-2">
          {sportsonlineEvents.map((event, i) => (
            <button key={i} onClick={() => setSelectedSportsonlineEvent(event)}
              className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-left flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                <Play className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full mr-2">{event.time}</span>
                <span className="text-sm font-semibold text-white">{event.name}</span>
              </div>
            </button>
          ))}
          {sportsonlineEvents.length === 0 && <p className="text-center text-muted-foreground py-8">Nessun evento live disponibile</p>}
        </div>
      )
    }

    if (activeTab === 'sportsonline-247') {
      return (
        <div className="space-y-2">
          {sportsonline247.map((ch, i) => (
            <button key={i} onClick={() => {
              setSelectedFeedChannel({ id: `247-${ch.name}`, name: ch.name, group: '24/7', type: 'external', url: ch.url })
              setCurrentM3uChannel(null); setSelectedDbChannel(null)
            }}
              className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-violet-500/50 rounded-xl text-left flex items-center gap-4"
            >
              <Tv className="w-5 h-5 text-violet-400" />
              <span className="text-sm font-medium text-white">{ch.name}</span>
            </button>
          ))}
        </div>
      )
    }

    if (activeTab === 'dirette') {
      return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {diretteMatches.map(match => (
            <div key={match.id} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <div className="aspect-video bg-slate-900 flex items-center justify-center p-4">
                {match.image ? (
                  <img src={match.image} alt={match.title} className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (<Tv className="w-12 h-12 text-white/20" />)}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white mb-1 truncate">{match.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full">{match.time}</span>
                  <span className="text-xs text-slate-500">{match.category}</span>
                </div>
                <button onClick={() => window.open(match.url, '_blank')}
                  className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />Guarda
                </button>
              </div>
            </div>
          ))}
          {diretteMatches.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Radio className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nessuna diretta disponibile al momento</p>
            </div>
          )}
        </div>
      )
    }

    if (activeTab === 'db') {
      const filtered = dbChannels.filter(ch => ch.title.toLowerCase().includes(searchQuery.toLowerCase()))
      return (
        <div>
          {!selectedDbCategory && dbCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {dbCategories.map(cat => (
                <button key={cat.id} onClick={() => setSelectedDbCategory(cat.id)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  {cat.icon} {cat.name} ({cat._count.channels})
                </button>
              ))}
            </div>
          )}
          {selectedDbCategory && (
            <button onClick={() => setSelectedDbCategory(null)} className="mb-4 px-3 py-1.5 text-xs rounded-lg bg-red-500/20 text-red-400">
              <X className="w-3 h-3 inline mr-1" />Tutte le categorie
            </button>
          )}
          <div className="grid gap-2 max-w-4xl">
            {filtered.map(ch => (
              <button key={ch.id} onClick={() => playDbChannel(ch)}
                className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all bg-card border border-border hover:border-red-500/30 ${selectedDbChannel?.id === ch.id ? 'bg-red-500/10 border-red-500/30' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{ch.title}</div>
                  <div className="text-xs text-muted-foreground">{ch.category?.name} {ch.isLive && <span className="text-green-500 ml-2">● LIVE</span>}</div>
                </div>
                {ch.drmType && <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded-full">{ch.drmType === 'none' ? 'FREE' : '🔑'}</span>}
              </button>
            ))}
          </div>
        </div>
      )
    }

    // M3U channels (all, sports, cinema, italian, paytv, franchino)
    const filtered = m3uChannels.filter(ch => ch.name.toLowerCase().includes(searchQuery.toLowerCase()))
    if (loading) {
      return (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      )
    }

    return (
      <div>
        {activeTab === 'all' && m3uCategories.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setSelectedM3uCategory(''); fetchM3UChannels(1) }}
                className={`px-3 py-1.5 text-xs rounded-lg ${!selectedM3uCategory ? 'bg-blue-500/20 text-blue-400' : 'bg-secondary hover:bg-secondary/80'}`}
              >Tutti</button>
              {m3uCategories.slice(0, 20).map(cat => (
                <button key={cat} onClick={() => { setSelectedM3uCategory(cat); fetchM3UChannels(1, cat) }}
                  className={`px-3 py-1.5 text-xs rounded-lg ${selectedM3uCategory === cat ? 'bg-blue-500/20 text-blue-400' : 'bg-secondary hover:bg-secondary/80'}`}
                >{cat.length > 20 ? cat.substring(0, 20) + '...' : cat}</button>
              ))}
            </div>
          </div>
        )}
        {viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filtered.map((ch, i) => (
              <div key={`${ch.url}-${i}`}
                className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 hover:border-purple-500/50 rounded-xl transition-all cursor-pointer"
                onClick={() => playM3UChannel(ch)}
              >
                <div className="aspect-video bg-gradient-to-br from-slate-900/80 to-slate-800/50 flex items-center justify-center p-4 border-b border-white/5">
                  {ch.logo ? (
                    <img src={ch.logo} alt={ch.name} className="max-w-full max-h-full object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (<Tv className="w-12 h-12 text-white/20" />)}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 flex items-end justify-center pb-6">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-2 right-2">
                    {channelStatus.has(ch.url) ? (
                      channelStatus.get(ch.url) ? (
                        <div className="flex items-center gap-1 bg-black/70 px-2 py-1 rounded-full border border-green-500/30">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                          <span className="text-[10px] font-bold text-green-400">LIVE</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-black/70 px-2 py-1 rounded-full border border-red-500/30">
                          <div className="w-2 h-2 rounded-full bg-red-400"></div>
                          <span className="text-[10px] font-bold text-red-400">OFF</span>
                        </div>
                      )
                    ) : null}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm text-white truncate">{ch.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 truncate">{ch.source}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((ch, i) => (
              <div key={`${ch.url}-${i}`}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-white/10 hover:border-purple-500/50 rounded-xl cursor-pointer transition-all"
                onClick={() => playM3UChannel(ch)}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                  {ch.logo ? <img src={ch.logo} alt="" className="w-10 h-10 object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    : <Tv className="w-6 h-6 text-white/20" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{ch.name}</h3>
                  <p className="text-xs text-slate-500">{ch.source} • {ch.group}</p>
                </div>
                <Play className="w-6 h-6 text-purple-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
        {filtered.length === 0 && !loading && (
          <div className="text-center py-16 text-muted-foreground">
            <Tv className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Nessun canale trovato</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <header className="border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-purple-600 flex items-center justify-center shadow-lg">
                <MonitorPlay className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-purple-400 bg-clip-text text-transparent">LiveTV</h1>
            </div>
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input type="text" placeholder="Cerca..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
            <button onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 rounded-lg border border-white/20 hover:bg-white/10"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0a0f1c] border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:block pt-20 lg:pt-0`}>
          <div className="h-full flex flex-col p-4 space-y-1 overflow-y-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? `bg-gradient-to-r ${tab.color} text-white border border-white/10` : 'text-white/70 hover:text-white hover:bg-white/5'}`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <main className="flex-1 min-w-0">
          {renderPlayer()}
          <div className="p-4 lg:p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              {tabs.find(t => t.id === activeTab)?.label || 'Canali'}
            </h2>
            {renderChannelGrid()}
          </div>
        </main>
      </div>
    </div>
  )
}
