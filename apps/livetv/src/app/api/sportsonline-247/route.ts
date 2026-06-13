import { NextResponse } from 'next/server';

const PROG_URL = 'https://v4.sportssonline.click//247.txt';

export async function GET() {
  try {
    const response = await fetch(PROG_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!response.ok) throw new Error('Errore nel caricamento');
    const text = await response.text();

    const channels: { name: string; url: string; group: string }[] = [];
    const lines = text.split('\n');
    let currentName = '', currentUrl = '', currentGroup = '24/7';
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      if (trimmedLine.startsWith('#EXTINF:')) {
        const match = trimmedLine.match(/,(.+)$/);
        if (match) currentName = match[1].trim();
        const groupMatch = trimmedLine.match(/group-title="([^"]+)"/);
        if (groupMatch) currentGroup = groupMatch[1];
      } else if (trimmedLine.startsWith('http')) {
        currentUrl = trimmedLine.trim();
        if (currentName && currentUrl) {
          channels.push({ name: currentName, url: currentUrl, group: currentGroup });
        }
        currentName = ''; currentUrl = ''; currentGroup = '24/7';
      }
    }
    return NextResponse.json({ channels });
  } catch (error) {
    console.error('Errore fetch 24/7:', error);
    return NextResponse.json({ error: 'Impossibile caricare', channels: [] }, { status: 500 });
  }
}
