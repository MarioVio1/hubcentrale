import * as cheerio from 'cheerio';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Decode VixCloud URL to get m3u8
export async function getVixCloudStream(iframeUrl: string): Promise<string | null> {
  try {
    const res = await fetch(iframeUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': 'https://www.animeworld.so/',
      },
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    // Look for m3u8 URL in script tags
    const scripts = $('script').toArray();
    
    for (const script of scripts) {
      const content = $(script).html() || '';
      
      // Common patterns for m3u8 URLs
      const patterns = [
        /file\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i,
        /source\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i,
        /["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i,
        /url\s*:\s*["']([^"']+\.m3u8[^"']*)["']/i,
      ];

      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          let m3u8Url = match[1];
          
          // Handle escaped characters
          m3u8Url = m3u8Url.replace(/\\\//g, '/').replace(/\\"/g, '"');
          
          if (m3u8Url.startsWith('//')) {
            m3u8Url = 'https:' + m3u8Url;
          }
          
          return m3u8Url;
        }
      }
    }

    // Check for source in window.sources or similar
    const windowPatterns = [
      /window\s*\.\s*sources?\s*=\s*(\[[\s\S]*?\])/i,
      /const\s+sources?\s*=\s*(\[[\s\S]*?\])/i,
      /var\s+sources?\s*=\s*(\[[\s\S]*?\])/i,
    ];

    for (const script of scripts) {
      const content = $(script).html() || '';
      
      for (const pattern of windowPatterns) {
        const match = content.match(pattern);
        if (match && match[1]) {
          try {
            // Try to parse the sources array
            const sourcesStr = match[1]
              .replace(/'/g, '"')
              .replace(/,\s*]/g, ']');
            
            const sources = JSON.parse(sourcesStr);
            
            if (Array.isArray(sources)) {
              for (const source of sources) {
                if (typeof source === 'string' && source.includes('.m3u8')) {
                  return source;
                }
                if (source.file && source.file.includes('.m3u8')) {
                  return source.file;
                }
                if (source.url && source.url.includes('.m3u8')) {
                  return source.url;
                }
              }
            }
          } catch {
            // Try to find m3u8 directly in the matched string
            const m3u8Match = match[1].match(/https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/);
            if (m3u8Match) {
              return m3u8Match[0];
            }
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('[VixCloud] Error:', error);
    return null;
  }
}

// Extract subtitles from page
export function extractSubs($: cheerio.CheerioAPI): Array<{ lang: string; url: string }> {
  const subs: Array<{ lang: string; url: string }> = [];
  
  $('track').each((_, el) => {
    const src = $(el).attr('src');
    const label = $(el).attr('label') || $(el).attr('srclang') || 'Unknown';
    if (src) {
      subs.push({ lang: label, url: src });
    }
  });

  return subs;
}
