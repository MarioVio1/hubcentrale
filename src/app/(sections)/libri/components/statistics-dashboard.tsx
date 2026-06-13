'use client'

import { useEffect, useState } from 'react'
import { Book, Clock, Star, TrendingUp, Award, BookOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Statistics {
  books: {
    total: number
    reading: number
    completed: number
    wishlist: number
  }
  ratings: {
    total: number
    average: number
  }
  reading: {
    totalMinutes: number
    totalHours: number
    totalPagesRead: number
    sessionsCount: number
  }
  recent: {
    last7DaysMinutes: number
    last7DaysSessions: number
  }
  topBooks: Array<{
    id: string
    title: string
    author: string
    sessionCount: number
  }>
}

export default function StatisticsDashboard() {
  const [stats, setStats] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/statistics')
      const data = await response.json()
      if (data.success) {
        setStats(data.statistics)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Caricamento statistiche...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Impossibile caricare le statistiche</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard Statistiche</h2>
        <p className="text-gray-400">Panoramica delle tue attività di lettura</p>
      </div>

      {/* Statistiche principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Libri Totali</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">{stats.books.total}</div>
              <Book className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2 space-y-1 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>In lettura:</span>
                <span className="text-white">{stats.books.reading}</span>
              </div>
              <div className="flex justify-between">
                <span>Completati:</span>
                <span className="text-green-400">{stats.books.completed}</span>
              </div>
              <div className="flex justify-between">
                <span>Wishlist:</span>
                <span className="text-blue-400">{stats.books.wishlist}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Tempo di Lettura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">{stats.reading.totalHours}</div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {stats.reading.totalMinutes} minuti totali
            </div>
            <div className="text-xs text-blue-400 mt-1">
              {stats.recent.last7DaysMinutes} min ultimi 7 giorni
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pagine Lette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">{stats.reading.totalPagesRead}</div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {stats.reading.sessionsCount} sessioni totali
            </div>
            <div className="text-xs text-green-400 mt-1">
              {stats.recent.last7DaysSessions} sessioni ultimi 7 giorni
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Rating Medio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-white">
                {stats.ratings.average > 0 ? stats.ratings.average.toFixed(1) : '-'}
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {stats.ratings.total} valutazioni
            </div>
            {stats.ratings.average >= 4 && (
              <Badge className="mt-2 bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                <Award className="h-3 w-3 mr-1" />
                Eccellente!
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Libri più letti */}
      {stats.topBooks.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5" />
              Libri più letti
            </CardTitle>
            <CardDescription className="text-gray-400">
              Libri con il maggior numero di sessioni di lettura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topBooks.map((book, index) => (
                <div
                  key={book.id}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-500/20 rounded-full">
                      <span className="text-purple-400 font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{book.title}</div>
                      <div className="text-sm text-gray-400">{book.author}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                      {book.sessionCount} sessioni
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggerimenti */}
      {stats.books.reading > 0 && stats.books.reading < 3 && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">Continua la tua lettura!</h4>
                <p className="text-sm text-gray-400">
                  Hai {stats.books.reading} libri in corso. Mantieni la costanza per raggiungere i tuoi obiettivi di lettura.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stats.books.reading === 0 && stats.books.total > 0 && (
        <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-1">Inizia una nuova lettura!</h4>
                <p className="text-sm text-gray-400">
                  Hai {stats.books.wishlist} libri nella wishlist. Scegli uno e inizia a leggere oggi stesso.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
