import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import probe from 'probe-image-size';
import { UnifiedMangaService } from '@/lib/unified-manga-service';

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

    console.log('[PDF Download] Starting for:', mangaTitle, 'Chapter', chapterNum);

    // Get chapter pages using static method
    const pages = await UnifiedMangaService.getChapterPages(chapterUrl, sourceId);

    if (!pages || pages.length === 0) {
      return NextResponse.json({ error: 'No pages found for this chapter' }, { status: 404 });
    }

    console.log('[PDF Download] Found', pages.length, 'pages');

    // Fetch all images and convert to base64
    const imageData: Array<{ data: string; width: number; height: number }> = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageUrl = page.url;
      console.log(`[PDF Download] Fetching page ${i + 1}/${pages.length}`);

      try {
        // Fetch image through proxy
        const proxyUrl = `${request.nextUrl.origin}/api/image-proxy?url=${encodeURIComponent(pageUrl)}`;
        const imgResponse = await fetch(proxyUrl);

        if (!imgResponse.ok) {
          console.error(`[PDF Download] Failed to fetch page ${i + 1}:`, imgResponse.statusText);
          continue;
        }

        const buffer = await imgResponse.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');

        // Get image dimensions using probe-image-size
        const dimensions = probe.sync(Buffer.from(buffer));

        if (!dimensions) {
          console.error(`[PDF Download] Could not get dimensions for page ${i + 1}`);
          continue;
        }

        imageData.push({
          data: base64,
          width: dimensions.width,
          height: dimensions.height,
        });

        console.log(`[PDF Download] Page ${i + 1}: ${dimensions.width}x${dimensions.height}`);
      } catch (error) {
        console.error(`[PDF Download] Error processing page ${i + 1}:`, error);
        continue;
      }
    }

    if (imageData.length === 0) {
      return NextResponse.json({ error: 'Failed to process any images' }, { status: 500 });
    }

    console.log('[PDF Download] Creating PDF with', imageData.length, 'pages');

    // Create PDF with exact dimensions (no borders)
    try {
      const firstPage = imageData[0];
      const doc = new jsPDF({
        orientation: firstPage.width > firstPage.height ? 'l' : 'p',
        unit: 'px',
        format: [firstPage.width, firstPage.height],
        compress: true,
      });

      // Add first image filling the entire page (no margins)
      doc.addImage(firstPage.data, 'JPEG', 0, 0, firstPage.width, firstPage.height);

      // Add remaining pages
      for (let i = 1; i < imageData.length; i++) {
        const page = imageData[i];
        doc.addPage([page.width, page.height], page.width > page.height ? 'l' : 'p');
        doc.addImage(page.data, 'JPEG', 0, 0, page.width, page.height);
      }

      // Generate PDF buffer
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

      console.log('[PDF Download] PDF generated successfully');

      // Return PDF file
      const safeTitle = mangaTitle.replace(/[^a-zA-Z0-9]/g, '_');
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${safeTitle}_Cap${chapterNum}.pdf"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });
    } catch (pdfError) {
      console.error('[PDF Download] jsPDF Error:', pdfError);
      throw pdfError;
    }
  } catch (error) {
    console.error('[PDF Download] Error:', error);
    if (error instanceof Error) {
      console.error('[PDF Download] Error name:', error.name);
      console.error('[PDF Download] Error message:', error.message);
    }
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
