import { NextResponse } from 'next/server';

const PROG_URL = 'https://sportsonline.vc/prog.txt';

export async function GET() {
  try {
    const response = await fetch(PROG_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    if (!response.ok) throw new Error('Errore nel caricamento del feed');
    const text = await response.text();

    const regex = /(\d{2}:\d{2})\s+(.*?)\s*\|\s*(https?:\/\/[^\s]+)/g;
    const events: { time: string; name: string; url: string }[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      events.push({ time: match[1], name: match[2].trim(), url: match[3].trim() });
    }
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Errore fetch sportsonline:', error);
    return NextResponse.json({ error: 'Impossibile caricare gli eventi live', events: [] }, { status: 500 });
  }
}
