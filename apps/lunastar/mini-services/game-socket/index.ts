import { Server } from 'socket.io';

const PORT = 3003;

const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Game state storage
const rooms: Record<string, {
  game: string;
  players: { id: string; name: string; isHost: boolean }[];
  state: any;
}> = {};

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  // Create room
  socket.on('create-room', ({ game, playerName }: { game: string; playerName: string }) => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    rooms[roomCode] = {
      game,
      players: [{ id: socket.id, name: playerName || 'Host', isHost: true }],
      state: { status: 'waiting' }
    };
    
    socket.join(roomCode);
    socket.emit('room-created', { roomCode, room: rooms[roomCode] });
    console.log(`Room created: ${roomCode} for game: ${game}`);
  });

  // Join room
  socket.on('join-room', ({ roomCode, playerName }: { roomCode: string; playerName: string }) => {
    const room = rooms[roomCode];
    
    if (!room) {
      socket.emit('error', { message: 'Stanza non trovata' });
      return;
    }

    room.players.push({ 
      id: socket.id, 
      name: playerName || `Player ${room.players.length + 1}`, 
      isHost: false 
    });
    
    socket.join(roomCode);
    io.to(roomCode).emit('player-joined', { room });
    socket.emit('room-joined', { roomCode, room });
    console.log(`Player joined room: ${roomCode}`);
  });

  // Start game
  socket.on('start-game', ({ roomCode }: { roomCode: string }) => {
    const room = rooms[roomCode];
    if (room) {
      room.state.status = 'playing';
      io.to(roomCode).emit('game-started', { room });
      console.log(`Game started in room: ${roomCode}`);
    }
  });

  // Game actions
  socket.on('game-action', ({ roomCode, action }: { roomCode: string; action: any }) => {
    const room = rooms[roomCode];
    if (room) {
      io.to(roomCode).emit('game-update', { action, playerId: socket.id });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    
    // Remove player from rooms
    for (const [code, room] of Object.entries(rooms)) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        io.to(code).emit('player-left', { room });
        
        // Delete room if empty
        if (room.players.length === 0) {
          delete rooms[code];
        }
      }
    }
  });
});

console.log(`🎮 Game WebSocket server running on port ${PORT}`);
