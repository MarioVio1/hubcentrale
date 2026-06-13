'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import type { GameState, ComicCard, GameSettings } from '@/types/game'

// LocalStorage keys - only for room code, NOT playerId
const LS_ROOM_CODE = 'comicparty_room_code'

interface UseGameSocketReturn {
  gameState: GameState | null
  playerCards: ComicCard[]
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  playerId: string | null  // ALWAYS current socket.id
  roomCode: string | null
  createRoom: (playerName: string, settings?: Partial<GameSettings>, gameType?: string) => void
  joinRoom: (roomCode: string, playerName: string) => void
  leaveRoom: () => void
  startGame: () => void
  submitCard: (cardId: string) => void
  vote: (cardId: string) => void
  getPlayerCards: () => void
}

export function useGameSocket(): UseGameSocketReturn {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerCards, setPlayerCards] = useState<ComicCard[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [socketId, setSocketId] = useState<string | null>(null)  // Current socket.id
  const [roomCode, setRoomCode] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(LS_ROOM_CODE)
  })

  const socketRef = useRef<Socket | null>(null)
  const lastRoundRef = useRef<number>(0)

  // playerId is ALWAYS the current socket.id
  const playerId = socketId

  useEffect(() => {
    if (socketRef.current) return

    console.log('[HOOK] Creating socket...')
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[HOOK] ✅ Connected! Socket ID:', socket.id)
      setIsConnected(true)
      setIsConnecting(false)
      setError(null)
      setSocketId(socket.id)  // Update playerId to NEW socket.id
    })

    socket.on('disconnect', (reason) => {
      console.log('[HOOK] ❌ Disconnected:', reason)
      setIsConnected(false)
    })

    socket.on('connect_error', (err) => {
      console.error('[HOOK] Connection error:', err)
      setIsConnecting(false)
      setError('Errore connessione')
    })

    socket.on('room-created', (data: { roomCode: string; playerId: string }) => {
      console.log('[HOOK] 🏠 Room created:', data.roomCode)
      setRoomCode(data.roomCode)
      localStorage.setItem(LS_ROOM_CODE, data.roomCode)
      setError(null)
    })

    socket.on('room-joined', (data: { roomCode: string; playerId: string }) => {
      console.log('[HOOK] 🚪 Room joined:', data.roomCode)
      setRoomCode(data.roomCode)
      localStorage.setItem(LS_ROOM_CODE, data.roomCode)
      setError(null)
    })

    socket.on('join-error', (data: { message: string }) => {
      console.log('[HOOK] ⚠️ Join error:', data.message)
      setError(data.message)
    })

    socket.on('game-state', (state: GameState) => {
      console.log('[HOOK] 📊 State:', state.phase, 'Round:', state.roundNumber, 'Players:', state.players?.length || 0)
      setGameState(state)
      if (state.roomCode) setRoomCode(state.roomCode)
      
      // Reset cards if round changed
      if (state.roundNumber !== lastRoundRef.current) {
        console.log('[HOOK] New round')
        lastRoundRef.current = state.roundNumber
        setPlayerCards([])  // Clear cards on new round
      }
    })

    socket.on('player-cards', (data: { cards: ComicCard[]; roundNumber: number }) => {
      console.log('[HOOK] 🃏 CARDS RECEIVED:', data.cards?.length || 0, 'for round', data.roundNumber)
      if (data.cards && data.cards.length > 0) {
        console.log('[HOOK] Card IDs:', data.cards.map(c => c.id).join(', '))
        setPlayerCards(data.cards)
        lastRoundRef.current = data.roundNumber
      }
    })

    socket.on('timer-update', (data: { timer: number }) => {
      setGameState(prev => prev ? { ...prev, timer: data.timer } : null)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [])

  // Auto-request cards when playing
  useEffect(() => {
    const socket = socketRef.current
    if (!socket || !isConnected || !gameState) return

    if (gameState.phase === 'playing') {
      // Find ME using CURRENT socket.id
      const me = playerId ? gameState.players.find(p => p.id === playerId) : null
      
      if (me && !me.isJudge && playerCards.length === 0 && !me.hasSubmitted) {
        console.log('[HOOK] 🔄 Requesting cards for:', me.name, 'id:', playerId)
        // Multiple attempts
        const t1 = setTimeout(() => socket.emit('get-cards'), 100)
        const t2 = setTimeout(() => socket.emit('get-cards'), 500)
        const t3 = setTimeout(() => socket.emit('get-cards'), 1500)
        const t4 = setTimeout(() => socket.emit('get-cards'), 3000)
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
      }
    }
  }, [gameState?.phase, gameState?.roundNumber, playerId, isConnected, playerCards.length])

  const createRoom = useCallback((playerName: string, settings?: Partial<GameSettings>, gameType?: string) => {
    const socket = socketRef.current
    if (!socket) return
    console.log('[HOOK] Creating room')
    socket.emit('create-room', { playerName, settings, gameType })
  }, [])

  const joinRoom = useCallback((roomCode: string, playerName: string) => {
    const socket = socketRef.current
    if (!socket) return
    console.log('[HOOK] Joining room:', roomCode)
    setPlayerCards([])  // Clear cards
    socket.emit('join-room', { roomCode, playerName })
  }, [])

  const leaveRoom = useCallback(() => {
    const socket = socketRef.current
    if (socket) socket.emit('leave-room')
    setGameState(null)
    setPlayerCards([])
    setError(null)
    setRoomCode(null)
    localStorage.removeItem(LS_ROOM_CODE)
  }, [])

  const startGame = useCallback(() => {
    const socket = socketRef.current
    if (!socket) return
    console.log('[HOOK] Starting game')
    socket.emit('start-game')
  }, [])

  const submitCard = useCallback((cardId: string) => {
    const socket = socketRef.current
    if (!socket) return
    console.log('[HOOK] Submitting:', cardId)
    socket.emit('submit-card', { cardId })
  }, [])

  const vote = useCallback((cardId: string) => {
    const socket = socketRef.current
    if (!socket) return
    console.log('[HOOK] Voting:', cardId)
    socket.emit('vote', { cardId })
  }, [])

  const getPlayerCards = useCallback(() => {
    const socket = socketRef.current
    if (!socket) return
    console.log('[HOOK] Manual get-cards')
    socket.emit('get-cards')
  }, [])

  return {
    gameState, playerCards, isConnected, isConnecting, error, playerId, roomCode,
    createRoom, joinRoom, leaveRoom, startGame, submitCard, vote, getPlayerCards,
  }
}
