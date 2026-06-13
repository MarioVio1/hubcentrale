import { NextRequest, NextResponse } from 'next/server';

const DAMI_TV_API = 'https://dami-tv.pro/papi/api/streams';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sport = searchParams.get('sport');
  const status = searchParams.get('status');

  try {
    const res = await fetch(DAMI_TV_API, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`API responded with ${res.status}`);

    const data = await res.json();
    if (!data.success || !Array.isArray(data.streams)) throw new Error('Invalid API response');

    let events = data.streams.flatMap((cat: any) =>
      (cat.streams || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        category: cat.category,
        league: s.league || '',
        status: s.status || 'upcoming',
        startsAt: s.starts_at,
        endsAt: s.ends_at,
        teams: s.teams || {},
        viewers: s.viewers || 0,
        poster: s.poster || '',
        iframe: s.iframe || '',
        embed: s.embed || '',
      }))
    );

    if (sport) {
      const sf = sport.toLowerCase();
      events = events.filter((e: any) => e.category.toLowerCase() === sf || e.league?.toLowerCase().includes(sf));
    }
    if (status) events = events.filter((e: any) => e.status === status);

    events.sort((a: any, b: any) => {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (a.status !== 'live' && b.status === 'live') return 1;
      return (a.startsAt || 0) - (b.startsAt || 0);
    });

    return NextResponse.json({ success: true, events, count: events.length, source: 'DAMI TV', timestamp: data.timestamp });
  } catch (error) {
    console.error('[DAMI TV Events] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch events', events: [], count: 0 }, { status: 500 });
  }
}
