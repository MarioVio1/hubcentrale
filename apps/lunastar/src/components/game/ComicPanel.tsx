"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ComicPanelProps {
  /** The text content to display in the panel */
  text: string;
  /** Panel type - setup for first 2 panels, punchline for the final card */
  type: "setup" | "punchline";
  /** Panel number (1, 2, or 3) */
  panelNumber?: number;
  /** Whether the panel is revealed (for punchline cards) */
  revealed?: boolean;
  /** Whether the panel is selected/winner */
  isWinner?: boolean;
  /** Optional className for additional styling */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * ComicPanel - A comic-style card component for TV display
 * Features large text, comic-style borders, and reveal animations
 */
export function ComicPanel({
  text,
  type,
  panelNumber,
  revealed = true,
  isWinner = false,
  className,
  onClick,
}: ComicPanelProps) {
  const [isRevealing, setIsRevealing] = React.useState(false);

  React.useEffect(() => {
    if (!revealed && type === "punchline") {
      // Trigger reveal animation
      setIsRevealing(true);
    }
  }, [revealed, type]);

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative w-full max-w-lg aspect-[3/4] rounded-2xl overflow-hidden",
        "transition-all duration-300 ease-out",
        "cursor-pointer select-none",
        // Comic-style border and shadow
        "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        "hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1",
        // Winner styling
        isWinner && "ring-4 ring-yellow-400 ring-offset-4 ring-offset-background",
        // Click interaction
        onClick && "active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1",
        className
      )}
    >
      {/* Background with gradient */}
      <div
        className={cn(
          "absolute inset-0",
          type === "setup"
            ? "bg-gradient-to-br from-amber-50 to-orange-100"
            : "bg-gradient-to-br from-purple-50 to-pink-100"
        )}
      />

      {/* Comic dots pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
        }}
      />

      {/* Panel number badge */}
      {panelNumber && (
        <div
          className={cn(
            "absolute top-4 left-4 z-10",
            "w-12 h-12 rounded-full",
            "bg-black text-white",
            "flex items-center justify-center",
            "text-2xl font-bold font-comic",
            "border-2 border-white shadow-lg"
          )}
        >
          {panelNumber}
        </div>
      )}

      {/* Type badge */}
      <div
        className={cn(
          "absolute top-4 right-4 z-10",
          "px-4 py-2 rounded-full",
          "text-sm font-bold uppercase tracking-wider",
          "border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
          type === "setup"
            ? "bg-amber-300 text-amber-900"
            : "bg-purple-300 text-purple-900"
        )}
      >
        {type === "setup" ? "Setup" : "Punchline"}
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center p-8 pt-20">
        {/* Hidden state for punchline */}
        {!revealed && type === "punchline" ? (
          <div className="text-center">
            <div
              className={cn(
                "text-6xl md:text-8xl font-bold",
                "animate-pulse"
              )}
            >
              ?
            </div>
            <p className="mt-4 text-lg text-muted-foreground">
              Waiting for reveal...
            </p>
          </div>
        ) : (
          <p
            className={cn(
              "text-lg md:text-xl lg:text-2xl font-bold text-center",
              "leading-relaxed tracking-wide",
              "text-gray-900",
              // Reveal animation
              isRevealing && "animate-in fade-in zoom-in duration-500"
            )}
            style={{
              textShadow: "1px 1px 0px rgba(255,255,255,0.5)",
            }}
          >
            {text}
          </p>
        )}
      </div>

      {/* Winner celebration overlay */}
      {isWinner && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-yellow-400/20 animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="text-6xl animate-bounce">&#127942;</div>
          </div>
        </div>
      )}

      {/* Speech bubble tail decoration */}
      <div
        className={cn(
          "absolute bottom-4 right-4",
          "w-16 h-16",
          "border-l-4 border-b-4 border-black/10",
          "rounded-bl-full"
        )}
      />
    </div>
  );
}

/**
 * ComicPanelStack - Display multiple panels in a row
 */
export function ComicPanelStack({
  panels,
  onPanelClick,
  className,
}: {
  panels: Array<Omit<ComicPanelProps, "panelNumber">>;
  onPanelClick?: (index: number) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap justify-center gap-6 md:gap-8",
        className
      )}
    >
      {panels.map((panel, index) => (
        <ComicPanel
          key={index}
          {...panel}
          panelNumber={index + 1}
          onClick={() => onPanelClick?.(index)}
        />
      ))}
    </div>
  );
}

export default ComicPanel;
