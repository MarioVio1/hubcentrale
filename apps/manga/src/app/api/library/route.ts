import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all library entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: any = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    const library = await db.libraryEntry.findMany({
      where,
      include: {
        manga: {
          include: {
            chapters: {
              where: { read: false },
              take: 1,
              orderBy: { chapterNum: 'asc' },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(library);
  } catch (error) {
    console.error('Error fetching library:', error);
    return NextResponse.json(
      { error: 'Failed to fetch library' },
      { status: 500 }
    );
  }
}

// POST add manga to library
export async function POST(request: NextRequest) {
  try {
    console.log('[Library] POST request received');

    const body = await request.json();
    console.log('[Library] Request body:', JSON.stringify(body, null, 2));

    const { mangaData } = body;

    if (!mangaData) {
      console.log('[Library] ERROR: mangaData is missing');
      return NextResponse.json(
        { error: 'Manga data is required' },
        { status: 400 }
      );
    }

    console.log('[Library] mangaData received:', {
      title: mangaData.title,
      url: mangaData.url,
      sourceUrl: mangaData.sourceUrl,
      extensionId: mangaData.extensionId,
      sourceId: mangaData.sourceId,
    });

    // Build the data for creating/updating manga
    // We use a combination of extensionId, sourceId, and url as the unique identifier
    const extensionId = mangaData.extensionId || null;
    const sourceId = mangaData.sourceId || mangaData.sourceId || 'default';
    const url = mangaData.url || mangaData.sourceUrl;

    if (!url) {
      console.log('[Library] ERROR: url is missing');
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // For mangas without a valid extensionId, we need to find or create one
    let finalExtensionId = extensionId;

    if (!finalExtensionId) {
      // Try to find a default extension for this language/source
      const defaultExtension = await db.extension.findFirst({
        where: {
          enabled: true,
          lang: 'it', // Default to Italian
        },
      });

      if (!defaultExtension) {
        console.log('[Library] ERROR: No valid extension found');
        return NextResponse.json(
          { error: 'No valid extension found' },
          { status: 400 }
        );
      }

      finalExtensionId = defaultExtension.id;
      console.log('[Library] Using default extension:', defaultExtension.id);
    } else {
      // Check if the provided extensionId exists
      const existingExtension = await db.extension.findUnique({
        where: { id: finalExtensionId },
      });

      if (!existingExtension) {
        console.log('[Library] Extension not found in DB, searching for alternative...');
        // Try to find an extension by name or use a default
        const altExtension = await db.extension.findFirst({
          where: {
            enabled: true,
            lang: 'it',
          },
        });

        if (altExtension) {
          finalExtensionId = altExtension.id;
          console.log('[Library] Using alternative extension:', altExtension.id, '-', altExtension.name);
        } else {
          console.log('[Library] ERROR: No valid extension found');
          return NextResponse.json(
            { error: 'No valid extension found' },
            { status: 400 }
          );
        }
      } else {
        console.log('[Library] Extension exists:', existingExtension.id, '-', existingExtension.name);
      }
    }

    // Check if manga exists in DB by extensionId, sourceId, and url
    let finalMangaId: string;
    const existingManga = await db.manga.findFirst({
      where: {
        extensionId: finalExtensionId,
        sourceId: sourceId,
        url: url,
      },
    });

    if (existingManga) {
      finalMangaId = existingManga.id;
      console.log('[Library] Found existing manga:', existingManga.id, '-', existingManga.title);

      // Check if already in library
      const existingEntry = await db.libraryEntry.findUnique({
        where: { mangaId: finalMangaId },
      });

      if (existingEntry) {
        console.log('[Library] Manga already in library');
        return NextResponse.json({
          success: true,
          message: 'Already in library',
          manga: existingManga,
          libraryEntry: existingEntry,
        });
      }
    } else {
      // Create the manga first
      const createdManga = await db.manga.create({
        data: {
          title: mangaData.title,
          thumbnailUrl: mangaData.thumbnailUrl || mangaData.coverUrl || null,
          description: mangaData.description || null,
          url: url,
          extensionId: finalExtensionId,
          sourceId: sourceId,
          author: mangaData.author || null,
          artist: mangaData.artist || null,
          status: mangaData.status || null,
          genre: Array.isArray(mangaData.genre) || Array.isArray(mangaData.genres)
            ? JSON.stringify(mangaData.genre || mangaData.genres)
            : (mangaData.genre || mangaData.genres || null),
          inLibrary: true,
        },
      });
      finalMangaId = createdManga.id;
      console.log('[Library] Created manga:', createdManga.id, '-', createdManga.title);
    }

    // Create library entry
    const libraryEntry = await db.libraryEntry.create({
      data: {
        mangaId: finalMangaId,
        category: 'all',
      },
    });

    // Update manga inLibrary flag
    await db.manga.update({
      where: { id: finalMangaId },
      data: { inLibrary: true },
    });

    console.log('[Library] Added to library successfully');
    return NextResponse.json({
      success: true,
      message: 'Added to library',
      mangaId: finalMangaId,
      libraryEntry,
    });

  } catch (error) {
    console.error('[Library] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE remove manga from library
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mangaId = searchParams.get('mangaId');

    if (!mangaId) {
      return NextResponse.json(
        { error: 'Manga ID is required' },
        { status: 400 }
      );
    }

    await db.libraryEntry.delete({
      where: { mangaId },
    });

    // Update manga inLibrary flag
    await db.manga.update({
      where: { id: mangaId },
      data: { inLibrary: false, category: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from library:', error);
    return NextResponse.json(
      { error: 'Failed to remove from library' },
      { status: 500 }
    );
  }
}
