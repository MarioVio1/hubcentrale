import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { UnifiedMangaService } from '@manga/lib/unified-manga-service';

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

    // Get chapter pages
    const service = UnifiedMangaService.getInstance();
    const pages = await service.getChapterPages(chapterUrl, sourceId);

    if (!pages || pages.length === 0) {
      return NextResponse.json({ error: 'No pages found for this chapter' }, { status: 404 });
    }

    console.log('[EPUB Download] Found', pages.length, 'pages');

    // Create new ZIP archive
    const zip = new JSZip();

    // 1. Add mimetype (must be first and uncompressed)
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    // 2. Create META-INF directory and container.xml
    const metaInf = zip.folder('META-INF');
    if (metaInf) {
      metaInf.file('container.xml', `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);
    }

    // 3. Create OEBPS directory and files
    const oebps = zip.folder('OEBPS');
    if (!oebps) {
      return NextResponse.json({ error: 'Failed to create OEBPS directory' }, { status: 500 });
    }

    // Create images directory
    const images = oebps.folder('images');

    // Fetch all pages and add to EPUB
    let totalSize = 0;
    const imageFiles: string[] = [];

    for (let i = 0; i < pages.length; i++) {
      const pageUrl = pages[i];
      console.log(`[EPUB Download] Fetching page ${i + 1}/${pages.length}`);

      try {
        // Fetch image through proxy
        const proxyUrl = `${request.nextUrl.origin}/api/image-proxy?url=${encodeURIComponent(pageUrl)}`;
        const imgResponse = await fetch(proxyUrl);

        if (!imgResponse.ok) {
          console.error(`[EPUB Download] Failed to fetch page ${i + 1}:`, imgResponse.statusText);
          continue;
        }

        const buffer = await imgResponse.arrayBuffer();
        const fileName = `page${i + 1}.jpg`;

        if (images) {
          images.file(fileName, buffer);
        }

        totalSize += buffer.byteLength;
        imageFiles.push(fileName);

        console.log(`[EPUB Download] Page ${i + 1}: ${buffer.byteLength} bytes`);
      } catch (error) {
        console.error(`[EPUB Download] Error processing page ${i + 1}:`, error);
        continue;
      }
    }

    if (imageFiles.length === 0) {
      return NextResponse.json({ error: 'Failed to process any images' }, { status: 500 });
    }

    console.log('[EPUB Download] Total size:', totalSize, 'bytes');

    // 4. Create content.opf (metadata)
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
${imageFiles.map((file, idx) => `    <item id="image${idx}" href="images/${file}" media-type="image/jpeg"/>`).join('\n')}
  </manifest>
  <spine>
${imageFiles.map((file, idx) => `    <itemref idref="image${idx}"/>`).join('\n')}
  </spine>
</package>`;

    oebps.file('content.opf', contentOpf);

    // 5. Create toc.ncx (table of contents)
    const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2.0">
  <head>
    <meta name="dtb:uid" content="${uniqueId}"/>
  </head>
  <docTitle>
    <text>${escapeXml(mangaTitle)} - Capitolo ${chapterNum}</text>
  </docTitle>
  <navMap>
${imageFiles.map((file, idx) => `    <navPoint id="navpoint-${idx}" playOrder="${idx + 1}">
      <navLabel>
        <text>Pagina ${idx + 1}</text>
      </navLabel>
      <content src="images/${file}"/>
    </navPoint>`).join('\n')}
  </navMap>
</ncx>`;

    oebps.file('toc.ncx', tocNcx);

    console.log('[EPUB Download] Generating EPUB file...');

    // Generate EPUB buffer
    const epubBuffer = await zip.generateAsync({ type: 'arraybuffer' });

    console.log('[EPUB Download] EPUB generated successfully');

    // Return EPUB file
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

// Helper function to escape XML special characters
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
