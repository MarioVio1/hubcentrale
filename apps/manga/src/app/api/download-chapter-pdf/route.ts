import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import probe from 'probe-image-size';
import { UnifiedMangaService } from '@/lib/unified-manga-service';

const BATCH_SIZE = 5;

async function fetchImageBatch(
  pages: { url: string; index: number }[],
  origin: string,
): Promise<{ data: string; width: number; height: number }[]> {
  const results: ({ data: string; width: number; height: number } | null)[] = new Array(pages.length).fill(null);

  for (let start = 0; start < pages.length; start += BATCH_SIZE) {
    const end = Math.min(start + BATCH_SIZE, pages.length);
    const batch = pages.slice(start, end);

    const batchResults = await Promise.all(
      batch.map(async (page) => {
        const proxyUrl = `${origin}/api/image-proxy?url=${encodeURIComponent(page.url)}`;
        try {
          const res = await fetch(proxyUrl);
          if (!res.ok) return null;
          const buffer = await res.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const dimensions = probe.sync(Buffer.from(buffer));
          if (!dimensions) return null;
          return { data: base64, width: dimensions.width, height: dimensions.height };
        } catch {
          return null;
        }
      })
    );

    for (let i = 0; i < batchResults.length; i++) {
      results[start + i] = batchResults[i];
    }
  }

  return results.filter((r): r is { data: string; width: number; height: number } => r !== null);
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

    console.log('[PDF Download] Starting for:', mangaTitle, 'Chapter', chapterNum);

    const pages = await UnifiedMangaService.getChapterPages(chapterUrl, sourceId);

    if (!pages || pages.length === 0) {
      return NextResponse.json({ error: 'No pages found for this chapter' }, { status: 404 });
    }

    console.log('[PDF Download] Found', pages.length, 'pages');

    const imageData = await fetchImageBatch(pages, request.nextUrl.origin);

    if (imageData.length === 0) {
      return NextResponse.json({ error: 'Failed to process any images' }, { status: 500 });
    }

    console.log('[PDF Download] Creating PDF with', imageData.length, 'pages');

    const firstPage = imageData[0];
    const doc = new jsPDF({
      orientation: firstPage.width > firstPage.height ? 'l' : 'p',
      unit: 'px',
      format: [firstPage.width, firstPage.height],
      compress: true,
    });

    doc.addImage(firstPage.data, 'JPEG', 0, 0, firstPage.width, firstPage.height);

    for (let i = 1; i < imageData.length; i++) {
      const page = imageData[i];
      doc.addPage([page.width, page.height], page.width > page.height ? 'l' : 'p');
      doc.addImage(page.data, 'JPEG', 0, 0, page.width, page.height);
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    const safeTitle = mangaTitle.replace(/[^a-zA-Z0-9]/g, '_');

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeTitle}_Cap${chapterNum}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('[PDF Download] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
