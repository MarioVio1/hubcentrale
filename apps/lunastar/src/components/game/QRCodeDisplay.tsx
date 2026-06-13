"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, Check, Smartphone, Share2 } from "lucide-react";

export interface QRCodeDisplayProps {
  /** The URL to encode in the QR code */
  url: string;
  /** Room code to display prominently */
  roomCode: string;
  /** Size of the QR code in pixels */
  size?: number;
  /** Whether to show the copy button */
  showCopyButton?: boolean;
  /** Optional game title */
  gameTitle?: string;
  /** Optional className for additional styling */
  className?: string;
}

/**
 * QRCodeDisplay - QR code component for joining games
 * Features QR code, room code, and copy link functionality
 */
export function QRCodeDisplay({
  url,
  roomCode,
  size = 256,
  showCopyButton = true,
  gameTitle = "Join the Game!",
  className,
}: QRCodeDisplayProps) {
  const [copied, setCopied] = React.useState(false);
  const [copiedCode, setCopiedCode] = React.useState(false);
  
  // Get actual origin for fallback
  const actualUrl = React.useMemo(() => {
    if (url) return url
    if (typeof window !== 'undefined' && roomCode) {
      return `${window.location.origin}?room=${roomCode}`
    }
    return ''
  }, [url, roomCode])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(actualUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 p-6 rounded-2xl",
        "bg-gradient-to-br from-slate-900 to-slate-800",
        "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        className
      )}
    >
      {/* Game title */}
      <h2 className="text-xl md:text-2xl font-bold text-white text-center">
        {gameTitle}
      </h2>

      {/* ROOM CODE - MEGA VISIBLE */}
      <div className="w-full text-center">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">
          CODICE STANZA
        </p>
        <div 
          onClick={handleCopyCode}
          className="cursor-pointer select-none"
        >
          <div
            className={cn(
              "inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl",
              "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500",
              "border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
              "hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1",
              "active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0",
              "transition-all duration-150"
            )}
          >
            <span
              className="text-5xl md:text-6xl font-black tracking-widest text-black"
              style={{
                fontFamily: "monospace",
                textShadow: "2px 2px 0px rgba(255,255,255,0.3)",
              }}
            >
              {roomCode || "----"}
            </span>
            {copiedCode ? (
              <Check className="w-8 h-8 text-green-700" />
            ) : (
              <Copy className="w-8 h-8 text-black/60" />
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Clicca per copiare
        </p>
      </div>

      {/* QR Code container */}
      <div
        className={cn(
          "relative p-4 rounded-xl",
          "bg-white border-4 border-slate-300",
          "shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
        )}
      >
        <QRCodeSVG
          value={actualUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}?room=${roomCode}`}
          size={size}
          level="H"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#000000"
        />

        {/* Scanning animation overlay */}
        <div className="absolute inset-4 pointer-events-none overflow-hidden rounded">
          <div
            className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"
            style={{
              animation: "scan 2s linear infinite",
            }}
          />
        </div>
      </div>

      {/* URL display */}
      <div className="w-full max-w-sm">
        <p className="text-xs text-slate-400 text-center mb-2">
          Oppure scansiona con la fotocamera
        </p>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg">
          <Smartphone className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-xs text-slate-300 truncate font-mono">
            {actualUrl || "Caricamento..."}
          </span>
        </div>
      </div>

      {/* Copy link button */}
      {showCopyButton && (
        <Button
          onClick={handleCopy}
          variant="outline"
          size="lg"
          className={cn(
            "w-full max-w-xs gap-2",
            "bg-white hover:bg-slate-100 text-black",
            "border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
            "hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5",
            "active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5",
            "transition-all duration-150"
          )}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-green-600">Copiato!</span>
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" />
              <span>Condividi Link</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}

/**
 * QRCodeCompact - A smaller QR code display
 */
export function QRCodeCompact({
  url,
  roomCode,
  className,
}: {
  url: string;
  roomCode: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl",
        "bg-slate-100 border border-slate-200",
        className
      )}
    >
      {/* Mini QR code */}
      <div className="p-2 bg-white rounded-lg border border-slate-200">
        <QRCodeSVG value={url} size={80} level="L" />
      </div>

      {/* Room info */}
      <div className="flex-1">
        <p className="text-sm text-slate-500 mb-1">Room Code</p>
        <p className="text-2xl font-bold font-mono tracking-wider">
          {roomCode}
        </p>
      </div>

      {/* Copy button */}
      <Button
        onClick={handleCopy}
        variant="ghost"
        size="icon"
        className="flex-shrink-0"
      >
        {copied ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <Copy className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}

/**
 * QRCodeLobby - Full lobby display with QR and player count
 */
export function QRCodeLobby({
  url,
  roomCode,
  playerCount,
  maxPlayers,
  className,
}: {
  url: string;
  roomCode: string;
  playerCount: number;
  maxPlayers: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      {/* QR Code */}
      <QRCodeDisplay
        url={url}
        roomCode={roomCode}
        size={200}
        showCopyButton={true}
      />

      {/* Player count */}
      <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-green-100 border-2 border-green-300">
        <div className="flex -space-x-2">
          {[...Array(Math.min(playerCount, 5))].map((_, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-green-500 border-2 border-white flex items-center justify-center text-white text-sm"
            >
              {["😀", "😎", "🎉", "🚀", "⭐"][i]}
            </div>
          ))}
          {playerCount > 5 && (
            <div className="w-8 h-8 rounded-full bg-green-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
              +{playerCount - 5}
            </div>
          )}
        </div>
        <span className="text-lg font-semibold text-green-800">
          {playerCount} / {maxPlayers} Players
        </span>
      </div>
    </div>
  );
}

// Add the scanning animation keyframes
const globalStyles = `
@keyframes scan {
  0% {
    top: 0;
  }
  50% {
    top: calc(100% - 4px);
  }
  100% {
    top: 0;
  }
}
`;

// Inject styles if running in browser
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = globalStyles;
  document.head.appendChild(styleElement);
}

export default QRCodeDisplay;
