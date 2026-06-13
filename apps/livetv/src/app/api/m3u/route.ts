import { NextResponse } from 'next/server'
import { FRANCHINO_M3U } from '@/lib/franchino-m3u'

const M3U_SOURCES = [
  { name: 'LIVETV - Sports99', url: 'https://raw.githubusercontent.com/leanhhu061206/LIVETV/main/sports99.m3u' },
  { name: 'LIVETV - Sports Online', url: 'https://raw.githubusercontent.com/leanhhu061206/LIVETV/main/sportsonline.m3u' },
  { name: 'LIVETV - DLHD', url: 'https://raw.githubusercontent.com/leanhhu061206/LIVETV/main/dlhd.m3u' },
  { name: 'LIVETV - Eventi DLHD', url: 'https://raw.githubusercontent.com/leanhhu061206/LIVETV/main/eventi_dlhd.m3u' },
  { name: 'LIVETV - Static', url: 'https://raw.githubusercontent.com/leanhhu061206/LIVETV/main/static.m3u' },
  { name: 'LIVETV - Streamed', url: 'https://raw.githubusercontent.com/leanhhu061206/LIVETV/main/streamed.m3u' },
  { name: 'LIVETV - Vavoo', url: 'https://raw.githubusercontent.com/leanhhu061206/LIVETV/main/vavoo.m3u' },
  { name: 'LIVETV - Zappruaznao (MPD)', url: 'https://raw.githubusercontent.com/leanhhu061206/LIVETV/main/zappruaznao.m3u' },
  { name: 'IPTV-org Italy', url: 'https://iptv-org.github.io/iptv/countries/it.m3u' },
  { name: 'IPTV-org General', url: 'https://iptv-org.github.io/iptv/index.m3u' },
  { name: 'IPTV-org Europe', url: 'https://iptv-org.github.io/iptv/countries/eu.m3u' },
  { name: 'IPTV-org Switzerland', url: 'https://iptv-org.github.io/iptv/countries/ch.m3u' },
  { name: 'IPTV-org San Marino', url: 'https://iptv-org.github.io/iptv/countries/sm.m3u' },
  { name: 'IPTV-org Malta', url: 'https://iptv-org.github.io/iptv/countries/mt.m3u' },
  { name: 'IPTV-org Vatican', url: 'https://iptv-org.github.io/iptv/countries/va.m3u' },
]

function parseM3U(content: string) {
  const channels: any[] = []
  const lines = content.split('\n')
  let currentChannel: any = {}
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (trimmedLine.startsWith('#EXTINF:')) {
      const infoLine = trimmedLine.substring(8)
      const parts = infoLine.split(',')
      const durationMatch = infoLine.match(/duration="(\d+)"/)
      const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/)
      const tvgIdMatch = infoLine.match(/tvg-id="([^"]*)"/)
      currentChannel = {
        duration: durationMatch ? parseInt(durationMatch[1]) : -1,
        logo: logoMatch ? logoMatch[1] : '',
        tvgId: tvgIdMatch ? tvgIdMatch[1] : '',
        name: parts.length > 1 ? parts[parts.length - 1].trim() : 'Unknown',
        group: '',
        url: ''
      }
      const groupMatch = infoLine.match(/group-title="([^"]*)"/)
      if (groupMatch) currentChannel.group = groupMatch[1]
    } else if (trimmedLine.startsWith('http') && currentChannel.name) {
      currentChannel.url = trimmedLine
      channels.push({ ...currentChannel })
      currentChannel = {}
    }
  }
  return channels
}

async function fetchM3U(url: string): Promise<string | null> {
  try {
    const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    })
    if (!response.ok) return null
    const text = await response.text()
    if (text.length < 100 || !text.includes('#EXTINF')) return null
    return text
  } catch (error) {
    console.error('Error fetching M3U:', error)
    return null
  }
}

let channelCache: any[] = []
let cacheTime = 0
const CACHE_DURATION = 10 * 60 * 1000

async function getAllChannels() {
  const allChannels: any[] = []
  const processedUrls = new Set<string>()
  for (const source of M3U_SOURCES) {
    const content = await fetchM3U(source.url)
    if (content) {
      const channels = parseM3U(content)
      for (const channel of channels) {
        if (!processedUrls.has(channel.url)) {
          processedUrls.add(channel.url)
          allChannels.push({ ...channel, source: source.name })
        }
      }
    }
  }
  return allChannels
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint') || 'channels'
  const forceRefresh = searchParams.get('refresh') === 'true'
  const now = Date.now()

  if (forceRefresh) { channelCache = []; cacheTime = 0 }

  if (!channelCache.length || now - cacheTime > CACHE_DURATION) {
    channelCache = await getAllChannels()
    cacheTime = now
  }

  switch (endpoint) {
    case 'channels': {
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = (page - 1) * limit
      return NextResponse.json({
        channels: channelCache.slice(offset, offset + limit),
        pagination: { page, limit, total: channelCache.length, totalPages: Math.ceil(channelCache.length / limit) }
      })
    }
    case 'categories': {
      const categoryCount = new Map<string, number>()
      channelCache.forEach(ch => {
        if (ch.group) categoryCount.set(ch.group, (categoryCount.get(ch.group) || 0) + 1)
      })
      return NextResponse.json({ categories: Array.from(categoryCount.entries()).sort((a, b) => b[1] - a[1]).map(([cat]) => cat) })
    }
    case 'search': {
      const query = searchParams.get('q')?.toLowerCase()
      if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 })
      const results = channelCache.filter(ch => ch.name.toLowerCase().includes(query) || ch.group?.toLowerCase().includes(query))
      return NextResponse.json({ channels: results, total: results.length })
    }
    case 'sports': {
      const sportsKeywords = ['sport', 'football', 'calcio', 'basket', 'tennis', 'motogp', 'f1', 'dazn', 'sky sport', 'eurosport', 'bein', 'nba', 'nfl', 'ufc', 'boxing', 'wwe']
      return NextResponse.json({
        channels: channelCache.filter(ch => {
          const name = ch.name.toLowerCase()
          const group = ch.group?.toLowerCase() || ''
          return sportsKeywords.some(k => name.includes(k) || group.includes(k))
        })
      })
    }
    case 'cinema': {
      const cinemaKeywords = ['cinema', 'movie', 'film', 'sky cinema', 'premium', 'disney', 'hbo', 'netflix', 'paramount', 'fox', 'axn']
      return NextResponse.json({
        channels: channelCache.filter(ch => {
          const name = ch.name.toLowerCase()
          const group = ch.group?.toLowerCase() || ''
          return cinemaKeywords.some(k => name.includes(k) || group.includes(k))
        })
      })
    }
    case 'italian': {
      const italianKeywords = ['rai', 'mediaset', 'canale', 'la7', 'italia', 'sky', 'dazn', 'premium', 'calcio', 'serie a']
      return NextResponse.json({
        channels: channelCache.filter(ch => {
          const name = ch.name.toLowerCase()
          const group = ch.group?.toLowerCase() || ''
          return italianKeywords.some(k => name.includes(k) || group.includes(k))
        })
      })
    }
    case 'paytv': {
      const paytvKeywords = ['sky', 'dazn', 'premium', 'disney', 'hbo', 'netflix', 'paramount', 'apple tv', 'peacock', 'now tv', 'bein', 'eurosport']
      return NextResponse.json({
        channels: channelCache.filter(ch => {
          const name = ch.name.toLowerCase()
          const group = ch.group?.toLowerCase() || ''
          return paytvKeywords.some(k => name.includes(k) || group.includes(k))
        })
      })
    }
    case 'franchino': {
      const channels = parseM3U(FRANCHINO_M3U).map(ch => ({ ...ch, source: 'Franchino' }))
      return NextResponse.json({ channels, total: channels.length })
    }
    case 'zappruaznao': {
      const zappruaznaoUrl = 'https://raw.githubusercontent.com/leanhhu061206/LIVETV/main/zappruaznao.m3u'
      const content = await fetchM3U(zappruaznaoUrl)
      if (!content) return NextResponse.json({ error: 'Failed' }, { status: 400 })
      const channels = parseM3U(content).map(ch => ({ ...ch, source: 'LIVETV - Zappruaznao (MPD)' }))
      return NextResponse.json({ channels, total: channels.length })
    }
    case 'custom': {
      const customUrl = searchParams.get('url')
      if (!customUrl) return NextResponse.json({ error: 'URL is required' }, { status: 400 })
      const content = await fetchM3U(customUrl)
      if (!content) return NextResponse.json({ error: 'Failed to fetch' }, { status: 400 })
      return NextResponse.json({ channels: parseM3U(content) })
    }
    default:
      return NextResponse.json({ endpoints: ['channels', 'categories', 'search', 'sports', 'cinema', 'italian', 'paytv', 'franchino', 'zappruaznao', 'custom'] })
  }
}
