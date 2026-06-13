import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * API per importare una biblioteca da JSON
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data || !data.books || !Array.isArray(data.books)) {
      return NextResponse.json(
        { error: 'Invalid import data format' },
        { status: 400 }
      );
    }

    let importedBooks = 0;
    let importedCollections = 0;
    const errors: string[] = [];

    // Import collections first
    if (data.collections && Array.isArray(data.collections)) {
      for (const collection of data.collections) {
        try {
          // Check if collection already exists
          const existing = await db.collection.findFirst({
            where: { name: collection.name }
          });

          if (!existing) {
            await db.collection.create({
              data: {
                name: collection.name,
                description: collection.description,
                color: collection.color
              }
            });
            importedCollections++;
          }
        } catch (error) {
          errors.push(`Failed to import collection "${collection.name}"`);
          console.error('Error importing collection:', error);
        }
      }
    }

    // Import books
    for (const bookData of data.books) {
      try {
        // Check if book already exists (by title and author)
        const existing = await db.book.findFirst({
          where: {
            title: bookData.title,
            author: bookData.author
          }
        });

        if (existing) {
          // Update existing book
          await db.book.update({
            where: { id: existing.id },
            data: {
              description: bookData.description,
              category: bookData.category
            }
          });

          // Import bookmarks
          if (bookData.bookmarks && Array.isArray(bookData.bookmarks)) {
            for (const bookmark of bookData.bookmarks) {
              try {
                await db.bookmark.create({
                  data: {
                    bookId: existing.id,
                    title: bookmark.title,
                    cfi: bookmark.cfi,
                    note: bookmark.note
                  }
                });
              } catch (error) {
                // Bookmark might already exist, skip
              }
            }
          }

          // Import highlights
          if (bookData.highlights && Array.isArray(bookData.highlights)) {
            for (const highlight of bookData.highlights) {
              try {
                await db.highlight.create({
                  data: {
                    bookId: existing.id,
                    text: highlight.text,
                    cfi: highlight.cfi,
                    color: highlight.color,
                    note: highlight.note
                  }
                });
              } catch (error) {
                // Highlight might already exist, skip
              }
            }
          }

          // Import rating
          if (bookData.rating && !existing.rating) {
            try {
              await db.bookRating.create({
                data: {
                  bookId: existing.id,
                  rating: bookData.rating.rating,
                  review: bookData.rating.review
                }
              });
            } catch (error) {
              // Rating might already exist, skip
            }
          }
        } else {
          // For new books, we only import metadata (not files)
          // User would need to re-upload the actual files
          const newBook = await db.book.create({
            data: {
              title: bookData.title,
              author: bookData.author,
              description: bookData.description,
              fileType: bookData.fileType || 'epub',
              category: bookData.category,
              totalPages: bookData.totalPages,
              filePath: '', // Empty - user needs to upload file
              fileSize: 0
            }
          });

          // Import bookmarks
          if (bookData.bookmarks && Array.isArray(bookData.bookmarks)) {
            for (const bookmark of bookData.bookmarks) {
              await db.bookmark.create({
                data: {
                  bookId: newBook.id,
                  title: bookmark.title,
                  cfi: bookmark.cfi,
                  note: bookmark.note
                }
              });
            }
          }

          // Import highlights
          if (bookData.highlights && Array.isArray(bookData.highlights)) {
            for (const highlight of bookData.highlights) {
              await db.highlight.create({
                data: {
                  bookId: newBook.id,
                  text: highlight.text,
                  cfi: highlight.cfi,
                  color: highlight.color,
                  note: highlight.note
                }
              });
            }
          }

          // Import rating
          if (bookData.rating) {
            await db.bookRating.create({
              data: {
                bookId: newBook.id,
                rating: bookData.rating.rating,
                review: bookData.rating.review
              }
            });
          }
        }

        // Add to collections
        if (bookData.collections && Array.isArray(bookData.collections)) {
          for (const collectionName of bookData.collections) {
            try {
              const collection = await db.collection.findFirst({
                where: { name: collectionName }
              });

              if (collection) {
                await db.bookCollection.create({
                  data: {
                    bookId: existing ? existing.id : (await db.book.findFirst({
                      where: { title: bookData.title, author: bookData.author }
                  }))?.id || '',
                    collectionId: collection.id
                  }
                });
              }
            } catch (error) {
              // Book might already be in collection, skip
            }
          }
        }

        importedBooks++;
      } catch (error) {
        errors.push(`Failed to import book "${bookData.title}"`);
        console.error('Error importing book:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Import completed',
      summary: {
        importedBooks,
        importedCollections,
        errors: errors.length,
        errorDetails: errors
      }
    });
  } catch (error) {
    console.error('Error importing library:', error);
    return NextResponse.json(
      {
        error: 'Failed to import library',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
