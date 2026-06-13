import { createServer } from 'http'
import { Server, Socket } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// ==================== Types ====================

interface Player {
  id: string
  socketId: string
  name: string
  isReady: boolean
  isHost: boolean
  deviceType: 'host' | 'controller'
  pairedDeviceId?: string
}

interface Room {
  code: string
  hostId: string
  players: Map<string, Player>
  gameState: GameState
  isGameStarted: boolean
  createdAt: Date
}

interface GameState {
  players: Record<string, PlayerState>
  timestamp: number
  frame: number
}

interface PlayerState {
  id: string
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  rotation: number
  health: number
  score: number
  customData?: Record<string, unknown>
}

interface ControllerInput {
  playerId: string
  type: 'move' | 'action' | 'button'
  data: {
    direction?: { x: number; y: number }
    action?: string
    button?: string
    pressed?: boolean
  }
  timestamp: number
}

interface DevicePairingData {
  pairingCode: string
  deviceId: string
  deviceType: 'host' | 'controller'
}

// ==================== Data Stores ====================

const rooms = new Map<string, Room>()
const playerRoomMap = new Map<string, string>() // socketId -> roomCode
const devicePairings = new Map<string, string>() // pairingCode -> socketId
const pendingPairings = new Map<string, { hostSocketId: string; controllerSocketId?: string; code: string }>()

// ==================== Utility Functions ====================

const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

const generatePairingCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const generatePlayerId = (): string => {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const getInitialPlayerState = (playerId: string): PlayerState => ({
  id: playerId,
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  rotation: 0,
  health: 100,
  score: 0,
})

const getPlayersArray = (room: Room): Player[] => {
  return Array.from(room.players.values())
}

const broadcastToRoom = (roomCode: string, event: string, data: unknown, excludeSocket?: Socket) => {
  const room = rooms.get(roomCode)
  if (!room) return

  room.players.forEach((player) => {
    const socket = io.sockets.sockets.get(player.socketId)
    if (socket && socket !== excludeSocket) {
      socket.emit(event, data)
    }
  })
}

// ==================== Room Management ====================

const handleCreateRoom = (socket: Socket, data: { playerName: string }) => {
  const { playerName } = data

  // Generate unique room code
  let roomCode = generateRoomCode()
  while (rooms.has(roomCode)) {
    roomCode = generateRoomCode()
  }

  const playerId = generatePlayerId()
  const hostPlayer: Player = {
    id: playerId,
    socketId: socket.id,
    name: playerName || 'Host',
    isReady: true,
    isHost: true,
    deviceType: 'host',
  }

  const room: Room = {
    code: roomCode,
    hostId: playerId,
    players: new Map([[playerId, hostPlayer]]),
    gameState: {
      players: { [playerId]: getInitialPlayerState(playerId) },
      timestamp: Date.now(),
      frame: 0,
    },
    isGameStarted: false,
    createdAt: new Date(),
  }

  rooms.set(roomCode, room)
  playerRoomMap.set(socket.id, roomCode)
  socket.join(roomCode)

  console.log(`Room created: ${roomCode} by ${hostPlayer.name} (${playerId})`)

  socket.emit('room:created', {
    roomCode,
    player: hostPlayer,
    players: getPlayersArray(room),
  })

  socket.emit('room:players', {
    players: getPlayersArray(room),
    roomCode,
  })
}

const handleJoinRoom = (socket: Socket, data: { roomCode: string; playerName: string; deviceType?: 'host' | 'controller' }) => {
  const { roomCode, playerName, deviceType = 'controller' } = data
  const room = rooms.get(roomCode.toUpperCase())

  if (!room) {
    socket.emit('error', { message: 'Room not found', code: 'ROOM_NOT_FOUND' })
    return
  }

  if (room.isGameStarted) {
    socket.emit('error', { message: 'Game already in progress', code: 'GAME_IN_PROGRESS' })
    return
  }

  if (room.players.size >= 4) {
    socket.emit('error', { message: 'Room is full (max 4 players)', code: 'ROOM_FULL' })
    return
  }

  const playerId = generatePlayerId()
  const player: Player = {
    id: playerId,
    socketId: socket.id,
    name: playerName || `Player ${room.players.size + 1}`,
    isReady: false,
    isHost: false,
    deviceType,
  }

  room.players.set(playerId, player)
  room.gameState.players[playerId] = getInitialPlayerState(playerId)
  playerRoomMap.set(socket.id, roomCode.toUpperCase())
  socket.join(roomCode.toUpperCase())

  console.log(`Player ${player.name} (${playerId}) joined room ${roomCode}`)

  socket.emit('room:joined', {
    roomCode: room.code,
    player,
    players: getPlayersArray(room),
    isGameStarted: room.isGameStarted,
  })

  broadcastToRoom(room.code, 'room:players', {
    players: getPlayersArray(room),
    roomCode: room.code,
  }, socket)

  // Notify others that a new player joined
  socket.to(room.code).emit('room:joined', {
    player,
    roomCode: room.code,
  })
}

const handleLeaveRoom = (socket: Socket) => {
  const roomCode = playerRoomMap.get(socket.id)
  if (!roomCode) {
    socket.emit('error', { message: 'You are not in a room', code: 'NOT_IN_ROOM' })
    return
  }

  const room = rooms.get(roomCode)
  if (!room) return

  const player = Array.from(room.players.values()).find(p => p.socketId === socket.id)
  if (!player) return

  room.players.delete(player.id)
  delete room.gameState.players[player.id]
  playerRoomMap.delete(socket.id)
  socket.leave(roomCode)

  console.log(`Player ${player.name} (${player.id}) left room ${roomCode}`)

  // If host leaves, assign new host or close room
  if (player.isHost && room.players.size > 0) {
    const newHost = Array.from(room.players.values())[0]
    newHost.isHost = true
    newHost.isReady = true
    room.hostId = newHost.id
    console.log(`New host assigned: ${newHost.name} (${newHost.id})`)
  }

  // Notify remaining players
  broadcastToRoom(roomCode, 'room:left', {
    playerId: player.id,
    playerName: player.name,
    roomCode,
  })

  broadcastToRoom(roomCode, 'room:players', {
    players: getPlayersArray(room),
    roomCode,
  })

  socket.emit('room:left', { roomCode })

  // Delete room if empty
  if (room.players.size === 0) {
    rooms.delete(roomCode)
    console.log(`Room ${roomCode} deleted (empty)`)
  }
}

const handlePlayerReady = (socket: Socket, data: { ready: boolean }) => {
  const roomCode = playerRoomMap.get(socket.id)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  const player = Array.from(room.players.values()).find(p => p.socketId === socket.id)
  if (!player) return

  player.isReady = data.ready

  console.log(`Player ${player.name} is ${data.ready ? 'ready' : 'not ready'}`)

  broadcastToRoom(roomCode, 'room:players', {
    players: getPlayersArray(room),
    roomCode,
  })
}

// ==================== Game Management ====================

const handleGameStart = (socket: Socket) => {
  const roomCode = playerRoomMap.get(socket.id)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  const player = Array.from(room.players.values()).find(p => p.socketId === socket.id)
  if (!player || !player.isHost) {
    socket.emit('error', { message: 'Only the host can start the game', code: 'NOT_HOST' })
    return
  }

  // Check if all players are ready
  const allReady = Array.from(room.players.values()).every(p => p.isReady)
  if (!allReady) {
    socket.emit('error', { message: 'Not all players are ready', code: 'PLAYERS_NOT_READY' })
    return
  }

  room.isGameStarted = true
  room.gameState.timestamp = Date.now()
  room.gameState.frame = 0

  console.log(`Game started in room ${roomCode}`)

  broadcastToRoom(roomCode, 'game:started', {
    roomCode,
    gameState: room.gameState,
    timestamp: Date.now(),
  })
}

const handleGameState = (socket: Socket, data: { gameState: Partial<GameState> }) => {
  const roomCode = playerRoomMap.get(socket.id)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room || !room.isGameStarted) return

  const player = Array.from(room.players.values()).find(p => p.socketId === socket.id)
  if (!player || !player.isHost) return

  // Update game state from host
  room.gameState = {
    ...room.gameState,
    ...data.gameState,
    timestamp: Date.now(),
    frame: (room.gameState.frame || 0) + 1,
  }

  // Broadcast to all other players
  broadcastToRoom(roomCode, 'game:sync', {
    gameState: room.gameState,
    roomCode,
  }, socket)
}

const handleGameInput = (socket: Socket, data: { input: ControllerInput }) => {
  const roomCode = playerRoomMap.get(socket.id)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room || !room.isGameStarted) return

  const player = Array.from(room.players.values()).find(p => p.socketId === socket.id)
  if (!player) return

  // Forward input to room (specifically to host)
  const hostSocket = io.sockets.sockets.get(
    Array.from(room.players.values()).find(p => p.isHost)?.socketId || ''
  )

  if (hostSocket && hostSocket !== socket) {
    hostSocket.emit('game:input', {
      playerId: player.id,
      input: data.input,
      timestamp: Date.now(),
    })
  }

  // Also broadcast to all for peer-to-peer style games
  broadcastToRoom(roomCode, 'game:input', {
    playerId: player.id,
    input: data.input,
    timestamp: Date.now(),
  }, socket)
}

// ==================== Device Pairing ====================

const handleDevicePair = (socket: Socket, data: DevicePairingData) => {
  const { pairingCode, deviceId, deviceType } = data

  if (deviceType === 'host') {
    // Host generates a pairing code
    const code = pairingCode || generatePairingCode()
    pendingPairings.set(code, {
      hostSocketId: socket.id,
      code,
    })

    console.log(`Host ${socket.id} generated pairing code: ${code}`)

    socket.emit('device:paired', {
      success: true,
      pairingCode: code,
      deviceType: 'host',
      message: 'Pairing code generated. Waiting for controller...',
    })
  } else if (deviceType === 'controller') {
    // Controller tries to pair with existing code
    const pending = pendingPairings.get(pairingCode)

    if (!pending) {
      socket.emit('error', { message: 'Invalid pairing code', code: 'INVALID_PAIRING_CODE' })
      return
    }

    if (pending.controllerSocketId) {
      socket.emit('error', { message: 'This code is already paired', code: 'ALREADY_PAIRED' })
      return
    }

    // Complete pairing
    pending.controllerSocketId = socket.id
    devicePairings.set(pairingCode, socket.id)

    console.log(`Controller ${socket.id} paired with host ${pending.hostSocketId} using code ${pairingCode}`)

    // Notify both devices
    socket.emit('device:paired', {
      success: true,
      pairingCode,
      deviceType: 'controller',
      hostSocketId: pending.hostSocketId,
      message: 'Successfully paired with host!',
    })

    const hostSocket = io.sockets.sockets.get(pending.hostSocketId)
    if (hostSocket) {
      hostSocket.emit('device:paired', {
        success: true,
        pairingCode,
        deviceType: 'host',
        controllerSocketId: socket.id,
        message: 'Controller connected!',
      })
    }

    // Clean up after successful pairing
    setTimeout(() => {
      pendingPairings.delete(pairingCode)
    }, 5000)
  }
}

const handleControllerInput = (socket: Socket, data: ControllerInput) => {
  const roomCode = playerRoomMap.get(socket.id)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room || !room.isGameStarted) return

  const player = Array.from(room.players.values()).find(p => p.socketId === socket.id)
  if (!player) return

  // Find paired device if exists
  const input: ControllerInput = {
    ...data,
    playerId: player.id,
    timestamp: Date.now(),
  }

  // Forward to host
  const hostSocket = io.sockets.sockets.get(
    Array.from(room.players.values()).find(p => p.isHost)?.socketId || ''
  )

  if (hostSocket) {
    hostSocket.emit('controller:input', {
      playerId: player.id,
      input,
      timestamp: Date.now(),
    })
  }

  // Broadcast to room for other processing
  broadcastToRoom(roomCode, 'controller:input', {
    playerId: player.id,
    input,
    timestamp: Date.now(),
  }, socket)
}

// ==================== Connection Handling ====================

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Room management events
  socket.on('room:create', (data) => handleCreateRoom(socket, data))
  socket.on('room:join', (data) => handleJoinRoom(socket, data))
  socket.on('room:leave', () => handleLeaveRoom(socket))
  socket.on('room:ready', (data) => handlePlayerReady(socket, data))

  // Game events
  socket.on('game:start', () => handleGameStart(socket))
  socket.on('game:state', (data) => handleGameState(socket, data))
  socket.on('game:input', (data) => handleGameInput(socket, data))

  // Device pairing events
  socket.on('device:pair', (data) => handleDevicePair(socket, data))
  socket.on('controller:input', (data) => handleControllerInput(socket, data))

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)

    // Clean up any pending pairings
    pendingPairings.forEach((pending, code) => {
      if (pending.hostSocketId === socket.id || pending.controllerSocketId === socket.id) {
        pendingPairings.delete(code)
        console.log(`Cleaned up pending pairing: ${code}`)
      }
    })

    // Clean up device pairings
    devicePairings.forEach((socketId, code) => {
      if (socketId === socket.id) {
        devicePairings.delete(code)
      }
    })

    // Handle leaving room
    const roomCode = playerRoomMap.get(socket.id)
    if (roomCode) {
      handleLeaveRoom(socket)
    }
  })

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

// ==================== Server Startup ====================

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`🎮 Game WebSocket server running on port ${PORT}`)
  console.log(`📡 Socket.IO path: /`)
  console.log(`🌐 CORS: enabled for all origins`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down server...')
  httpServer.close(() => {
    console.log('Game WebSocket server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down server...')
  httpServer.close(() => {
    console.log('Game WebSocket server closed')
    process.exit(0)
  })
})
