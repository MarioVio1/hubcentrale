import { chromium, Browser, Page, BrowserContext, Request } from 'playwright';

const PORT = 3002;
const PROXY_URL = 'https://hushed-brett-annualetesina-2b360535.koyeb.app';

let browser: Browser | null = null;

async function initBrowser() {
  if (!browser) {
    console.log('[Extractor] Launching browser...');
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--dns-prefetch-disable',
      ]
    });
    console.log('[Extractor] Browser launched');
  }
  return browser;
}

interface ExtractedStream {
  url: string;
  quality?: string;
  source: string;
}

async function extractM3U8(embedUrl: string): Promise<ExtractedStream[]> {
  const streams: ExtractedStream[] = [];
  const m3u8Urls = new Set<string>();
  
  console.log('[Extractor] Extracting from:', embedUrl);
  
  try {
    const browser = await initBrowser();
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      // Use proxy for all requests
      proxy: {
        server: `http://${PROXY_URL.replace('https://', '')}`
      }
    });

    const page = await context.newPage();
    
    // Intercept all network requests
    page.on('request', (request: Request) => {
      const url = request.url();
      
      // Look for m3u8 URLs
      if (url.includes('.m3u8') || url.includes('m3u8') || url.includes('playlist') || url.includes('master')) {
        if (!m3u8Urls.has(url)) {
          m3u8Urls.add(url);
          console.log('[Extractor] Found m3u8:', url.substring(0, 100));
          
          let quality = 'HD';
          if (url.includes('1080')) quality = '1080p';
          else if (url.includes('720')) quality = '720p';
          else if (url.includes('480')) quality = '480p';
          else if (url.includes('360')) quality = '360p';
          
          streams.push({
            url,
            quality,
            source: new URL(embedUrl).hostname
          });
        }
      }
    });

    console.log('[Extractor] Navigating to page...');
    
    await page.goto(embedUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    // Wait for video element
    try {
      await page.waitForSelector('video', { timeout: 10000 });
      console.log('[Extractor] Video element found');
      
      // Try to click play
      const playButton = await page.$('.play-button, [class*="play"], button[aria-label*="play"], .vjs-big-play-button');
      if (playButton) {
        await playButton.click().catch(() => {});
        console.log('[Extractor] Clicked play button');
      }
      
      await page.waitForTimeout(5000);
      
      // Check video src
      const videoSrc = await page.$eval('video', (v: HTMLVideoElement) => v.src || v.currentSrc).catch(() => null);
      if (videoSrc && videoSrc.includes('m3u8') && !m3u8Urls.has(videoSrc)) {
        m3u8Urls.add(videoSrc);
        streams.push({
          url: videoSrc,
          quality: 'HD',
          source: new URL(embedUrl).hostname
        });
      }
      
    } catch (e) {
      console.log('[Extractor] Waiting for network requests...');
      await page.waitForTimeout(10000);
    }

    await page.close();
    await context.close();
    
  } catch (error) {
    console.error('[Extractor] Error:', error);
  }
  
  console.log(`[Extractor] Found ${streams.length} streams`);
  return streams;
}

// HTTP Server
const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    
    // CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }
    
    // Health check
    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', browser: browser ? 'running' : 'not started' });
    }
    
    // Extract endpoint
    if (url.pathname === '/extract') {
      const embedUrl = url.searchParams.get('url');
      
      if (!embedUrl) {
        return Response.json({ error: 'Missing url parameter' }, { status: 400 });
      }
      
      try {
        const streams = await extractM3U8(embedUrl);
        
        return Response.json({
          success: streams.length > 0,
          url: embedUrl,
          streams,
          count: streams.length
        });
      } catch (error) {
        return Response.json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          streams: []
        });
      }
    }
    
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
});

console.log(`[Extractor] Server running on http://localhost:${PORT}`);

// Cleanup on exit
process.on('exit', async () => {
  if (browser) {
    await browser.close();
  }
});
