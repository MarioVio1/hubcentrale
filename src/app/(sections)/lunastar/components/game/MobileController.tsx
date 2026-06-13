'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { useGameSocket } from '@lunastar/hooks/useGameSocket';
import type { ComicCard } from '@lunastar/types/game';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Crown, Users, LogOut, Loader2, Star, Check, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

// ============================================
// CARD COMPONENT
// ============================================
const categoryColors: Record<string, string> = {
  dark: 'from-gray-700 to-gray-900 border-gray-500',
  absurd: 'from-pink-500 to-purple-600 border-pink-400',
  surreal: 'from-cyan-500 to-blue-600 border-cyan-400',
  crude: 'from-orange-500 to-red-600 border-orange-400',
  normal: 'from-slate-400 to-slate-600 border-slate-300',
};

function GameCard({ card, selected, onClick }: { card: ComicCard; selected?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer select-none',
        'border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]',
        'bg-gradient-to-br transition-all duration-200',
        categoryColors[card.category] || categoryColors.normal,
        selected && 'ring-4 ring-yellow-400 scale-[1.03]',
        onClick && 'hover:scale-[1.03] active:scale-[0.97]'
      )}
    >
      {/* Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '8px 8px' }} />
      
      {/* Panel number */}
      <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center text-sm font-bold">
        {card.panel}
      </div>
      
      {/* Text */}
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <p className="text-xs sm:text-sm font-bold text-white text-center leading-tight drop-shadow-md">
          {card.text}
        </p>
      </div>
      
      {selected && (
        <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-black">
          <Check className="w-4 h-4 text-black" />
        </div>
      )}
    </div>
  );
}

// ============================================
// TIMER
// ============================================
function Timer({ time, max }: { time: number; max: number }) {
  const pct = Math.max(0, time / max)
  return (
    <div className="flex items-center gap-2">
      <div className={cn('text-base font-bold tabular-nums', time <= 10 ? 'text-red-400' : time <= 20 ? 'text-orange-400' : 'text-white')}>
        {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
      </div>
      <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', time <= 10 ? 'bg-red-500' : time <= 20 ? 'bg-orange-500' : 'bg-green-500')} style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  )
}

// ============================================
// MAIN CONTROLLER
// ============================================
export function MobileController() {
  const {
    gameState, playerCards, isConnected, isConnecting, error, playerId, roomCode,
    joinRoom, leaveRoom, startGame, submitCard, vote, getPlayerCards
  } = useGameSocket();

  const [name, setName] = React.useState('');
  const [code, setCode] = React.useState('');
  const [selected, setSelected] = React.useState<string | null>(null);
  const [requestedCards, setRequestedCards] = React.useState(false);

  // Find ME in gameState
  const me = React.useMemo(() => {
    if (!gameState || !playerId) {
      console.log('[MOBILE] Looking for me: no state or playerId')
      return null
    }
    const found = gameState.players.find(p => p.id === playerId)
    console.log('[MOBILE] Me:', found?.name, 'Judge:', found?.isJudge, 'Cards in hand:', found?.cardCount, 'My cards:', playerCards.length)
    return found ?? null
  }, [gameState, playerId, playerCards.length])

  // Reset on phase/round change
  React.useEffect(() => {
    setSelected(null);
    setRequestedCards(false);
    console.log('[MOBILE] Phase changed:', gameState?.phase, 'Round:', gameState?.roundNumber)
  }, [gameState?.phase, gameState?.roundNumber]);

  // Debug log
  React.useEffect(() => {
    if (gameState) {
      console.log('[MOBILE] === STATE ===')
      console.log('[MOBILE] Phase:', gameState.phase)
      console.log('[MOBILE] Round:', gameState.roundNumber)
      console.log('[MOBILE] PlayerId:', playerId)
      console.log('[MOBILE] Me:', me?.name)
      console.log('[MOBILE] IsJudge:', me?.isJudge)
      console.log('[MOBILE] HasSubmitted:', me?.hasSubmitted)
      console.log('[MOBILE] PlayerCards:', playerCards.length)
      console.log('[MOBILE] CardCount (from state):', me?.cardCount)
      console.log('[MOBILE] ==================')
    }
  }, [gameState?.phase, gameState?.roundNumber, me, playerId, playerCards.length])

  // Auto request cards when playing
  React.useEffect(() => {
    if (!isConnected || !gameState || gameState.phase !== 'playing' || requestedCards) return
    if (!me || me.isJudge) return
    
    // If I have no cards but should have some
    if (playerCards.length === 0) {
      console.log('[MOBILE] 🔄 Auto requesting cards...')
      setRequestedCards(true)
      const t1 = setTimeout(() => getPlayerCards(), 200)
      const t2 = setTimeout(() => getPlayerCards(), 800)
      const t3 = setTimeout(() => getPlayerCards(), 2000)
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
    }
  }, [gameState?.phase, me, playerCards.length, isConnected, requestedCards, getPlayerCards])

  // ===== RENDER =====

  // Loading
  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-yellow-400 mx-auto mb-3" />
          <p className="text-white">Connessione...</p>
        </div>
      </div>
    );
  }

  // Disconnected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <LogOut className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-white text-lg mb-2">Disconnesso</p>
          <Button onClick={() => window.location.reload()}>Riconnetti</Button>
        </div>
      </div>
    );
  }

  // JOIN FORM - only if NOT in a room (no gameState) OR in lobby but I'm not a player
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">COMIC PARTY</h1>
            <p className="text-gray-400 text-sm mt-1">Unisciti alla partita!</p>
          </div>

          {error && <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-300 text-sm text-center">{error}</div>}

          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Il tuo nome" className="h-14 text-lg bg-gray-800 border-gray-600 text-white" maxLength={15} />
          <Input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="CODICE" className="h-14 text-2xl text-center font-mono bg-gray-800 border-gray-600 text-white tracking-widest" maxLength={4} />

          <Button onClick={() => name.trim() && code.length === 4 && joinRoom(code, name)} disabled={!name.trim() || code.length !== 4} className="w-full h-14 text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50">
            ENTRA
          </Button>

          <p className="text-gray-500 text-xs text-center">Chiedi il codice all'host sulla TV</p>
        </div>
      </div>
    );
  }

  // LOBBY - I'm in gameState but game hasn't started
  if (gameState.phase === 'lobby') {
    if (!me) {
      // I'm not a player, show join form
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
          <div className="w-full max-w-sm space-y-5">
            <div className="text-center">
              <h1 className="text-3xl font-black text-yellow-400">COMIC PARTY</h1>
              <p className="text-gray-400 text-sm mt-1">Stanza: {gameState.roomCode}</p>
            </div>
            {error && <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-300 text-sm text-center">{error}</div>}
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Il tuo nome" className="h-14 text-lg bg-gray-800 border-gray-600 text-white" maxLength={15} />
            <Button onClick={() => name.trim() && joinRoom(gameState.roomCode, name)} disabled={!name.trim()} className="w-full h-14 text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900">
              ENTRA
            </Button>
          </div>
        </div>
      )
    }

    // I'm a player in lobby
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-yellow-400">COMIC PARTY</h1>
          <Button onClick={leaveRoom} variant="ghost" className="text-gray-400"><LogOut className="w-5 h-5 mr-1" /> Esci</Button>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-5 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl border-3 border-black">{me.avatar || '🎭'}</div>
            <div>
              <p className="text-xl font-bold text-white">{me.name}</p>
              {me.isHost && <Badge className="bg-purple-600 mt-1"><Crown className="w-3 h-3 mr-1" /> Host</Badge>}
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 mb-5 text-center">
          <p className="text-gray-400 text-sm">Codice Stanza</p>
          <p className="text-3xl font-mono font-bold text-white tracking-widest">{gameState.roomCode}</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-4 mb-5 flex items-center justify-center gap-3">
          <Users className="w-5 h-5 text-yellow-400" />
          <span className="text-xl font-bold text-white">{gameState.players.length} / {gameState.settings.maxPlayers}</span>
          <span className="text-gray-400">giocatori</span>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-yellow-400 mx-auto mb-3" />
            <p className="text-white font-medium">In attesa dell'host...</p>
            {me.isHost && gameState.players.length >= 2 && (
              <Button onClick={startGame} className="mt-4 bg-green-500 text-white">INIZIA PARTITA</Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PLAYING PHASE
  if (gameState.phase === 'playing') {
    // Judge view
    if (me?.isJudge) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">Round {gameState.roundNumber}</span>
            </div>
            <Timer time={gameState.timer} max={gameState.settings.roundTime} />
          </div>

          <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-5 text-center mb-5">
            <Crown className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-white mb-1">SEI IL GIUDICE</h2>
            <p className="text-yellow-200 text-sm">Aspetta che tutti scelgano</p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-5">
            <p className="text-gray-400 text-xs text-center mb-2">Setup:</p>
            {gameState.currentSetup.map((card, i) => (
              <div key={card.id} className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-3 mb-2">
                <p className="text-white text-sm text-center">{card.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-auto bg-gray-800/50 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Hanno scelto</p>
            <p className="text-2xl font-bold text-white">{gameState.players.filter(p => !p.isJudge && p.hasSubmitted).length} / {gameState.players.filter(p => !p.isJudge).length}</p>
          </div>
        </div>
      );
    }

    // Already submitted
    if (me?.hasSubmitted) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-bold">Round {gameState.roundNumber}</span>
            <Timer time={gameState.timer} max={gameState.settings.roundTime} />
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Hai scelto!</h2>
              <p className="text-gray-400">Aspetta gli altri</p>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Ancora in scelta</p>
            <p className="text-3xl font-bold text-yellow-400">{gameState.players.filter(p => !p.isJudge && !p.hasSubmitted).length}</p>
          </div>
        </div>
      );
    }

    // Loading cards - THIS IS THE KEY FIX
    if (playerCards.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
          <Loader2 className="w-10 h-10 animate-spin text-yellow-400 mb-3" />
          <p className="text-white">Distribuzione carte...</p>
          <p className="text-gray-500 text-xs mt-1">Round {gameState.roundNumber}</p>
          <Button onClick={() => { setRequestedCards(false); getPlayerCards(); }} variant="outline" className="mt-4 text-sm text-yellow-400 border-yellow-400">
            <RefreshCw className="w-4 h-4 mr-2" /> Richiedi carte
          </Button>
        </div>
      );
    }

    // Choosing cards
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">Round {gameState.roundNumber}</span>
            <Badge className="bg-purple-600 text-xs">{playerCards.length} carte</Badge>
          </div>
          <Timer time={gameState.timer} max={gameState.settings.roundTime} />
        </div>

        <div className="bg-gray-800/50 rounded-xl p-3 mb-4">
          <p className="text-gray-400 text-xs text-center mb-2">Completa la storia:</p>
          {gameState.currentSetup.map(card => (
            <div key={card.id} className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-2 mb-1">
              <p className="text-white text-xs text-center">{card.text}</p>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-x-auto py-2">
          <div className="flex gap-3 px-2 min-w-max pb-2">
            {playerCards.map(card => (
              <div key={card.id} className="w-32 flex-shrink-0">
                <GameCard card={card} selected={selected === card.id} onClick={() => setSelected(card.id)} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mb-3">
          <ChevronLeft className="w-4 h-4" /> Scorri <ChevronRight className="w-4 h-4" />
        </div>

        <Button onClick={() => selected && submitCard(selected)} disabled={!selected} className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-gray-900 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50">
          CONFERMA
        </Button>
      </div>
    );
  }

  // JUDGING PHASE
  if (gameState.phase === 'judging') {
    const canVote = me?.isJudge
    const hasVoted = me?.hasVoted

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-bold">{me?.isJudge ? 'GIUDICA!' : 'VOTA!'}</span>
          </div>
          <Timer time={gameState.timer} max={60} />
        </div>

        {!canVote && !hasVoted && (
          <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-3 mb-4 text-center">
            <p className="text-purple-200 text-sm">Il giudice sta scegliendo...</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {gameState.submittedPunchlines.map(card => (
              <GameCard key={card.id} card={card} selected={selected === card.id} onClick={canVote && !hasVoted ? () => setSelected(card.id) : undefined} />
            ))}
          </div>
        </div>

        {canVote && !hasVoted && (
          <Button onClick={() => selected && vote(selected)} disabled={!selected} className="w-full h-14 mt-4 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50">
            VOTA
          </Button>
        )}

        {hasVoted && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 mt-4 text-center">
            <Check className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <p className="text-green-200 font-medium">Hai votato!</p>
          </div>
        )}
      </div>
    );
  }

  // RESULTS PHASE
  if (gameState.phase === 'results') {
    const winner = gameState.players.find(p => p.id === gameState.winner)
    const iWon = gameState.winner === playerId

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col p-4">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            {iWon ? (
              <>
                <div className="text-5xl mb-3 animate-bounce">🎉</div>
                <h2 className="text-3xl font-black text-yellow-400 mb-1">HAI VINTO!</h2>
                <p className="text-gray-400">+1 punto</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-3">🏆</div>
                <h2 className="text-2xl font-bold text-white mb-1">{winner?.name} vince!</h2>
              </>
            )}
          </div>
        </div>

        {gameState.winningCard && (
          <div className="mb-5">
            <p className="text-gray-400 text-xs text-center mb-2">Carta vincente:</p>
            <div className="max-w-[180px] mx-auto">
              <GameCard card={gameState.winningCard} />
            </div>
          </div>
        )}

        {me && (
          <div className="bg-gray-800/50 rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Il tuo punteggio</p>
            <p className="text-3xl font-bold text-yellow-400">{me.score} <Star className="inline w-5 h-5" /></p>
          </div>
        )}
      </div>
    );
  }

  // GAME OVER
  if (gameState.phase === 'gameOver') {
    const sorted = [...gameState.players].sort((a, b) => b.score - a.score)
    const myRank = sorted.findIndex(p => p.id === playerId) + 1

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col p-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-yellow-400">FINE PARTITA!</h1>
        </div>

        {me && (
          <div className={cn('rounded-xl p-5 mb-5 text-center border-3', myRank === 1 ? 'bg-yellow-500/20 border-yellow-500' : 'bg-gray-800/50 border-gray-600')}>
            {myRank === 1 && <div className="text-3xl mb-1">👑</div>}
            <p className="text-gray-400 text-sm">Classifica</p>
            <p className={cn('text-4xl font-black mb-1', myRank === 1 ? 'text-yellow-400' : 'text-white')}>#{myRank}</p>
            <p className="text-lg text-white">{me.name}</p>
            <p className="text-xl font-bold text-yellow-400 mt-1">{me.score} punti</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto mb-5">
          <p className="text-gray-400 text-xs mb-2 text-center">Classifica finale</p>
          {sorted.map((p, i) => (
            <div key={p.id} className={cn('flex items-center gap-2 p-2 rounded-lg mb-1', p.id === playerId ? 'bg-yellow-500/20 border border-yellow-500' : 'bg-gray-800/50')}>
              <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', i === 0 ? 'bg-yellow-500 text-yellow-900' : i === 1 ? 'bg-gray-400 text-gray-800' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-700 text-gray-300')}>
                {i + 1}
              </div>
              <span className="text-lg">{p.avatar}</span>
              <span className="flex-1 text-white font-medium text-sm">{p.name}</span>
              <span className="text-yellow-400 font-bold">{p.score}</span>
            </div>
          ))}
        </div>

        <Button onClick={leaveRoom} className="w-full h-14 text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 border-3 border-black">
          GIOCA ANCORA
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-yellow-400" />
    </div>
  );
}

export default MobileController;
