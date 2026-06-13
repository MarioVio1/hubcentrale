"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TimerProps {
  /** Current time remaining in seconds */
  timeRemaining: number;
  /** Total time in seconds */
  totalTime: number;
  /** Timer size in pixels */
  size?: number;
  /** Stroke width for the progress ring */
  strokeWidth?: number;
  /** Whether the timer is paused */
  isPaused?: boolean;
  /** Label to show above/below timer */
  label?: string;
  /** Optional className for additional styling */
  className?: string;
  /** Callback when timer reaches 0 */
  onComplete?: () => void;
}

/**
 * Timer - A large circular animated timer for TV display
 * Features progress ring, warning animations, and color changes
 */
export function Timer({
  timeRemaining,
  totalTime,
  size = 200,
  strokeWidth = 12,
  isPaused = false,
  label,
  className,
  onComplete,
}: TimerProps) {
  const [prevTime, setPrevTime] = React.useState(timeRemaining);
  const [isWarning, setIsWarning] = React.useState(false);

  // Track when time decreases for pulse animation
  React.useEffect(() => {
    if (timeRemaining < prevTime) {
      // Time decreased, could add pulse animation here
    }
    setPrevTime(timeRemaining);
  }, [timeRemaining, prevTime]);

  // Check for warning state (less than 30% time remaining)
  React.useEffect(() => {
    const warningThreshold = totalTime * 0.3;
    setIsWarning(timeRemaining <= warningThreshold && timeRemaining > 0);
  }, [timeRemaining, totalTime]);

  // Call onComplete when timer reaches 0
  React.useEffect(() => {
    if (timeRemaining === 0 && onComplete) {
      onComplete();
    }
  }, [timeRemaining, onComplete]);

  // Calculate progress
  const progress = Math.max(0, Math.min(1, timeRemaining / totalTime));
  const progressPercent = progress * 100;

  // SVG calculations
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Determine color based on time remaining
  const getColor = () => {
    if (timeRemaining <= 10) return "text-red-500"; // Critical: red
    if (timeRemaining <= totalTime * 0.3) return "text-orange-500"; // Warning: orange
    if (timeRemaining <= totalTime * 0.5) return "text-yellow-500"; // Caution: yellow
    return "text-green-500"; // Safe: green
  };

  const getStrokeColor = () => {
    if (timeRemaining <= 10) return "#ef4444"; // red-500
    if (timeRemaining <= totalTime * 0.3) return "#f97316"; // orange-500
    if (timeRemaining <= totalTime * 0.5) return "#eab308"; // yellow-500
    return "#22c55e"; // green-500
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Label */}
      {label && (
        <p className="text-xl md:text-2xl font-semibold text-gray-700">
          {label}
        </p>
      )}

      {/* Timer circle */}
      <div
        className={cn(
          "relative",
          isWarning && "animate-pulse",
          timeRemaining <= 10 && "animate-[pulse_0.5s_ease-in-out_infinite]"
        )}
        style={{ width: size, height: size }}
      >
        {/* Background circle */}
        <svg
          className="absolute inset-0 -rotate-90 transform"
          width={size}
          height={size}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-gray-200"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getStrokeColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "text-5xl md:text-6xl font-bold tabular-nums",
              getColor()
            )}
            style={{
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {formatTime(timeRemaining)}
          </span>

          {/* Paused indicator */}
          {isPaused && (
            <span className="mt-2 text-lg font-medium text-gray-500 animate-pulse">
              Paused
            </span>
          )}
        </div>

        {/* Warning glow effect */}
        {isWarning && (
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{
              background: `radial-gradient(circle, ${getStrokeColor()} 0%, transparent 70%)`,
            }}
          />
        )}
      </div>

      {/* Progress bar (alternative visual) */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-1000 ease-linear rounded-full"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: getStrokeColor(),
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * TimerCompact - A smaller inline timer
 */
export function TimerCompact({
  timeRemaining,
  totalTime,
  className,
}: {
  timeRemaining: number;
  totalTime: number;
  className?: string;
}) {
  const progress = Math.max(0, Math.min(1, timeRemaining / totalTime));
  const isWarning = timeRemaining <= totalTime * 0.3;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2 rounded-lg",
        "bg-slate-100 border border-slate-200",
        isWarning && "bg-red-50 border-red-200",
        className
      )}
    >
      {/* Clock icon */}
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2",
          "flex items-center justify-center",
          isWarning ? "border-red-400 text-red-500" : "border-slate-400 text-slate-500"
        )}
      >
        <div
          className={cn(
            "w-1 h-2 origin-bottom",
            isWarning ? "bg-red-500" : "bg-slate-500"
          )}
          style={{
            transform: `rotate(${(timeRemaining % 60) * 6}deg)`,
          }}
        />
      </div>

      {/* Time */}
      <span
        className={cn(
          "text-lg font-semibold tabular-nums",
          isWarning ? "text-red-600" : "text-slate-700"
        )}
      >
        {formatTime(timeRemaining)}
      </span>

      {/* Progress bar */}
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            isWarning ? "bg-red-500" : "bg-green-500"
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

export default Timer;
