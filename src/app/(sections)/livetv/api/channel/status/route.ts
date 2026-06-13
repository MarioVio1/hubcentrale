import { NextResponse } from 'next/server'

const statusCache = new Map<string, { online: boolean, checkedAt: number }>()
const CACHE_DURATION = 2 * 60 * 1000

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    const cached = statusCache.get(url)
    if (cached && Date.now() - cached.checkedAt < CACHE_DURATION) {
      return NextResponse.json({ url, online: cached.online, cached: true })
    }

    let online = false
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(url, { method: 'HEAD', signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'manual' })
      clearTimeout(timeoutId)
      online = response.status >= 200 && response.status < 500
    } catch { online = false }

    statusCache.set(url, { online, checkedAt: Date.now() })
    return NextResponse.json({ url, online, cached: false })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const urls = searchParams.get('urls')?.split(',') || []
  if (!urls.length) return NextResponse.json({ error: 'No URLs' }, { status: 400 })

  const results = await Promise.all(urls.map(async (url) => {
    const cached = statusCache.get(url)
    if (cached && Date.now() - cached.checkedAt < CACHE_DURATION) return { url, online: cached.online, cached: true }
    let online = false
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      const response = await fetch(url, { method: 'HEAD', signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'manual' })
      clearTimeout(timeoutId)
      online = response.status >= 200 && response.status < 500
    } catch { online = false }
    statusCache.set(url, { online, checkedAt: Date.now() })
    return { url, online, cached: false }
  }))

  return NextResponse.json({ results, total: results.length, online: results.filter(r => r.online).length })
}
