'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

const LS_PLAYER_ID = 'partygames_player_id'
const LS_ROOM_CODE = 'partygames_room_code'

interface Player {
  id: string
  name: string
  score: number
  isHost: boolean
  avatar: string
  isJudge: boolean
  hasSubmitted: boolean
  hasVoted: boolean
  isEliminated?: boolean
  hasBomb?: boolean
  cardCount?: number
  coins?: number
}

interface GameState {
  roomCode: string
  gameType: string
  phase: string
  roundNumber: number
  maxRounds: number
  timer: number
  players: Player[]
  currentPlayer?: {
    id: string
    name: string
    isJudge: boolean
    hasSubmitted: boolean
    cards: any[]
    coins: number
  } | null
  // Game specific
  currentSetup?: any[]
  submittedPunchlines?: any[]
  winningCard?: any
  judgeId?: string
  currentPhrase?: string
  currentQuestion?: any
  submittedAnswers?: any[]
  winner?: string
  winningAnswer?: string
  bombHolder?: string
  currentCard?: any
  currentBid?: number
  eliminatedCards?: any[]
}

function getPlayerIdFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LS_PLAYER_ID)
}

function getRoomCodeFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(LS_ROOM_CODE)
}

function createPlayerId(): string {
  const id = 'player_' + Math.random().toString(36).substring(2, 10)
  if (typeof window !== 'undefined') {
    localStorage.setItem(LS_PLAYER_ID, id)
  }
  return id
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerCards, setPlayerCards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(() => {
    const stored = getPlayerIdFromStorage()
    return stored || createPlayerId()
  })
  const [roomCode, setRoomCode] = useState<string | null>(() => getRoomCodeFromStorage())
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const lastPhaseRef = useRef<string>('')
  const lastRoundRef = useRef<number>(0)

  // Poll for game state
  const pollGameState = useCallback(async () => {
    if (!roomCode) return
    
    try {
      const params = new URLSearchParams({ code: roomCode, playerId: playerId || '' })
      const res = await fetch(`/api/game?${params}`)
      
      if (res.ok) {
        const data = await res.json()
        setGameState(data)
        
        // Update player cards
        if (data.currentPlayer?.cards) {
          setPlayerCards(data.currentPlayer.cards)
        }
        
        // Store room code
        if (data.roomCode) {
          localStorage.setItem(LS_ROOM_CODE, data.roomCode)
          setRoomCode(data.roomCode)
        }
        
        // Clear cards on new round
        if (data.roundNumber !== lastRoundRef.current) {
          lastRoundRef.current = data.roundNumber
          if (data.phase === 'playing') {
            setPlayerCards(data.currentPlayer?.cards || [])
          }
        }
        
        lastPhaseRef.current = data.phase
      }
    } catch (e) {
      console.error('Poll error:', e)
    }
  }, [roomCode, playerId])

  // Start polling
  useEffect(() => {
    if (!roomCode) return
    
    pollGameState() // Initial fetch
    pollingRef.current = setInterval(pollGameState, 1000)
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [roomCode, pollGameState])

  // Create room
  const createRoom = useCallback(async (playerName: string, gameType: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          playerName,
          gameType,
          playerId,
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Errore creazione stanza')
        return false
      }
      
      setRoomCode(data.roomCode)
      localStorage.setItem(LS_ROOM_CODE, data.roomCode)
      if (data.playerId) {
        setPlayerId(data.playerId)
        localStorage.setItem(LS_PLAYER_ID, data.playerId)
      }
      
      return true
    } catch (e) {
      setError('Errore di connessione')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [playerId])

  // Join room
  const joinRoom = useCallback(async (code: string, playerName: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          roomCode: code,
          playerName,
          playerId,
        }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Errore join')
        return false
      }
      
      setRoomCode(data.roomCode)
      localStorage.setItem(LS_ROOM_CODE, data.roomCode)
      if (data.playerId) {
        setPlayerId(data.playerId)
        localStorage.setItem(LS_PLAYER_ID, data.playerId)
      }
      
      return true
    } catch (e) {
      setError('Errore di connessione')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [playerId])

  // Leave room
  const leaveRoom = useCallback(async () => {
    if (roomCode && playerId) {
      try {
        await fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'leave', roomCode, playerId }),
        })
      } catch (e) {}
    }
    
    setGameState(null)
    setRoomCode(null)
    setPlayerCards([])
    setError(null)
    localStorage.removeItem(LS_ROOM_CODE)
  }, [roomCode, playerId])

  // Start game
  const startGame = useCallback(async () => {
    if (!roomCode) return
    
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', roomCode }),
      })
    } catch (e) {
      setError('Errore avvio partita')
    }
  }, [roomCode])

  // Submit card
  const submitCard = useCallback(async (cardId: string) => {
    if (!roomCode || !playerId) return
    
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit-card', roomCode, playerId, cardId }),
      })
    } catch (e) {
      setError('Errore invio carta')
    }
  }, [roomCode, playerId])

  // Play UNO card
  const playUnoCard = useCallback(async (cardId: string, newColor?: string) => {
    if (!roomCode || !playerId) return
    
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'play-uno-card', roomCode, playerId, cardId, newColor }),
      })
    } catch (e) {
      setError('Errore giocata carta')
    }
  }, [roomCode, playerId])

  // Draw card (UNO)
  const drawCard = useCallback(async () => {
    if (!roomCode || !playerId) return
    
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'draw-card', roomCode, playerId }),
      })
    } catch (e) {
      setError('Errore pesca carta')
    }
  }, [roomCode, playerId])

  // Call UNO
  const callUno = useCallback(async () => {
    if (!roomCode || !playerId) return
    
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'call-uno', roomCode, playerId }),
      })
    } catch (e) {
      setError('Errore chiamata UNO')
    }
  }, [roomCode, playerId])

  // Submit answer
  const submitAnswer = useCallback(async (answer: string) => {
    if (!roomCode || !playerId) return
    
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit-answer', roomCode, playerId, answer }),
      })
    } catch (e) {
      setError('Errore invio risposta')
    }
  }, [roomCode, playerId])

  // Vote
  const vote = useCallback(async (votedId: string) => {
    if (!roomCode || !playerId) return
    
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'vote', roomCode, playerId, votedId }),
      })
    } catch (e) {
      setError('Errore voto')
    }
  }, [roomCode, playerId])

  // Pass bomb
  const passBomb = useCallback(async () => {
    if (!roomCode || !playerId) return
    
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pass-bomb', roomCode, playerId }),
      })
    } catch (e) {
      setError('Errore passaggio bomba')
    }
  }, [roomCode, playerId])

  // Place bid
  const placeBid = useCallback(async (bid: number) => {
    if (!roomCode || !playerId) return
    
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'place-bid', roomCode, playerId, bid }),
      })
    } catch (e) {
      setError('Errore puntata')
    }
  }, [roomCode, playerId])

  // Next round
  const nextRound = useCallback(async () => {
    if (!roomCode) return
    
    try {
      await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'next-round', roomCode }),
      })
    } catch (e) {
      setError('Errore prossimo round')
    }
  }, [roomCode])

  // Get cards (manual refresh)
  const getCards = useCallback(async () => {
    await pollGameState()
  }, [pollGameState])

  return {
    gameState,
    playerCards,
    isLoading,
    error,
    playerId,
    roomCode,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    submitCard,
    playUnoCard,
    drawCard,
    callUno,
    submitAnswer,
    vote,
    passBomb,
    placeBid,
    nextRound,
    getCards,
    setError,
  }
}
