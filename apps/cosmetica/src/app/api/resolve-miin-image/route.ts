import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { url: string; expiry: number }>();

export async function GET(request: NextRequest) {
  const miinUrl = request.nextUrl.searchParams.get("url");
  if (!miinUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const cached = cache.get(miinUrl);
  if (cached && Date.now() < cached.expiry) {
    return NextResponse.redirect(cached.url);
  }

  try {
    const html = await fetch(miinUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    }).then(r => r.text());

    const ogMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/);
    if (ogMatch) {
      const imgUrl = ogMatch[1];
      cache.set(miinUrl, { url: imgUrl, expiry: Date.now() + 86400000 });
      if (cache.size > 200) {
        const oldest = cache.keys().next().value;
        if (oldest) cache.delete(oldest);
      }
      return NextResponse.redirect(imgUrl);
    }

    const imgMatch = html.match(/<img[^>]+id="main-image"[^>]+src="([^"]+)"/);
    if (imgMatch) {
      const imgUrl = imgMatch[1].startsWith("http") ? imgMatch[1] : `https://miin-cosmetics.com${imgMatch[1]}`;
      cache.set(miinUrl, { url: imgUrl, expiry: Date.now() + 86400000 });
      return NextResponse.redirect(imgUrl);
    }

    return NextResponse.json({ error: "No image found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });
  }
}
