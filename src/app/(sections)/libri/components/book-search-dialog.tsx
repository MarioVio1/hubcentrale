'use client'

import { useState, useEffect } from 'react'
import { Search, Download, ExternalLink, AlertTriangle, BookOpen, Loader2, Globe, Book } from 'lucide-react'
import { SearchResult, getSourceLabel, getSourceColor, supportsDirectDownload, ANNAS_ARCHIVE_WARNING, isItalianSource, LEGAL_WARNING, isDirectorySource } from '@libri/lib/book-sources'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface BookSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportBook?: (url: string, title: string) => void
}

type BookSource = 'open-library' | 'gutenberg' | 'google-books' | 'annas-archive' | 'libgen' | 'liber-liber' | 'internet-archive' | 'manybooks' | 'feedbooks' | 'zlibrary' | 'ebookspy' | 'eurekaddl' | 'unblocked';

export default function BookSearchDialog({
  open,
  onOpenChange,
  onImportBook,
}: BookSearchDialogProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedSources, setSelectedSources] = useState<BookSource[]>([
    // Download diretto
    'gutenberg',
    'libgen',
    'zlibrary',
    // Italiane
    'liber-liber',
    'eurekaddl',
    'ebookspy',
    // Altre
    'internet-archive',
    'manybooks',
    'feedbooks',
    'open-library',
    'google-books',
    'annas-archive',
    'unblocked',
  ])
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Inserisci una query di ricerca')
      return
    }

    setLoading(true)
    setSearched(false)

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}&sources=${selectedSources.join(',')}`
      )

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setResults(data.results || [])
      setSearched(true)

      // Mostra avvertenze se presenti
      if (data.warnings?.annasArchive) {
        toast.warning(ANNAS_ARCHIVE_WARNING)
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Errore durante la ricerca')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleDirectDownload = async (result: SearchResult) => {
    if (!result.downloadUrl) {
      toast.error('Download diretto non disponibile per questo libro')
      return
    }

    try {
      toast.loading('Scaricamento in corso...')
      const response = await fetch(result.downloadUrl)
      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${result.title}.epub`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast.success('Download completato!')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Errore durante il download')
    }
  }

  const handleOpenSource = (url: string) => {
    window.open(url, '_blank')
  }

  const toggleSource = (source: BookSource) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    )
  }

  const sources = [
    // Download Diretto
    { id: 'gutenberg' as BookSource, label: 'Project Gutenberg', icon: '📚', description: 'Domino pubblico', warning: false, direct: true },
    { id: 'libgen' as BookSource, label: 'LibGen', icon: '📖', description: 'Scientifico/Accademico', warning: false, direct: true },
    { id: 'zlibrary' as BookSource, label: 'Z-Library', icon: '📕', description: 'Vasta collezione', warning: false, direct: true },
    // Fonti Italiane
    { id: 'liber-liber' as BookSource, label: 'Liber Liber', icon: '🇮🇹', description: 'Classici italiani', warning: false, italian: true },
    { id: 'eurekaddl' as BookSource, label: 'EUREKAddl', icon: '🇮🇹', description: 'Libri italiani', warning: false, italian: true },
    { id: 'ebookspy' as BookSource, label: 'EbookSpy', icon: '🇮🇹', description: 'Ricerca eBook', warning: false, italian: true },
    // Altre Fonti
    { id: 'internet-archive' as BookSource, label: 'Internet Archive', icon: '🏛️', description: 'Biblioteca digitale', warning: false },
    { id: 'manybooks' as BookSource, label: 'ManyBooks', icon: '📗', description: 'Libri gratuiti', warning: false },
    { id: 'feedbooks' as BookSource, label: 'Feedbooks', icon: '📘', description: 'Dominio pubblico', warning: false },
    { id: 'open-library' as BookSource, label: 'Open Library', icon: '📚', description: 'Catalogo', warning: true },
    { id: 'google-books' as BookSource, label: 'Google Books', icon: '🔍', description: 'Anteprima', warning: true },
    { id: 'annas-archive' as BookSource, label: "Anna's Archive", icon: '⚠️', description: 'Shadow library', warning: true },
    { id: 'unblocked' as BookSource, label: 'Unblockit.date', icon: '🔓', description: 'Directory risorse', warning: true, directory: true },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Globe className="h-6 w-6 text-purple-400" />
            Cerca e Scarica Libri - Tutte le Fonti
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Cerca libri da 14 fonti diverse, incluse 5 specializzate in libri italiani
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Fonti di ricerca - Organizzate per categoria */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <Book className="h-4 w-4" />
              <span>Fonti di ricerca:</span>
              <span className="text-xs text-gray-400 font-normal">({selectedSources.length} selezionate)</span>
            </label>

            {/* Download Diretto - Verde */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-2">
                <Download className="h-3 w-3" />
                <span>Download Diretto (clicca e scarica)</span>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {sources.filter(s => s.direct).map((source) => (
                  <div key={source.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`source-${source.id}`}
                      checked={selectedSources.includes(source.id)}
                      onCheckedChange={() => toggleSource(source.id)}
                      className="border-gray-600"
                    />
                    <label
                      htmlFor={`source-${source.id}`}
                      className="text-xs cursor-pointer flex items-center gap-1"
                      title={source.description}
                    >
                      <span>{source.icon}</span>
                      <span className="truncate">{source.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Fonti Italiane - Teale */}
            <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3">
              <p className="text-xs font-semibold text-teal-400 mb-2 flex items-center gap-2">
                <span>🇮🇹</span>
                <span>Fonti Italiane</span>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {sources.filter(s => s.italian).map((source) => (
                  <div key={source.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`source-${source.id}`}
                      checked={selectedSources.includes(source.id)}
                      onCheckedChange={() => toggleSource(source.id)}
                      className="border-gray-600"
                    />
                    <label
                      htmlFor={`source-${source.id}`}
                      className="text-xs cursor-pointer flex items-center gap-1"
                      title={source.description}
                    >
                      <span>{source.icon}</span>
                      <span className="truncate">{source.label}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Altre Fonti - Viola */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <p className="text-xs font-semibold text-purple-400 mb-2 flex items-center gap-2">
                <Globe className="h-3 w-3" />
                <span>Altre Fonti Internazionali</span>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {sources.filter(s => !s.italian && !s.direct).map((source) => (
                  <div key={source.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`source-${source.id}`}
                      checked={selectedSources.includes(source.id)}
                      onCheckedChange={() => toggleSource(source.id)}
                      className="border-gray-600"
                    />
                    <label
                      htmlFor={`source-${source.id}`}
                      className="text-xs cursor-pointer flex items-center gap-1"
                      title={source.description}
                    >
                      <span>{source.icon}</span>
                      <span className="truncate">{source.label}</span>
                      {source.warning && (
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      )}
                      {source.directory && (
                        <ExternalLink className="h-3 w-3 text-cyan-400" />
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Avvertenze legali */}
            {selectedSources.some(s => s.warning) && (
              <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-red-200 text-xs">
                    {LEGAL_WARNING}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Barra di ricerca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Cerca titolo, autore, ISBN..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
            />
          </div>

          <Button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-semibold py-3"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ricerca in corso...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Cerca in Tutte le Fonti
              </>
            )}
          </Button>

          {/* Risultati */}
          {searched && results.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-400">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nessun libro trovato con questa query</p>
              <p className="text-sm mt-2">Prova con parole chiave diverse o altre fonti</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-gray-400">
                  {results.length} risultati trovati
                </p>
                <div className="flex gap-2 flex-wrap">
                  {results.some(r => isItalianSource(r.source)) && (
                    <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">
                      🇮🇹 {results.filter(r => isItalianSource(r.source)).length} italiani
                    </Badge>
                  )}
                  {results.some(r => supportsDirectDownload(r.source)) && (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      ⬇️ {results.filter(r => supportsDirectDownload(r.source)).length} download diretto
                    </Badge>
                  )}
                  {results.some(r => isDirectorySource(r.source)) && (
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      🔗 {results.filter(r => isDirectorySource(r.source)).length} directory
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.map((result) => (
                  <Card
                    key={`${result.source}-${result.id}`}
                    className="bg-gray-700/50 border-gray-600 hover:border-purple-500/50 transition-all"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <Badge className={getSourceColor(result.source)}>
                          {isItalianSource(result.source) && '🇮🇹 '}
                          {supportsDirectDownload(result.source) && '⬇️ '}
                          {isDirectorySource(result.source) && '🔗 '}
                          {getSourceLabel(result.source)}
                        </Badge>
                        {result.year && (
                          <Badge variant="outline" className="bg-gray-600/50 text-gray-300 border-gray-500">
                            {result.year}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="line-clamp-2 text-lg">
                        {result.title}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        di {result.author}
                      </CardDescription>
                    </CardHeader>

                    {result.cover && (
                      <CardContent className="pb-3">
                        <div className="flex gap-4">
                          <div className="w-16 h-24 flex-shrink-0 bg-gray-600 rounded overflow-hidden">
                            <img
                              src={result.cover}
                              alt={result.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                          {result.description && (
                            <p className="text-sm text-gray-400 line-clamp-3">
                              {result.description}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    )}

                    {result.description && !result.cover && (
                      <CardContent className="pb-3">
                        <p className="text-sm text-gray-400 line-clamp-3">
                          {result.description}
                        </p>
                      </CardContent>
                    )}

                    <CardFooter className="gap-2 pt-3">
                      {supportsDirectDownload(result.source) && result.downloadUrl ? (
                        <Button
                          size="sm"
                          onClick={() => handleDirectDownload(result)}
                          className="flex-1 bg-green-600 hover:bg-green-700 font-medium"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Scarica
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenSource(result.sourceUrl)}
                          className="flex-1 border-purple-500/50 hover:bg-purple-600/20 text-purple-300 font-medium"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {isDirectorySource(result.source) ? 'Apri Directory' : 'Vedi e Scarica'}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Info sulle fonti */}
          <div className="bg-gray-700/30 rounded-lg p-4 space-y-3 text-sm">
            <p className="font-semibold text-white flex items-center gap-2">
              <span>💡</span>
              <span>Guida alle fonti:</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs space-y-2">
              <div className="space-y-2">
                <p className="font-semibold text-green-400 flex items-center gap-2">
                  <Download className="h-3 w-3" />
                  <span>Download Diretto:</span>
                </p>
                <ul className="space-y-1 ml-6 text-gray-400">
                  <li><strong>Project Gutenberg:</strong> Libri di dominio pubblico</li>
                  <li><strong>LibGen:</strong> Libri scientifici e accademici</li>
                  <li><strong>Z-Library:</strong> Vasta collezione internazionale</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-teal-400 flex items-center gap-2">
                  <span>🇮🇹</span>
                  <span>Fonti Italiane:</span>
                </p>
                <ul className="space-y-1 ml-6 text-gray-400">
                  <li><strong>Liber Liber:</strong> Classici italiani</li>
                  <li><strong>EUREKAddl:</strong> Libri italiani vari</li>
                  <li><strong>EbookSpy:</strong> Motore di ricerca eBook</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-purple-400 flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  <span>Altre Fonti:</span>
                </p>
                <ul className="space-y-1 ml-6 text-gray-400">
                  <li><strong>Internet Archive:</strong> Biblioteca digitale</li>
                  <li><strong>ManyBooks/Feedbooks:</strong> Libri gratuiti</li>
                  <li><strong>Open Library/Google Books:</strong> Cataloghi</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-cyan-400 flex items-center gap-2">
                  <ExternalLink className="h-3 w-3" />
                  <span>Directory:</span>
                </p>
                <ul className="space-y-1 ml-6 text-gray-400">
                  <li><strong>Unblockit.date:</strong> Directory di risorse</li>
                  <li><strong>Anna's Archive:</strong> ⚠️ Shadow library</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded text-green-300 text-xs">
              <strong>🎯 Suggerimento:</strong> Per il download immediato, usa <strong>Project Gutenberg</strong>, <strong>LibGen</strong> o <strong>Z-Library</strong>. Per libri in italiano, attiva le <strong>Fonti Italiane</strong>!
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
