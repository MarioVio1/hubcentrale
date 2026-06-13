export interface Book {
  id: string
  title: string
  author: string
  description?: string
  coverPath?: string
  filePath: string
  fileType: 'epub' | 'pdf'
  fileSize: number
  totalPages?: number
  category: 'reading' | 'completed' | 'wishlist'
  addedAt: string
  updatedAt: string
  progress?: ReadingProgress
}

export interface ReadingProgress {
  id: string
  bookId: string
  currentPage: number
  totalPages?: number
  percentage: number
  cfi?: string
  lastPosition?: string
  lastReadAt: string
}

export interface Bookmark {
  id: string
  bookId: string
  title: string
  cfi?: string
  pageNumber?: number
  note?: string
  createdAt: string
}

export interface Highlight {
  id: string
  bookId: string
  text: string
  cfi?: string
  color: string
  note?: string
  createdAt: string
}
