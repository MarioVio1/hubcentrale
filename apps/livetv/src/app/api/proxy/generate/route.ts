import { NextResponse } from 'next/server'

const HUSHED_PROXY_URL = process.env.HUSHED_PROXY_URL || 'https://hushed-brett-annualetesina-2b360535.koyeb.app'
let proxyAvailable = true
let lastProxyCheck = 0
const PROXY_CHECK_INTERVAL = 5 * 60 * 1000

export async function POST(request: Request) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

    const now = Date.now()
    if (proxyAvailable && (now - lastProxyCheck > PROXY_CHECK_INTERVAL)) {
      try {
        const testResponse = await fetch(`${HUSHED_PROXY_URL}/generate_urls`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: [{ destination_url: 'https://example.com', endpoint: '/proxy/stream', request_headers: {}, warp: 'on', disable_ssl: '0' }] })
        })
        if (!testResponse.ok) proxyAvailable = false
        else lastProxyCheck = now
      } catch { proxyAvailable = false }
    }

    if (!proxyAvailable) return NextResponse.json({ originalUrl: url, proxyUrl: url, proxyDisabled: true })

    let endpoint = '/proxy/stream'
    if (url.includes('.m3u8')) endpoint = '/proxy/hls/manifest.m3u8'
    else if (url.includes('.mpd')) endpoint = '/proxy/mpd/manifest.m3u8'

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(`${HUSHED_PROXY_URL}/generate_urls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        urls: [{
          destination_url: url,
          endpoint,
          request_headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
            'Referer': url,
            'Origin': new URL(url).origin
          },
          warp: 'on',
          disable_ssl: '0'
        }]
      }),
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (!response.ok) return NextResponse.json({ originalUrl: url, proxyUrl: url, proxyError: true })
    const data = await response.json()
    if (!data.urls?.length) return NextResponse.json({ originalUrl: url, proxyUrl: url, noUrlGenerated: true })

    return NextResponse.json({ originalUrl: url, proxyUrl: data.urls[0], endpoint })
  } catch (error) {
    console.error('[Proxy] Error:', error)
    return NextResponse.json({ originalUrl: url, proxyUrl: url, error: 'Proxy failed' })
  }
}
