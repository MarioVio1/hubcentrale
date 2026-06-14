import { NextRequest, NextResponse } from "next/server";

const RATE_LIMIT = 60;
const rateMap = new Map<string, { count: number; reset: number }>();

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (entry && now < entry.reset) {
    if (entry.count >= RATE_LIMIT) {
      return NextResponse.json({ error: "Rate limit" }, { status: 429 });
    }
    entry.count++;
  } else {
    rateMap.set(ip, { count: 1, reset: now + 60000 });
  }

  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "image/webp,image/avif,image/*,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return NextResponse.redirect(
        "data:image/svg+xml," + encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">' +
          '<rect fill="#fce7f3" width="400" height="400"/>' +
          '<text x="200" y="200" text-anchor="middle" fill="#ec4899" font-family="Arial" font-size="14">Immagine non disponibile</text>' +
          "</svg>"
        )
      );
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.redirect(
      "data:image/svg+xml," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">' +
        '<rect fill="#fce7f3" width="400" height="400"/>' +
        '<text x="200" y="200" text-anchor="middle" fill="#ec4899" font-family="Arial" font-size="14">Errore caricamento</text>' +
        "</svg>"
      )
    );
  }
}
