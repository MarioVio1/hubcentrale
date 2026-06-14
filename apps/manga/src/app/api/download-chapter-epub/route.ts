import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { UnifiedMangaService } from '@/lib/unified-manga-service';

const BATCH_SIZE = 5;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchAllImages(
  pages: { url: string; index: number }[],
  origin: string,
): Promise<{ fileName: string; buffer: ArrayBuffer }[]> {
  const results: ({ fileName: string; buffer: ArrayBuffer } | null)[] = new Array(pages.length).fill(null);

  for (let start = 0; start < pages.length; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE, pages.length);
    const batch = pages.slice(start, end);

    const batchResults = await Promise.all(
      batch.map(async (page, idx) => {
        const proxyUrl = `${origin}/api/image-proxy?url=${encodeURIComponent(page.url)}`;
        try {
          const res = await fetch(proxyUrl);
          if (!res.ok) return null;
          const buffer = await res.arrayBuffer();
          return { fileName: `page${start + idx + 1}.jpg`, buffer };
        } catch {
          return null;
        }
      })
    );

    for (let i = 0; i < batchResults.length; i++) {
      results[start + i] = batchResults[i];
    }
  }

  return results.filter((r): r is { fileName: string; buffer: ArrayBuffer } => r !== null);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const chapterUrl = searchParams.get('chapterUrl');
    const sourceId = searchParams.get('sourceId') || 'mangaworld';
    const mangaTitle = searchParams.get('mangaTitle') || 'Manga';
    const chapterNum = searchParams.get('chapterNum') || '1';

    if (!chapterUrl) {
      return NextResponse.json({ error: 'Missing chapterUrl parameter' }, { status: 400 });
    }

    console.log('[EPUB Download] Starting for:', mangaTitle, 'Chapter', chapterNum);

    const pages = await UnifiedMangaService.getChapterPages(chapterUrl, sourceId);

    if (!pages || pages.length === 0) {
      return NextResponse.json({ error: 'No pages found for this chapter' }, { status: 404 });
    }

    console.log('[EPUB Download] Found', pages.length, 'pages');

    const zip = new JSZip();
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    const metaInf = zip.folder('META-INF');
    if (metaInf) {
      metaInf.file('container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);
    }

    const oebps = zip.folder('OEBPS');
    if (!oebps) {
      return NextResponse.json({ error: 'Failed to create OEBPS directory' }, { status: 500 });
    }

    const images = oebps.folder('images');

    const imageFiles = await fetchAllImages(pages, request.nextUrl.origin);

    if (imageFiles.length === 0) {
      return NextResponse.json({ error: 'Failed to process any images' }, { status: 500 });
    }

    for (const { fileName, buffer } of imageFiles) {
      if (images) images.file(fileName, buffer);
    }

    const uniqueId = `manga-${Date.now()}`;
    const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">${uniqueId}</dc:identifier>
    <dc:title>${escapeXml(mangaTitle)} - Capitolo ${chapterNum}</dc:title>
    <dc:language>it</dc:language>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
${imageFiles.map((f, idx) => `    <item id="image${idx}" href="images/${f.fileName}" media-type="image/jpeg"/>`).join('\n')}
  </manifest>
  <spine>
${imageFiles.map((_, idx) => `    <itemref idref="image${idx}"/>`).join('\n')}
  </spine>
</package>`;

    oebps.file('content.opf', contentOpf);

    const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2.0">
  <head>
    <meta name="dtb:uid" content="${uniqueId}"/>
  </head>
  <docTitle>
    <text>${escapeXml(mangaTitle)} - Capitolo ${chapterNum}</text>
  </docTitle>
  <navMap>
${imageFiles.map((f, idx) => `    <navPoint id="navpoint-${idx}" playOrder="${idx + 1}">
      <navLabel>
        <text>Pagina ${idx + 1}</text>
      </navLabel>
      <content src="images/${f.fileName}"/>
    </navPoint>`).join('\n')}
  </navMap>
</ncx>`;

    oebps.file('toc.ncx', tocNcx);

    const epubBuffer = await zip.generateAsync({ type: 'arraybuffer' });

    return new NextResponse(Buffer.from(epubBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/epub+zip',
        'Content-Disposition': `attachment; filename="${mangaTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Cap${chapterNum}.epub"`,
        'Content-Length': Buffer.from(epubBuffer).length.toString(),
      },
    });
  } catch (error) {
    console.error('[EPUB Download] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate EPUB', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
