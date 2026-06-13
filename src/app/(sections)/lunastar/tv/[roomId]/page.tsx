'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useParams } from 'next/navigation';

interface Player {
  id: string;
  name: string;
  color: string;
  symbol: string;
  isHost: boolean;
  score: number;
}

interface Room {
  id: string;
  gameType: 'forza4' | 'tris';
  players: Player[];
  state: 'waiting' | 'playing' | 'finished';
  currentTurn: string;
  board: any;
  chat: any[];
  winner: string | null;
}

export default function TVMode() {
  const params = useParams();
  const roomId = params.roomId as string;
  
  const [room, setRoom] = useState<Room | null>(null);
  const [board, setBoard] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);
  const [winningPositions, setWinningPositions] = useState<any>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const SOCKET_PORT = 3030;

  // Socket connection
  useEffect(() => {
    socketRef.current = io('/?XTransformPort=' + SOCKET_PORT, {
      path: '/',
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('📺 TV Mode connected');
      socket.emit('getRoomState', { roomId });
    });

    socket.on('roomState', (data: Room) => {
      setRoom(data);
      setBoard(data.board);
    });

    socket.on('gameStarted', (data: { room: Room }) => {
      setRoom(data.room);
      setBoard(data.room.board);
      setWinningPositions(null);
    });

    socket.on('moveMade', (data: any) => {
      const newBoard = [...board.map((row: any[]) => [...row])];
      newBoard[data.row][data.column] = data.player;
      setBoard(newBoard);
      setLastMove({ row: data.row, col: data.column });
      
      if (data.won) {
        setWinningPositions(data.winningPositions);
      }
    });

    socket.on('trisMoveMade', (data: any) => {
      const newBoard = [...board];
      newBoard[data.position] = data.symbol;
      setBoard(newBoard);
      
      if (data.won) {
        setWinningPositions(data.winningLine);
      }
    });

    socket.on('resetGame', (data: { room: Room }) => {
      setRoom(data.room);
      setBoard(data.room.board);
      setWinningPositions(null);
      setLastMove(null);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-[#050816] flex flex-col items-center justify-center p-4 relative"
    >
      {/* Fullscreen Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-50 px-4 py-2 bg-white/10 backdrop-blur rounded-xl text-white font-medium hover:bg-white/20 transition-colors"
      >
        {isFullscreen ? '⬜ Esci Fullscreen' : '⛶ Fullscreen'}
      </button>

      {/* Room Code Display */}
      {room && (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-4">
          <div className="px-4 py-2 bg-white/10 backdrop-blur rounded-xl">
            <span className="text-sm text-gray-400">Stanza: </span>
            <span className="font-mono font-bold text-xl text-cyan-400">{roomId}</span>
          </div>
          <div className="px-4 py-2 bg-white/10 backdrop-blur rounded-xl text-sm">
            {room.gameType === 'forza4' ? '🔴 Forza 4' : '⭕ Tris'}
          </div>
        </div>
      )}

      {/* Waiting State */}
      {!room && (
        <div className="text-center">
          <div className="text-6xl animate-pulse mb-4">📺</div>
          <p className="text-2xl text-gray-400">Connessione alla stanza...</p>
          <p className="text-gray-500 mt-2">{roomId}</p>
        </div>
      )}

      {/* Waiting for players */}
      {room && room.state === 'waiting' && (
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-3xl font-bold mb-4">In attesa giocatori...</p>
          <div className="flex gap-4 justify-center">
            {room.players.map((p, i) => (
              <div key={p.id} className="px-6 py-4 bg-white/10 backdrop-blur rounded-xl">
                <div className={`w-16 h-16 rounded-full mb-2 ${i === 0 ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <p className="font-bold text-xl">{p.name}</p>
              </div>
            ))}
            {room.players.length < 2 && (
              <div className="px-6 py-4 bg-white/5 backdrop-blur rounded-xl border-2 border-dashed border-white/20">
                <div className="w-16 h-16 rounded-full mb-2 bg-gray-700 flex items-center justify-center text-3xl">
                  ?
                </div>
                <p className="text-gray-500">Aspettando...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Board - FORZA 4 */}
      {room && room.state === 'playing' && room.gameType === 'forza4' && (
        <div className="flex flex-col items-center justify-center">
          {/* Players */}
          <div className="flex gap-8 mb-8">
            {room.players.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${
                  room.currentTurn === p.id
                    ? 'bg-white/20 ring-4 ring-purple-500 scale-110'
                    : 'bg-white/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-full ${i === 0 ? 'bg-red-500' : 'bg-yellow-500'}`} />
                <div>
                  <p className="font-bold text-2xl">{p.name}</p>
                  <p className="text-sm text-gray-400">Punteggio: {p.score}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Board */}
          <div className="bg-gradient-to-b from-blue-600 to-blue-700 p-6 rounded-3xl shadow-2xl">
            <div className="grid grid-cols-7 gap-3">
              {board?.map((row: any[], rowIndex: number) =>
                row.map((cell: number, colIndex: number) => {
                  const isWinning = winningPositions?.some(
                    (pos: number[]) => pos[0] === rowIndex && pos[1] === colIndex
                  );
                  
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-20 h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center ${
                        isWinning ? 'ring-4 ring-white animate-pulse' : ''
                      }`}
                      style={{ backgroundColor: 'rgba(0,0,50,0.5)' }}
                    >
                      {cell === 1 && (
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg ${isWinning ? 'ring-4 ring-white' : ''}`} />
                      )}
                      {cell === 2 && (
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-lg ${isWinning ? 'ring-4 ring-white' : ''}`} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Game Board - TRIS */}
      {room && room.state === 'playing' && room.gameType === 'tris' && (
        <div className="flex flex-col items-center justify-center">
          {/* Players */}
          <div className="flex gap-8 mb-8">
            {room.players.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all ${
                  room.currentTurn === p.id
                    ? 'bg-white/20 ring-4 ring-purple-500 scale-110'
                    : 'bg-white/5'
                }`}
              >
                <div className="text-4xl font-bold" style={{ color: i === 0 ? '#22d3ee' : '#f472b6' }}>
                  {p.symbol}
                </div>
                <div>
                  <p className="font-bold text-2xl">{p.name}</p>
                  <p className="text-sm text-gray-400">Punteggio: {p.score}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Board */}
          <div className="grid grid-cols-3 gap-6 p-8 bg-slate-800/50 rounded-3xl backdrop-blur-xl">
            {board?.map((cell: string | null, index: number) => {
              const isWinning = winningPositions?.indices?.includes(index);
              
              return (
                <div
                  key={index}
                  className={`w-28 h-28 md:w-36 md:h-36 rounded-xl flex items-center justify-center text-6xl font-bold transition-all ${
                    isWinning
                      ? 'bg-purple-500/30 ring-4 ring-purple-500 animate-pulse'
                      : 'bg-slate-700/50'
                  }`}
                >
                  {cell === 'X' && (
                    <span className="text-cyan-400 drop-shadow-lg" style={{ fontSize: '4rem' }}>✕</span>
                  )}
                  {cell === 'O' && (
                    <span className="text-pink-400 drop-shadow-lg" style={{ fontSize: '4rem' }}>○</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Winner Display */}
      {room && room.state === 'finished' && room.winner && (
        <div className="text-center animate-pulse">
          <div className="text-8xl mb-4">🏆</div>
          <p className="text-4xl font-bold">
            {room.players.find(p => p.id === room.winner)?.name} VINCE!
          </p>
        </div>
      )}

      <style jsx global>{`
        @keyframes dropIn {
          0% { transform: translateY(-100px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
