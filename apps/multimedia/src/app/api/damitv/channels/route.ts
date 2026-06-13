import { NextResponse } from 'next/server';

const ITALIAN_CHANNELS = [
  { id: 'rai-1', name: 'Rai 1', slug: 'rai-1', group: 'Rai', logo: '' },
  { id: 'rai-2', name: 'Rai 2', slug: 'rai-2', group: 'Rai', logo: '' },
  { id: 'rai-3', name: 'Rai 3', slug: 'rai-3', group: 'Rai', logo: '' },
  { id: 'rai-4', name: 'Rai 4', slug: 'rai-4', group: 'Rai', logo: '' },
  { id: 'rai-5', name: 'Rai 5', slug: 'rai-5', group: 'Rai', logo: '' },
  { id: 'rai-news', name: 'Rai News', slug: 'rai-news', group: 'Rai', logo: '' },
  { id: 'rai-storia', name: 'Rai Storia', slug: 'rai-storia', group: 'Rai', logo: '' },
  { id: 'rai-movie', name: 'Rai Movie', slug: 'rai-movie', group: 'Rai', logo: '' },
  { id: 'rai-premium', name: 'Rai Premium', slug: 'rai-premium', group: 'Rai', logo: '' },
  { id: 'rai-gulp', name: 'Rai Gulp', slug: 'rai-gulp', group: 'Rai', logo: '' },
  { id: 'rai-yoyo', name: 'Rai Yoyo', slug: 'rai-yoyo', group: 'Rai', logo: '' },
  { id: 'rai-sport', name: 'Rai Sport', slug: 'rai-sport', group: 'Rai', logo: '' },
  { id: 'canale-5', name: 'Canale 5', slug: 'canale-5', group: 'Mediaset', logo: '' },
  { id: 'italia-1', name: 'Italia 1', slug: 'italia-1', group: 'Mediaset', logo: '' },
  { id: 'rete-4', name: 'Rete 4', slug: 'rete-4', group: 'Mediaset', logo: '' },
  { id: '20-mediaset', name: '20 Mediaset', slug: '20-mediaset', group: 'Mediaset', logo: '' },
  { id: 'italia-2', name: 'Italia 2', slug: 'italia-2', group: 'Mediaset', logo: '' },
  { id: 'la5', name: 'La5', slug: 'la5', group: 'Mediaset', logo: '' },
  { id: 'mediaset-extra', name: 'Mediaset Extra', slug: 'mediaset-extra', group: 'Mediaset', logo: '' },
  { id: 'iris', name: 'Iris', slug: 'iris', group: 'Mediaset', logo: '' },
  { id: 'topcrime', name: 'Top Crime', slug: 'topcrime', group: 'Mediaset', logo: '' },
  { id: 'focus', name: 'Focus', slug: 'focus', group: 'Mediaset', logo: '' },
  { id: 'la7', name: 'La7', slug: 'la7', group: 'La7', logo: '' },
  { id: 'tv8', name: 'TV8', slug: 'tv8', group: 'Altri', logo: '' },
  { id: 'nove', name: 'Nove', slug: 'nove', group: 'Altri', logo: '' },
  { id: 'real-time', name: 'Real Time', slug: 'real-time', group: 'Altri', logo: '' },
  { id: 'dmax', name: 'DMAX', slug: 'dmax', group: 'Altri', logo: '' },
  { id: 'giallo', name: 'Giallo', slug: 'giallo', group: 'Altri', logo: '' },
  { id: 'ciao-boi', name: 'CiaoBoi', slug: 'ciao-boi', group: 'Altri', logo: '' },
  { id: 'sportitalia', name: 'Sportitalia', slug: 'sportitalia', group: 'Sport', logo: '' },
  { id: 'sportitalia-24h', name: 'Sportitalia 24h', slug: 'sportitalia-24h', group: 'Sport', logo: '' },
  { id: 'sportitalia-sport-2', name: 'Sportitalia 2', slug: 'sportitalia-sport-2', group: 'Sport', logo: '' },
  { id: 'sportitalia-sport-3', name: 'Sportitalia 3', slug: 'sportitalia-sport-3', group: 'Sport', logo: '' },
  { id: 'sky-tg24', name: 'Sky TG24', slug: 'sky-tg24', group: 'Sky', logo: '' },
  { id: 'sky-sport-24', name: 'Sky Sport 24', slug: 'sky-sport-24', group: 'Sky', logo: '' },
  { id: 'sky-sport-uno', name: 'Sky Sport Uno', slug: 'sky-sport-uno', group: 'Sky', logo: '' },
  { id: 'sky-sport-calcio', name: 'Sky Sport Calcio', slug: 'sky-sport-calcio', group: 'Sky', logo: '' },
  { id: 'sky-sport-serie-a', name: 'Sky Sport Serie A', slug: 'sky-sport-serie-a', group: 'Sky', logo: '' },
  { id: 'tgcom24', name: 'TGcom24', slug: 'tgcom24', group: 'News', logo: '' },
];

export const dynamic = 'force-dynamic';

export async function GET() {
  const channels = ITALIAN_CHANNELS.map(ch => ({
    ...ch,
    embedUrl: `https://dami-tv.pro/embed/channel/?id=${ch.slug}`,
  }));

  return NextResponse.json({ success: true, channels, count: channels.length, source: 'DAMI TV' });
}
