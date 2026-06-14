import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

const PROXY_PATH = '/api/proxy/embed';
const TIMEOUT_MS = 8000;

const ALLOWED_DOMAINS = [
  '2embed.cc', 'www.2embed.cc',
  'vidsrc.net', 'www.vidsrc.net',
  'vidsrc.to', 'www.vidsrc.to',
  'autoembed.cc', 'www.autoembed.cc',
  'embedsu.com', 'www.embedsu.com',
  'vixsrc.to', 'www.vixsrc.to',
  '2anime.cc', 'www.2anime.cc',
  'voe.sx', 'www.voe.sx',
  'mixdrop.co', 'www.mixdrop.co',
  'streamtape.com', 'www.streamtape.com',
];

const HTML_TYPES = ['text/html', 'application/xhtml+xml', 'text/xml', 'application/xml'];
const JS_TYPES = ['text/javascript', 'application/javascript', 'application/x-javascript', 'text/js'];
const CSS_TYPES = ['text/css'];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

function makeProxyUrl(url: string, baseOrigin: string, proxyOrigin: string): string {
  if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('javascript:') || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) {
    return url;
  }
  if (url.includes(PROXY_PATH + '?url=') || url.startsWith(proxyOrigin + PROXY_PATH)) {
    return url;
  }

  let resolved: string;
  if (url.startsWith('//')) {
    resolved = 'https:' + url;
  } else if (url.startsWith('http://') || url.startsWith('https://')) {
    resolved = url;
  } else if (url.startsWith('/')) {
    resolved = baseOrigin + url;
  } else {
    resolved = baseOrigin + '/' + url;
  }

  return proxyOrigin + PROXY_PATH + '?url=' + encodeURIComponent(resolved);
}

function rewriteHtml(html: string, baseOrigin: string, proxyOrigin: string): string {
  let result = html;

  result = result.replace(/<base\s[^>]*>/gi, '');

  result = result.replace(
    /\s(src|href|action|poster|data-src|data-href|data-url|data-setup|data-lazy-src|data-original|data-background|data-poster|preload)=("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/gi,
    (match, attr, quoteContent) => {
      const url = quoteContent.slice(1, -1);
      const proxied = makeProxyUrl(url, baseOrigin, proxyOrigin);
      if (proxied === url) return match;
      const q = quoteContent[0];
      return ' ' + attr + '=' + q + proxied + q;
    }
  );

  result = result.replace(
    /\ssrcset=("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/gi,
    (match, quoteContent) => {
      const srcset = quoteContent.slice(1, -1);
      const newSrcset = srcset.split(',').map(part => {
        const trimmed = part.trim();
        const [urlPart, ...descPart] = trimmed.split(/\s+/);
        if (!urlPart) return part;
        const proxiedUrl = makeProxyUrl(urlPart, baseOrigin, proxyOrigin);
        if (proxiedUrl === urlPart) return part;
        return ' ' + proxiedUrl + ' ' + descPart.join(' ');
      }).join(',');
      if (newSrcset === srcset) return match;
      const q = quoteContent[0];
      return ' srcset=' + q + newSrcset + q;
    }
  );

  result = result.replace(
    /url\(("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^)]+)\)/gi,
    (match, urlContent) => {
      let url = urlContent;
      const q = url[0];
      if (q === '"' || q === "'") {
        url = url.slice(1, -1);
      }
      url = url.trim();
      if (!url || url.startsWith('data:') || url.startsWith('#') || url.startsWith('http://') || url.startsWith('https://')) {
        return match;
      }
      const resolved = baseOrigin + (url.startsWith('/') ? url : '/' + url);
      if (q === '"' || q === "'") {
        return 'url(' + q + resolved + q + ')';
      }
      return 'url(' + resolved + ')';
    }
  );

  return result;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  const targetUrl = decodeURIComponent(rawUrl);

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const isAllowed = ALLOWED_DOMAINS.some(d =>
    parsedUrl.hostname === d || parsedUrl.hostname.endsWith('.' + d)
  );
  if (!isAllowed) {
    return NextResponse.json({ error: 'Domain not allowed: ' + parsedUrl.hostname }, { status: 403 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': parsedUrl.origin,
        'Sec-Fetch-Dest': 'iframe',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
      },
      redirect: 'follow',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const contentType = response.headers.get('content-type') || '';
    const proxyOrigin = new URL(request.url).origin;
    const baseOrigin = parsedUrl.origin;

    const isHtml = HTML_TYPES.some(t => contentType.startsWith(t));
    const isJs = JS_TYPES.some(t => contentType.startsWith(t));
    const isCss = CSS_TYPES.some(t => contentType.startsWith(t));

    if (isHtml) {
      let html = await response.text();
      html = rewriteHtml(html, baseOrigin, proxyOrigin);

      return new NextResponse(html, {
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'X-Proxy': 'multimedia',
          'X-Robots-Tag': 'noindex',
        },
      });
    }

    if (isJs) {
      let js = await response.text();

      js = js.replace(
        /(?:location\.(?:href|origin)|document\.(?:location|domain|URL)|window\.location\.href)\s*(?:=|\|\||&&)/gi,
        ''
      );

      return new NextResponse(js, {
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'X-Proxy': 'multimedia',
        },
      });
    }

    if (isCss) {
      let css = await response.text();
      css = css.replace(/url\((['"]?)([^'")\s]+)\1\)/gi, (_m, q, u) => {
        const proxied = makeProxyUrl(u, baseOrigin, proxyOrigin);
        if (proxied === u) return _m;
        return 'url(' + q + proxied + q + ')';
      });

      return new NextResponse(css, {
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'X-Proxy': 'multimedia',
        },
      });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'X-Proxy': 'multimedia',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Proxy timeout' }, { status: 504 });
    }
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
