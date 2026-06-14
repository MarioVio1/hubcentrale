import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const M3U_LISTS = [
  { id: 'lista', name: 'Lista Principale', description: 'Canali TV italiani principali', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/lista.m3u', icon: '📺' },
  { id: 'dlhd', name: 'DLHD', description: 'Canali internazionali DLHD', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/dlhd.m3u', icon: '🎯' },
  { id: 'static', name: 'Static', description: 'Canali statici stabili', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/static.m3u', icon: '📡' },
  { id: 'staticestero', name: 'Estero', description: 'Canali esteri e internazionali', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/staticestero.m3u', icon: '🌍' },
  { id: 'sports99', name: 'Sports99', description: 'Sport e eventi sportivi', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/sports99.m3u', icon: '⚽' },
  { id: 'sportsonline', name: 'Sports Online', description: 'Sport in diretta streaming', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/sportsonline.m3u', icon: '🏀' },
  { id: 'eventi_dlhd', name: 'Eventi DLHD', description: 'Eventi speciali e PPV', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/eventi_dlhd.m3u', icon: '🎬' },
  { id: 'streamed', name: 'Streamed', description: 'Canali in streaming', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/streamed.m3u', icon: '🎥' },
  { id: 'vavoo', name: 'Vavoo', description: 'Canali Vavoo', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/vavoo.m3u', icon: '🔴' },
  { id: 'thisnot', name: 'ThisNot', description: 'Canali ThisNot', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/thisnot.m3u', icon: '🟣' },
  { id: 'mpd', name: 'MPD', description: 'Stream MPD/DASH', url: 'https://gitea.stremioitalia.dpdns.org/admin/Tv/raw/branch/main/mpd.m3u', icon: '💿' },
];

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json({ lists: M3U_LISTS }, { headers: corsHeaders });
}
