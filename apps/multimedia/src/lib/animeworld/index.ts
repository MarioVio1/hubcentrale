import * as cheerio from 'cheerio';
import { getVixCloudStream, extractSubs } from './utils';

const BASE_URL = 'https://www.animeworld.so';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export interface AnimeResult {
  title: string;
  poster: string | null;
  url: string;
  type: string;
  episodes?: number;
}

export interface Episode {
  number: number;
  url: string;
  title?: string;
}

export interface Stream {
  url: string;
  quality: string;
  provider: string;
  subtitles?: Array<{ lang: string; url: string }>;
}

// Search for anime
export async function search(query: string): Promise<AnimeResult[]> {
  try {
    const res = await fetch(`${BASE_URL}/search?keyword=${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    const results: AnimeResult[] = [];

    $('.film-list .item, .anime-list .item, .items .item').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.name, .title').text().trim() || $el.find('a').attr('title') || '';
      const poster = $el.find('img').attr('src') || $el.find('img').attr('data-src') || null;
      const href = $el.find('a').attr('href') || '';
      const type = $el.find('.type, .status').text().trim() || 'TV';
      
      // Extract episode count if available
      const epText = $el.find('.episodes, .ep').text();
      const epMatch = epText.match(/(\d+)/);
      const episodes = epMatch ? parseInt(epMatch[1]) : undefined;

      if (title && href) {
        results.push({
          title,
          poster: poster ? (poster.startsWith('//') ? 'https:' + poster : poster) : null,
          url: href.startsWith('http') ? href : BASE_URL + href,
          type,
          episodes,
        });
      }
    });

    console.log(`[AnimeWorld] Found ${results.length} results for "${query}"`);
    return results;
  } catch (error) {
    console.error('[AnimeWorld] Search error:', error);
    return [];
  }
}

// Get episodes for an anime
export async function getEpisodes(animeUrl: string): Promise<Episode[]> {
  try {
    const res = await fetch(animeUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    const episodes: Episode[] = [];

    // Try multiple selectors for episode lists
    const selectors = [
      '.episode-list .episode',
      '.episodes-list .episode',
      '.server-list .server',
      '.ep-list a',
      'ul.episodes li a',
      '.list-episodes a',
    ];

    for (const selector of selectors) {
      const found = $(selector);
      if (found.length > 0) {
        found.each((i, el) => {
          const $el = $(el);
          const href = $el.attr('href') || '';
          const text = $el.text().trim();
          
          // Extract episode number
          const numMatch = text.match(/(\d+)/) || href.match(/ep(?:isode)?[-_]?(\d+)/i);
          const number = numMatch ? parseInt(numMatch[1]) : episodes.length + 1;

          if (href) {
            episodes.push({
              number,
              url: href.startsWith('http') ? href : BASE_URL + href,
              title: text,
            });
          }
        });

        if (episodes.length > 0) break;
      }
    }

    // Sort by episode number
    episodes.sort((a, b) => a.number - b.number);
    
    console.log(`[AnimeWorld] Found ${episodes.length} episodes`);
    return episodes;
  } catch (error) {
    console.error('[AnimeWorld] getEpisodes error:', error);
    return [];
  }
}

// Get streams for an episode
export async function getStreams(episodeUrl: string): Promise<Stream[]> {
  try {
    const res = await fetch(episodeUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': BASE_URL,
      },
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    const streams: Stream[] = [];

    // Look for iframe players
    const iframeSelectors = [
      'iframe[src*="vixcloud"]',
      'iframe[src*="streaming"]',
      'iframe[src*="player"]',
      'iframe',
    ];

    for (const selector of iframeSelectors) {
      const iframe = $(selector).first();
      const iframeSrc = iframe.attr('src');
      
      if (iframeSrc) {
        let fullUrl = iframeSrc;
        if (iframeSrc.startsWith('//')) {
          fullUrl = 'https:' + iframeSrc;
        } else if (!iframeSrc.startsWith('http')) {
          fullUrl = BASE_URL + iframeSrc;
        }

        console.log(`[AnimeWorld] Found iframe: ${fullUrl}`);

        // Try to extract m3u8 from the player
        const m3u8 = await getVixCloudStream(fullUrl);
        
        if (m3u8) {
          streams.push({
            url: m3u8,
            quality: '1080p',
            provider: 'AnimeWorld',
            subtitles: extractSubs($),
          });
          break; // Found working stream
        }
      }
    }

    // Also check for direct video sources in the page
    const scripts = $('script').toArray();
    for (const script of scripts) {
      const content = $(script).html() || '';
      
      // Look for direct m3u8 URLs
      const m3u8Match = content.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i);
      if (m3u8Match && m3u8Match[1]) {
        const url = m3u8Match[1].replace(/\\\//g, '/');
        
        // Avoid duplicates
        if (!streams.some(s => s.url === url)) {
          streams.push({
            url,
            quality: '1080p',
            provider: 'AnimeWorld',
          });
        }
      }
    }

    console.log(`[AnimeWorld] Found ${streams.length} streams`);
    return streams;
  } catch (error) {
    console.error('[AnimeWorld] getStreams error:', error);
    return [];
  }
}

// Get anime info by URL
export async function getAnimeInfo(animeUrl: string): Promise<{
  title: string;
  poster: string | null;
  description: string;
  episodes: Episode[];
} | null> {
  try {
    const res = await fetch(animeUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $('h1, .title, .anime-title').first().text().trim();
    const poster = $('img.poster, .poster img, .cover img').attr('src') || 
                   $('.anime-poster img').attr('src') || null;
    const description = $('.description, .synopsis, .anime-desc').text().trim();

    const episodes = await getEpisodes(animeUrl);

    return {
      title,
      poster: poster ? (poster.startsWith('//') ? 'https:' + poster : poster) : null,
      description,
      episodes,
    };
  } catch (error) {
    console.error('[AnimeWorld] getAnimeInfo error:', error);
    return null;
  }
}
