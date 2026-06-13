import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================
// HELPER FUNCTIONS
// ============================================
function generateCode(): string {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function shuffle(array: any[]) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const AI_NAMES = ['Bot Mario', 'Bot Luigi', 'Bot Peach', 'Bot Toad', 'Bot Yoshi'];

// ============================================
// DECK CREATION FUNCTIONS
// ============================================
function createBriscolaDeck() {
  const suits = [
    { suit: 'denari', emoji: '🪙' },
    { suit: 'coppe', emoji: '🏆' },
    { suit: 'spade', emoji: '⚔️' },
    { suit: 'bastoni', emoji: '🪵' },
  ];
  const values = [
    { value: 'A', points: 11 },
    { value: '2', points: 0 },
    { value: '3', points: 10 },
    { value: '4', points: 0 },
    { value: '5', points: 0 },
    { value: '6', points: 0 },
    { value: '7', points: 0 },
    { value: 'J', points: 2 },
    { value: 'Q', points: 3 },
    { value: 'K', points: 4 },
  ];
  
  const deck: any[] = [];
  for (const s of suits) {
    for (const v of values) {
      deck.push({ 
        suit: s.emoji, 
        suitName: s.suit,
        value: v.value, 
        id: `${s.suit}-${v.value}`, 
        points: v.points 
      });
    }
  }
  return shuffle(deck);
}

function createUnoDeck() {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const deck: any[] = [];
  
  for (const c of colors) {
    deck.push({ color: c, value: '0', id: `${c}-0`, type: 'number' });
    for (let i = 1; i <= 9; i++) {
      deck.push({ color: c, value: String(i), id: `${c}-${i}-a`, type: 'number' });
      deck.push({ color: c, value: String(i), id: `${c}-${i}-b`, type: 'number' });
    }
    for (const s of ['🚫', '⇄', '+2']) {
      deck.push({ color: c, value: s, id: `${c}-${s}-a`, type: 'special' });
      deck.push({ color: c, value: s, id: `${c}-${s}-b`, type: 'special' });
    }
  }
  
  for (let i = 0; i < 4; i++) {
    deck.push({ color: 'black', value: '🎨', id: `wild-${i}`, type: 'wild' });
    deck.push({ color: 'black', value: '+4', id: `wild4-${i}`, type: 'wild' });
  }
  
  return shuffle(deck);
}

function createScopaDeck() {
  const suits = [
    { suit: 'denari', emoji: '🪙' },
    { suit: 'coppe', emoji: '🏆' },
    { suit: 'spade', emoji: '⚔️' },
    { suit: 'bastoni', emoji: '🪵' },
  ];
  const valueMappings: { value: string; numValue: number }[] = [
    { value: 'A', numValue: 1 },
    { value: '2', numValue: 2 },
    { value: '3', numValue: 3 },
    { value: '4', numValue: 4 },
    { value: '5', numValue: 5 },
    { value: '6', numValue: 6 },
    { value: '7', numValue: 7 },
    { value: 'J', numValue: 8 },
    { value: 'Q', numValue: 9 },
    { value: 'K', numValue: 10 },
  ];
  
  const deck: any[] = [];
  for (const s of suits) {
    for (const v of valueMappings) {
      deck.push({ 
        suit: s.emoji, 
        suitName: s.suit,
        value: v.value, 
        id: `${s.suit}-${v.value}`, 
        numValue: v.numValue,
        isDenari: s.suit === 'denari'
      });
    }
  }
  return shuffle(deck);
}

// ============================================
// CPU LOGIC
// ============================================
function cpuPlayBriscola(gameState: any) {
  const currentPlayer = gameState.players.find((p: any) => p.id === gameState.currentTurn);
  
  if (!currentPlayer || !currentPlayer.id.startsWith('cpu-')) return false;
  if (!currentPlayer.hand?.length) {
    // Skip if no cards but deck has cards - deal should happen first
    const currentIdx = gameState.players.findIndex((p: any) => p.id === gameState.currentTurn);
    const nextIdx = (currentIdx + 1) % gameState.players.length;
    gameState.currentTurn = gameState.players[nextIdx].id;
    return true;
  }
  
  // Smarter CPU: prefer lower value cards, avoid briscola if possible
  let cardIndex = 0;
  const briscolaSuit = gameState.briscolaSuit;
  const hand = currentPlayer.hand;
  
  // Find non-briscola cards with lowest points
  const nonBriscolaCards = hand.map((c: any, i: number) => ({ card: c, index: i }))
    .filter((item: any) => item.card.suit !== briscolaSuit);
  
  if (nonBriscolaCards.length > 0) {
    // Play lowest point non-briscola card
    nonBriscolaCards.sort((a: any, b: any) => (a.card.points || 0) - (b.card.points || 0));
    cardIndex = nonBriscolaCards[0].index;
  } else {
    // All briscola - play lowest value
    const sortedHand = hand.map((c: any, i: number) => ({ card: c, index: i }));
    sortedHand.sort((a: any, b: any) => (a.card.points || 0) - (b.card.points || 0));
    cardIndex = sortedHand[0].index;
  }
  
  const card = currentPlayer.hand.splice(cardIndex, 1)[0];
  
  gameState.currentTrick = gameState.currentTrick || [];
  gameState.currentTrick.push({ 
    playerId: currentPlayer.id, 
    card,
    playerName: currentPlayer.name 
  });
  
  gameState.lastAction = {
    playerId: currentPlayer.id,
    message: `${currentPlayer.name} gioca ${card.suit}${card.value}`
  };
  
  if (gameState.currentTrick.length === gameState.players.length) {
    let winningPlay = gameState.currentTrick[0];
    
    for (const play of gameState.currentTrick) {
      const isBriscola = play.card.suit === briscolaSuit;
      const winningIsBriscola = winningPlay.card.suit === briscolaSuit;
      
      if (isBriscola && !winningIsBriscola) {
        winningPlay = play;
      } else if (play.card.suit === gameState.currentTrick[0].card.suit && !isBriscola) {
        const values = ['2', '4', '5', '6', '7', 'J', 'Q', 'K', '3', 'A'];
        if (values.indexOf(play.card.value) > values.indexOf(winningPlay.card.value)) {
          winningPlay = play;
        }
      }
    }
    
    const points = gameState.currentTrick.reduce((sum: number, p: any) => sum + (p.card.points || 0), 0);
    const winner = gameState.players.find((p: any) => p.id === winningPlay.playerId);
    if (winner) winner.points = (winner.points || 0) + points;
    
    gameState.currentTrick = [];
    gameState.currentTurn = winningPlay.playerId;
    
    // Deal cards: winner first, then others in order
    if (gameState.deck.length > 0 && winner?.hand.length < 3) {
      winner.hand.push(gameState.deck.pop());
    }
    for (const p of gameState.players) {
      if (p.id !== winner?.id && gameState.deck.length > 0 && p.hand.length < 3) {
        p.hand.push(gameState.deck.pop());
      }
    }
  } else {
    const currentIdx = gameState.players.findIndex((p: any) => p.id === gameState.currentTurn);
    const nextIdx = (currentIdx + 1) % gameState.players.length;
    gameState.currentTurn = gameState.players[nextIdx].id;
  }
  
  if (gameState.players.every((p: any) => p.hand.length === 0) && gameState.deck.length === 0) {
    gameState.phase = 'gameOver';
    const maxPoints = Math.max(...gameState.players.map((p: any) => p.points || 0));
    gameState.winner = gameState.players.find((p: any) => p.points === maxPoints)?.id;
  }
  
  return true;
}

function cpuPlayUno(gameState: any) {
  const currentPlayer = gameState.players.find((p: any) => p.id === gameState.currentTurn);
  
  if (!currentPlayer || !currentPlayer.id.startsWith('cpu-')) return false;
  
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const currentColor = gameState.currentColor;
  
  // Find all playable cards
  const playableCards = currentPlayer.hand.filter((c: any) => {
    // Wild cards are always playable
    if (c.type === 'wild') return true;
    // Match current color
    if (c.color === currentColor) return true;
    // Match value
    if (c.value === topCard.value) return true;
    return false;
  });
  
  // Prefer special cards and cards matching color over wild cards
  let playableCard = playableCards.find((c: any) => c.type !== 'wild' && c.value === topCard.value);
  if (!playableCard) {
    playableCard = playableCards.find((c: any) => c.color === currentColor && c.type !== 'wild');
  }
  if (!playableCard) {
    playableCard = playableCards[0]; // Any playable card including wilds
  }
  
  if (playableCard) {
    const cardIndex = currentPlayer.hand.findIndex((c: any) => c.id === playableCard.id);
    currentPlayer.hand.splice(cardIndex, 1);
    
    if (playableCard.type === 'wild') {
      // Choose color based on hand
      const colorCounts: Record<string, number> = {};
      for (const c of currentPlayer.hand) {
        if (c.color && c.color !== 'black') {
          colorCounts[c.color] = (colorCounts[c.color] || 0) + 1;
        }
      }
      const bestColor = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0];
      playableCard.chosenColor = bestColor ? bestColor[0] : 'red';
      gameState.currentColor = playableCard.chosenColor;
    } else {
      gameState.currentColor = playableCard.color;
    }
    
    gameState.discardPile.push(playableCard);
    
    gameState.lastAction = {
      playerId: currentPlayer.id,
      message: `${currentPlayer.name} gioca ${playableCard.value} ${playableCard.chosenColor || playableCard.color || ''}`
    };
    
    // Handle special cards
    if (playableCard.value === '⇄') {
      gameState.direction = gameState.direction * -1;
    }
    
    if (playableCard.value === '🚫') {
      // Skip next player
      gameState.lastAction.message += ' (SALTA!)';
    }
    
    if (playableCard.value === '+2') {
      // Next player draws 2
      const currentIdx = gameState.players.findIndex((p: any) => p.id === gameState.currentTurn);
      const nextPlayerIdx = (currentIdx + gameState.direction + gameState.players.length) % gameState.players.length;
      const nextPlayer = gameState.players[nextPlayerIdx];
      for (let i = 0; i < 2; i++) {
        if (gameState.deck.length === 0) reshuffleDeck(gameState);
        if (gameState.deck.length > 0) nextPlayer.hand.push(gameState.deck.pop());
      }
      gameState.lastAction.message += ' (+2!)';
    }
    
    if (playableCard.value === '+4') {
      // Next player draws 4
      const currentIdx = gameState.players.findIndex((p: any) => p.id === gameState.currentTurn);
      const nextPlayerIdx = (currentIdx + gameState.direction + gameState.players.length) % gameState.players.length;
      const nextPlayer = gameState.players[nextPlayerIdx];
      for (let i = 0; i < 4; i++) {
        if (gameState.deck.length === 0) reshuffleDeck(gameState);
        if (gameState.deck.length > 0) nextPlayer.hand.push(gameState.deck.pop());
      }
      gameState.lastAction.message += ` (+4! Colore: ${playableCard.chosenColor})`;
    }
    
    if (currentPlayer.hand.length === 0) {
      gameState.phase = 'gameOver';
      gameState.winner = currentPlayer.id;
      return true;
    }
  } else {
    // No playable card - MUST draw from deck
    if (gameState.deck.length === 0) {
      reshuffleDeck(gameState);
    }
    
    if (gameState.deck.length > 0) {
      const drawnCard = gameState.deck.pop();
      currentPlayer.hand.push(drawnCard);
      gameState.lastAction = {
        playerId: currentPlayer.id,
        message: `${currentPlayer.name} pesca una carta (${currentPlayer.hand.length} carte)`
      };
    } else {
      // Truly no cards available
      gameState.lastAction = {
        playerId: currentPlayer.id,
        message: `${currentPlayer.name} non può pescare - mazzo vuoto!`
      };
    }
  }
  
  // Move to next player (considering skips from special cards)
  const currentIdx = gameState.players.findIndex((p: any) => p.id === gameState.currentTurn);
  let nextIdx = (currentIdx + gameState.direction + gameState.players.length) % gameState.players.length;
  
  // Skip if played skip card, +2, or +4
  if (playableCard?.value === '🚫' || playableCard?.value === '+2' || playableCard?.value === '+4') {
    nextIdx = (nextIdx + gameState.direction + gameState.players.length) % gameState.players.length;
  }
  
  gameState.currentTurn = gameState.players[nextIdx].id;
  
  return true;
}

// Helper function to reshuffle deck when empty
function reshuffleDeck(gameState: any) {
  if (gameState.discardPile.length <= 1) return; // Can't reshuffle with only top card
  
  const topCard = gameState.discardPile.pop();
  gameState.deck = shuffle([...gameState.discardPile]);
  gameState.discardPile = [topCard];
}

function cpuSelectCharacter(gameState: any) {
  for (const player of gameState.players) {
    if (player.id.startsWith('cpu-') && player.secretCharacter === -1) {
      player.secretCharacter = Math.floor(Math.random() * 50) + 1;
    }
  }
  
  if (gameState.players.every((p: any) => p.secretCharacter !== -1)) {
    gameState.phase = 'playing';
    gameState.currentQuestioner = gameState.players.find((p: any) => !p.id.startsWith('cpu-'))?.id || gameState.players[0].id;
  }
  
  return true;
}

function cpuAskQuestion(gameState: any) {
  const cpuPlayer = gameState.players.find((p: any) => p.id === gameState.currentQuestioner && p.id.startsWith('cpu-'));
  
  if (!cpuPlayer) return false;
  
  const questions = [
    { text: 'Ha gli occhiali? 👓', key: 'glasses' },
    { text: 'Ha il cappello? 🎩', key: 'hat' },
    { text: 'Ha la barba? 🧔', key: 'beard' },
    { text: 'Ha i capelli biondi? 💛', key: 'hair_biondi' },
    { text: 'Ha i capelli neri? 🖤', key: 'hair_neri' },
  ];
  
  const q = questions[Math.floor(Math.random() * questions.length)];
  gameState.currentQuestion = q.text;
  gameState.currentQuestionKey = q.key;
  gameState.waitingForAnswer = true;
  gameState.targetPlayerId = gameState.players.find((p: any) => !p.id.startsWith('cpu-'))?.id;
  
  return true;
}

function cpuPlayForza4(gameState: any) {
  if (gameState.cpuThinking) return false;
  
  if (!gameState.cpuThinkingStartTime) {
    gameState.cpuThinking = true;
    gameState.cpuThinkingStartTime = Date.now();
    return false;
  }
  
  const elapsed = Date.now() - gameState.cpuThinkingStartTime;
  if (elapsed < 1500) return false;
  
  gameState.cpuThinking = false;
  gameState.cpuThinkingStartTime = null;
  
  const currentPlayer = gameState.players.find((p: any) => p.id === gameState.currentTurn);
  
  if (!currentPlayer || !currentPlayer.id.startsWith('cpu-')) return false;
  if (gameState.phase === 'gameOver') return false;
  
  const board = gameState.board as number[][];
  const playerIndex = gameState.players.findIndex((p: any) => p.id === currentPlayer.id);
  const cpuNum = playerIndex + 1;
  const opponentNum = cpuNum === 1 ? 2 : 1;
  
  const checkWin = (board: number[][], player: number): boolean => {
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === player && board[r][c+1] === player && board[r][c+2] === player && board[r][c+3] === player) return true;
      }
    }
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 7; c++) {
        if (board[r][c] === player && board[r+1][c] === player && board[r+2][c] === player && board[r+3][c] === player) return true;
      }
    }
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === player && board[r+1][c+1] === player && board[r+2][c+2] === player && board[r+3][c+3] === player) return true;
      }
    }
    for (let r = 3; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === player && board[r-1][c+1] === player && board[r-2][c+2] === player && board[r-3][c+3] === player) return true;
      }
    }
    return false;
  };
  
  const findRow = (board: number[][], col: number): number => {
    for (let r = 5; r >= 0; r--) {
      if (board[r][col] === 0) return r;
    }
    return -1;
  };
  
  const validColumns: number[] = [];
  for (let c = 0; c < 7; c++) {
    if (findRow(board, c) !== -1) validColumns.push(c);
  }
  
  if (validColumns.length === 0) return false;
  
  let bestCol = -1;
  
  // Check for winning move
  for (const col of validColumns) {
    const row = findRow(board, col);
    const testBoard = board.map(r => [...r]);
    testBoard[row][col] = cpuNum;
    if (checkWin(testBoard, cpuNum)) {
      bestCol = col;
      break;
    }
  }
  
  // Block opponent's winning move
  if (bestCol === -1) {
    for (const col of validColumns) {
      const row = findRow(board, col);
      const testBoard = board.map(r => [...r]);
      testBoard[row][col] = opponentNum;
      if (checkWin(testBoard, opponentNum)) {
        bestCol = col;
        break;
      }
    }
  }
  
  // Prefer center columns
  if (bestCol === -1) {
    const centerPreference = [3, 2, 4, 1, 5, 0, 6];
    for (const col of centerPreference) {
      if (validColumns.includes(col)) {
        bestCol = col;
        break;
      }
    }
  }
  
  const row = findRow(board, bestCol);
  board[row][bestCol] = cpuNum;
  
  if (checkWin(board, cpuNum)) {
    gameState.phase = 'gameOver';
    gameState.winner = currentPlayer.id;
    gameState.lastAction = {
      playerId: currentPlayer.id,
      message: `${currentPlayer.name} vince!`
    };
    return true;
  }
  
  if (board[0].every((cell: number) => cell !== 0)) {
    gameState.phase = 'gameOver';
    gameState.winner = 'draw';
    return true;
  }
  
  const currentIdx = gameState.players.findIndex((p: any) => p.id === gameState.currentTurn);
  gameState.currentTurn = gameState.players[(currentIdx + 1) % gameState.players.length].id;
  gameState.lastAction = {
    playerId: currentPlayer.id,
    message: `${currentPlayer.name} gioca colonna ${bestCol + 1}`
  };
  
  return true;
}

function processCpuTurns(gameState: any, gameType: string) {
  if (!gameState) return;
  
  let iterations = 0;
  const maxIterations = 20; // Increased for multi-player games
  
  while (iterations < maxIterations) {
    const currentPlayer = gameState.players?.find((p: any) => p.id === gameState.currentTurn);
    const isCpuTurn = currentPlayer?.id?.startsWith('cpu-');
    const isCpuQuestioner = gameState.currentQuestioner?.startsWith('cpu-');
    
    // Break if game is over
    if (gameState.phase === 'gameOver') break;
    
    // Break if waiting for player answer (Indovina Chi)
    if (gameState.waitingForAnswer) break;
    
    // For Briscola/UNO/Scopa - break if it's not CPU turn
    if (gameType !== 'forza4' && gameType !== 'indovinachi' && !isCpuTurn) break;
    
    // For Indovina Chi - handle CPU turns
    if (gameType === 'indovinachi') {
      if (gameState.phase === 'selecting') {
        cpuSelectCharacter(gameState);
        iterations++;
        continue;
      }
      if (isCpuQuestioner && !gameState.waitingForAnswer) {
        cpuAskQuestion(gameState);
        break; // After asking, wait for answer
      }
      break;
    }
    
    // For Forza 4 - special delay handling
    if (gameType === 'forza4') {
      if (!isCpuTurn) break;
      
      // Check if we need to start thinking
      if (!gameState.cpuThinking) {
        gameState.cpuThinking = true;
        gameState.cpuThinkingStartTime = Date.now();
        return; // Return to save state and wait
      }
      
      // Check if still thinking
      const elapsed = Date.now() - (gameState.cpuThinkingStartTime || 0);
      if (elapsed < 1000) {
        return; // Still thinking, wait more
      }
      
      // Time to play - reset thinking state
      gameState.cpuThinking = false;
      gameState.cpuThinkingStartTime = null;
      
      if (!cpuPlayForza4(gameState)) {
        return; // Something went wrong
      }
      iterations++;
      continue;
    }
    
    // For Briscola - with bot card display delay
    if (gameType === 'briscola' && isCpuTurn) {
      // Check if CPU has cards to play
      if (!currentPlayer.hand || currentPlayer.hand.length === 0) {
        break;
      }
      
      // Check if we already played a card but need to show it
      if (gameState.botShowCard) {
        const elapsed = Date.now() - (gameState.botShowCard.timestamp || 0);
        if (elapsed < 6000) {
          return; // Still showing the card
        }
        // Done showing, clear the state and continue
        gameState.botShowCard = null;
      }
      
      // Play the card
      if (!cpuPlayBriscola(gameState)) {
        break;
      }
      
      // If bot played a card, set show state
      if (gameState.lastAction && currentPlayer.id.startsWith('cpu-')) {
        // Find the card just played
        const lastTrick = gameState.currentTrick || [];
        if (lastTrick.length > 0) {
          const lastPlay = lastTrick[lastTrick.length - 1];
          if (lastPlay.playerId.startsWith('cpu-')) {
            gameState.botShowCard = {
              card: lastPlay.card,
              playerName: lastPlay.playerName,
              timestamp: Date.now()
            };
            return; // Return to show the card
          }
        }
      }
      
      iterations++;
      continue;
    }
    
    // For UNO
    if (gameType === 'uno' && isCpuTurn) {
      if (!cpuPlayUno(gameState)) {
        break;
      }
      iterations++;
      continue;
    }
    
    // For Scopa - CPU plays a card randomly
    if (gameType === 'scopa' && isCpuTurn) {
      if (!currentPlayer.hand || currentPlayer.hand.length === 0) {
        break;
      }
      
      const cardIndex = Math.floor(Math.random() * currentPlayer.hand.length);
      const card = currentPlayer.hand.splice(cardIndex, 1)[0];
      
      // Try to capture
      const tableCards = gameState.tableCards || [];
      const captures = findCaptureCombinations(tableCards, card.numValue);
      
      if (captures.length > 0) {
        const selectedCapture = captures[0];
        currentPlayer.collectedCards = currentPlayer.collectedCards || [];
        currentPlayer.collectedCards.push(card);
        
        for (const capturedCard of selectedCapture) {
          const tableIdx = tableCards.findIndex((c: any) => c.id === capturedCard.id);
          if (tableIdx !== -1) {
            currentPlayer.collectedCards.push(tableCards.splice(tableIdx, 1)[0]);
          }
        }
        
        gameState.lastCapturer = currentPlayer.id;
        
        const isScopa = tableCards.length === 0;
        if (isScopa) {
          currentPlayer.scopas = (currentPlayer.scopas || 0) + 1;
          gameState.lastAction = { playerId: currentPlayer.id, message: `SCOPA! 🎉` };
        }
      } else {
        tableCards.push(card);
      }
      
      // Deal more cards if needed
      const allHandsEmpty = gameState.players.every((p: any) => p.hand.length === 0);
      if (allHandsEmpty && gameState.deck.length > 0) {
        for (const p of gameState.players) {
          for (let i = 0; i < 3; i++) {
            if (gameState.deck.length > 0) {
              p.hand.push(gameState.deck.pop());
            }
          }
        }
      }
      
      // Check game over
      if (gameState.players.every((p: any) => p.hand.length === 0) && gameState.deck.length === 0) {
        const lastCapturer = gameState.lastCapturer || gameState.players[0].id;
        const lastPlayer = gameState.players.find((p: any) => p.id === lastCapturer);
        if (lastPlayer && tableCards.length > 0) {
          lastPlayer.collectedCards = lastPlayer.collectedCards || [];
          lastPlayer.collectedCards.push(...tableCards);
          tableCards.length = 0;
        }
        gameState.phase = 'gameOver';
        gameState.finalScores = calculateScopaScores(gameState);
        break;
      }
      
      const currentIdx = gameState.players.findIndex((p: any) => p.id === currentPlayer.id);
      gameState.currentTurn = gameState.players[(currentIdx + 1) % gameState.players.length].id;
      
      iterations++;
      continue;
    }
    
    // If we get here, break to prevent infinite loop
    break;
  }
}

// ============================================
// SCOPA HELPERS
// ============================================
function findCaptureCombinations(tableCards: any[], targetValue: number): any[][] {
  const results: any[][] = [];
  
  for (const card of tableCards) {
    if (card.numValue === targetValue) {
      results.push([card]);
    }
  }
  
  if (targetValue > 1) {
    const findSums = (cards: any[], target: number, current: any[], start: number) => {
      if (target === 0 && current.length >= 2) {
        results.push([...current]);
        return;
      }
      if (target < 0 || start >= cards.length) return;
      
      for (let i = start; i < cards.length; i++) {
        if (cards[i].numValue === targetValue) continue;
        findSums(cards, target - cards[i].numValue, [...current, cards[i]], i + 1);
      }
    };
    
    findSums(tableCards, targetValue, [], 0);
  }
  
  return results;
}

function calculateScopaScores(gameState: any) {
  const scores: { playerId: string; points: number; details: string[] }[] = [];
  
  for (const player of gameState.players) {
    const collected = player.collectedCards || [];
    const details: string[] = [];
    let points = 0;
    
    details.push(`Carte: ${collected.length} carte raccolte`);
    const denariCount = collected.filter((c: any) => c.suitName === 'denari').length;
    details.push(`Denari: ${denariCount} denari`);
    const hasSettebello = collected.some((c: any) => c.suitName === 'denari' && c.value === '7');
    details.push(`Settebello: ${hasSettebello ? 'Sì' : 'No'}`);
    const scopaCount = player.scopas || 0;
    details.push(`Scopa: ${scopaCount} scopa${scopaCount !== 1 ? 'e' : ''}`);
    
    scores.push({ playerId: player.id, points, details });
  }
  
  const player1Collected = gameState.players[0]?.collectedCards || [];
  const player2Collected = gameState.players[1]?.collectedCards || [];
  
  if (player1Collected.length > player2Collected.length) {
    scores[0].points += 1;
    scores[0].details[0] += ' ✓ +1 punto';
  } else if (player2Collected.length > player1Collected.length) {
    scores[1].points += 1;
    scores[1].details[0] += ' ✓ +1 punto';
  }
  
  const p1Denari = player1Collected.filter((c: any) => c.suitName === 'denari').length;
  const p2Denari = player2Collected.filter((c: any) => c.suitName === 'denari').length;
  if (p1Denari > p2Denari) {
    scores[0].points += 1;
    scores[0].details[1] += ' ✓ +1 punto';
  } else if (p2Denari > p1Denari) {
    scores[1].points += 1;
    scores[1].details[1] += ' ✓ +1 punto';
  }
  
  for (let i = 0; i < gameState.players.length; i++) {
    const hasSettebello = (i === 0 ? player1Collected : player2Collected)
      .some((c: any) => c.suitName === 'denari' && c.value === '7');
    if (hasSettebello) {
      scores[i].points += 1;
      scores[i].details[2] += ' ✓ +1 punto';
    }
  }
  
  for (let i = 0; i < gameState.players.length; i++) {
    const scopaCount = gameState.players[i]?.scopas || 0;
    scores[i].points += scopaCount;
    if (scopaCount > 0) {
      scores[i].details[3] += ` ✓ +${scopaCount} punti`;
    }
  }
  
  return scores;
}

// ============================================
// API HANDLERS
// ============================================
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const roomCode = searchParams.get('roomCode');
  const playerId = searchParams.get('playerId');
  
  if (!roomCode) {
    return NextResponse.json({ success: false, error: 'Codice stanza mancante' });
  }
  
  try {
    const room = await db.room.findUnique({
      where: { code: roomCode.toUpperCase() },
      include: { players: true }
    });
    
    if (!room) {
      return NextResponse.json({ success: false, error: 'Stanza non trovata' });
    }
    
    let gameState = room.gameState as any;
    
    // Process CPU turns if needed (critical for all games)
    if (gameState && gameState.phase !== 'gameOver' && room.vsCpu) {
      const currentPlayer = gameState.players?.find((p: any) => p.id === gameState.currentTurn);
      const isCpuTurn = currentPlayer?.id?.startsWith('cpu-');
      const isIndovinachiCpuQuestioner = gameState.currentQuestioner?.startsWith('cpu-') && !gameState.waitingForAnswer;
      
      if (isCpuTurn || isIndovinachiCpuQuestioner || (gameState.phase === 'selecting' && room.gameType === 'indovinachi')) {
        // Store previous values to detect changes
        const prevTurn = gameState.currentTurn;
        const prevCpuThinking = gameState.cpuThinking;
        const prevPhase = gameState.phase;
        const prevBotShowCard = gameState.botShowCard;
        
        // Process CPU turns
        processCpuTurns(gameState, room.gameType);
        
        // Always update if: turn changed, game over, has action, CPU thinking state changed, or bot show card changed
        const thinkingChanged = gameState.cpuThinking !== prevCpuThinking;
        const turnChanged = gameState.currentTurn !== prevTurn;
        const phaseChanged = gameState.phase !== prevPhase;
        const botShowCardChanged = gameState.botShowCard !== prevBotShowCard;
        
        if (turnChanged || phaseChanged || gameState.phase === 'gameOver' || gameState.lastAction || thinkingChanged || botShowCardChanged) {
          await db.room.update({
            where: { id: room.id },
            data: {
              gameState,
              phase: gameState.phase,
              currentTurn: gameState.currentTurn,
              winner: gameState.winner,
              lastAction: gameState.lastAction
            }
          });
        }
      }
    }
    
    // Get player's hand from game state
    let myCards = null;
    let mySecret = null;
    
    if (gameState?.players) {
      const gamePlayer = gameState.players.find((p: any) => p.id === playerId);
      if (gamePlayer) {
        myCards = gamePlayer.hand || [];
        mySecret = gamePlayer.secretCharacter;
      }
    }
    
    // Return players from game state (which has updated scores, cards, etc.)
    const gamePlayers = gameState?.players || room.players.map(p => ({
      id: p.persistentId,
      name: p.name,
      isHost: p.isHost,
      score: p.score,
      isCpu: p.isCpu
    }));
    
    return NextResponse.json({
      success: true,
      gameState,
      players: gamePlayers,
      myCards,
      mySecret,
      gameType: room.gameType,
      isMyTurnToAnswer: gameState?.waitingForAnswer && gameState?.targetPlayerId === playerId,
      currentQuestion: gameState?.currentQuestion,
      lastAction: gameState?.lastAction
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ success: false, error: 'Errore del server' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, roomCode, gameType, playerName, playerId, cardId, characterId, vsCpu, numBots, chosenColor, answer, questionKey, targetPlayerId, column } = body;

    switch (action) {
      case 'createRoom': {
        const code = generateCode();
        const pId = playerId || `player-${Date.now()}`;
        
        // Create room with initial player
        const room = await db.room.create({
          data: {
            code,
            gameType,
            hostId: pId,
            vsCpu: !!vsCpu,
            phase: 'lobby',
            players: {
              create: {
                persistentId: pId,
                name: playerName,
                isHost: true,
                isCpu: false
              }
            }
          },
          include: { players: true }
        });
        
        // Add CPU players if requested
        if (vsCpu) {
          const bots = numBots || 1;
          for (let i = 0; i < bots; i++) {
            await db.player.create({
              data: {
                persistentId: `cpu-${i}`,
                name: AI_NAMES[i % AI_NAMES.length],
                roomId: room.id,
                isHost: false,
                isCpu: true
              }
            });
          }
        }
        
        // Fetch updated room with all players
        const updatedRoom = await db.room.findUnique({
          where: { id: room.id },
          include: { players: true }
        });
        
        return NextResponse.json({ 
          success: true, 
          roomCode: code, 
          playerId: pId, 
          players: updatedRoom?.players.map(p => ({
            id: p.persistentId,
            name: p.name,
            isHost: p.isHost,
            isCpu: p.isCpu,
            score: p.score
          }))
        });
      }

      case 'joinRoom': {
        const room = await db.room.findUnique({
          where: { code: roomCode?.toUpperCase() },
          include: { players: true }
        });
        
        if (!room) {
          return NextResponse.json({ success: false, error: 'Stanza non trovata!' });
        }
        
        if (room.phase !== 'lobby') {
          return NextResponse.json({ success: false, error: 'Partita già iniziata!' });
        }
        
        const pId = playerId || `player-${Date.now()}`;
        
        await db.player.create({
          data: {
            persistentId: pId,
            name: playerName,
            roomId: room.id,
            isHost: false,
            isCpu: false
          }
        });
        
        const updatedRoom = await db.room.findUnique({
          where: { id: room.id },
          include: { players: true }
        });
        
        return NextResponse.json({ 
          success: true, 
          playerId: pId, 
          gameType: room.gameType, 
          players: updatedRoom?.players.map(p => ({
            id: p.persistentId,
            name: p.name,
            isHost: p.isHost,
            isCpu: p.isCpu,
            score: p.score
          }))
        });
      }

      case 'startGame': {
        const room = await db.room.findUnique({
          where: { code: roomCode?.toUpperCase() },
          include: { players: true }
        });
        
        if (!room) {
          return NextResponse.json({ success: false, error: 'Stanza non trovata!' });
        }
        
        const players = room.players.map(p => ({
          id: p.persistentId,
          name: p.name,
          hand: [],
          score: 0,
          points: 0,
          isCpu: p.isCpu
        }));
        
        const gameState: any = {
          phase: 'playing',
          currentTurn: players[0].id,
          players,
          lastAction: null,
        };
        
        if (gameType === 'briscola') {
          const deck = createBriscolaDeck();
          // In traditional Briscola, the last card in the deck is the trump card
          // We store the trump suit but keep the card in the deck (it will be the last one drawn)
          gameState.briscolaSuit = deck[deck.length - 1].suit; // Last card determines trump
          gameState.briscolaCard = deck[deck.length - 1]; // Store for reference
          gameState.deck = deck;
          gameState.currentTrick = [];
          gameState.players.forEach((p: any) => { 
            p.hand = [];
            p.points = 0;
            for (let i = 0; i < 3; i++) {
              if (deck.length > 0) p.hand.push(deck.pop());
            }
          });
        }

        if (gameType === 'forza4') {
          gameState.board = Array(6).fill(null).map(() => Array(7).fill(0));
          gameState.phase = 'playing';
          gameState.winner = null;
          gameState.currentTurn = players[0].id;
          gameState.cpuThinking = false;
          gameState.cpuThinkingStartTime = null;
        }

        if (gameType === 'uno') {
          const deck = createUnoDeck();
          let startCard = deck.pop()!;
          while (startCard.type === 'wild') {
            deck.unshift(startCard);
            deck.sort(() => Math.random() - 0.5);
            startCard = deck.pop()!;
          }
          gameState.deck = deck;
          gameState.discardPile = [startCard];
          gameState.currentColor = startCard.color;
          gameState.direction = 1;
          gameState.players.forEach((p: any) => { 
            p.hand = [];
            for (let i = 0; i < 7; i++) {
              if (deck.length > 0) p.hand.push(deck.pop());
            }
          });
        }

        if (gameType === 'indovinachi') {
          gameState.phase = 'selecting';
          gameState.players.forEach((p: any) => {
            p.secretCharacter = -1;
            p.eliminatedCharacters = [];
          });
        }

        if (gameType === 'scopa') {
          const deck = createScopaDeck();
          gameState.deck = deck;
          gameState.tableCards = [];
          gameState.lastCapturer = null;
          
          for (let i = 0; i < 4; i++) {
            if (deck.length > 0) {
              gameState.tableCards.push(deck.pop());
            }
          }
          
          gameState.players.forEach((p: any) => {
            p.hand = [];
            p.collectedCards = [];
            p.scopas = 0;
            for (let i = 0; i < 3; i++) {
              if (deck.length > 0) p.hand.push(deck.pop());
            }
          });
        }
        
        // Process CPU turns if needed
        if (room.vsCpu) {
          processCpuTurns(gameState, gameType);
        }
        
        // Update room in database
        await db.room.update({
          where: { id: room.id },
          data: {
            phase: gameState.phase,
            gameState,
            currentTurn: gameState.currentTurn,
            winner: gameState.winner
          }
        });
        
        const me = gameState.players?.find((p: any) => p.id === playerId);
        
        return NextResponse.json({ 
          success: true, 
          gameState, 
          myCards: me?.hand || [],
          board: gameState.board
        });
      }

      case 'playCard': {
        const room = await db.room.findUnique({
          where: { code: roomCode?.toUpperCase() },
          include: { players: true }
        });
        
        if (!room || !room.gameState) {
          return NextResponse.json({ success: false });
        }
        
        const gameState = room.gameState as any;
        const player = gameState.players?.find((p: any) => p.id === playerId);
        
        if (!player) {
          return NextResponse.json({ success: false });
        }
        
        const cardIndex = player.hand?.findIndex((c: any) => c.id === cardId);
        if (cardIndex === -1) {
          return NextResponse.json({ success: false, error: 'Carta non trovata' });
        }
        
        const card = player.hand.splice(cardIndex, 1)[0];
        gameState.lastAction = null;
        
        if (gameType === 'uno') {
          // Handle wild card color selection
          if (chosenColor && card.type === 'wild') {
            card.chosenColor = chosenColor;
            gameState.currentColor = chosenColor;
          } else {
            gameState.currentColor = card.color;
          }
          
          gameState.discardPile.push(card);
          
          // Handle special cards
          let skipNext = false;
          
          if (card.value === '⇄') {
            // Reverse direction
            gameState.direction = gameState.direction * -1;
            gameState.lastAction = { playerId, message: 'Direzione invertita!' };
          }
          
          if (card.value === '🚫') {
            // Skip next player
            skipNext = true;
            gameState.lastAction = { playerId, message: 'Salta il prossimo!' };
          }
          
          if (card.value === '+2') {
            // Next player draws 2
            const currentIdx = gameState.players.findIndex((p: any) => p.id === playerId);
            const nextPlayerIdx = (currentIdx + gameState.direction + gameState.players.length) % gameState.players.length;
            const nextPlayer = gameState.players[nextPlayerIdx];
            for (let i = 0; i < 2; i++) {
              if (gameState.deck.length === 0) reshuffleDeck(gameState);
              if (gameState.deck.length > 0) nextPlayer.hand.push(gameState.deck.pop());
            }
            skipNext = true;
            gameState.lastAction = { playerId, message: `+2! ${nextPlayer.name} pesca 2 carte` };
          }
          
          if (card.value === '+4') {
            // Next player draws 4
            const currentIdx = gameState.players.findIndex((p: any) => p.id === playerId);
            const nextPlayerIdx = (currentIdx + gameState.direction + gameState.players.length) % gameState.players.length;
            const nextPlayer = gameState.players[nextPlayerIdx];
            for (let i = 0; i < 4; i++) {
              if (gameState.deck.length === 0) reshuffleDeck(gameState);
              if (gameState.deck.length > 0) nextPlayer.hand.push(gameState.deck.pop());
            }
            skipNext = true;
            gameState.lastAction = { playerId, message: `+4! ${nextPlayer.name} pesca 4 carte. Colore: ${chosenColor}` };
          }
          
          // Move to next player
          const currentIdx = gameState.players.findIndex((p: any) => p.id === playerId);
          let nextIdx = (currentIdx + gameState.direction + gameState.players.length) % gameState.players.length;
          
          // Skip if needed
          if (skipNext) {
            nextIdx = (nextIdx + gameState.direction + gameState.players.length) % gameState.players.length;
          }
          
          gameState.currentTurn = gameState.players[nextIdx].id;
          
          if (player.hand.length === 0) {
            gameState.phase = 'gameOver';
            gameState.winner = playerId;
          }
        } else if (gameType === 'scopa') {
          const tableCards = gameState.tableCards || [];
          const captures = findCaptureCombinations(tableCards, card.numValue);
          const selectedCaptureIndex = body.captureIndex || 0;
          
          if (captures.length > 0) {
            const selectedCapture = captures[Math.min(selectedCaptureIndex, captures.length - 1)];
            
            player.collectedCards = player.collectedCards || [];
            player.collectedCards.push(card);
            
            for (const capturedCard of selectedCapture) {
              const tableIdx = tableCards.findIndex((c: any) => c.id === capturedCard.id);
              if (tableIdx !== -1) {
                const captured = tableCards.splice(tableIdx, 1)[0];
                player.collectedCards.push(captured);
              }
            }
            
            gameState.lastCapturer = playerId;
            
            const isScopa = tableCards.length === 0 && selectedCapture.length > 0;
            if (isScopa) {
              player.scopas = (player.scopas || 0) + 1;
              gameState.lastAction = { playerId, message: `SCOPA! 🎉` };
            } else {
              gameState.lastAction = { playerId, message: `Cattura ${selectedCapture.length + 1} carte` };
            }
          } else {
            tableCards.push(card);
            gameState.lastAction = { playerId, message: `Gioca ${card.suit}${card.value}` };
          }
          
          const allHandsEmpty = gameState.players.every((p: any) => p.hand.length === 0);
          if (allHandsEmpty && gameState.deck.length > 0) {
            for (const p of gameState.players) {
              for (let i = 0; i < 3; i++) {
                if (gameState.deck.length > 0) {
                  p.hand.push(gameState.deck.pop());
                }
              }
            }
          }
          
          if (gameState.players.every((p: any) => p.hand.length === 0) && gameState.deck.length === 0) {
            const lastCapturer = gameState.lastCapturer || gameState.players[0].id;
            const lastPlayer = gameState.players.find((p: any) => p.id === lastCapturer);
            if (lastPlayer && tableCards.length > 0) {
              lastPlayer.collectedCards = lastPlayer.collectedCards || [];
              lastPlayer.collectedCards.push(...tableCards);
              tableCards.length = 0;
            }
            
            gameState.phase = 'gameOver';
            gameState.finalScores = calculateScopaScores(gameState);
            gameState.winner = gameState.finalScores.find((s: any) => s.points === Math.max(...gameState.finalScores.map((x: any) => x.points)))?.playerId;
          } else {
            const currentIdx = gameState.players.findIndex((p: any) => p.id === playerId);
            const nextIdx = (currentIdx + 1) % gameState.players.length;
            gameState.currentTurn = gameState.players[nextIdx].id;
          }
        } else {
          // Briscola
          gameState.currentTrick = gameState.currentTrick || [];
          gameState.currentTrick.push({ playerId, card, playerName: player.name });
          
          if (gameState.currentTrick.length === gameState.players.length) {
            const briscolaSuit = gameState.briscolaSuit;
            let winningPlay = gameState.currentTrick[0];
            
            for (const play of gameState.currentTrick) {
              const isBriscola = play.card.suit === briscolaSuit;
              const winningIsBriscola = winningPlay.card.suit === briscolaSuit;
              
              if (isBriscola && !winningIsBriscola) {
                winningPlay = play;
              } else if (play.card.suit === gameState.currentTrick[0].card.suit && !isBriscola) {
                const values = ['2', '4', '5', '6', '7', 'J', 'Q', 'K', '3', 'A'];
                if (values.indexOf(play.card.value) > values.indexOf(winningPlay.card.value)) {
                  winningPlay = play;
                }
              }
            }
            
            const points = gameState.currentTrick.reduce((sum: number, p: any) => sum + (p.card.points || 0), 0);
            const winner = gameState.players.find((p: any) => p.id === winningPlay.playerId);
            if (winner) winner.points = (winner.points || 0) + points;
            
            gameState.currentTrick = [];
            gameState.currentTurn = winningPlay.playerId;
            
            if (gameState.deck.length > 0 && winner?.hand.length < 3) {
              winner.hand.push(gameState.deck.pop());
            }
            for (const p of gameState.players) {
              if (p.id !== winner?.id && gameState.deck.length > 0 && p.hand.length < 3) {
                p.hand.push(gameState.deck.pop());
              }
            }
            
            if (gameState.players.every((p: any) => p.hand.length === 0) && gameState.deck.length === 0) {
              gameState.phase = 'gameOver';
              const maxPoints = Math.max(...gameState.players.map((p: any) => p.points || 0));
              gameState.winner = gameState.players.find((p: any) => p.points === maxPoints)?.id;
            }
          } else {
            const currentIdx = gameState.players.findIndex((p: any) => p.id === playerId);
            const nextIdx = (currentIdx + 1) % gameState.players.length;
            gameState.currentTurn = gameState.players[nextIdx].id;
          }
        }
        
        // Process CPU turns
        if (room.vsCpu) {
          processCpuTurns(gameState, gameType);
        }
        
        // Save to database
        await db.room.update({
          where: { id: room.id },
          data: {
            gameState,
            phase: gameState.phase,
            currentTurn: gameState.currentTurn,
            winner: gameState.winner,
            lastAction: gameState.lastAction
          }
        });
        
        return NextResponse.json({ 
          success: true, 
          gameState, 
          hand: player.hand,
          opponentAction: gameState.lastAction?.message 
        });
      }

      case 'drawCard': {
        const room = await db.room.findUnique({
          where: { code: roomCode?.toUpperCase() },
          include: { players: true }
        });
        
        if (!room || !room.gameState) {
          return NextResponse.json({ success: false });
        }
        
        const gameState = room.gameState as any;
        
        // Reshuffle if deck is empty
        if (!gameState.deck?.length) {
          reshuffleDeck(gameState);
        }
        
        if (!gameState.deck?.length) {
          return NextResponse.json({ success: false, error: 'Nessuna carta disponibile' });
        }
        
        const player = gameState.players.find((p: any) => p.id === playerId);
        if (!player) {
          return NextResponse.json({ success: false });
        }
        
        const card = gameState.deck.pop();
        player.hand.push(card);
        
        gameState.lastAction = { 
          playerId, 
          message: `${player.name} pesca una carta (${player.hand.length} carte)` 
        };
        
        const currentIdx = gameState.players.findIndex((p: any) => p.id === playerId);
        const nextIdx = (currentIdx + (gameState.direction || 1) + gameState.players.length) % gameState.players.length;
        gameState.currentTurn = gameState.players[nextIdx].id;
        
        if (room.vsCpu) {
          processCpuTurns(gameState, room.gameType);
        }
        
        await db.room.update({
          where: { id: room.id },
          data: { gameState, currentTurn: gameState.currentTurn, lastAction: gameState.lastAction }
        });
        
        return NextResponse.json({ success: true, hand: player.hand, gameState });
      }

      case 'selectCharacter': {
        const room = await db.room.findUnique({
          where: { code: roomCode?.toUpperCase() },
          include: { players: true }
        });
        
        if (!room || !room.gameState) {
          return NextResponse.json({ success: false });
        }
        
        const gameState = room.gameState as any;
        const player = gameState.players.find((p: any) => p.id === playerId);
        
        if (player) {
          player.secretCharacter = characterId;
        }
        
        if (room.vsCpu) {
          processCpuTurns(gameState, gameType);
        }
        
        await db.room.update({
          where: { id: room.id },
          data: { gameState, phase: gameState.phase }
        });
        
        return NextResponse.json({ success: true, gameState, mySecret: characterId });
      }

      case 'askQuestion': {
        const room = await db.room.findUnique({
          where: { code: roomCode?.toUpperCase() },
          include: { players: true }
        });
        
        if (!room || !room.gameState) {
          return NextResponse.json({ success: false });
        }
        
        const gameState = room.gameState as any;
        const targetPlayer = gameState.players.find((p: any) => p.id === targetPlayerId);
        
        if (!targetPlayer || targetPlayer.secretCharacter === -1) {
          return NextResponse.json({ success: false, error: 'Giocatore non valido' });
        }

        const CHARACTERS = [
          { id: 1, glasses: false, hat: false, beard: false, hair: 'castani', age: 'young', gender: 'male', mustache: false },
          { id: 2, glasses: true, hat: false, beard: false, hair: 'biondi', age: 'young', gender: 'male', mustache: false },
          { id: 3, glasses: false, hat: false, beard: false, hair: 'neri', age: 'young', gender: 'male', mustache: false },
          { id: 4, glasses: false, hat: true, beard: false, hair: 'rossi', age: 'young', gender: 'male', mustache: false },
          { id: 5, glasses: false, hat: false, beard: false, hair: 'castani', age: 'young', gender: 'male', mustache: true },
          { id: 6, glasses: false, hat: false, beard: true, hair: 'castani', age: 'young', gender: 'male', mustache: false },
          { id: 7, glasses: true, hat: false, beard: false, hair: 'neri', age: 'young', gender: 'male', mustache: true },
          { id: 8, glasses: false, hat: false, beard: true, hair: 'castani', age: 'young', gender: 'male', mustache: false },
          { id: 9, glasses: false, hat: false, beard: false, hair: 'neri', age: 'young', gender: 'male', mustache: false },
          { id: 10, glasses: true, hat: false, beard: false, hair: 'biondi', age: 'young', gender: 'male', mustache: false },
          { id: 11, glasses: false, hat: false, beard: true, hair: 'castani', age: 'adult', gender: 'male', mustache: true },
          { id: 12, glasses: true, hat: false, beard: false, hair: 'neri', age: 'adult', gender: 'male', mustache: true },
          { id: 13, glasses: false, hat: true, beard: true, hair: 'bianchi', age: 'adult', gender: 'male', mustache: false },
          { id: 14, glasses: true, hat: false, beard: false, hair: 'castani', age: 'adult', gender: 'male', mustache: false },
          { id: 15, glasses: false, hat: false, beard: true, hair: 'neri', age: 'adult', gender: 'male', mustache: true },
          { id: 16, glasses: true, hat: false, beard: true, hair: 'biondi', age: 'adult', gender: 'male', mustache: false },
          { id: 17, glasses: false, hat: true, beard: false, hair: 'castani', age: 'adult', gender: 'male', mustache: false },
          { id: 18, glasses: false, hat: false, beard: false, hair: 'neri', age: 'adult', gender: 'male', mustache: false },
          { id: 19, glasses: true, hat: false, beard: false, hair: 'bianchi', age: 'adult', gender: 'male', mustache: false },
          { id: 20, glasses: false, hat: false, beard: true, hair: 'castani', age: 'adult', gender: 'male', mustache: true },
          { id: 21, glasses: true, hat: false, beard: false, hair: 'neri', age: 'adult', gender: 'male', mustache: false },
          { id: 22, glasses: false, hat: true, beard: false, hair: 'biondi', age: 'adult', gender: 'male', mustache: false },
          { id: 23, glasses: true, hat: false, beard: false, hair: 'bianchi', age: 'elder', gender: 'male', mustache: true },
          { id: 24, glasses: true, hat: true, beard: true, hair: 'bianchi', age: 'elder', gender: 'male', mustache: false },
          { id: 25, glasses: false, hat: false, beard: true, hair: 'bianchi', age: 'elder', gender: 'male', mustache: true },
          { id: 26, glasses: true, hat: false, beard: false, hair: 'castani', age: 'elder', gender: 'male', mustache: false },
          { id: 27, glasses: false, hat: true, beard: false, hair: 'neri', age: 'elder', gender: 'male', mustache: false },
          { id: 28, glasses: true, hat: false, beard: true, hair: 'bianchi', age: 'elder', gender: 'male', mustache: false },
          { id: 29, glasses: false, hat: false, beard: false, hair: 'castani', age: 'elder', gender: 'male', mustache: true },
          { id: 30, glasses: true, hat: true, beard: false, hair: 'bianchi', age: 'elder', gender: 'male', mustache: false },
          { id: 31, glasses: false, hat: false, beard: false, hair: 'biondi', age: 'young', gender: 'female', earrings: true },
          { id: 32, glasses: false, hat: false, beard: false, hair: 'neri', age: 'young', gender: 'female', earrings: false },
          { id: 33, glasses: false, hat: false, beard: false, hair: 'rossi', age: 'young', gender: 'female', earrings: true },
          { id: 34, glasses: true, hat: false, beard: false, hair: 'castani', age: 'young', gender: 'female', earrings: false },
          { id: 35, glasses: false, hat: true, beard: false, hair: 'biondi', age: 'young', gender: 'female', earrings: true },
          { id: 36, glasses: true, hat: false, beard: false, hair: 'neri', age: 'young', gender: 'female', earrings: false },
          { id: 37, glasses: false, hat: false, beard: false, hair: 'castani', age: 'young', gender: 'female', earrings: true },
          { id: 38, glasses: true, hat: true, beard: false, hair: 'biondi', age: 'young', gender: 'female', earrings: false },
          { id: 39, glasses: false, hat: false, beard: false, hair: 'neri', age: 'young', gender: 'female', earrings: true },
          { id: 40, glasses: true, hat: false, beard: false, hair: 'rossi', age: 'young', gender: 'female', earrings: true },
          { id: 41, glasses: true, hat: false, beard: false, hair: 'castani', age: 'adult', gender: 'female', earrings: true },
          { id: 42, glasses: false, hat: false, beard: false, hair: 'biondi', age: 'adult', gender: 'female', earrings: false },
          { id: 43, glasses: true, hat: true, beard: false, hair: 'neri', age: 'adult', gender: 'female', earrings: true },
          { id: 44, glasses: false, hat: false, beard: false, hair: 'castani', age: 'adult', gender: 'female', earrings: false },
          { id: 45, glasses: true, hat: false, beard: false, hair: 'biondi', age: 'adult', gender: 'female', earrings: true },
          { id: 46, glasses: false, hat: true, beard: false, hair: 'rossi', age: 'adult', gender: 'female', earrings: true },
          { id: 47, glasses: true, hat: false, beard: false, hair: 'bianchi', age: 'elder', gender: 'female', earrings: false },
          { id: 48, glasses: false, hat: true, beard: false, hair: 'bianchi', age: 'elder', gender: 'female', earrings: true },
          { id: 49, glasses: true, hat: false, beard: false, hair: 'bianchi', age: 'elder', gender: 'female', earrings: true },
          { id: 50, glasses: false, hat: true, beard: false, hair: 'castani', age: 'elder', gender: 'female', earrings: false },
        ];

        const secretChar = CHARACTERS.find(c => c.id === targetPlayer.secretCharacter);
        let answerResult = false;

        if (questionKey === 'gender_male') answerResult = secretChar?.gender === 'male';
        else if (questionKey === 'gender_female') answerResult = secretChar?.gender === 'female';
        else if (questionKey === 'age_young') answerResult = secretChar?.age === 'young';
        else if (questionKey === 'age_adult') answerResult = secretChar?.age === 'adult';
        else if (questionKey === 'age_elder') answerResult = secretChar?.age === 'elder';
        else if (questionKey === 'glasses') answerResult = secretChar?.glasses || false;
        else if (questionKey === 'hat') answerResult = secretChar?.hat || false;
        else if (questionKey === 'beard') answerResult = secretChar?.beard || false;
        else if (questionKey === 'mustache') answerResult = secretChar?.mustache || false;
        else if (questionKey === 'earrings') answerResult = (secretChar as any)?.earrings || false;
        else if (questionKey === 'hair_biondi') answerResult = secretChar?.hair === 'biondi';
        else if (questionKey === 'hair_neri') answerResult = secretChar?.hair === 'neri';
        else if (questionKey === 'hair_bianchi') answerResult = secretChar?.hair === 'bianchi';
        else if (questionKey === 'hair_castani') answerResult = secretChar?.hair === 'castani';
        else if (questionKey === 'hair_rossi') answerResult = secretChar?.hair === 'rossi';
        
        // CPU's turn to ask
        gameState.currentQuestioner = gameState.players.find((p: any) => p.id.startsWith('cpu-'))?.id;
        gameState.waitingForAnswer = false;
        
        await db.room.update({
          where: { id: room.id },
          data: { gameState }
        });
        
        if (room.vsCpu) {
          setTimeout(async () => {
            const updatedRoom = await db.room.findUnique({ where: { id: room.id } });
            if (updatedRoom?.gameState) {
              const gs = updatedRoom.gameState as any;
              processCpuTurns(gs, gameType);
              await db.room.update({ where: { id: room.id }, data: { gameState: gs } });
            }
          }, 1000);
        }
        
        return NextResponse.json({ success: true, answer: answerResult, gameState });
      }

      case 'makeGuess': {
        const room = await db.room.findUnique({
          where: { code: roomCode?.toUpperCase() },
          include: { players: true }
        });
        
        if (!room || !room.gameState) {
          return NextResponse.json({ success: false });
        }
        
        const gameState = room.gameState as any;
        const targetPlayer = gameState.players.find((p: any) => p.id !== playerId);
        const correct = targetPlayer?.secretCharacter === characterId;

        if (correct) {
          gameState.phase = 'gameOver';
          gameState.winner = playerId;
          gameState.revealedCharacter = targetPlayer?.secretCharacter;
          gameState.winMessage = `Hai indovinato il personaggio!`;
        } else {
          const cpu = gameState.players.find((p: any) => p.id.startsWith('cpu-'));
          if (cpu) {
            gameState.phase = 'gameOver';
            gameState.winner = cpu.id;
            gameState.revealedCharacter = targetPlayer?.secretCharacter;
            gameState.winMessage = `${cpu.name} ha vinto!`;
          }
        }
        
        await db.room.update({
          where: { id: room.id },
          data: { gameState, phase: gameState.phase, winner: gameState.winner }
        });

        return NextResponse.json({ success: true, correct, gameState });
      }

      case 'playForza4': {
        const room = await db.room.findUnique({
          where: { code: roomCode?.toUpperCase() },
          include: { players: true }
        });
        
        if (!room || !room.gameState) {
          return NextResponse.json({ success: false, error: 'Stanza non trovata' });
        }
        
        const gameState = room.gameState as any;
        
        if (gameState.phase === 'gameOver') {
          return NextResponse.json({ success: false, error: 'Partita finita' });
        }
        
        if (gameState.currentTurn !== playerId) {
          return NextResponse.json({ success: false, error: 'Non è il tuo turno' });
        }
        
        const board = gameState.board;
        
        // Find the lowest empty row in the column
        let row = -1;
        for (let r = 5; r >= 0; r--) {
          if (board[r][column] === 0) {
            row = r;
            break;
          }
        }
        
        if (row === -1) {
          return NextResponse.json({ success: false, error: 'Colonna piena' });
        }
        
        // Place the piece (use player index as piece value)
        const playerIndex = gameState.players.findIndex((p: any) => p.id === playerId);
        board[row][column] = playerIndex + 1;
        
        // Check for win
        const checkWin = (player: number): boolean => {
          // Horizontal
          for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 4; c++) {
              if (board[r][c] === player && board[r][c+1] === player && 
                  board[r][c+2] === player && board[r][c+3] === player) {
                return true;
              }
            }
          }
          // Vertical
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 7; c++) {
              if (board[r][c] === player && board[r+1][c] === player && 
                  board[r+2][c] === player && board[r+3][c] === player) {
                return true;
              }
            }
          }
          // Diagonal (down-right)
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 4; c++) {
              if (board[r][c] === player && board[r+1][c+1] === player && 
                  board[r+2][c+2] === player && board[r+3][c+3] === player) {
                return true;
              }
            }
          }
          // Diagonal (up-right)
          for (let r = 3; r < 6; r++) {
            for (let c = 0; c < 4; c++) {
              if (board[r][c] === player && board[r-1][c+1] === player && 
                  board[r-2][c+2] === player && board[r-3][c+3] === player) {
                return true;
              }
            }
          }
          return false;
        };
        
        if (checkWin(playerIndex + 1)) {
          gameState.phase = 'gameOver';
          gameState.winner = playerId;
        } else {
          // Check for draw
          const isDraw = board[0].every((cell: number) => cell !== 0);
          if (isDraw) {
            gameState.phase = 'gameOver';
            gameState.winner = 'draw';
          } else {
            // Switch turn
            const currentIdx = gameState.players.findIndex((p: any) => p.id === playerId);
            const nextIdx = (currentIdx + 1) % gameState.players.length;
            gameState.currentTurn = gameState.players[nextIdx].id;
            
            gameState.lastAction = {
              playerId,
              message: `Gioca colonna ${column + 1}`
            };
          }
        }
        
        // Process CPU turn if needed
        if (room.vsCpu && gameState.phase !== 'gameOver' && gameState.currentTurn.startsWith('cpu-')) {
          processCpuTurns(gameState, 'forza4');
        }
        
        await db.room.update({
          where: { id: room.id },
          data: {
            gameState,
            phase: gameState.phase,
            currentTurn: gameState.currentTurn,
            winner: gameState.winner
          }
        });
        
        return NextResponse.json({ success: true, gameState });
      }

      default:
        return NextResponse.json({ success: false, error: 'Azione non riconosciuta' });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ success: false, error: 'Errore del server' });
  }
}
