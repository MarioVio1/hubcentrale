'use client'

import { useState, useEffect } from 'react'
import { Folder, Plus, Edit, Trash2, Book, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface Collection {
  id: string
  name: string
  description: string | null
  color: string | null
  books: Array<{
    book: {
      id: string
      title: string
      author: string
    }
  }>
}

interface Book {
  id: string
  title: string
  author: string
}

interface CollectionsManagerProps {
  bookId?: string // Se fornito, mostra solo le collections per questo libro
}

export default function CollectionsManager({ bookId }: CollectionsManagerProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false)
  const [newCollection, setNewCollection] = useState({ name: '', description: '', color: '#8b5cf6' })
  const [loading, setLoading] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      const data = await response.json()
      if (data.success) {
        setCollections(data.collections)
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
    }
  }

  const handleCreateCollection = async () => {
    if (!newCollection.name.trim()) {
      toast.error('Il nome è obbligatorio')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCollection)
      })

      const data = await response.json()
      if (data.success) {
        setCollections([data.collection, ...collections])
        setNewCollection({ name: '', description: '', color: '#8b5cf6' })
        setIsCreateDialogOpen(false)
        toast.success('Collection creata!')
      }
    } catch (error) {
      toast.error('Errore durante la creazione della collection')
      console.error('Error creating collection:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCollection = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa collection?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        setCollections(collections.filter((c) => c.id !== id))
        toast.success('Collection eliminata!')
      }
    } catch (error) {
      toast.error('Errore durante l\'eliminazione della collection')
      console.error('Error deleting collection:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCollection = async () => {
    if (!editingCollection) return

    setLoading(true)
    try {
      const response = await fetch(`/api/collections/${editingCollection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingCollection.name,
          description: editingCollection.description,
          color: editingCollection.color
        })
      })

      const data = await response.json()
      if (data.success) {
        setCollections(collections.map((c) =>
          c.id === editingCollection.id ? data.collection : c
        ))
        setEditingCollection(null)
        toast.success('Collection aggiornata!')
      }
    } catch (error) {
      toast.error('Errore durante l\'aggiornamento della collection')
      console.error('Error updating collection:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBookToCollection = async (collectionId: string) => {
    if (!bookId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/collections/${collectionId}/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId })
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Libro aggiunto alla collection!')
        fetchCollections()
      }
    } catch (error) {
      toast.error('Errore durante l\'aggiunta del libro')
      console.error('Error adding book to collection:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBookFromCollection = async (collectionId: string) => {
    if (!bookId) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/collections/${collectionId}/books/${bookId}`,
        {
          method: 'DELETE'
        }
      )

      const data = await response.json()
      if (data.success) {
        toast.success('Libro rimosso dalla collection!')
        fetchCollections()
      }
    } catch (error) {
      toast.error('Errore durante la rimozione del libro')
      console.error('Error removing book from collection:', error)
    } finally {
      setLoading(false)
    }
  }

  const colorOptions = [
    '#8b5cf6', // Purple
    '#3b82f6', // Blue
    '#06b6d4', // Cyan
    '#10b981', // Green
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#6366f1', // Indigo
  ]

  const filteredCollections = bookId
    ? collections.filter((c) => c.books.some((b) => b.book.id === bookId))
    : collections

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">
            {bookId ? 'Collections del libro' : 'Le tue Collections'}
          </h3>
        </div>
        {!bookId && (
          <Button
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nuova Collection
          </Button>
        )}
      </div>

      {filteredCollections.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="py-12 text-center">
            <Folder className="h-12 w-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">
              {bookId
                ? 'Questo libro non è in nessuna collection'
                : 'Nessuna collection creata'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCollections.map((collection) => (
            <Card
              key={collection.id}
              className="bg-gray-800 border-gray-700 hover:border-purple-500/50 transition-all"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {collection.color && (
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: collection.color }}
                      />
                    )}
                    <CardTitle className="text-lg truncate">
                      {editingCollection?.id === collection.id ? (
                        <Input
                          value={editingCollection.name}
                          onChange={(e) =>
                            setEditingCollection({
                              ...editingCollection,
                              name: e.target.value
                            })
                          }
                          className="bg-gray-700 border-gray-600 text-white h-8"
                        />
                      ) : (
                        collection.name
                      )}
                    </CardTitle>
                  </div>
                  {!bookId && (
                    <div className="flex gap-1">
                      {editingCollection?.id === collection.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleUpdateCollection}
                            disabled={loading}
                            className="h-8 w-8 p-0 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          >
                            ✓
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingCollection(null)}
                            disabled={loading}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingCollection(collection)}
                            disabled={loading}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCollection(collection.id)}
                            disabled={loading}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                {collection.description && (
                  <CardDescription className="text-gray-400">
                    {collection.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-400">
                    <Book className="h-4 w-4" />
                    <span>{collection.books.length} libri</span>
                  </div>
                  {bookId && collection.books.some((b) => b.book.id === bookId) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveBookFromCollection(collection.id)}
                      disabled={loading}
                      className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Rimuovi
                    </Button>
                  ) : bookId ? (
                    <Button
                      size="sm"
                      onClick={() => handleAddBookToCollection(collection.id)}
                      disabled={loading}
                      className="text-xs bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Aggiungi
                    </Button>
                  ) : null}
                </div>

                {!bookId && collection.books.length > 0 && (
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {collection.books.slice(0, 3).map((item) => (
                      <div
                        key={item.book.id}
                        className="text-xs text-gray-400 truncate px-2 py-1 bg-gray-700/50 rounded"
                      >
                        {item.book.title}
                      </div>
                    ))}
                    {collection.books.length > 3 && (
                      <div className="text-xs text-gray-500 px-2">
                        + {collection.books.length - 3} altri libri
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Collection Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Nuova Collection</DialogTitle>
            <DialogDescription className="text-gray-400">
              Crea una nuova collection per organizzare i tuoi libri
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Nome *</label>
              <Input
                value={newCollection.name}
                onChange={(e) =>
                  setNewCollection({ ...newCollection, name: e.target.value })
                }
                placeholder="Nome della collection"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Descrizione</label>
              <Input
                value={newCollection.description}
                onChange={(e) =>
                  setNewCollection({
                    ...newCollection,
                    description: e.target.value
                  })
                }
                placeholder="Descrizione opzionale"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Colore</label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      setNewCollection({ ...newCollection, color })
                    }
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      newCollection.color === color
                        ? 'border-white scale-110'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="border-gray-600 hover:bg-gray-700"
              >
                Annulla
              </Button>
              <Button
                onClick={handleCreateCollection}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? 'Creazione...' : 'Crea'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
