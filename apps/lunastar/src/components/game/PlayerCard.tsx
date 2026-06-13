"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Star } from "lucide-react";

export interface PlayerCardProps {
  /** Player's unique ID */
  id: string;
  /** Player's display name */
  name: string;
  /** Player's avatar emoji */
  avatar: string;
  /** Player's current score */
  score: number;
  /** Whether this player is the current judge */
  isJudge?: boolean;
  /** Whether this player is the room host */
  isHost?: boolean;
  /** Whether this player has submitted their card */
  hasSubmitted?: boolean;
  /** Whether this is the current player (highlighted) */
  isCurrentPlayer?: boolean;
  /** Whether this player is the winner */
  isWinner?: boolean;
  /** Player's rank in the game */
  rank?: number;
  /** Optional className for additional styling */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * PlayerCard - A player display component for TV viewing
 * Features avatar emoji, name, score, and status indicators
 */
export function PlayerCard({
  id,
  name,
  avatar,
  score,
  isJudge = false,
  isHost = false,
  hasSubmitted = false,
  isCurrentPlayer = false,
  isWinner = false,
  rank,
  className,
  onClick,
}: PlayerCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-4 p-4 rounded-xl",
        "transition-all duration-300 ease-out",
        "border-3 border-black",
        // Judge active state
        isJudge && [
          "bg-gradient-to-r from-yellow-100 to-amber-100",
          "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
          "ring-2 ring-yellow-400",
        ],
        // Regular player state
        !isJudge && [
          "bg-gradient-to-r from-slate-50 to-slate-100",
          "shadow-[3px_3px_0px_0px_rgba(0,0,0,0.8)]",
        ],
        // Current player highlight
        isCurrentPlayer && "ring-2 ring-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50",
        // Winner state
        isWinner && "ring-4 ring-green-400 bg-gradient-to-r from-green-50 to-emerald-50",
        // Hover effect
        onClick && "cursor-pointer hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]",
        className
      )}
    >
      {/* Rank badge (for scoreboard) */}
      {rank !== undefined && (
        <div
          className={cn(
            "absolute -top-2 -left-2 z-10",
            "w-8 h-8 rounded-full",
            "flex items-center justify-center",
            "text-lg font-bold",
            "border-2 border-black",
            rank === 1 && "bg-yellow-400 text-yellow-900",
            rank === 2 && "bg-gray-300 text-gray-700",
            rank === 3 && "bg-amber-600 text-amber-100",
            rank > 3 && "bg-slate-200 text-slate-700"
          )}
        >
          {rank}
        </div>
      )}

      {/* Avatar */}
      <div
        className={cn(
          "relative flex-shrink-0",
          "w-16 h-16 md:w-20 md:h-20",
          "rounded-full",
          "bg-white border-3 border-black",
          "flex items-center justify-center",
          "text-4xl md:text-5xl",
          // Judge glow animation
          isJudge && "animate-pulse ring-2 ring-yellow-400 ring-offset-2"
        )}
      >
        {avatar}
      </div>

      {/* Player info */}
      <div className="flex-1 min-w-0">
        {/* Name */}
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              "text-xl md:text-2xl font-bold truncate",
              "text-gray-900"
            )}
          >
            {name}
          </h3>

          {/* Host badge */}
          {isHost && (
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-700 border border-purple-300 text-xs"
            >
              <Crown className="w-3 h-3 mr-1" />
              Host
            </Badge>
          )}
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-3 mt-1">
          {/* Score */}
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-lg md:text-xl font-semibold text-gray-700">
              {score} pts
            </span>
          </div>

          {/* Judge indicator */}
          {isJudge && (
            <Badge
              className="bg-yellow-400 text-yellow-900 border border-yellow-500 animate-pulse"
            >
              <Crown className="w-3 h-3 mr-1" />
              Judge
            </Badge>
          )}

          {/* Submitted indicator */}
          {hasSubmitted && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 border border-green-300"
            >
              <Check className="w-3 h-3 mr-1" />
              Done
            </Badge>
          )}
        </div>
      </div>

      {/* Winner trophy */}
      {isWinner && (
        <div className="absolute -top-3 -right-3 text-4xl animate-bounce">
          &#127942;
        </div>
      )}
    </div>
  );
}

/**
 * PlayerCardGrid - Display multiple players in a grid
 */
export function PlayerCardGrid({
  players,
  onPlayerClick,
  className,
}: {
  players: PlayerCardProps[];
  onPlayerClick?: (playerId: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
        className
      )}
    >
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          {...player}
          onClick={() => onPlayerClick?.(player.id)}
        />
      ))}
    </div>
  );
}

/**
 * PlayerCardList - Display players in a vertical list (for sidebar)
 */
export function PlayerCardList({
  players,
  onPlayerClick,
  className,
}: {
  players: PlayerCardProps[];
  onPlayerClick?: (playerId: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          {...player}
          onClick={() => onPlayerClick?.(player.id)}
        />
      ))}
    </div>
  );
}

export default PlayerCard;
