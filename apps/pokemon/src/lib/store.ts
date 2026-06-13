import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface User {
  id: string
  email: string
  username: string
  avatar: string | null
  role: string
  createdAt: string
  updatedAt: string
}

export interface Game {
  id: string
  title: string
  description: string
  category: string
  thumbnail: string
  gamePath: string
  isActive: boolean
  isMultiplayer: boolean
  maxPlayers: number
  createdAt: string
  updatedAt: string
  _count?: { scores: number }
}

export interface Score {
  id: string
  userId: string
  gameId: string
  score: number
  createdAt: string
  user?: { username: string; avatar: string | null }
}

export interface RoomPlayer {
  id: string
  name: string
  isHost: boolean
  isReady: boolean
  deviceType: 'host' | 'controller'
}

export interface Room {
  id: string
  code: string
  gameId: string
  hostId: string
  status: string
  maxPlayers: number
  players: RoomPlayer[]
}

// Auth Store
interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
  checkSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
        } catch (e) {
          console.error('Logout error:', e)
        }
        set({ user: null, isAuthenticated: false })
      },
      checkSession: async () => {
        try {
          const res = await fetch('/api/auth/session')
          const data = await res.json()
          if (data.authenticated && data.user) {
            set({ user: data.user, isAuthenticated: true, isLoading: false })
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false })
          }
        } catch (e) {
          console.error('Session check error:', e)
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      }
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }) }
  )
)

// Game Store
interface GameState {
  games: Game[]
  currentGame: Game | null
  isLoading: boolean
  category: string | null
  searchQuery: string
  setGames: (games: Game[]) => void
  setCurrentGame: (game: Game | null) => void
  setCategory: (category: string | null) => void
  setSearchQuery: (query: string) => void
  fetchGames: () => Promise<void>
}

export const useGameStore = create<GameState>((set, get) => ({
  games: [],
  currentGame: null,
  isLoading: false,
  category: null,
  searchQuery: '',
  setGames: (games) => set({ games }),
  setCurrentGame: (game) => set({ currentGame: game }),
  setCategory: (category) => set({ category }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  fetchGames: async () => {
    set({ isLoading: true })
    try {
      const { category } = get()
      const url = category ? `/api/games?category=${category}` : '/api/games'
      const res = await fetch(url)
      const data = await res.json()
      set({ games: data.games || [], isLoading: false })
    } catch (e) {
      console.error('Fetch games error:', e)
      set({ isLoading: false })
    }
  }
}))

// Score Store
interface ScoreState {
  scores: Score[]
  isLoading: boolean
  fetchLeaderboard: (gameId?: string) => Promise<void>
  submitScore: (gameId: string, score: number) => Promise<boolean>
}

export const useScoreStore = create<ScoreState>((set) => ({
  scores: [],
  isLoading: false,
  fetchLeaderboard: async (gameId) => {
    set({ isLoading: true })
    try {
      const url = gameId ? `/api/scores?gameId=${gameId}` : '/api/scores'
      const res = await fetch(url)
      const data = await res.json()
      set({ scores: data.scores || [], isLoading: false })
    } catch (e) {
      console.error('Fetch scores error:', e)
      set({ isLoading: false })
    }
  },
  submitScore: async (gameId, score) => {
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, score })
      })
      const data = await res.json()
      return !!data.score
    } catch (e) {
      console.error('Submit score error:', e)
      return false
    }
  }
}))

// Room Store
interface RoomState {
  room: Room | null
  roomCode: string | null
  isHost: boolean
  players: RoomPlayer[]
  isGameStarted: boolean
  pairingCode: string | null
  setRoom: (room: Room | null) => void
  setRoomCode: (code: string | null) => void
  setIsHost: (isHost: boolean) => void
  setPlayers: (players: RoomPlayer[]) => void
  setPairingCode: (code: string | null) => void
  setGameStarted: (started: boolean) => void
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  roomCode: null,
  isHost: false,
  players: [],
  isGameStarted: false,
  pairingCode: null,
  setRoom: (room) => set({ room }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setIsHost: (isHost) => set({ isHost }),
  setPlayers: (players) => set({ players }),
  setPairingCode: (pairingCode) => set({ pairingCode }),
  setGameStarted: (isGameStarted) => set({ isGameStarted })
}))

// UI Store
interface UIState {
  currentView: 'home' | 'game' | 'profile' | 'leaderboard' | 'admin' | 'controller'
  showAuthModal: boolean
  authMode: 'login' | 'register'
  setCurrentView: (view: UIState['currentView']) => void
  setShowAuthModal: (show: boolean) => void
  setAuthMode: (mode: 'login' | 'register') => void
}

export const useUIStore = create<UIState>((set) => ({
  currentView: 'home',
  showAuthModal: false,
  authMode: 'login',
  setCurrentView: (currentView) => set({ currentView }),
  setShowAuthModal: (showAuthModal) => set({ showAuthModal }),
  setAuthMode: (authMode) => set({ authMode })
}))
