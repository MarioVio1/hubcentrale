'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  ShoppingBag,
  Crown,
  Coins,
  MinusCircle,
  Sparkles,
  Skull,
  Trophy,
  Users,
  Clock,
  Loader2,
  Check,
  X,
  Zap,
  AlertTriangle,
  PartyPopper,
  HandCoins,
} from 'lucide-react'
import type {
  MercanteGameState,
  MercantePlayer,
  MercanteCard,
} from '@/types/mercante'
import {
  getPrizeDescription,
  shuffleArray,
} from '@/types/mercante'

// ============================================
// ANIMATIONS
// ============================================
const suspenseShake = {
  animate: {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.5, repeat: 3 }
  }
}

const cardReveal = {
  hidden: { rotateY: 180, scale: 0.8 },
  visible: { rotateY: 0, scale: 1, transition: { duration: 0.6, type: 'spring' as const } }
}

const elimination = {
  animate: {
    scale: [1, 1.2, 0],
    opacity: [1, 1, 0],
    transition: { duration: 0.5 }
  }
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const pulseGlow = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(239, 68, 68, 0.5)',
      '0 0 40px rgba(239, 68, 68, 0.8)',
      '0 0 20px rgba(239, 68, 68, 0.5)',
    ],
    transition: { duration: 0.5, repeat: 6 }
  }
}

// ============================================
// CARD COMPONENT
// ============================================
function MercanteCardDisplay({
  card,
  size = 'md',
  showNumber = true,
  onClick,
  isSelected = false,
  isEliminating = false,
  suspense = false,
}: {
  card: MercanteCard
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
  onClick?: () => void
  isSelected?: boolean
  isEliminating?: boolean
  suspense?: boolean
}) {
  const sizeClasses = {
    sm: 'w-16 h-24 text-lg',
    md: 'w-24 h-36 text-2xl',
    lg: 'w-32 h-48 text-4xl',
  }

  const prize = card.type === 'prize' && card.value ? getPrizeDescription(card.value) : null

  return (
    <motion.div
      onClick={onClick}
      variants={isEliminating ? elimination : cardReveal}
      initial={card.revealed ? 'visible' : 'hidden'}
      animate={isEliminating ? 'animate' : 'visible'}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      className={cn(
        'relative rounded-xl border-4 border-black cursor-pointer select-none',
        'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
        sizeClasses[size],
        'flex flex-col items-center justify-center',
        'transition-colors duration-200',
        // Background based on state
        card.eliminated
          ? 'bg-gray-600 opacity-50'
          : card.revealed
            ? card.type === 'prize'
              ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
              : 'bg-gradient-to-br from-gray-400 to-gray-500'
            : isSelected
              ? 'bg-gradient-to-br from-purple-500 to-pink-500'
              : 'bg-gradient-to-br from-emerald-500 to-teal-600',
        // Glow effects
        suspense && 'animate-pulse ring-4 ring-red-400',
        isSelected && 'ring-4 ring-yellow-400',
        onClick && !card.revealed && 'hover:ring-4 hover:ring-yellow-300'
      )}
    >
      {/* Card number */}
      {showNumber && !card.revealed && !card.eliminated && (
        <span className="font-black text-white drop-shadow-lg">
          {card.number}
        </span>
      )}

      {/* Revealed content */}
      {card.revealed && !card.eliminated && (
        <div className="text-center">
          {card.type === 'prize' ? (
            <>
              <span className="text-4xl">{prize?.emoji}</span>
              <p className="text-sm font-bold text-amber-900 mt-1">{prize?.label}</p>
              <p className="text-lg font-black text-amber-900">{card.value}€</p>
            </>
          ) : (
            <>
              <X className="w-8 h-8 text-gray-700 mx-auto" />
              <p className="text-sm font-bold text-gray-700">Vuoto</p>
            </>
          )}
        </div>
      )}

      {/* Eliminated overlay */}
      {card.eliminated && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skull className="w-8 h-8 text-gray-400" />
        </div>
      )}
    </motion.div>
  )
}

// ============================================
// SUSPENSE ANIMATION COMPONENT
// ============================================
function SuspenseReveal({
  cards,
  onRevealNext,
  currentRevealIndex,
}: {
  cards: number[]
  onRevealNext: () => void
  currentRevealIndex: number
}) {
  const [phase, setPhase] = useState<'shaking' | 'result'>('shaking')

  useEffect(() => {
    // After 2 seconds, show result
    const timer = setTimeout(() => {
      setPhase('result')
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // After showing result, trigger next reveal
    if (phase === 'result') {
      const timer = setTimeout(() => {
        onRevealNext()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [phase, onRevealNext])

  const isShaking = phase === 'shaking'

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
      {/* Card being revealed */}
      <motion.div
        animate={isShaking ? { x: [-10, 10, -10, 10, 0], y: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.15, repeat: isShaking ? Infinity : 0 }}
        className="relative"
      >
        <div className={cn(
          'w-48 h-72 rounded-2xl border-4 border-black',
          'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]',
          'bg-gradient-to-br from-emerald-500 to-teal-600',
          'flex items-center justify-center',
          isShaking && 'ring-4 ring-red-400 animate-pulse'
        )}>
          {isShaking ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-center"
            >
              <span className="text-7xl font-black text-white drop-shadow-lg">
                {cards[currentRevealIndex]}
              </span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="text-center"
            >
              <Skull className="w-16 h-16 text-red-300 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">ELIMINATA!</p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Progress */}
      <div className="mt-8 flex gap-2">
        {cards.map((num, i) => (
          <div
            key={num}
            className={cn(
              'w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-bold',
              i < currentRevealIndex ? 'bg-red-500 text-white' :
              i === currentRevealIndex ? 'bg-yellow-400 text-black animate-pulse' :
              'bg-gray-600 text-white'
            )}
          >
            {num}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <p className="text-white text-xl mt-6">
        {isShaking ? '🎯 Estrazione in corso...' : '❌ Carta eliminata!'}
      </p>
    </div>
  )
}

// ============================================
// AUCTION COMPONENT
// ============================================
function AuctionPhase({
  gameState,
  currentPlayer,
  onBid,
  onPass,
}: {
  gameState: MercanteGameState
  currentPlayer: MercantePlayer
  onBid: (amount: number) => void
  onPass: () => void
}) {
  const [bidAmount, setBidAmount] = useState(gameState.currentAuction.highestBid + 5)
  const isMyTurn = gameState.players[gameState.currentAuction.currentPlayerIndex]?.id === currentPlayer.id

  return (
    <div className="flex flex-col items-center">
      {/* Card being auctioned */}
      <div className="text-center mb-6">
        <p className="text-slate-400 text-lg mb-2">Carta all'asta</p>
        <div className="w-24 h-36 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
          <span className="text-3xl font-black text-white">{gameState.currentAuction.cardNumber}</span>
        </div>
      </div>

      {/* Current bid */}
      <div className="bg-slate-800/80 rounded-xl p-4 mb-6 text-center border-2 border-slate-600">
        <p className="text-slate-400 text-sm">Offerta attuale</p>
        <p className="text-4xl font-black text-amber-400">{gameState.currentAuction.highestBid} €</p>
        {gameState.currentAuction.highestBidderId && (
          <p className="text-slate-300 text-sm mt-1">
            by {gameState.players.find(p => p.id === gameState.currentAuction.highestBidderId)?.name}
          </p>
        )}
      </div>

      {/* Your turn */}
      {isMyTurn ? (
        <div className="w-full max-w-sm space-y-4">
          <p className="text-white text-lg text-center">È il tuo turno!</p>
          
          <div className="flex items-center gap-3">
            <Input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              min={gameState.currentAuction.highestBid + 1}
              max={currentPlayer.money}
              className="bg-slate-700 border-2 border-slate-500 text-white text-xl text-center"
            />
            <span className="text-white text-xl">€</span>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => onBid(bidAmount)}
              disabled={bidAmount <= gameState.currentAuction.highestBid || bidAmount > currentPlayer.money}
              className="flex-1 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg"
            >
              <HandCoins className="w-5 h-5 mr-2" /> Offri
            </Button>
            <Button
              onClick={onPass}
              variant="outline"
              className="flex-1 py-6 bg-slate-700 text-white font-bold text-lg"
            >
              Passa
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-2" />
          <p className="text-slate-300">Turno di {gameState.players[gameState.currentAuction.currentPlayerIndex]?.name}</p>
        </div>
      )}
    </div>
  )
}

// ============================================
// PLAYING PHASE - TV
// ============================================
function PlayingPhaseTV({
  gameState,
}: {
  gameState: MercanteGameState
}) {
  const activeCards = gameState.deck.filter(c => !c.eliminated)

  return (
    <div className="text-center">
      <h2 className="text-3xl font-black text-white mb-4">
        Round {gameState.currentExtraction.roundNumber}
      </h2>
      <p className="text-slate-300 mb-6">
        Carte attive: {activeCards.length}
      </p>

      {/* Cards grid */}
      <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
        {gameState.deck.map((card) => (
          <MercanteCardDisplay
            key={card.id}
            card={card}
            size="md"
            suspense={gameState.currentExtraction.cardsToEliminate.includes(card.number) && gameState.currentExtraction.suspenseActive}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================
// PLAYING PHASE - CONTROLLER
// ============================================
function PlayingPhaseController({
  gameState,
  currentPlayer,
}: {
  gameState: MercanteGameState
  currentPlayer: MercantePlayer
}) {
  const myCards = gameState.deck.filter(c => c.ownerId === currentPlayer.id && !c.eliminated)

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Le tue carte</h2>
      
      {myCards.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-3">
          {myCards.map((card) => (
            <MercanteCardDisplay
              key={card.id}
              card={card}
              size="md"
              suspense={gameState.currentExtraction.cardsToEliminate.includes(card.number) && gameState.currentExtraction.suspenseActive}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/50 rounded-xl p-6">
          <Skull className="w-12 h-12 text-gray-500 mx-auto mb-2" />
          <p className="text-slate-400">Non hai più carte!</p>
          <p className="text-slate-500 text-sm">Osserva la partita...</p>
        </div>
      )}

      {/* Status */}
      {gameState.currentExtraction.suspenseActive && (
        <div className="mt-6 bg-red-500/20 border border-red-500 rounded-xl p-4">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-red-300 font-bold">ESTRAZIONE IN CORSO!</p>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// ============================================
// GAME OVER
// ============================================
function MercanteGameOver({
  gameState,
  onPlayAgain,
}: {
  gameState: MercanteGameState
  onPlayAgain: () => void
}) {
  const winner = gameState.winners[0]
  const winningCard = gameState.deck.find(c => !c.eliminated)

  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <Trophy className="w-24 h-24 text-amber-400 mx-auto mb-4" />
        <h1 className="text-5xl font-black text-white mb-2" style={{ textShadow: '4px 4px 0px #000' }}>
          {winner?.name} VINCE!
        </h1>
        {winningCard && winningCard.type === 'prize' && (
          <p className="text-2xl text-amber-400 mb-4">
            Premio: {winningCard.value}€
          </p>
        )}
      </motion.div>

      {winningCard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <MercanteCardDisplay card={winningCard} size="lg" />
        </motion.div>
      )}

      <Button
        onClick={onPlayAgain}
        className="text-xl py-6 px-8 gap-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold"
      >
        <Sparkles className="w-5 h-5" /> Gioca Ancora
      </Button>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export function MercanteGame({
  gameState,
  playerId,
  onAction,
}: {
  gameState: MercanteGameState
  playerId: string
  onAction: (action: string, data?: Record<string, unknown>) => void
}) {
  const currentPlayer = gameState.players.find(p => p.id === playerId)

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Giocatore non trovato</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-4">
      {/* Header with player info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{currentPlayer.avatar}</span>
          <div>
            <p className="text-xl font-bold text-white">{currentPlayer.name}</p>
            <div className="flex items-center gap-2 text-amber-400">
              <Coins className="w-4 h-4" />
              <span className="font-bold">{currentPlayer.money} €</span>
            </div>
          </div>
        </div>
        <Badge className="bg-emerald-600 text-white text-lg px-4 py-2">
          <ShoppingBag className="w-4 h-4 mr-1" />
          {currentPlayer.cards.length} carte
        </Badge>
      </div>

      {/* Phase content */}
      <AnimatePresence mode="wait">
        {gameState.phase === 'auction' && (
          <motion.div key="auction" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AuctionPhase
              gameState={gameState}
              currentPlayer={currentPlayer}
              onBid={(amount) => onAction('bid', { amount })}
              onPass={() => onAction('pass')}
            />
          </motion.div>
        )}

        {gameState.phase === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PlayingPhaseTV gameState={gameState} />
          </motion.div>
        )}

        {gameState.phase === 'revelation' && (
          <motion.div key="revelation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SuspenseReveal
              cards={gameState.currentExtraction.cardsToEliminate}
              currentRevealIndex={gameState.currentExtraction.currentRevealIndex}
              onRevealNext={() => onAction('reveal_next')}
            />
          </motion.div>
        )}

        {gameState.phase === 'gameOver' && (
          <motion.div key="gameover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MercanteGameOver
              gameState={gameState}
              onPlayAgain={() => onAction('play_again')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MercanteGame
