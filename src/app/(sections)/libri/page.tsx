'use client'

import { useState, useEffect } from 'react'
import { Search, BookOpen, CheckCircle2, Heart, Plus, Trash2, Upload, ExternalLink, Globe } from 'lucide-react'
import { Book, LibraryFilters } from '@libri/types/book'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import BookSearchDialog from '@libri/components/book-search-dialog'

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState<'all' | 'reading' | 'completed' | 'wishlist'>('all')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    filterBooks()
  }, [books, searchTerm, activeCategory])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books')
      const data = await response.json()
      if (data.success) {
        setBooks(data.books)
      }
    } catch (error) {
      console.error('Error fetching books:', error)
      toast.error('Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  const filterBooks = () => {
    let filtered = [...books]

    if (activeCategory !== 'all') {
      filtered = filtered.filter(book => book.category === activeCategory)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term)
      )
    }

    setFilteredBooks(filtered)
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)

    const formData = new FormData(e.currentTarget)
    const file = formData.get('file') as File

    if (!file) {
      toast.error('Please select a file')
      setUploading(false)
      return
    }

    try {
      const response = await fetch('/api/books/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Book uploaded successfully!')
        setUploadDialogOpen(false)
        fetchBooks()
      } else {
        toast.error(data.error || 'Failed to upload book')
      }
    } catch (error) {
      console.error('Error uploading book:', error)
      toast.error('Failed to upload book')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteBook = async (bookId: string) => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return
    }

    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Book deleted successfully!')
        fetchBooks()
      } else {
        toast.error('Failed to delete book')
      }
    } catch (error) {
      console.error('Error deleting book:', error)
      toast.error('Failed to delete book')
    }
  }

  const updateBookCategory = async (bookId: string, category: string) => {
    try {
      const response = await fetch(`/api/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category })
      })

      if (response.ok) {
        toast.success('Book updated!')
        fetchBooks()
      } else {
        toast.error('Failed to update book')
      }
    } catch (error) {
      console.error('Error updating book:', error)
      toast.error('Failed to update book')
    }
  }

  const getCategoryCount = (category: string) => {
    if (category === 'all') return books.length
    return books.filter(book => book.category === category).length
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reading':
        return <BookOpen className="h-4 w-4" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'wishlist':
        return <Heart className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reading':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
      case 'completed':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
      case 'wishlist':
        return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 backdrop-blur-sm bg-gray-900/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  ShadowKindle
                </h1>
                <p className="text-sm text-gray-400">Your personal ebook reader</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
                onClick={() => setSearchDialogOpen(true)}
              >
                <Globe className="h-5 w-5 mr-2" />
                🔍 Cerca Libri Online
              </Button>

              <BookSearchDialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen} />

              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Book
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Upload New Book</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Upload EPUB or PDF files to your library
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">File *</label>
                      <Input
                        type="file"
                        name="file"
                        accept=".epub,.pdf"
                        required
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <Input
                        name="title"
                        placeholder="Book title (auto-filled from file)"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Author</label>
                      <Input
                        name="author"
                        placeholder="Author name"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Input
                        name="description"
                        placeholder="Brief description"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={uploading}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {uploading ? 'Uploading...' : 'Upload Book'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              All ({getCategoryCount('all')})
            </TabsTrigger>
            <TabsTrigger value="reading" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Reading ({getCategoryCount('reading')})
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Completed ({getCategoryCount('completed')})
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Wishlist ({getCategoryCount('wishlist')})
            </TabsTrigger>
          </TabsList>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-400">Loading your library...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No books found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'Try a different search term' : 'Upload your first book to get started'}
              </p>
              <Button
                onClick={() => setUploadDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Book
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
              {filteredBooks.map((book) => (
                <Card
                  key={book.id}
                  className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge className={getCategoryColor(book.category)}>
                        {getCategoryIcon(book.category)}
                        <span className="ml-1 capitalize">{book.category}</span>
                      </Badge>
                      <Badge variant="outline" className="bg-gray-700/50 border-gray-600 text-gray-300">
                        {book.fileType.toUpperCase()}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2 text-lg text-white mt-3">
                      {book.title}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      by {book.author}
                    </CardDescription>
                  </CardHeader>

                  {book.description && (
                    <CardContent>
                      <p className="text-sm text-gray-400 line-clamp-3">
                        {book.description}
                      </p>
                    </CardContent>
                  )}

                  {book.progress && (
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>Progress</span>
                          <span>{Math.round(book.progress.percentage)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${book.progress.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  )}

                  <CardFooter className="flex gap-2">
                    <Button
                      asChild
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <a href={`/reader/${book.id}`}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Read
                      </a>
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteBook(book.id)}
                      className="border-gray-600 hover:bg-red-600/20 hover:border-red-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p className="mb-2">ShadowKindle - Your Personal Ebook Reader</p>
          <p className="text-xs">
            Self-hosted • Open Source • Built with Next.js, Tailwind CSS, and EPUB.js
          </p>
        </div>
      </footer>
    </div>
  )
}
