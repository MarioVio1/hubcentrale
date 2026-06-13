/**
 * Proxy Service for external requests
 * This service handles requests to external book sources with caching
 */

const PORT = 3031;

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: any;
  timestamp: number;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

function getCacheKey(url: string): string {
  return Buffer.from(url).toString('base64');
}

function getFromCache(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (req.method !== 'GET') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders,
      });
    }

    const path = url.pathname;

    if (path === '/health') {
      return Response.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        cacheSize: cache.size,
      }, { headers: corsHeaders });
    }

    if (path === '/proxy') {
      const targetUrl = url.searchParams.get('url');
      const useCache = url.searchParams.get('cache') !== 'false';

      if (!targetUrl) {
        return Response.json({ error: 'Missing url parameter' }, {
          status: 400,
          headers: corsHeaders,
        });
      }

      try {
        let html: string;

        // Try cache first
        if (useCache) {
          const cacheKey = getCacheKey(targetUrl);
          const cached = getFromCache(cacheKey);
          if (cached) {
            console.log(`Cache hit for: ${targetUrl}`);
            return new Response(cached, {
              headers: {
                ...corsHeaders,
                'Content-Type': 'text/html; charset=utf-8',
                'X-Cache': 'HIT',
              },
            });
          }
        }

        // Fetch from target
        console.log(`Fetching: ${targetUrl}`);
        const response = await fetchWithTimeout(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        html = await response.text();

        // Cache the result
        if (useCache) {
          const cacheKey = getCacheKey(targetUrl);
          setCache(cacheKey, html);
        }

        return new Response(html, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/html; charset=utf-8',
            'X-Cache': 'MISS',
          },
        });
      } catch (error) {
        console.error('Proxy error:', error);
        return Response.json({
          error: 'Failed to fetch URL',
          message: error instanceof Error ? error.message : 'Unknown error',
        }, {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    return new Response('Not found', {
      status: 404,
      headers: corsHeaders,
    });
  },
});

console.log(`Proxy service running on port ${PORT}`);
