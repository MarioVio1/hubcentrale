'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Settings, Bookmark, BookOpen, Maximize2, Sun, Moon, ZoomIn, ZoomOut, Highlighter } from 'lucide-react'
import { Book, ReadingProgress } from '@libri/types/book'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'

export default function ReaderPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params.id as string

  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [fontSize, setFontSize] = useState(18)
  const [progress, setProgress] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [currentLocation, setCurrentLocation] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [highlights, setHighlights] = useState<any[]>([])

  const viewerRef = useRef<HTMLDivElement>(null)
  const renditionRef = useRef<any>(null)
  const bookRef = useRef<any>(null)

  // Fetch book data
  useEffect(() => {
    fetchBook()
    fetchBookmarks()
    fetchHighlights()
  }, [bookId])

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${bookId}`)
      const data = await response.json()
      if (data.book) {
        setBook(data.book)
        if (data.book.progress) {
          setProgress(data.book.progress.percentage)
          setCurrentLocation(data.book.progress.cfi || '')
        }
      }
    } catch (error) {
      console.error('Error fetching book:', error)
      toast.error('Failed to load book')
    } finally {
      setLoading(false)
    }
  }

  const fetchBookmarks = async () => {
    try {
      const response = await fetch(`/api/bookmarks?bookId=${bookId}`)
      const data = await response.json()
      if (data.bookmarks) {
        setBookmarks(data.bookmarks)
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    }
  }

  const fetchHighlights = async () => {
    try {
      const response = await fetch(`/api/highlights?bookId=${bookId}`)
      const data = await response.json()
      if (data.highlights) {
        setHighlights(data.highlights)
      }
    } catch (error) {
      console.error('Error fetching highlights:', error)
    }
  }

  // Initialize EPUB reader
  useEffect(() => {
    if (!book || book.fileType !== 'epub' || !viewerRef.current) return

    const initEPUB = async () => {
      try {
        const EPub = (await import('epubjs')).default

        // Load the book
        const epubBook = EPub(book.filePath)
        bookRef.current = epubBook

        // Create rendition
        const rendition = epubBook.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          spread: 'none',
        })
        renditionRef.current = rendition

        // Apply theme
        rendition.themes.default({
          body: {
            color: darkMode ? '#e5e5e5' : '#1a1a1a',
            background: darkMode ? '#1a1a1a' : '#ffffff',
          },
          p: {
            'font-size': `${fontSize}px`,
            'line-height': '1.6',
          },
        })

        // Display book
        await rendition.display()

        // Track location changes
        rendition.on('locationChanged', (location: any) => {
          const cfi = location.start.cfi
          setCurrentLocation(cfi)

          // Calculate progress
          if (epubBook.locations.length() > 0) {
            const prog = epubBook.locations.percentageFromCfi(cfi)
            const percentage = Math.round(prog * 100)
            setProgress(percentage)

            // Save progress
            saveProgress(percentage, cfi)
          }
        })

        // Generate locations for progress tracking
        epubBook.locations.generate(1000)

        // Restore previous location
        if (currentLocation) {
          rendition.display(currentLocation)
        }
      } catch (error) {
        console.error('Error initializing EPUB reader:', error)
        toast.error('Failed to load EPUB reader')
      }
    }

    initEPUB()

    return () => {
      if (renditionRef.current) {
        renditionRef.current.destroy()
      }
    }
  }, [book, darkMode, fontSize])

  // Update theme when dark mode changes
  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.default({
        body: {
          color: darkMode ? '#e5e5e5' : '#1a1a1a',
          background: darkMode ? '#1a1a1a' : '#ffffff',
        },
        p: {
          'font-size': `${fontSize}px`,
          'line-height': '1.6',
        },
      })
    }
  }, [darkMode, fontSize])

  const saveProgress = useCallback(async (percentage: number, cfi: string) => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          percentage,
          cfi,
          lastPosition: JSON.stringify({ cfi }),
        }),
      })

      // Save to localStorage as backup
      localStorage.setItem(`progress_${bookId}`, JSON.stringify({ percentage, cfi }))
    } catch (error) {
      console.error('Error saving progress:', error)
    }
  }, [bookId])

  const handleAddBookmark = async () => {
    if (!currentLocation || !renditionRef.current) return

    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          title: `Bookmark at ${Math.round(progress)}%`,
          cfi: currentLocation,
        }),
      })

      toast.success('Bookmark added!')
      fetchBookmarks()
    } catch (error) {
      console.error('Error adding bookmark:', error)
      toast.error('Failed to add bookmark')
    }
  }

  const handleDeleteBookmark = async (id: string) => {
    try {
      await fetch(`/api/bookmarks?id=${id}`, {
        method: 'DELETE',
      })

      toast.success('Bookmark deleted!')
      fetchBookmarks()
    } catch (error) {
      console.error('Error deleting bookmark:', error)
      toast.error('Failed to delete bookmark')
    }
  }

  const goToBookmark = (cfi: string) => {
    if (renditionRef.current) {
      renditionRef.current.display(cfi)
      setSidebarOpen(false)
    }
  }

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0])
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading book...</p>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Book not found</p>
          <Button
            onClick={() => router.push('/')}
            className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600"
          >
            Go to Library
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <header className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'border-gray-800 bg-gray-900/95' : 'border-gray-200 bg-white/95'}`}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className={darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900'}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{book.title}</h1>
            <p className="text-sm text-gray-400 truncate">{book.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900'}
          >
            <Bookmark className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className={darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900'}
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddBookmark}
            className={darkMode ? 'hover:bg-gray-800 text-white' : 'hover:bg-gray-100 text-gray-900'}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Reader Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Bookmarks Sidebar */}
        {sidebarOpen && (
          <aside className={`w-80 border-r ${darkMode ? 'border-gray-800 bg-gray-800/95' : 'border-gray-200 bg-gray-50/95'} overflow-y-auto`}>
            <div className="p-4">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Bookmark className="h-5 w-5" />
                Bookmarks
              </h2>
              {bookmarks.length === 0 ? (
                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No bookmarks yet</p>
              ) : (
                <div className="space-y-2">
                  {bookmarks.map((bookmark) => (
                    <Card
                      key={bookmark.id}
                      className={`p-3 cursor-pointer hover:border-purple-500/50 ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200'}`}
                      onClick={() => goToBookmark(bookmark.cfi)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{bookmark.title}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {bookmark.createdAt ? new Date(bookmark.createdAt).toLocaleDateString() : ''}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteBookmark(bookmark.id)
                          }}
                        >
                          <span className="text-red-400">×</span>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Reader View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div
            ref={viewerRef}
            className="flex-1 overflow-hidden"
            style={{ minHeight: 'calc(100vh - 200px)' }}
          />

          {/* Progress Bar */}
          <div className={`border-t ${darkMode ? 'border-gray-800 bg-gray-900/95' : 'border-gray-200 bg-white/95'} p-4`}>
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center gap-4">
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Progress</span>
                <div className="flex-1">
                  <Slider
                    value={[progress]}
                    onValueChange={([value]) => {
                      if (renditionRef.current && bookRef.current) {
                        const cfi = bookRef.current.locations.cfiFromPercentage(value / 100)
                        renditionRef.current.display(cfi)
                      }
                    }}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <span className={`text-sm font-medium w-12 text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {progress}%
                </span>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div className={`border-t ${darkMode ? 'border-gray-800 bg-gray-900/95' : 'border-gray-200 bg-white/95'} p-4`}>
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1">
                <Sun className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                  className={`h-8 w-8 ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}
                >
                  <Moon className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4 flex-1">
                <ZoomOut className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className="flex-1">
                  <Slider
                    value={[fontSize]}
                    onValueChange={handleFontSizeChange}
                    min={12}
                    max={32}
                    step={2}
                    className="w-full"
                  />
                </div>
                <ZoomIn className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm font-medium w-20 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {fontSize}px
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
