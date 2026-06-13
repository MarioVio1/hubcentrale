import EPub from 'epubjs';

export interface EpubMetadata {
  title?: string;
  author?: string;
  description?: string;
  publisher?: string;
  language?: string;
}

export async function extractMetadata(filePath: string): Promise<EpubMetadata> {
  try {
    const book = EPub(filePath);

    await new Promise<void>((resolve, reject) => {
      book.ready
        .then(() => resolve())
        .catch((err) => reject(err));
    });

    const metadata: EpubMetadata = {};

    // Extract title
    if (book.packageMetadata) {
      metadata.title = book.packageMetadata.title;
    }

    // Extract creator (author)
    if (book.packageMetadata?.creator) {
      const creators = Array.isArray(book.packageMetadata.creator)
        ? book.packageMetadata.creator
        : [book.packageMetadata.creator];

      metadata.author = creators
        .map((c: any) => c['@_text'] || c)
        .join(', ');
    }

    // Extract description
    if (book.packageMetadata?.description) {
      const descriptions = Array.isArray(book.packageMetadata.description)
        ? book.packageMetadata.description
        : [book.packageMetadata.description];

      metadata.description = descriptions
        .map((d: any) => d['@_text'] || d)
        .join('\n\n');
    }

    // Extract publisher
    if (book.packageMetadata?.publisher) {
      const publishers = Array.isArray(book.packageMetadata.publisher)
        ? book.packageMetadata.publisher
        : [book.packageMetadata.publisher];

      metadata.publisher = publishers
        .map((p: any) => p['@_text'] || p)
        .join(', ');
    }

    // Extract language
    if (book.packageMetadata?.language) {
      metadata.language = book.packageMetadata.language;
    }

    return metadata;
  } catch (error) {
    console.error('Error extracting EPUB metadata:', error);
    return {};
  }
}

export function getEpubCoverUrl(bookId: string): string {
  return `/api/books/${bookId}/cover`;
}

export function getEpubFileUrl(bookId: string): string {
  return `/api/books/${bookId}/file`;
}
