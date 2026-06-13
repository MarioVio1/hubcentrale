'use client'

import { useState, useEffect } from 'react'
import { Star, Trash2, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface BookRatingProps {
  bookId: string
  onRatingChange?: (rating: number | null) => void
}

interface RatingData {
  rating: number
  review: string | null
}

export default function BookRating({ bookId, onRatingChange }: BookRatingProps) {
  const [rating, setRating] = useState<RatingData | null>(null)
  const [hoverRating, setHoverRating] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRating()
  }, [bookId])

  const fetchRating = async () => {
    try {
      const response = await fetch(`/api/ratings/${bookId}`)
      const data = await response.json()
      if (data.success && data.rating) {
        setRating(data.rating)
        setReviewText(data.rating.review || '')
      } else {
        setRating(null)
      }
    } catch (error) {
      console.error('Error fetching rating:', error)
    }
  }

  const handleStarClick = async (selectedRating: number) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/ratings/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: selectedRating,
          review: reviewText
        })
      })

      const data = await response.json()
      if (data.success) {
        setRating(data.rating)
        toast.success('Valutazione salvata!')
        onRatingChange?.(selectedRating)
      }
    } catch (error) {
      toast.error('Errore durante il salvataggio della valutazione')
      console.error('Error saving rating:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!rating) return

    if (!confirm('Sei sicuro di voler eliminare questa valutazione?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/ratings/${bookId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        setRating(null)
        setReviewText('')
        toast.success('Valutazione eliminata!')
        onRatingChange?.(null)
      }
    } catch (error) {
      toast.error('Errore durante l\'eliminazione della valutazione')
      console.error('Error deleting rating:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveReview = async () => {
    if (!rating) return

    setLoading(true)
    try {
      const response = await fetch(`/api/ratings/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: rating.rating,
          review: reviewText
        })
      })

      const data = await response.json()
      if (data.success) {
        setRating(data.rating)
        toast.success('Recensione salvata!')
        setIsDialogOpen(false)
      }
    } catch (error) {
      toast.error('Errore durante il salvataggio della recensione')
      console.error('Error saving review:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="space-y-3">
        {/* Star Rating */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => !loading && handleStarClick(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              disabled={loading}
              className="transition-transform hover:scale-110 disabled:opacity-50"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= (hoverRating || rating?.rating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-500'
                }`}
              />
            </button>
          ))}
          {rating && (
            <span className="text-sm text-gray-400 ml-2">
              {rating.rating}/5
            </span>
          )}
        </div>

        {/* Review Actions */}
        {rating && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              disabled={loading}
              className="border-gray-600 hover:bg-gray-700"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              {rating.review ? 'Modifica recensione' : 'Aggiungi recensione'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={loading}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Review Preview */}
        {rating?.review && (
          <div className="p-3 bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-300">{rating.review}</p>
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Recensione</DialogTitle>
            <DialogDescription className="text-gray-400">
              Scrivi la tua recensione per questo libro
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Scrivi qui la tua recensione..."
              className="min-h-[150px] bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-gray-600 hover:bg-gray-700"
              >
                Annulla
              </Button>
              <Button
                onClick={handleSaveReview}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? 'Salvataggio...' : 'Salva'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
