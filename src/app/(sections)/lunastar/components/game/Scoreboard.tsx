"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlayerCard, type PlayerCardProps } from "./PlayerCard";
import { Crown, Trophy, Medal, RotateCcw, PartyPopper, Sparkles } from "lucide-react";

export interface ScoreboardPlayer extends Omit<PlayerCardProps, "rank"> {
  id: string;
  name: string;
  avatar: string;
  score: number;
}

export interface ScoreboardProps {
  /** List of players with their scores */
  players: ScoreboardPlayer[];
  /** Number of rounds played */
  roundsPlayed?: number;
  /** Whether to show the celebration animation */
  showCelebration?: boolean;
  /** Callback when play again button is clicked */
  onPlayAgain?: () => void;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * Scoreboard - Final scoreboard with rankings and celebration
 * Features ranked player list, winner animation, and play again button
 */
export function Scoreboard({
  players,
  roundsPlayed,
  showCelebration = true,
  onPlayAgain,
  className,
}: ScoreboardProps) {
  // Sort players by score (descending)
  const rankedPlayers = React.useMemo(() => {
    return [...players]
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
        isWinner: index === 0,
      }));
  }, [players]);

  const winner = rankedPlayers[0];
  const hasTie = rankedPlayers.length > 1 && rankedPlayers[0].score === rankedPlayers[1].score;

  return (
    <div className={cn("relative", className)}>
      {/* Celebration confetti overlay */}
      {showCelebration && winner && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Confetti particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              >
                {["🎉", "🎊", "⭐", "✨", "🌟", "💎", "🏆"][Math.floor(Math.random() * 7)]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Winner spotlight */}
      {winner && (
        <div className="mb-8 text-center">
          {/* Winner crown/medal */}
          <div className="relative inline-block mb-4">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <Trophy
                className={cn(
                  "w-16 h-16 text-yellow-500",
                  "animate-bounce"
                )}
                strokeWidth={1.5}
              />
            </div>

            {/* Winner avatar */}
            <div
              className={cn(
                "relative w-32 h-32 rounded-full",
                "bg-gradient-to-br from-yellow-200 to-amber-300",
                "border-4 border-yellow-400",
                "flex items-center justify-center",
                "shadow-[0_0_30px_rgba(250,204,21,0.5)]",
                "animate-pulse"
              )}
            >
              <span className="text-6xl">{winner.avatar}</span>
            </div>

            {/* Sparkles around winner */}
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-spin" />
            <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-yellow-400 animate-spin" />
          </div>

          {/* Winner name and score */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            {hasTie ? "It's a Tie!" : `${winner.name} Wins!`}
          </h2>
          <p className="text-2xl text-gray-600">
            {winner.score} points
          </p>

          {hasTie && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Medal className="w-6 h-6 text-amber-500" />
              <span className="text-lg text-gray-600">
                Multiple winners share the glory!
              </span>
            </div>
          )}
        </div>
      )}

      {/* Player rankings */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-slate-200">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Final Standings
          </h3>
          {roundsPlayed !== undefined && (
            <span className="text-gray-500">
              {roundsPlayed} rounds played
            </span>
          )}
        </div>

        {/* Podium for top 3 */}
        <div className="flex items-end justify-center gap-2 mb-8">
          {/* 2nd place */}
          {rankedPlayers[1] && (
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">{rankedPlayers[1].avatar}</div>
              <div
                className={cn(
                  "w-24 h-20 rounded-t-lg",
                  "bg-gradient-to-t from-gray-400 to-gray-300",
                  "border-2 border-gray-500",
                  "flex items-end justify-center pb-2"
                )}
              >
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <p className="mt-2 text-sm font-medium truncate max-w-[100px]">
                {rankedPlayers[1].name}
              </p>
              <p className="text-xs text-gray-500">{rankedPlayers[1].score} pts</p>
            </div>
          )}

          {/* 1st place */}
          {winner && (
            <div className="flex flex-col items-center">
              <div className="text-5xl mb-2 animate-bounce">{winner.avatar}</div>
              <div
                className={cn(
                  "w-28 h-28 rounded-t-lg",
                  "bg-gradient-to-t from-yellow-500 to-yellow-300",
                  "border-2 border-yellow-600",
                  "flex items-end justify-center pb-2",
                  "shadow-[0_0_20px_rgba(250,204,21,0.5)]"
                )}
              >
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <p className="mt-2 text-sm font-bold truncate max-w-[120px]">
                {winner.name}
              </p>
              <p className="text-xs text-yellow-600 font-medium">{winner.score} pts</p>
            </div>
          )}

          {/* 3rd place */}
          {rankedPlayers[2] && (
            <div className="flex flex-col items-center">
              <div className="text-4xl mb-2">{rankedPlayers[2].avatar}</div>
              <div
                className={cn(
                  "w-20 h-16 rounded-t-lg",
                  "bg-gradient-to-t from-amber-700 to-amber-500",
                  "border-2 border-amber-800",
                  "flex items-end justify-center pb-2"
                )}
              >
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <p className="mt-2 text-sm font-medium truncate max-w-[100px]">
                {rankedPlayers[2].name}
              </p>
              <p className="text-xs text-gray-500">{rankedPlayers[2].score} pts</p>
            </div>
          )}
        </div>

        {/* Remaining players list */}
        {rankedPlayers.length > 3 && (
          <div className="space-y-3">
            {rankedPlayers.slice(3).map((player, index) => (
              <div
                key={player.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg",
                  "bg-white border border-slate-200",
                  "transition-all hover:shadow-md"
                )}
              >
                {/* Rank */}
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                  {player.rank}
                </div>

                {/* Avatar */}
                <div className="text-2xl">{player.avatar}</div>

                {/* Name */}
                <span className="flex-1 font-medium text-gray-900">
                  {player.name}
                </span>

                {/* Score */}
                <span className="font-semibold text-gray-600">
                  {player.score} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Play again button */}
      {onPlayAgain && (
        <div className="mt-8 text-center">
          <Button
            onClick={onPlayAgain}
            size="lg"
            className={cn(
              "text-xl px-8 py-6",
              "bg-gradient-to-r from-green-500 to-emerald-600",
              "hover:from-green-600 hover:to-emerald-700",
              "text-white",
              "border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
              "hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1",
              "active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5",
              "transition-all duration-150"
            )}
          >
            <RotateCcw className="w-6 h-6 mr-2" />
            Play Again
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * ScoreboardMini - A compact scoreboard for sidebar/header
 */
export function ScoreboardMini({
  players,
  className,
}: {
  players: ScoreboardPlayer[];
  className?: string;
}) {
  const sortedPlayers = React.useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score).slice(0, 5);
  }, [players]);

  return (
    <div
      className={cn(
        "rounded-xl p-4",
        "bg-slate-100 border border-slate-200",
        className
      )}
    >
      <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
        Leaderboard
      </h4>
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg",
              index === 0 ? "bg-yellow-100" : "bg-white"
            )}
          >
            <span className="text-lg">{player.avatar}</span>
            <span className="flex-1 text-sm font-medium truncate">
              {player.name}
            </span>
            <span className="text-sm font-semibold text-gray-600">
              {player.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * RoundScoreboard - Shows scores for a single round
 */
export function RoundScoreboard({
  players,
  roundNumber,
  winnerId,
  className,
}: {
  players: ScoreboardPlayer[];
  roundNumber: number;
  winnerId?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-6",
        "bg-gradient-to-br from-indigo-50 to-purple-50",
        "border-3 border-indigo-300",
        className
      )}
    >
      <h3 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
        <PartyPopper className="w-5 h-5" />
        Round {roundNumber} Results
      </h3>

      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg",
              player.id === winnerId
                ? "bg-green-100 border-2 border-green-400"
                : "bg-white/50"
            )}
          >
            <span className="text-2xl">{player.avatar}</span>
            <span className="flex-1 font-medium">{player.name}</span>
            <span
              className={cn(
                "font-bold",
                player.id === winnerId ? "text-green-600" : "text-gray-600"
              )}
            >
              +{player.id === winnerId ? 1 : 0} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add confetti animation to global styles
const confettiStyles = `
@keyframes confetti {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.animate-confetti {
  animation: confetti 3s linear infinite;
  font-size: 24px;
}
`;

// Inject styles if running in browser
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = confettiStyles;
  document.head.appendChild(styleElement);
}

export default Scoreboard;
