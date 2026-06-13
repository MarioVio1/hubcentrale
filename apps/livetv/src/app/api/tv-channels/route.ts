import { NextResponse } from 'next/server';

const M3U_URL = 'https://raw.githubusercontent.com/Ak1r4Yuk1/Ak1r4Yuk1/refs/heads/main/tv.m3u';

export async function GET() {
  try {
    const response = await fetch(M3U_URL);
    if (!response.ok) throw new Error('Errore nel caricamento');
    const text = await response.text();

    const channels: { name: string; url: string; logo?: string; group: string }[] = [];
    const lines = text.split('\n');
    let currentName = '', currentUrl = '', currentLogo = '', currentGroup = 'TV';
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      if (trimmedLine.startsWith('#EXTINF:')) {
        const nameMatch = trimmedLine.match(/,(.+)$/);
        if (nameMatch) currentName = nameMatch[1].trim();
        const logoMatch = trimmedLine.match(/tvg-logo="([^"]+)"/);
        if (logoMatch) currentLogo = logoMatch[1];
        const groupMatch = trimmedLine.match(/group-title="([^"]+)"/);
        if (groupMatch) currentGroup = groupMatch[1];
      } else if (trimmedLine.startsWith('http')) {
        currentUrl = trimmedLine.trim();
        if (currentName && currentUrl) {
          channels.push({ name: currentName, url: currentUrl, logo: currentLogo || undefined, group: currentGroup });
        }
        currentName = ''; currentUrl = ''; currentLogo = ''; currentGroup = 'TV';
      }
    }
    return NextResponse.json({ channels });
  } catch (error) {
    console.error('Errore fetch TV:', error);
    return NextResponse.json({ error: 'Impossibile caricare', channels: [] }, { status: 500 });
  }
}
