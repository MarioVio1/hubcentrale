import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "LiveTV Unified API",
    version: "1.0.0",
    endpoints: {
      "/api/categories": "Get all categories",
      "/api/channels": "Get all channels (paginated, filterable)",
      "/api/channels/:id": "Get single channel",
      "/api/m3u": "M3U aggregation service (Daznfit)",
      "/api/proxy/generate": "Generate proxied stream URL",
      "/api/channel/status": "Check channel online status",
      "/api/dirette": "Live sports events scraper",
      "/api/sportsonline-feed": "Sportsonline live events",
      "/api/sportsonline-247": "Sportsonline 24/7 channels",
      "/api/tv-channels": "TV channels list",
      "/api/iptvitaplus": "IPTV Italia Plus channels",
    }
  });
}
