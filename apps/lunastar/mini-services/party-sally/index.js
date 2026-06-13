const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ============================================
// GAME STATE MANAGEMENT (In-Memory)
// ============================================

const rooms = new Map();
const ROOM_CODE_LENGTH = 6;

// Generate random room code
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create empty game board for Forza 4
function createForza4Board() {
  return Array(6).fill(null).map(() => Array(7).fill(0));
}

// Create empty board for Tris
function createTrisBoard() {
  return Array(9).fill(null);
}

// Check Forza 4 win condition
function checkForza4Win(board, player) {
  const ROWS = 6;
  const COLS = 7;
  
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] === player && 
          board[r][c+1] === player && 
          board[r][c+2] === player && 
          board[r][c+3] === player) {
        return true;
      }
    }
  }
  
  // Vertical
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === player && 
          board[r+1][c] === player && 
          board[r+2][c] === player && 
          board[r+3][c] === player) {
        return true;
      }
    }
  }
  
  // Diagonal (down-right)
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] === player && 
          board[r+1][c+1] === player && 
          board[r+2][c+2] === player && 
          board[r+3][c+3] === player) {
        return true;
      }
    }
  }
  
  // Diagonal (up-right)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] === player && 
          board[r-1][c+1] === player && 
          board[r-2][c+2] === player && 
          board[r-3][c+3] === player) {
        return true;
      }
    }
  }
  
  return false;
}

// Check if Forza 4 board is full (draw)
function isForza4BoardFull(board) {
  return board[0].every(cell => cell !== 0);
}

// Check Tris win condition
function checkTrisWin(board, player) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];
  
  for (const pattern of winPatterns) {
    if (pattern.every(i => board[i] === player)) {
      return true;
    }
  }
  return false;
}

// Check if Tris board is full (draw)
function isTrisBoardFull(board) {
  return board.every(cell => cell !== null);
}

// Get winning line for Tris
function getTrisWinningLine(board) {
  const winPatterns = [
    { indices: [0, 1, 2], type: 'row0' },
    { indices: [3, 4, 5], type: 'row1' },
    { indices: [6, 7, 8], type: 'row2' },
    { indices: [0, 3, 6], type: 'col0' },
    { indices: [1, 4, 7], type: 'col1' },
    { indices: [2, 5, 8], type: 'col2' },
    { indices: [0, 4, 8], type: 'diag0' },
    { indices: [2, 4, 6], type: 'diag1' }
  ];
  
  for (const pattern of winPatterns) {
    if (pattern.indices.every(i => board[i] === board[pattern.indices[0]]) && board[pattern.indices[0]] !== null) {
      return pattern;
    }
  }
  return null;
}

// Get winning positions for Forza 4
function getForza4WinningPositions(board, player) {
  const ROWS = 6;
  const COLS = 7;
  
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] === player && 
          board[r][c+1] === player && 
          board[r][c+2] === player && 
          board[r][c+3] === player) {
        return [[r, c], [r, c+1], [r, c+2], [r, c+3]];
      }
    }
  }
  
  // Vertical
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === player && 
          board[r+1][c] === player && 
          board[r+2][c] === player && 
          board[r+3][c] === player) {
        return [[r, c], [r+1, c], [r+2, c], [r+3, c]];
      }
    }
  }
  
  // Diagonal (down-right)
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] === player && 
          board[r+1][c+1] === player && 
          board[r+2][c+2] === player && 
          board[r+3][c+3] === player) {
        return [[r, c], [r+1, c+1], [r+2, c+2], [r+3, c+3]];
      }
    }
  }
  
  // Diagonal (up-right)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (board[r][c] === player && 
          board[r-1][c+1] === player && 
          board[r-2][c+2] === player && 
          board[r-3][c+3] === player) {
        return [[r, c], [r-1, c+1], [r-2, c+2], [r-3, c+3]];
      }
    }
  }
  
  return [];
}

// ============================================
// SOCKET.IO EVENT HANDLERS
// ============================================

io.on('connection', (socket) => {
  console.log(`🎮 Player connected: ${socket.id}`);
  
  // Create a new room
  socket.on('createRoom', ({ playerName, gameType }) => {
    let roomId;
    do {
      roomId = generateRoomCode();
    } while (rooms.has(roomId));
    
    const room = {
      id: roomId,
      gameType: gameType || 'forza4',
      players: [{
        id: socket.id,
        name: playerName || 'Player 1',
        color: 'red',
        symbol: 'X',
        isHost: true,
        score: 0
      }],
      state: 'waiting',
      currentTurn: socket.id,
      board: gameType === 'tris' ? createTrisBoard() : createForza4Board(),
      chat: [],
      createdAt: Date.now()
    };
    
    rooms.set(roomId, room);
    socket.join(roomId);
    socket.roomId = roomId;
    
    socket.emit('roomCreated', {
      roomId,
      player: room.players[0],
      room: sanitizeRoom(room)
    });
    
    console.log(`🏠 Room created: ${roomId} by ${playerName}`);
  });
  
  // Join an existing room
  socket.on('joinRoom', ({ roomId, playerName }) => {
    roomId = roomId.toUpperCase();
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Stanza non trovata!' });
      return;
    }
    
    if (room.players.length >= 2) {
      socket.emit('error', { message: 'Stanza piena!' });
      return;
    }
    
    if (room.state !== 'waiting') {
      socket.emit('error', { message: 'Partita già iniziata!' });
      return;
    }
    
    const player = {
      id: socket.id,
      name: playerName || 'Player 2',
      color: 'yellow',
      symbol: 'O',
      isHost: false,
      score: 0
    };
    
    room.players.push(player);
    socket.join(roomId);
    socket.roomId = roomId;
    
    socket.emit('roomJoined', {
      roomId,
      player,
      room: sanitizeRoom(room)
    });
    
    socket.to(roomId).emit('playerJoined', {
      player,
      room: sanitizeRoom(room)
    });
    
    console.log(`👤 ${playerName} joined room ${roomId}`);
  });
  
  // Start game
  socket.on('startGame', ({ roomId }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Stanza non trovata!' });
      return;
    }
    
    if (room.players.length < 2) {
      socket.emit('error', { message: 'Servono almeno 2 giocatori!' });
      return;
    }
    
    // Randomly choose who starts
    room.currentTurn = room.players[Math.floor(Math.random() * 2)].id;
    room.state = 'playing';
    room.board = room.gameType === 'tris' ? createTrisBoard() : createForza4Board();
    
    io.to(roomId).emit('gameStarted', {
      room: sanitizeRoom(room),
      firstTurn: room.currentTurn
    });
    
    console.log(`🎯 Game started in room ${roomId}`);
  });
  
  // Make a move (Forza 4)
  socket.on('makeMove', ({ roomId, column }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Stanza non trovata!' });
      return;
    }
    
    if (room.state !== 'playing') {
      socket.emit('error', { message: 'Partita non in corso!' });
      return;
    }
    
    if (room.currentTurn !== socket.id) {
      socket.emit('error', { message: 'Non è il tuo turno!' });
      return;
    }
    
    // Find the lowest empty row in the column
    let row = -1;
    for (let r = 5; r >= 0; r--) {
      if (room.board[r][column] === 0) {
        row = r;
        break;
      }
    }
    
    if (row === -1) {
      socket.emit('error', { message: 'Colonna piena!' });
      return;
    }
    
    // Get player number (1 or 2)
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    const playerNum = playerIndex + 1;
    
    // Make the move
    room.board[row][column] = playerNum;
    
    // Check for win
    const won = checkForza4Win(room.board, playerNum);
    const draw = !won && isForza4BoardFull(room.board);
    
    let winningPositions = [];
    if (won) {
      winningPositions = getForza4WinningPositions(room.board, playerNum);
    }
    
    // Broadcast move to all players
    io.to(roomId).emit('moveMade', {
      row,
      column,
      player: playerNum,
      playerId: socket.id,
      playerName: room.players[playerIndex].name,
      won,
      draw,
      winningPositions,
      nextTurn: won || draw ? null : room.players[1 - playerIndex].id
    });
    
    if (won) {
      room.state = 'finished';
      room.winner = socket.id;
      room.players[playerIndex].score++;
      io.to(roomId).emit('gameOver', {
        winner: socket.id,
        winnerName: room.players[playerIndex].name,
        winningPositions,
        scores: room.players.map(p => ({ id: p.id, name: p.name, score: p.score }))
      });
      console.log(`🏆 ${room.players[playerIndex].name} won in room ${roomId}!`);
    } else if (draw) {
      room.state = 'finished';
      io.to(roomId).emit('gameOver', {
        winner: null,
        draw: true,
        scores: room.players.map(p => ({ id: p.id, name: p.name, score: p.score }))
      });
      console.log(`🤝 Draw in room ${roomId}`);
    } else {
      room.currentTurn = room.players[1 - playerIndex].id;
    }
  });
  
  // Make a move (Tris)
  socket.on('makeTrisMove', ({ roomId, position }) => {
    const room = rooms.get(roomId);
    
    if (!room) {
      socket.emit('error', { message: 'Stanza non trovata!' });
      return;
    }
    
    if (room.state !== 'playing') {
      socket.emit('error', { message: 'Partita non in corso!' });
      return;
    }
    
    if (room.currentTurn !== socket.id) {
      socket.emit('error', { message: 'Non è il tuo turno!' });
      return;
    }
    
    if (room.board[position] !== null) {
      socket.emit('error', { message: 'Posizione occupata!' });
      return;
    }
    
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    const symbol = room.players[playerIndex].symbol;
    
    // Make the move
    room.board[position] = symbol;
    
    // Check for win
    const won = checkTrisWin(room.board, symbol);
    const draw = !won && isTrisBoardFull(room.board);
    
    let winningLine = null;
    if (won) {
      winningLine = getTrisWinningLine(room.board);
    }
    
    // Broadcast move to all players
    io.to(roomId).emit('trisMoveMade', {
      position,
      symbol,
      playerId: socket.id,
      playerName: room.players[playerIndex].name,
      won,
      draw,
      winningLine,
      nextTurn: won || draw ? null : room.players[1 - playerIndex].id
    });
    
    if (won) {
      room.state = 'finished';
      room.winner = socket.id;
      room.players[playerIndex].score++;
      io.to(roomId).emit('gameOver', {
        winner: socket.id,
        winnerName: room.players[playerIndex].name,
        winningLine,
        scores: room.players.map(p => ({ id: p.id, name: p.name, score: p.score }))
      });
    } else if (draw) {
      room.state = 'finished';
      io.to(roomId).emit('gameOver', {
        winner: null,
        draw: true,
        scores: room.players.map(p => ({ id: p.id, name: p.name, score: p.score }))
      });
    } else {
      room.currentTurn = room.players[1 - playerIndex].id;
    }
  });
  
  // Play again
  socket.on('playAgain', ({ roomId }) => {
    const room = rooms.get(roomId);
    
    if (!room) return;
    
    room.state = 'waiting';
    room.board = room.gameType === 'tris' ? createTrisBoard() : createForza4Board();
    room.winner = null;
    
    io.to(roomId).emit('resetGame', {
      room: sanitizeRoom(room)
    });
  });
  
  // Chat message
  socket.on('chatMessage', ({ roomId, message }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    
    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;
    
    const chatMsg = {
      id: Date.now(),
      playerId: socket.id,
      playerName: player.name,
      message: message.substring(0, 200),
      timestamp: Date.now()
    };
    
    room.chat.push(chatMsg);
    
    io.to(roomId).emit('chatMessage', chatMsg);
  });
  
  // Disconnect
  socket.on('disconnect', () => {
    const roomId = socket.roomId;
    if (!roomId) return;
    
    const room = rooms.get(roomId);
    if (!room) return;
    
    const playerIndex = room.players.findIndex(p => p.id === socket.id);
    if (playerIndex === -1) return;
    
    const player = room.players[playerIndex];
    room.players.splice(playerIndex, 1);
    
    console.log(`👋 ${player.name} left room ${roomId}`);
    
    if (room.players.length === 0) {
      rooms.delete(roomId);
      console.log(`🗑️ Room ${roomId} deleted (empty)`);
    } else {
      socket.to(roomId).emit('playerLeft', {
        playerId: socket.id,
        playerName: player.name,
        room: sanitizeRoom(room)
      });
    }
  });
  
  // Get room state (for reconnection or TV mode)
  socket.on('getRoomState', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: 'Stanza non trovata!' });
      return;
    }
    
    socket.join(roomId);
    socket.emit('roomState', sanitizeRoom(room));
  });
});

// Sanitize room data for client (remove sensitive info)
function sanitizeRoom(room) {
  return {
    id: room.id,
    gameType: room.gameType,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      color: p.color,
      symbol: p.symbol,
      isHost: p.isHost,
      score: p.score
    })),
    state: room.state,
    currentTurn: room.currentTurn,
    board: room.board,
    chat: room.chat.slice(-50), // Last 50 messages
    winner: room.winner
  };
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size,
    uptime: process.uptime()
  });
});

// Start server
const PORT = 3030;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 PartySally Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
});
