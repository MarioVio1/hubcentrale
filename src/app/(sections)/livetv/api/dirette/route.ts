import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const response = await fetch('https://fig.direttecommunity.online/partite-streaming.html', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      next: { revalidate: 300 }
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const html = await response.text()
    const matches: any[] = []

    const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi
    const linkMatches = html.match(linkRegex)
    if (linkMatches) {
      linkMatches.slice(0, 20).forEach((linkMatch, index) => {
        const urlMatch = linkMatch.match(/href="([^"]*)"/i)
        const textMatch = linkMatch.match(/>([\s\S]*?)<\/a>/i)
        const url = urlMatch ? urlMatch[1] : ''
        const title = textMatch ? textMatch[1].replace(/<[^>]*>/g, '').trim() : `Stream ${index + 1}`
        const timeMatch = linkMatch.match(/(\d{1,2}:\d{2})/i) || linkMatch.match(/(\d+h)|Live/i)
        const time = timeMatch ? timeMatch[1] || 'Live' : 'Live'
        if (url && title && title.length > 3) {
          matches.push({
            id: `match-${index}`,
            title,
            url: url.startsWith('http') ? url : `https://fig.direttecommunity.online${url}`,
            image: '',
            time,
            category: 'Live'
          })
        }
      })
    }

    return NextResponse.json({ success: true, matches, total: matches.length })
  } catch (error) {
    console.error('Dirette error:', error)
    return NextResponse.json({ success: false, matches: [], total: 0 }, { status: 500 })
  }
}
