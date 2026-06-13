'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================
// TYPES
// ============================================
interface Player {
  id: string;
  name: string;
  isHost: boolean;
  score: number;
  isCpu?: boolean;
  money?: number;
  cards?: GameCard[];
  collectedCards?: GameCard[];
  scopas?: number;
}

interface GameCard {
  id: string;
  suit?: string;
  suitName?: string;
  value: string;
  color?: string;
  points?: number;
  numValue?: number;
  type?: string;
  emoji?: string;
  name?: string;
  text?: string;
  isDenari?: boolean;
  isPrize?: boolean;
}

// ============================================
// CONSTANTS
// ============================================
const BRISCOLA_SUITS = [
  { suit: 'denari', emoji: '🪙', color: '#D4AF37', name: 'Denari' },
  { suit: 'coppe', emoji: '🏆', color: '#CD7F32', name: 'Coppe' },
  { suit: 'spade', emoji: '⚔️', color: '#C0C0C0', name: 'Spade' },
  { suit: 'bastoni', emoji: '🪵', color: '#8B4513', name: 'Bastoni' },
];

const UNO_COLORS: Record<string, { bg: string; text: string }> = {
  red: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', text: '#fff' },
  blue: { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', text: '#fff' },
  green: { bg: 'linear-gradient(135deg, #22c55e, #16a34a)', text: '#fff' },
  yellow: { bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', text: '#000' },
  black: { bg: 'linear-gradient(135deg, #374151, #1f2937)', text: '#fff' },
};

// ============================================
// CARD COMPONENTS - Professional stylized cards
// ============================================

// Briscola Card Component - Italian traditional style with elegant design
const BriscolaCard = ({ 
  suit, 
  value, 
  size = 'normal',
  onClick,
  disabled,
  isPlayable = true,
  showPoints = false,
  points = 0,
  useImage = true
}: { 
  suit: string; 
  value: string;
  size?: 'small' | 'normal' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  isPlayable?: boolean;
  showPoints?: boolean;
  points?: number;
  useImage?: boolean;
}) => {
  const suitInfo = BRISCOLA_SUITS.find(s => s.emoji === suit);
  const isFaceCard = ['J', 'Q', 'K'].includes(value);
  const isAce = value === 'A';
  
  const sizeConfig = {
    small: { card: 'w-12 h-16', symbol: 'text-xl', value: 'text-xs', corner: 'text-[8px]', faceLabel: 'text-[6px]', pips: 'text-sm', padding: 'p-1.5', borderRadius: 'rounded-lg', innerBorder: 'inset-1.5' },
    normal: { card: 'w-16 h-22 min-h-[88px]', symbol: 'text-3xl', value: 'text-sm', corner: 'text-[10px]', faceLabel: 'text-[7px]', pips: 'text-base', padding: 'p-2', borderRadius: 'rounded-xl', innerBorder: 'inset-2' },
    large: { card: 'w-24 h-32', symbol: 'text-4xl', value: 'text-lg', corner: 'text-xs', faceLabel: 'text-[9px]', pips: 'text-xl', padding: 'p-3', borderRadius: 'rounded-2xl', innerBorder: 'inset-3' },
  };

  const config = sizeConfig[size];
  
  // Get image path for the card
  const suitMap: Record<string, string> = {
    '🪙': 'denari',
    '🏆': 'coppe',
    '⚔️': 'spade',
    '🪵': 'bastoni',
  };
  const suitName = suitMap[suit] || 'denari';
  const imagePath = `/images/cards/briscola/${suitName}-${value}.png`;

  // Rich gradient backgrounds per suit with sophisticated colors
  const suitStyles: Record<string, { bg: string; border: string; accent: string; glow: string; pattern: string }> = {
    '🪙': { bg: 'from-amber-50 via-yellow-50 to-amber-100', border: 'border-amber-400', accent: 'text-amber-800', glow: 'shadow-amber-300/30', pattern: 'bg-gradient-to-br from-amber-200/20 to-transparent' },
    '🏆': { bg: 'from-orange-50 via-rose-50 to-orange-100', border: 'border-orange-400', accent: 'text-orange-800', glow: 'shadow-orange-300/30', pattern: 'bg-gradient-to-br from-orange-200/20 to-transparent' },
    '⚔️': { bg: 'from-slate-50 via-blue-50 to-slate-100', border: 'border-slate-400', accent: 'text-slate-800', glow: 'shadow-slate-300/30', pattern: 'bg-gradient-to-br from-slate-200/20 to-transparent' },
    '🪵': { bg: 'from-stone-50 via-amber-50 to-stone-100', border: 'border-stone-400', accent: 'text-stone-800', glow: 'shadow-stone-300/30', pattern: 'bg-gradient-to-br from-stone-200/20 to-transparent' },
  };
  
  const styles = suitStyles[suit] || suitStyles['🪙'];

  // Face card specific styling
  const faceCardStyles = { J: { label: 'FANTE', color: 'from-blue-500 to-indigo-600' }, Q: { label: 'CAVALLO', color: 'from-rose-500 to-pink-600' }, K: { label: 'RE', color: 'from-amber-500 to-orange-600' } };
  const faceInfo = isFaceCard ? faceCardStyles[value as keyof typeof faceCardStyles] : null;
  
  // Card wrapper with common styles
  const cardWrapper = (children: React.ReactNode) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${config.card}
        ${config.borderRadius}
        border-2 ${styles.border}
        relative overflow-hidden
        ${config.padding}
        flex flex-col items-center justify-between
        transition-all duration-300 ease-out
        ${isPlayable && !disabled ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]' : ''}
        ${disabled ? 'opacity-40 grayscale-[50%] cursor-not-allowed' : ''}
        shadow-lg bg-gradient-to-br ${styles.bg}
      `}
      style={{ boxShadow: isPlayable && !disabled ? '0 4px 20px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)' }}
    >
      {children}
    </button>
  );

  // If using image
  if (useImage) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          ${config.card}
          ${config.borderRadius}
          border-2 ${styles.border}
          relative overflow-hidden
          transition-all duration-300 ease-out
          ${isPlayable && !disabled ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]' : ''}
          ${disabled ? 'opacity-40 grayscale-[50%] cursor-not-allowed' : ''}
          shadow-lg bg-white
        `}
        style={{ boxShadow: isPlayable && !disabled ? '0 4px 20px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)' }}
      >
        {/* Card Image */}
        <img 
          src={imagePath}
          alt={`${suitName} ${value}`}
          className="w-full h-full object-cover rounded-inherit"
          style={{ borderRadius: 'inherit' }}
          onError={(e) => {
            // Fallback to styled card if image fails
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        
        {/* Points badge */}
        {showPoints && points > 0 && (
          <div className="absolute -top-1 -right-1 z-20">
            <div className={`bg-gradient-to-br ${points === 11 ? 'from-red-500 to-red-600' : points >= 10 ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-green-500'} text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white`}>
              {points}
            </div>
          </div>
        )}
      </button>
    );
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${config.card}
        bg-gradient-to-br ${styles.bg}
        ${config.borderRadius}
        border-2 ${styles.border}
        relative overflow-hidden
        ${config.padding}
        flex flex-col items-center justify-between
        transition-all duration-300 ease-out
        ${isPlayable && !disabled ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]' : ''}
        ${disabled ? 'opacity-40 grayscale-[50%] cursor-not-allowed' : ''}
        shadow-lg
      `}
      style={{ boxShadow: isPlayable && !disabled ? '0 4px 20px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)' }}
    >
      {/* Inner border frame */}
      <div className={`absolute ${config.innerBorder} border ${styles.border} opacity-30 ${config.borderRadius} pointer-events-none`}></div>
      
      {/* Decorative pattern overlay */}
      <div className={`absolute inset-0 ${styles.pattern} pointer-events-none`}></div>
      
      {/* Top left corner */}
      <div className="absolute top-1 left-1.5 flex flex-col items-center leading-tight">
        <span className={`${config.value} font-black ${styles.accent} tracking-tight`}>{value}</span>
        <span className={`${config.corner} ${styles.accent} -mt-0.5`}>{suit}</span>
      </div>
      
      {/* Center content */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        {isFaceCard && faceInfo ? (
          <div className="relative flex flex-col items-center">
            <div className={`absolute inset-0 bg-gradient-to-br ${faceInfo.color} opacity-10 rounded-lg blur-sm`}></div>
            <span className={`${config.symbol} relative`} style={{ color: suitInfo?.color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>{suit}</span>
            <div className={`${config.faceLabel} font-bold ${styles.accent} mt-1 uppercase tracking-widest bg-white/60 px-2 py-0.5 rounded`}>{faceInfo.label}</div>
            {value === 'K' && <div className="absolute -top-2 text-[10px]">👑</div>}
          </div>
        ) : isAce ? (
          <div className="relative">
            <span className={`${size === 'large' ? 'text-6xl' : size === 'normal' ? 'text-4xl' : 'text-2xl'}`} style={{ color: suitInfo?.color, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>{suit}</span>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center items-center gap-0.5 max-w-full">
            {Array.from({ length: parseInt(value) || 1 }).map((_, i) => (
              <span key={i} className={`${config.pips} leading-none`} style={{ color: suitInfo?.color, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}>{suit}</span>
            ))}
          </div>
        )}
      </div>
      
      {/* Bottom right corner (rotated) */}
      <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-tight rotate-180">
        <span className={`${config.value} font-black ${styles.accent} tracking-tight`}>{value}</span>
        <span className={`${config.corner} ${styles.accent} -mt-0.5`}>{suit}</span>
      </div>
      
      {/* Points badge */}
      {showPoints && points > 0 && (
        <div className="absolute -top-1 -right-1 z-20">
          <div className={`bg-gradient-to-br ${points === 11 ? 'from-red-500 to-red-600' : points >= 10 ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-green-500'} text-white text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white`}>
            {points}
          </div>
        </div>
      )}
    </button>
  );
};

// UNO Card Component - Bold modern design with vibrant colors
const UnoCard = ({ 
  card,
  onClick,
  disabled,
  isPlayable = true,
  size = 'normal'
}: { 
  card: GameCard;
  onClick?: () => void;
  disabled?: boolean;
  isPlayable?: boolean;
  size?: 'small' | 'normal' | 'large';
}) => {
  const isWild = card.type === 'wild';
  const color = card.color || 'black';
  const isSpecial = ['skip', 'reverse', 'draw2', 'wild', 'wild+4'].includes(card.value);
  
  const sizeConfig = {
    small: { card: 'w-12 h-16', oval: 'inset-2', value: 'text-lg', corner: 'text-[8px]', ovalInner: 'inset-2.5' },
    normal: { card: 'w-16 h-22 min-h-[88px]', oval: 'inset-3', value: 'text-2xl', corner: 'text-[10px]', ovalInner: 'inset-3.5' },
    large: { card: 'w-24 h-32', oval: 'inset-4', value: 'text-4xl', corner: 'text-xs', ovalInner: 'inset-5' },
  };

  const config = sizeConfig[size];

  // Vibrant UNO color schemes
  const unoColorSchemes: Record<string, { gradient: string; border: string; shadow: string; text: string; innerGlow: string; ovalBg: string }> = {
    red: { gradient: 'from-red-500 via-red-600 to-red-700', border: 'border-red-400', shadow: 'shadow-red-500/40', text: 'text-red-600', innerGlow: 'from-red-400/30', ovalBg: 'bg-red-50' },
    blue: { gradient: 'from-blue-500 via-blue-600 to-blue-700', border: 'border-blue-400', shadow: 'shadow-blue-500/40', text: 'text-blue-600', innerGlow: 'from-blue-400/30', ovalBg: 'bg-blue-50' },
    green: { gradient: 'from-green-500 via-green-600 to-green-700', border: 'border-green-400', shadow: 'shadow-green-500/40', text: 'text-green-600', innerGlow: 'from-green-400/30', ovalBg: 'bg-green-50' },
    yellow: { gradient: 'from-yellow-400 via-yellow-500 to-yellow-600', border: 'border-yellow-300', shadow: 'shadow-yellow-500/40', text: 'text-yellow-700', innerGlow: 'from-yellow-300/30', ovalBg: 'bg-yellow-50' },
    black: { gradient: 'from-gray-800 via-gray-900 to-black', border: 'border-gray-600', shadow: 'shadow-gray-700/40', text: 'text-gray-800', innerGlow: 'from-gray-500/30', ovalBg: 'bg-gray-100' },
  };
  
  const colorScheme = unoColorSchemes[color] || unoColorSchemes.black;

  // Get display value with special symbols
  const getDisplayValue = () => {
    switch (card.value) {
      case 'skip': return '⊘';
      case 'reverse': return '⟲';
      case 'draw2':
      case '+2': return '+2';
      case 'wild': return '★';
      case 'wild+4': return '+4';
      default: return card.value;
    }
  };
  
  const displayValue = getDisplayValue();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${config.card}
        bg-gradient-to-br ${colorScheme.gradient}
        rounded-2xl
        border-[3px] ${colorScheme.border}
        relative overflow-hidden
        flex items-center justify-center
        transition-all duration-300 ease-out
        ${isPlayable && !disabled ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.03] active:scale-[0.97]' : ''}
        ${disabled ? 'opacity-40 grayscale-[30%] cursor-not-allowed' : ''}
        shadow-xl ${colorScheme.shadow}
      `}
    >
      {/* Inner shine effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme.innerGlow} to-transparent pointer-events-none`}></div>
      
      {/* Wild card rainbow effect */}
      {isWild && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-red-500 to-red-600 opacity-40"></div>
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-500 to-blue-600 opacity-40"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-green-500 to-green-600 opacity-40"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-yellow-400 to-yellow-500 opacity-40"></div>
          {/* Animated shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
        </div>
      )}
      
      {/* Main oval */}
      <div className={`absolute ${config.oval} bg-black/20 rounded-full`}></div>
      <div className={`absolute ${config.ovalInner} ${colorScheme.ovalBg} rounded-full flex items-center justify-center shadow-inner`}>
        <span className={`${config.value} font-black ${colorScheme.text} drop-shadow-sm`}>{displayValue}</span>
      </div>
      
      {/* Top left corner */}
      <div className="absolute top-1 left-2 flex flex-col items-center">
        <span className={`${config.corner} text-white font-bold drop-shadow-lg`}>{displayValue}</span>
      </div>
      
      {/* Bottom right corner (rotated) */}
      <div className="absolute bottom-1 right-2 flex flex-col items-center rotate-180">
        <span className={`${config.corner} text-white font-bold drop-shadow-lg`}>{displayValue}</span>
      </div>
      
      {/* UNO logo watermark */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/20 font-black text-[6px] tracking-widest">UNO</div>
      
      {/* Special card indicator */}
      {isSpecial && !isWild && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
      )}
    </button>
  );
};

// Card back component - Professional designs for both game types
const CardBack = ({ type = 'briscola', size = 'normal' }: { type?: 'briscola' | 'uno'; size?: 'small' | 'normal' | 'large' }) => {
  const sizeConfig = {
    small: { card: 'w-12 h-16', pattern: 'text-lg', border: 'inset-1.5' },
    normal: { card: 'w-16 h-22 min-h-[88px]', pattern: 'text-xl', border: 'inset-2' },
    large: { card: 'w-24 h-32', pattern: 'text-3xl', border: 'inset-3' },
  };

  const config = sizeConfig[size];

  if (type === 'uno') {
    return (
      <div className={`${config.card} bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl border-[3px] border-gray-600 relative overflow-hidden flex items-center justify-center shadow-xl`}
        style={{ borderWidth: '3px' }}
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-red-600"></div>
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-600"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-green-600"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-yellow-500"></div>
        </div>
        
        {/* Center UNO logo */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 bg-clip-text">
            <span className={`${config.pattern} font-black text-transparent tracking-wider`}
              style={{ WebkitTextStroke: '2px white', textShadow: '0 0 20px rgba(255,255,255,0.3)' }}
            >UNO</span>
          </div>
        </div>
        
        {/* Decorative ring */}
        <div className="absolute inset-4 border-2 border-white/10 rounded-full"></div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
      </div>
    );
  }

  // Briscola card back
  return (
    <div className={`${config.card} bg-gradient-to-br from-amber-800 via-red-900 to-amber-900 rounded-xl border-2 border-amber-600 relative overflow-hidden flex items-center justify-center shadow-xl shadow-amber-900/30`}>
      {/* Ornate pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,215,0,0.1) 5px, rgba(255,215,0,0.1) 10px)`
        }}></div>
      </div>
      
      {/* Inner decorative frame */}
      <div className={`absolute ${config.border} border border-amber-500/40 rounded-lg`}></div>
      
      {/* Center design */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-amber-300/50">
          <span className={`${config.pattern} text-amber-900`}>🃏</span>
        </div>
      </div>
      
      {/* Corner flourishes */}
      <div className="absolute top-1 left-1 text-amber-500/30 text-xs">❧</div>
      <div className="absolute top-1 right-1 text-amber-500/30 text-xs rotate-90">❧</div>
      <div className="absolute bottom-1 left-1 text-amber-500/30 text-xs -rotate-90">❧</div>
      <div className="absolute bottom-1 right-1 text-amber-500/30 text-xs rotate-180">❧</div>
      
      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20"></div>
    </div>
  );
};

// Helper functions to get card image paths (fallback)
const getBriscolaCardImage = (suitEmoji: string, value: string): string => {
  const suitMap: Record<string, string> = {
    '🪙': 'denari',
    '🏆': 'coppe',
    '⚔️': 'spade',
    '🪵': 'bastoni',
  };
  const suit = suitMap[suitEmoji] || 'denari';
  return `/images/cards/briscola/${suit}-${value}.png`;
};

const getUnoCardImage = (card: GameCard): string => {
  if (card.type === 'wild') {
    return card.value === 'wild+4' ? '/images/cards/uno/wild-draw4.png' : '/images/cards/uno/wild.png';
  }
  const color = card.color || 'red';
  const value = card.value?.toLowerCase() || '0';
  return `/images/cards/uno/${color}-${value}.png`;
};

const CHARACTERS = [
  // AI-generated faces - YOUNG MEN (10)
  { id: 1, name: 'Marco', image: '/images/faces/face-1.png', hair: 'castani', glasses: false, hat: false, beard: false, age: 'young', gender: 'male', mustache: false },
  { id: 2, name: 'Luca', image: '/images/faces/face-2.png', hair: 'biondi', glasses: true, hat: false, beard: false, age: 'young', gender: 'male', mustache: false },
  { id: 3, name: 'Andrea', image: '/images/faces/face-3.png', hair: 'neri', glasses: false, hat: false, beard: false, age: 'young', gender: 'male', mustache: false },
  { id: 4, name: 'Pietro', image: '/images/faces/face-4.png', hair: 'rossi', glasses: false, hat: true, beard: false, age: 'young', gender: 'male', mustache: false },
  { id: 5, name: 'Giovanni', image: '/images/faces/face-5.png', hair: 'castani', glasses: false, hat: false, beard: false, age: 'young', gender: 'male', mustache: true },
  { id: 6, name: 'Antonio', image: '/images/faces/face-6.png', hair: 'castani', glasses: false, hat: false, beard: true, age: 'young', gender: 'male', mustache: false },
  { id: 7, name: 'Francesco', image: '/images/faces/face-7.png', hair: 'neri', glasses: true, hat: false, beard: false, age: 'young', gender: 'male', mustache: true },
  { id: 8, name: 'Roberto', image: '/images/faces/face-8.png', hair: 'castani', glasses: false, hat: false, beard: true, age: 'young', gender: 'male', mustache: false },
  { id: 9, name: 'Davide', image: '/images/faces/face-9.png', hair: 'neri', glasses: false, hat: false, beard: false, age: 'young', gender: 'male', mustache: false },
  { id: 10, name: 'Lorenzo', image: '/images/faces/face-10.png', hair: 'biondi', glasses: true, hat: false, beard: false, age: 'young', gender: 'male', mustache: false },
  
  // ADULT MEN (12)
  { id: 11, name: 'Giuseppe', image: '/images/faces/face-11.png', hair: 'castani', glasses: false, hat: false, beard: true, age: 'adult', gender: 'male', mustache: true },
  { id: 12, name: 'Carlo', image: '/images/faces/face-12.png', hair: 'neri', glasses: true, hat: false, beard: false, age: 'adult', gender: 'male', mustache: true },
  { id: 13, name: 'Alessandro', image: '/images/faces/face-13.png', hair: 'bianchi', glasses: false, hat: true, beard: true, age: 'adult', gender: 'male', mustache: false },
  { id: 14, name: 'Stefano', image: '/images/faces/face-14.png', hair: 'castani', glasses: true, hat: false, beard: false, age: 'adult', gender: 'male', mustache: false },
  { id: 15, name: 'Matteo', image: '/images/faces/face-15.png', hair: 'neri', glasses: false, hat: false, beard: true, age: 'adult', gender: 'male', mustache: true },
  { id: 16, name: 'Riccardo', image: '/images/faces/face-16.png', hair: 'biondi', glasses: true, hat: false, beard: true, age: 'adult', gender: 'male', mustache: false },
  { id: 17, name: 'Daniele', image: '/images/faces/face-17.png', hair: 'castani', glasses: false, hat: true, beard: false, age: 'adult', gender: 'male', mustache: false },
  { id: 18, name: 'Paolo', image: '/images/faces/face-18.png', hair: 'neri', glasses: false, hat: false, beard: false, age: 'adult', gender: 'male', mustache: false },
  { id: 19, name: 'Vincenzo', image: '/images/faces/face-19.png', hair: 'bianchi', glasses: true, hat: false, beard: false, age: 'adult', gender: 'male', mustache: false },
  { id: 20, name: 'Salvatore', image: '/images/faces/face-20.png', hair: 'castani', glasses: false, hat: false, beard: true, age: 'adult', gender: 'male', mustache: true },
  { id: 21, name: 'Federico', image: '/images/faces/face-21.png', hair: 'neri', glasses: true, hat: false, beard: false, age: 'adult', gender: 'male', mustache: false },
  { id: 22, name: 'Massimo', image: '/images/faces/face-22.png', hair: 'biondi', glasses: false, hat: true, beard: false, age: 'adult', gender: 'male', mustache: false },
  
  // ELDER MEN (8)
  { id: 23, name: 'Romano', image: '/images/faces/face-23.png', hair: 'bianchi', glasses: true, hat: false, beard: false, age: 'elder', gender: 'male', mustache: true },
  { id: 24, name: 'Bruno', image: '/images/faces/face-24.png', hair: 'bianchi', glasses: true, hat: true, beard: true, age: 'elder', gender: 'male', mustache: false },
  { id: 25, name: 'Alfredo', image: '/images/faces/face-25.png', hair: 'bianchi', glasses: false, hat: false, beard: true, age: 'elder', gender: 'male', mustache: true },
  { id: 26, name: 'Mario', image: '/images/faces/face-26.png', hair: 'castani', glasses: true, hat: false, beard: false, age: 'elder', gender: 'male', mustache: false },
  { id: 27, name: 'Angelo', image: '/images/faces/face-27.png', hair: 'neri', glasses: false, hat: true, beard: false, age: 'elder', gender: 'male', mustache: false },
  { id: 28, name: 'Luciano', image: '/images/faces/face-28.png', hair: 'bianchi', glasses: true, hat: false, beard: true, age: 'elder', gender: 'male', mustache: false },
  { id: 29, name: 'Sergio', image: '/images/faces/face-29.png', hair: 'castani', glasses: false, hat: false, beard: false, age: 'elder', gender: 'male', mustache: true },
  { id: 30, name: 'Umberto', image: '/images/faces/face-30.png', hair: 'bianchi', glasses: true, hat: true, beard: false, age: 'elder', gender: 'male', mustache: false },
  
  // YOUNG WOMEN (10)
  { id: 31, name: 'Sofia', image: '/images/faces/face-31.png', hair: 'biondi', glasses: false, hat: false, beard: false, age: 'young', gender: 'female', earrings: true },
  { id: 32, name: 'Giulia', image: '/images/faces/face-32.png', hair: 'neri', glasses: false, hat: false, beard: false, age: 'young', gender: 'female', earrings: false },
  { id: 33, name: 'Aurora', image: '/images/faces/face-33.png', hair: 'rossi', glasses: false, hat: false, beard: false, age: 'young', gender: 'female', earrings: true },
  { id: 34, name: 'Martina', image: '/images/faces/face-34.png', hair: 'castani', glasses: true, hat: false, beard: false, age: 'young', gender: 'female', earrings: false },
  { id: 35, name: 'Chiara', image: '/images/faces/face-35.png', hair: 'biondi', glasses: false, hat: true, beard: false, age: 'young', gender: 'female', earrings: true },
  { id: 36, name: 'Alessia', image: '/images/faces/face-36.png', hair: 'neri', glasses: true, hat: false, beard: false, age: 'young', gender: 'female', earrings: false },
  { id: 37, name: 'Beatrice', image: '/images/faces/face-37.png', hair: 'castani', glasses: false, hat: false, beard: false, age: 'young', gender: 'female', earrings: true },
  { id: 38, name: 'Camilla', image: '/images/faces/face-38.png', hair: 'biondi', glasses: true, hat: true, beard: false, age: 'young', gender: 'female', earrings: false },
  { id: 39, name: 'Sara', image: '/images/faces/face-39.png', hair: 'neri', glasses: false, hat: false, beard: false, age: 'young', gender: 'female', earrings: true },
  { id: 40, name: 'Valentina', image: '/images/faces/face-40.png', hair: 'rossi', glasses: true, hat: false, beard: false, age: 'young', gender: 'female', earrings: true },
  
  // ADULT WOMEN (6)
  { id: 41, name: 'Laura', image: '/images/faces/face-41.png', hair: 'castani', glasses: true, hat: false, beard: false, age: 'adult', gender: 'female', earrings: true },
  { id: 42, name: 'Elena', image: '/images/faces/face-42.png', hair: 'biondi', glasses: false, hat: false, beard: false, age: 'adult', gender: 'female', earrings: false },
  { id: 43, name: 'Francesca', image: '/images/faces/face-43.png', hair: 'neri', glasses: true, hat: true, beard: false, age: 'adult', gender: 'female', earrings: true },
  { id: 44, name: 'Anna', image: '/images/faces/face-44.png', hair: 'castani', glasses: false, hat: false, beard: false, age: 'adult', gender: 'female', earrings: false },
  { id: 45, name: 'Maria', image: '/images/faces/face-45.png', hair: 'biondi', glasses: true, hat: false, beard: false, age: 'adult', gender: 'female', earrings: true },
  { id: 46, name: 'Rosa', image: '/images/faces/face-46.png', hair: 'rossi', glasses: false, hat: true, beard: false, age: 'adult', gender: 'female', earrings: true },
  
  // ELDER WOMEN (4)
  { id: 47, name: 'Lucia', image: '/images/faces/face-47.png', hair: 'bianchi', glasses: true, hat: false, beard: false, age: 'elder', gender: 'female', earrings: false },
  { id: 48, name: 'Angela', image: '/images/faces/face-48.png', hair: 'bianchi', glasses: false, hat: true, beard: false, age: 'elder', gender: 'female', earrings: true },
  { id: 49, name: 'Teresa', image: '/images/faces/face-49.png', hair: 'bianchi', glasses: true, hat: false, beard: false, age: 'elder', gender: 'female', earrings: true },
  { id: 50, name: 'Giovanna', image: '/images/faces/face-50.png', hair: 'castani', glasses: false, hat: true, beard: false, age: 'elder', gender: 'female', earrings: false },
];

const QUESTIONS = [
  { text: 'È maschio?', key: 'gender_male' },
  { text: 'È femmina?', key: 'gender_female' },
  { text: 'È giovane?', key: 'age_young' },
  { text: 'È adulto?', key: 'age_adult' },
  { text: 'È anziano?', key: 'age_elder' },
  { text: 'Ha gli occhiali?', key: 'glasses' },
  { text: 'Ha il cappello?', key: 'hat' },
  { text: 'Ha la barba?', key: 'beard' },
  { text: 'Ha i baffi?', key: 'mustache' },
  { text: 'Ha gli orecchini?', key: 'earrings' },
  { text: 'Ha i capelli biondi?', key: 'hair_biondi' },
  { text: 'Ha i capelli neri?', key: 'hair_neri' },
  { text: 'Ha i capelli bianchi?', key: 'hair_bianchi' },
  { text: 'Ha i capelli castani?', key: 'hair_castani' },
  { text: 'Ha i capelli rossi?', key: 'hair_rossi' },
];

const JOKING_PANELS = [
  { id: 1, text: 'Un uomo entra in un bar', emoji: '🍺' },
  { id: 2, text: 'E ordina qualcosa di strano', emoji: '🤪' },
  { id: 3, text: 'Il barista lo guarda male', emoji: '😤' },
  { id: 4, text: 'Poi scoppia a ridere', emoji: '😂' },
  { id: 5, text: 'Tutti applaudono', emoji: '👏' },
  { id: 6, text: 'Arriva la polizia', emoji: '👮' },
  { id: 7, text: 'Qualcosa esplode', emoji: '💥' },
  { id: 8, text: 'Tutti scappano urlando', emoji: '😱' },
];

// Games configuration
const GAMES = [
  { id: 'forza4', name: 'Forza 4', emoji: '🔴', subtitle: 'Connetti 4 in fila!', players: '2', time: '5-15 min', gradient: 'from-yellow-500 to-red-500', image: '/images/games/forza4-card.png' },
  { id: 'briscola', name: 'Briscola', emoji: '🃏', subtitle: 'Carte trevisane', players: '2-4', time: '15-25 min', gradient: 'from-amber-600 to-yellow-600', image: '/images/games/briscola-card.png' },
  { id: 'uno', name: 'UNO', emoji: '🎴', subtitle: 'Il classico colorato', players: '2-8', time: '15-30 min', gradient: 'from-red-500 to-pink-500', image: '/images/games/uno-card.png' },
  { id: 'scopa', name: 'Scopa', emoji: '🪙', subtitle: 'Prendi tutte le carte', players: '2-4', time: '20-30 min', gradient: 'from-blue-500 to-cyan-500', image: '/images/games/scopa-card.png' },
  { id: 'indovinachi', name: 'Indovina Chi', emoji: '🔍', subtitle: 'Indovina il personaggio', players: '2', time: '10-20 min', gradient: 'from-purple-500 to-violet-500', image: '/images/games/indovinachi-card.png' },
  { id: 'nomecitta', name: 'Nome Città', emoji: '📝', subtitle: 'Cose, Animali, Città', players: '2-8', time: '10-20 min', gradient: 'from-pink-500 to-rose-500', image: '/images/games/nomecitta-card.png' },
  { id: 'dama', name: 'Dama', emoji: '♛', subtitle: 'Il classico da tavolo', players: '2', time: '15-30 min', gradient: 'from-violet-500 to-purple-500', image: '/images/games/dama-card.png' },
  { id: 'mercanteinfiera', name: 'Mercante in Fiera', emoji: '🎪', subtitle: 'Vinci il jackpot', players: '2-6', time: '20-40 min', gradient: 'from-orange-500 to-amber-500', image: '/images/games/mercanteinfiera-card.png' },
  { id: 'tressette', name: 'Tressette', emoji: '♠️', subtitle: '3 carte in mano', players: '2-4', time: '15-25 min', gradient: 'from-slate-600 to-gray-700', image: '/images/games/tressette-card.png' },
  { id: 'tombola', name: 'Tombola', emoji: '🎯', subtitle: 'Numeri fortunati!', players: '2-10', time: '20-40 min', gradient: 'from-green-500 to-emerald-500', image: '/images/games/tombola-card.png' },
  { id: 'settemezzo', name: 'Sette e Mezzo', emoji: '7️⃣', subtitle: 'Non sballare!', players: '2-8', time: '10-20 min', gradient: 'from-yellow-600 to-amber-600', image: '/images/games/settemezzo-card.png' },
  { id: 'tris', name: 'Tris', emoji: '⭕', subtitle: '3 in riga!', players: '2', time: '2-5 min', gradient: 'from-cyan-500 to-blue-500', image: '/images/games/tris-card.png' },
  { id: 'memory', name: 'Memory', emoji: '🧠', subtitle: 'Trova le coppie', players: '1-4', time: '5-15 min', gradient: 'from-indigo-500 to-purple-500', image: '/images/games/memory-card.png' },
  { id: 'paroliamo', name: 'Paroliamo', emoji: '🔤', subtitle: 'Forma parole!', players: '2-6', time: '10-20 min', gradient: 'from-rose-500 to-pink-500', image: '/images/games/paroliamo-card.png' },
  { id: 'scala40', name: 'Scala 40', emoji: '🃏', subtitle: 'Chiudi le scale!', players: '2-6', time: '20-40 min', gradient: 'from-red-600 to-orange-500', image: '/images/games/scala40-card.png' },
  { id: 'burraco', name: 'Burraco', emoji: '🎴', subtitle: 'Pinelle e scale', players: '2-4', time: '30-60 min', gradient: 'from-teal-500 to-cyan-500', image: '/images/games/burraco-card.png' },
];

// ============================================
// API HELPER with Retry Logic
// ============================================
async function gameApi(action: string, data: Record<string, unknown> = {}, retries = 5): Promise<any> {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      });
      
      const result = await res.json();
      
      // Check for "function is pending" error
      if (result.Code === 'PreconditionFailed' || result.Message?.includes('pending')) {
        console.log(`Attempt ${attempt + 1}: Function pending, retrying in ${1000 * (attempt + 1)}ms...`);
        await delay(1000 * (attempt + 1)); // Exponential backoff: 1s, 2s, 3s, 4s, 5s
        continue;
      }
      
      return result;
    } catch (e) {
      console.error(`Attempt ${attempt + 1} failed:`, e);
      if (attempt < retries - 1) {
        await delay(1000 * (attempt + 1));
      } else {
        return { success: false, error: 'Errore di connessione. Riprova.' };
      }
    }
  }
  
  return { success: false, error: 'Servizio temporaneamente non disponibile. Riprova tra qualche secondo.' };
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function Home() {
  const [view, setView] = useState<'home' | 'lobby' | 'game'>('home');
  const [gameType, setGameType] = useState<string>('');
  const [roomCode, setRoomCode] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string>('');
  const [myCards, setMyCards] = useState<GameCard[]>([]);
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [playerId] = useState(() => `player-${Date.now()}`);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [vsCpu, setVsCpu] = useState(false);
  const [numBots, setNumBots] = useState(1);
  const [playingCard, setPlayingCard] = useState<string | null>(null);
  const [opponentAction, setOpponentAction] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Indovina Chi state
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null);
  const [secretCharacter, setSecretCharacter] = useState<number | null>(null);
  const [eliminatedCharacters, setEliminatedCharacters] = useState<number[]>([]);
  const [lastAnswer, setLastAnswer] = useState<boolean | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string>('');
  const [isMyTurnToAnswer, setIsMyTurnToAnswer] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  
  // Dama state
  const [selectedPiece, setSelectedPiece] = useState<{x: number, y: number} | null>(null);
  
  // Mercante state
  const [currentBid, setCurrentBid] = useState(0);
  
  // Nome Città state
  const [localTimer, setLocalTimer] = useState(90);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Forza 4 state
  const [forza4Board, setForza4Board] = useState<number[][]>(() => 
    Array(6).fill(null).map(() => Array(7).fill(0))
  );

  const showNotification = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Polling for game state updates with error handling
  const pollState = useCallback(async () => {
    if (!roomCode) return;
    if (view !== 'game' && view !== 'lobby') return;
    
    try {
      const res = await fetch(`/api/game?roomCode=${roomCode}&playerId=${playerId}`);
      const data = await res.json();
      
      // Skip if "function is pending" error - will retry next poll
      if (data.Code === 'PreconditionFailed' || data.Message?.includes('pending')) {
        console.log('Polling: Function pending, skipping...');
        return;
      }
      
      // Check if game has started (for lobby -> game transition)
      if (view === 'lobby' && data.gameState && data.gameState.phase) {
        console.log('Game started! Transitioning to game view...');
        setGameState(data.gameState);
        setPlayers(data.players || []);
        if (data.gameType) setGameType(data.gameType);
        if (data.myCards) setMyCards(data.myCards);
        if (data.mySecret !== undefined) setSecretCharacter(data.mySecret);
        setView('game');
        showNotification('🎮 La partita è iniziata!', 'success');
        return;
      }
      
      if (data.gameState) {
        setGameState(data.gameState);
        if (data.lastAction && data.lastAction.playerId !== playerId) {
          setOpponentAction(data.lastAction.message);
          setTimeout(() => setOpponentAction(null), 2000);
        }
        // Forza 4 board
        if (data.gameState.board) {
          setForza4Board(data.gameState.board as number[][]);
        }
      }
      if (data.myCards) setMyCards(data.myCards);
      if (data.mySecret !== undefined) setSecretCharacter(data.mySecret);
      if (data.players) setPlayers(data.players);
      if (data.isMyTurnToAnswer !== undefined) setIsMyTurnToAnswer(data.isMyTurnToAnswer);
      if (data.currentQuestion) setCurrentQuestion(data.currentQuestion);
    } catch (e) {
      console.error('Polling error:', e);
    }
  }, [roomCode, view, playerId, showNotification]);

  useEffect(() => {
    if (view === 'game' || view === 'lobby') {
      pollingRef.current = setInterval(pollState, 1000);
      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [view, pollState]);

  // Nome Città timer with auto-submit
  useEffect(() => {
    if (view === 'game' && gameType === 'nomecitta' && gameState?.phase === 'writing') {
      const startTime = gameState.timerStart as number || Date.now();
      timerRef.current = setInterval(async () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.max(0, 90 - elapsed);
        setLocalTimer(remaining);
        
        // Auto-submit when timer expires
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Call timerExpired to auto-validate
          const res = await gameApi('timerExpired', { roomCode, playerId });
          if (res.success) {
            setGameState(res.gameState);
            showNotification('⏱️ Tempo scaduto! Risposte convalidate automaticamente', 'info');
          }
        }
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [view, gameType, gameState?.phase, gameState?.timerStart, roomCode, playerId]);

  const createRoom = async (game: string) => {
    if (!playerName.trim()) { setError('Inserisci il tuo nome!'); return; }
    setIsLoading(true);
    setError('');
    const res = await gameApi('createRoom', { gameType: game, playerName, playerId, vsCpu, numBots });
    setIsLoading(false);
    if (res.success) {
      setRoomCode(res.roomCode);
      setGameType(game);
      setIsHost(true);
      setPlayers(res.players);
      setView('lobby');
    } else {
      setError(res.error || 'Errore');
    }
  };

  const joinRoom = async () => {
    if (roomCode.length !== 4) { setError('Codice non valido!'); return; }
    if (!playerName.trim()) { setError('Inserisci il tuo nome!'); return; }
    setIsLoading(true);
    setError('');
    const res = await gameApi('joinRoom', { roomCode, playerName, playerId });
    setIsLoading(false);
    if (res.success) {
      setGameType(res.gameType);
      setPlayers(res.players);
      setView('lobby');
    } else {
      setError(res.error || 'Errore');
    }
  };

  const startGame = async () => {
    setIsLoading(true);
    const res = await gameApi('startGame', { roomCode, playerId, gameType });
    setIsLoading(false);
    if (res.success) {
      setGameState(res.gameState);
      const me = res.gameState?.players?.find((p: Player) => p.id === playerId);
      if (me?.hand) setMyCards(me.hand);
      if (res.gameState?.board) setForza4Board(res.gameState.board as number[][]);
      setView('game');
      showNotification('🎮 Partita iniziata!', 'success');
    } else {
      setError(res.error || 'Errore');
    }
  };

  const playCard = async (cardId: string, captureIndex?: number) => {
    if (playingCard) return;
    setPlayingCard(cardId);
    setOpponentAction(null);
    try {
      const res = await gameApi('playCard', { roomCode, playerId, cardId, captureIndex });
      if (res.success) {
        setGameState(res.gameState);
        setMyCards(res.hand || []);
        if (res.opponentAction) {
          setTimeout(() => {
            setOpponentAction(res.opponentAction);
            setTimeout(() => setOpponentAction(null), 2000);
          }, 500);
        }
      } else {
        showNotification(res.error || 'Non puoi giocare questa carta', 'error');
      }
    } finally {
      setTimeout(() => setPlayingCard(null), 500);
    }
  };

  const drawCard = async () => {
    const res = await gameApi('drawCard', { roomCode, playerId });
    if (res.success) {
      setGameState(res.gameState);
      setMyCards(res.hand || []);
      showNotification('📥 Hai pescato una carta', 'info');
    }
  };

  // Forza 4 move
  const playForza4 = async (col: number) => {
    const res = await gameApi('playForza4', { roomCode, playerId, column: col });
    if (res.success) {
      setGameState(res.gameState);
      if (res.gameState?.board) setForza4Board(res.gameState.board as number[][]);
    } else {
      showNotification(res.error || 'Mossa non valida', 'error');
    }
  };

  // ============================================
  // RENDER HELPERS
  // ============================================
  
  const notificationEl = notification && (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl font-semibold z-50 shadow-2xl ${
      notification.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
      notification.type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-500' :
      'bg-gradient-to-r from-blue-500 to-cyan-500'
    } text-white`}>
      {notification.message}
    </div>
  );

  const opponentActionEl = opponentAction && (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black/90 text-white px-6 py-3 rounded-full font-semibold z-50 border-2 border-cyan-400">
      {opponentAction}
    </div>
  );

  const loadingOverlay = isLoading && (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-800/90 rounded-3xl p-8 text-center border border-white/10">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg font-semibold">Connessione in corso...</p>
        <p className="text-gray-400 text-sm mt-2">Se il server è freddo, potrebbe richiedere qualche secondo</p>
      </div>
    </div>
  );

  // ============================================
  // HOME SCREEN
  // ============================================
  if (view === 'home') {
    return (
      <main className="min-h-screen bg-[#0a0a12] flex flex-col">
        {loadingOverlay}
        {notificationEl}
        {error && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-2xl z-50 cursor-pointer animate-bounce" onClick={() => setError('')}>
            ⚠️ {error}
          </div>
        )}

        {/* Header */}
        <header className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-2xl">🎮</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  PartySally
                </h1>
                <p className="text-xs text-gray-500">Giochi in compagnia</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 bg-green-500/20 text-green-400 text-sm font-medium px-3 py-1.5 rounded-full border border-green-500/30">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Online
              </span>
            </div>
          </div>
        </header>

        {/* Main Content - Centered */}
        <section className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {/* Player Setup - Centered */}
            <div className="animate-fade-in-up mb-8" style={{ animationDelay: '100ms' }}>
              <div className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                  🎉
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"> PartySally</span>
                </h2>
                <p className="text-gray-400 text-sm">Gioca con gli amici!</p>
              </div>
              <div className="bg-gradient-to-br from-[#16161f] to-[#1a1a25] backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl shadow-black/20 text-center">
                <label className="block text-gray-300 text-sm font-medium mb-2">👤 Il tuo nome</label>
                <input
                  type="text"
                  placeholder="Come ti chiami?"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#0d0d14] border border-white/10 rounded-xl text-white text-center placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
                  maxLength={20}
                />
                
                <div className="flex items-center justify-center gap-3 mt-4">
                  <input
                    type="checkbox"
                    id="vsCpu"
                    checked={vsCpu}
                    onChange={(e) => setVsCpu(e.target.checked)}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
                  />
                  <label htmlFor="vsCpu" className="text-gray-300 cursor-pointer">🤖 Gioca contro il PC</label>
                </div>
                
                {vsCpu && (
                  <div className="mt-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">Numero di Bot</label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3].map(n => (
                        <button
                          key={n}
                          onClick={() => setNumBots(n)}
                          className={`w-10 h-10 rounded-xl font-bold transition-all ${
                            numBots === n 
                              ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white' 
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Join Room */}
            <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Codice stanza"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-3 bg-[#16161f] border border-white/10 rounded-xl text-white text-center text-xl font-mono tracking-widest placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  maxLength={4}
                />
                <button
                  onClick={joinRoom}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  ENTRA
                </button>
              </div>
            </div>

            {/* Games Grid - Compact */}
            <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <p className="text-center text-gray-400 text-sm mb-4">Scegli un gioco per iniziare</p>
              <div className="grid grid-cols-4 gap-3">
                {GAMES.map((game, index) => (
                  <button
                    key={game.id}
                    onClick={() => createRoom(game.id)}
                    onMouseEnter={() => setHoveredGame(game.id)}
                    onMouseLeave={() => setHoveredGame(null)}
                    className={`relative overflow-hidden rounded-xl cursor-pointer group transition-all duration-300 ${
                      hoveredGame === game.id 
                        ? 'scale-105 shadow-lg shadow-purple-500/30' 
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="aspect-square flex flex-col items-center justify-center p-3 bg-gradient-to-br from-[#1a1a25] to-[#16161f] border border-white/10 rounded-xl group-hover:border-purple-500/30 transition-all">
                      <span className="text-3xl mb-1">{game.emoji}</span>
                      <span className="text-white text-xs font-medium text-center">{game.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-purple-500/20 bg-[#0d0d14] py-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-2 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20">
                <span className="text-sm">🎮</span>
                <span className="text-purple-300 text-sm font-medium">16 Giochi</span>
              </div>
              <div className="flex items-center gap-2 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20">
                <span className="text-sm">👥</span>
                <span className="text-cyan-300 text-sm font-medium">Multiplayer</span>
              </div>
              <div className="flex items-center gap-2 bg-pink-500/10 px-3 py-1.5 rounded-lg border border-pink-500/20">
                <span className="text-sm">🤖</span>
                <span className="text-pink-300 text-sm font-medium">vs CPU</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-500 text-xs">
                Made with 💜 by <span className="text-purple-400 font-semibold">PartySally</span>
              </p>
            </div>
          </div>
        </footer>
      </main>
    );
  }

  // ============================================
  // LOBBY SCREEN
  // ============================================
  if (view === 'lobby') {
    const game = GAMES.find(g => g.id === gameType) || GAMES[0];
    
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0a0a12] via-purple-900/20 to-[#0a0a12] flex flex-col">
        {loadingOverlay}
        {notificationEl}
        
        {/* Header */}
        <header className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] backdrop-blur-xl border-b border-purple-500/20 py-3">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{game.emoji}</span>
              <div>
                <h1 className="text-xl font-bold text-white">{game.name}</h1>
                <p className="text-xs text-gray-400">{game.subtitle}</p>
              </div>
            </div>
            <button
              onClick={() => { setView('home'); setRoomCode(''); setPlayers([]); }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕ Esci
            </button>
          </div>
        </header>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#16161f] to-[#1a1a25] backdrop-blur-xl rounded-3xl border border-purple-500/20 p-8 max-w-lg w-full shadow-2xl shadow-purple-500/10">
            {/* Room Code */}
            <div className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl p-6 text-center mb-6 border border-purple-500/30">
              <p className="text-gray-400 text-sm mb-2">🏠 Codice Stanza</p>
              <p className="text-5xl font-mono font-bold text-white tracking-widest drop-shadow-lg">{roomCode}</p>
              <p className="text-purple-300 text-sm mt-3">Condividi con gli amici!</p>
            </div>
            
            {/* Players */}
            <div className="bg-[#0d0d14] rounded-2xl p-4 mb-6 border border-white/5">
              <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                <span>👥</span> Giocatori ({players.length})
              </p>
              <div className="space-y-2">
                {players.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#1a1a25] to-[#16161f] border border-white/5 hover:border-purple-500/30 transition-colors">
                    <div className={`w-10 h-10 bg-gradient-to-br ${game.gradient} rounded-xl flex items-center justify-center text-white font-bold shadow-lg`}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white flex-1 font-medium">{p.name}</span>
                    {p.isHost && <span className="text-yellow-400 text-lg" title="Host">👑</span>}
                    {p.isCpu && <span className="text-green-400 text-lg" title="Bot">🤖</span>}
                    <span className="text-green-400 text-lg" title="Pronto">✓</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => { setView('home'); setRoomCode(''); setPlayers([]); }}
                className="flex-1 py-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors border border-gray-700"
              >
                ← Indietro
              </button>
              {isHost && (
                <button
                  onClick={startGame}
                  className={`flex-2 py-4 bg-gradient-to-r ${game.gradient} text-white font-bold rounded-xl hover:opacity-90 transition-opacity px-8 shadow-lg shadow-purple-500/20`}
                >
                  🚀 INIZIA
                </button>
              )}
            </div>
            
            {!isHost && (
              <p className="text-center text-gray-500 text-sm mt-4">
                ⏳ Aspettando che l'host inizi la partita...
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ============================================
  // GAME SCREENS
  // ============================================
  if (view === 'game' && gameState) {
    const game = GAMES.find(g => g.id === gameType) || GAMES[0];
    const isMyTurn = gameState.currentTurn === playerId;
    
    // FORZA 4 GAME
    if (gameType === 'forza4') {
      const board = forza4Board;
      const winner = gameState.winner as string;
      const isGameOver = gameState.phase === 'gameOver';
      const myPlayerIndex = (gameState.players as any[])?.findIndex((p: any) => p.id === playerId);
      const myColor = myPlayerIndex === 0 ? 'red' : 'yellow';
      
      return (
        <main className="min-h-screen bg-gradient-to-br from-[#0a0a12] via-blue-900/30 to-[#0a0a12] flex flex-col">
          {notificationEl}
          {opponentActionEl}
          
          {/* Header */}
          <header className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] backdrop-blur-xl border-b border-blue-500/20 py-3">
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔴</span>
                <div>
                  <h1 className="text-xl font-bold text-white">Forza 4</h1>
                  <p className="text-xs text-gray-400">Connetti 4 in fila!</p>
                </div>
              </div>
              <button
                onClick={() => { setView('home'); setGameState(null); }}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                ✕ Esci
              </button>
            </div>
          </header>
          
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            {isGameOver ? (
              <div className="text-center">
                <div className="text-8xl mb-6 animate-bounce">{winner === playerId ? '🎉' : '😢'}</div>
                <h2 className="text-4xl font-bold text-white mb-6">
                  {winner === playerId ? 'HAI VINTO!' : winner === 'draw' ? 'PAREGGIO!' : 'HAI PERSO!'}
                </h2>
                <button
                  onClick={() => { setView('home'); setGameState(null); }}
                  className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all hover:-translate-y-1"
                >
                  🏠 Nuova Partita
                </button>
              </div>
            ) : (
              <>
                {/* Turn Indicator */}
                <div className={`px-6 py-3 rounded-full font-bold mb-6 transition-all ${
                  isMyTurn 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 animate-pulse' 
                    : 'bg-gray-800 text-gray-400'
                }`}>
                  {isMyTurn ? '🎯 È il tuo turno!' : `⏳ Turno di ${((gameState.players as any[])?.find((p: any) => p.id === gameState.currentTurn))?.name || 'avversario'}`}
                </div>
                
                {/* Board */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 rounded-3xl shadow-2xl shadow-blue-500/30 border-4 border-blue-500/50">
                  {/* Column buttons */}
                  <div className="grid grid-cols-7 gap-1.5 md:gap-2 mb-2">
                    {board[0].map((_, colIndex) => (
                      <button
                        key={colIndex}
                        onClick={() => isMyTurn && playForza4(colIndex)}
                        disabled={!isMyTurn}
                        className={`w-10 h-10 md:w-14 md:h-14 rounded-xl transition-all flex items-center justify-center ${
                          isMyTurn 
                            ? 'hover:bg-blue-400/50 cursor-pointer active:scale-90' 
                            : 'cursor-default opacity-50'
                        }`}
                      >
                        <span className={`text-xl md:text-2xl transition-transform ${isMyTurn ? 'group-hover:scale-125' : ''}`}>
                          {isMyTurn ? '⬇️' : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Grid */}
                  <div className="grid grid-cols-7 gap-1.5 md:gap-2">
                    {board.map((row, rowIndex) =>
                      row.map((cell, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className="w-10 h-10 md:w-14 md:h-14 bg-blue-900/80 rounded-xl flex items-center justify-center shadow-inner border border-blue-700/50"
                        >
                          {cell === 1 && (
                            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg border-2 border-red-300/50 animate-[pop_0.3s_ease-out]"></div>
                          )}
                          {cell === 2 && (
                            <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg border-2 border-yellow-200/50 animate-[pop_0.3s_ease-out]"></div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Players */}
                <div className="flex gap-4 mt-6">
                  {(gameState.players as any[])?.map((p: any, i: number) => (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
                        gameState.currentTurn === p.id 
                          ? 'bg-gradient-to-r from-white/20 to-white/10 ring-2 ring-white shadow-lg' 
                          : 'bg-black/30'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full shadow-lg ${i === 0 ? 'bg-gradient-to-br from-red-400 to-red-600' : 'bg-gradient-to-br from-yellow-300 to-yellow-500'}`}></div>
                      <span className="text-white font-medium">{p.name}</span>
                      {p.isCpu && <span className="text-lg">🤖</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      );
    }

    // BRISCOLA GAME - 4 PLAYER TABLE VIEW
    if (gameType === 'briscola') {
      const trumpSuit = BRISCOLA_SUITS.find(s => s.emoji === gameState.briscolaSuit);
      const deckCount = (gameState.deck as any[])?.length || 0;
      const isGameOver = gameState.phase === 'gameOver';
      const winner = gameState.winner as string;
      const allPlayers = (gameState.players as any[]) || [];
      const myPlayer = allPlayers.find(p => p.id === playerId);
      const myScore = myPlayer?.points || 0;
      const tableCards = (gameState.currentTrick as any[]) || [];
      const numPlayers = allPlayers.length;
      
      // Position players around the table
      const getPlayerPosition = (index: number, total: number) => {
        if (total <= 2) {
          return index === 0 ? 'bottom' : 'top';
        }
        const positions = ['bottom', 'left', 'top', 'right'];
        return positions[index % 4];
      };
      
      const myIndex = allPlayers.findIndex(p => p.id === playerId);
      // Reorder players so current player is at bottom
      const orderedPlayers = [...allPlayers.slice(myIndex), ...allPlayers.slice(0, myIndex)];
      
      return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900/20 to-gray-900 flex flex-col">
          {notificationEl}
          {opponentActionEl}
          
          {/* Top bar */}
          <div className="bg-black/40 backdrop-blur-xl border-b border-white/10 p-3">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <h1 className="text-lg font-bold text-white">🃏 Briscola {numPlayers} Giocatori</h1>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">Mazzo: {deckCount}</span>
                <div className="bg-gradient-to-br from-amber-600 to-yellow-600 px-3 py-1 rounded-lg flex items-center gap-2">
                  <span className="text-xl">{gameState.briscolaSuit}</span>
                  <span className="text-white text-sm font-bold">{trumpSuit?.name}</span>
                </div>
              </div>
            </div>
          </div>
          
          {isGameOver ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">{winner === playerId ? '🏆' : '😢'}</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {winner === playerId ? 'HAI VINTO!' : 'HAI PERSO!'}
                </h2>
                <div className="flex gap-4 justify-center mb-4">
                  {allPlayers.map(p => (
                    <div key={p.id} className="bg-black/30 rounded-lg px-4 py-2">
                      <p className="text-white font-medium">{p.name}</p>
                      <p className="text-yellow-400 font-bold">{p.points || 0} pt</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { setView('home'); setGameState(null); }}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl"
                >
                  🏠 Nuova Partita
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 relative">
              {/* Table container with players around it */}
              <div className="relative w-full max-w-2xl aspect-square">
                
                {/* TOP PLAYER */}
                {orderedPlayers[1] && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
                    <div className={`inline-flex flex-col items-center p-2 rounded-xl ${
                      gameState.currentTurn === orderedPlayers[1].id ? 'bg-red-500/30 ring-2 ring-red-400' : 'bg-black/20'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{orderedPlayers[1].name}</span>
                        {orderedPlayers[1].isCpu && <span>🤖</span>}
                        <span className="text-yellow-400 font-bold text-sm">{orderedPlayers[1].points || 0}pt</span>
                      </div>
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: orderedPlayers[1].hand?.length || 0 }).map((_, i) => (
                          <CardBack key={i} type="briscola" size="small" />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* LEFT PLAYER */}
                {orderedPlayers[2] && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 text-center">
                    <div className={`p-2 rounded-xl ${
                      gameState.currentTurn === orderedPlayers[2].id ? 'bg-red-500/30 ring-2 ring-red-400' : 'bg-black/20'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{orderedPlayers[2].name}</span>
                        {orderedPlayers[2].isCpu && <span>🤖</span>}
                        <span className="text-yellow-400 font-bold text-sm">{orderedPlayers[2].points || 0}pt</span>
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        {Array.from({ length: orderedPlayers[2].hand?.length || 0 }).map((_, i) => (
                          <CardBack key={i} type="briscola" size="small" />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* RIGHT PLAYER */}
                {orderedPlayers[3] && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 text-center">
                    <div className={`p-2 rounded-xl ${
                      gameState.currentTurn === orderedPlayers[3].id ? 'bg-red-500/30 ring-2 ring-red-400' : 'bg-black/20'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{orderedPlayers[3].name}</span>
                        {orderedPlayers[3].isCpu && <span>🤖</span>}
                        <span className="text-yellow-400 font-bold text-sm">{orderedPlayers[3].points || 0}pt</span>
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        {Array.from({ length: orderedPlayers[3].hand?.length || 0 }).map((_, i) => (
                          <CardBack key={i} type="briscola" size="small" />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* CENTER TABLE */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-gradient-to-br from-green-800/50 to-green-900/50 rounded-3xl p-6 min-w-[280px] min-h-[180px] flex items-center justify-center gap-6">
                    {/* Deck */}
                    {deckCount > 0 && (
                      <div className="relative">
                        <CardBack type="briscola" size="normal" />
                        {/* Show the actual trump card (briscola) */}
                        {gameState.briscolaCard && (
                          <div className="absolute -right-6 top-1/2 -translate-y-1/2 rotate-90">
                            <BriscolaCard 
                              suit={gameState.briscolaCard.suit as string} 
                              value={gameState.briscolaCard.value as string}
                              size="small" 
                              isPlayable={false}
                              showPoints={(gameState.briscolaCard.points || 0) > 0}
                              points={gameState.briscolaCard.points}
                              useImage={false}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Played cards */}
                    {tableCards.length === 0 ? (
                      <p className="text-white/40">Tavolo vuoto</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 max-w-[200px]">
                        {tableCards.map((play: any, i: number) => {
                          const isMe = play.playerId === playerId;
                          return (
                            <div key={i} className="text-center">
                              <p className={`text-[10px] font-bold mb-1 ${isMe ? 'text-green-400' : 'text-yellow-400'}`}>
                                {isMe ? 'Tu' : play.playerName?.substring(0, 6)}
                              </p>
                              <BriscolaCard 
                                suit={play.card.suit}
                                value={play.card.value}
                                size="normal"
                                isPlayable={false}
                                showPoints={play.card.points > 0}
                                points={play.card.points}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Bot card display popup */}
                {gameState.botShowCard && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-50">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-6 shadow-2xl border-2 border-yellow-500/50 animate-pulse">
                      <p className="text-center text-yellow-400 font-bold text-lg mb-3">
                        🤖 {gameState.botShowCard.playerName} gioca:
                      </p>
                      <div className="flex justify-center">
                        <BriscolaCard 
                          suit={gameState.botShowCard.card.suit}
                          value={gameState.botShowCard.card.value}
                          size="large"
                          isPlayable={false}
                          showPoints={(gameState.botShowCard.card.points || 0) > 0}
                          points={gameState.botShowCard.card.points}
                          useImage={false}
                        />
                      </div>
                      <p className="text-center text-white/60 text-sm mt-3">
                        {gameState.briscolaSuit === gameState.botShowCard.card.suit ? '🌟 BRISCOLA!' : ''}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* BOTTOM - MY CARDS */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                  <div className={`p-3 rounded-xl ${gameState.currentTurn === playerId ? 'bg-green-500/20 ring-2 ring-green-400' : 'bg-black/20'}`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-white font-medium">Tu</span>
                      <span className="text-yellow-400 font-bold">{myScore} pt</span>
                    </div>
                    <div className="flex justify-center gap-2">
                      {myCards.map((card, i) => (
                        <BriscolaCard 
                          key={i}
                          suit={card.suit || ''}
                          value={card.value || ''}
                          size="normal"
                          onClick={() => isMyTurn && !playingCard && playCard(card.id)}
                          disabled={!isMyTurn || !!playingCard}
                          isPlayable={isMyTurn}
                          showPoints={(card.points || 0) > 0}
                          points={card.points}
                        />
                      ))}
                    </div>
                    {isMyTurn && (
                      <p className="text-center text-green-400 font-bold text-sm mt-2">🎯 TOCCA A TE!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => { setView('home'); setGameState(null); }}
            className="p-3 text-white/60 hover:text-white transition-colors text-center"
          >
            ← Esci
          </button>
        </main>
      );
    }

    // UNO GAME
    if (gameType === 'uno') {
      const topCard = (gameState.discardPile as any[])?.slice(-1)[0];
      const currentColor = gameState.currentColor as string;
      const isGameOver = gameState.phase === 'gameOver';
      const winner = gameState.winner as string;
      const deckCount = (gameState.deck as any[])?.length || 0;
      const allPlayers = (gameState.players as any[]) || [];
      const direction = gameState.direction as number || 1;
      
      const canPlayCard = (card: GameCard) => {
        if (!isMyTurn) return false;
        if (card.type === 'wild') return true;
        if (card.color === currentColor) return true;
        if (card.value === topCard?.value) return true;
        return false;
      };
      
      // Position players around the table
      const myIndex = allPlayers.findIndex(p => p.id === playerId);
      const orderedPlayers = [...allPlayers.slice(myIndex), ...allPlayers.slice(0, myIndex)];
      
      return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-900 flex flex-col">
          {notificationEl}
          {opponentActionEl}
          
          {/* Top bar */}
          <div className="bg-black/40 backdrop-blur-xl border-b border-white/10 p-3">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <h1 className="text-lg font-bold text-white">🎴 UNO {allPlayers.length} Giocatori</h1>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">Mazzo: {deckCount}</span>
                <div
                  className="px-3 py-1 rounded-lg text-white font-bold text-sm"
                  style={{ background: UNO_COLORS[currentColor]?.bg }}
                >
                  {currentColor?.toUpperCase()}
                </div>
                <span className="text-2xl">{direction === 1 ? '➡️' : '⬅️'}</span>
              </div>
            </div>
          </div>
          
          {isGameOver ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">{winner === playerId ? '🎉' : '😢'}</div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {winner === playerId ? 'HAI VINTO!' : 'HAI PERSO!'}
                </h2>
                <button
                  onClick={() => { setView('home'); setGameState(null); setMyCards([]); }}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl"
                >
                  🏠 Nuova Partita
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4 relative">
              {/* Table container with players around it */}
              <div className="relative w-full max-w-2xl aspect-square">
                
                {/* TOP PLAYER */}
                {orderedPlayers[1] && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
                    <div className={`inline-flex flex-col items-center p-2 rounded-xl ${
                      gameState.currentTurn === orderedPlayers[1].id ? 'bg-green-500/30 ring-2 ring-green-400' : 'bg-black/20'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{orderedPlayers[1].name}</span>
                        {orderedPlayers[1].isCpu && <span>🤖</span>}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {Array.from({ length: Math.min(orderedPlayers[1].hand?.length || 0, 7) }).map((_, i) => (
                          <CardBack key={i} type="uno" size="small" />
                        ))}
                        {(orderedPlayers[1].hand?.length || 0) > 7 && (
                          <span className="text-white text-xs">+{(orderedPlayers[1].hand?.length || 0) - 7}</span>
                        )}
                      </div>
                      <span className="text-yellow-400 font-bold text-sm mt-1">{orderedPlayers[1].hand?.length || 0} carte</span>
                    </div>
                  </div>
                )}
                
                {/* LEFT PLAYER */}
                {orderedPlayers[2] && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 text-center">
                    <div className={`p-2 rounded-xl ${
                      gameState.currentTurn === orderedPlayers[2].id ? 'bg-green-500/30 ring-2 ring-green-400' : 'bg-black/20'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{orderedPlayers[2].name}</span>
                        {orderedPlayers[2].isCpu && <span>🤖</span>}
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        {Array.from({ length: Math.min(orderedPlayers[2].hand?.length || 0, 5) }).map((_, i) => (
                          <CardBack key={i} type="uno" size="small" />
                        ))}
                        {(orderedPlayers[2].hand?.length || 0) > 5 && (
                          <span className="text-white text-xs">+{(orderedPlayers[2].hand?.length || 0) - 5}</span>
                        )}
                      </div>
                      <span className="text-yellow-400 font-bold text-sm mt-1">{orderedPlayers[2].hand?.length || 0} carte</span>
                    </div>
                  </div>
                )}
                
                {/* RIGHT PLAYER */}
                {orderedPlayers[3] && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 text-center">
                    <div className={`p-2 rounded-xl ${
                      gameState.currentTurn === orderedPlayers[3].id ? 'bg-green-500/30 ring-2 ring-green-400' : 'bg-black/20'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{orderedPlayers[3].name}</span>
                        {orderedPlayers[3].isCpu && <span>🤖</span>}
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        {Array.from({ length: Math.min(orderedPlayers[3].hand?.length || 0, 5) }).map((_, i) => (
                          <CardBack key={i} type="uno" size="small" />
                        ))}
                        {(orderedPlayers[3].hand?.length || 0) > 5 && (
                          <span className="text-white text-xs">+{(orderedPlayers[3].hand?.length || 0) - 5}</span>
                        )}
                      </div>
                      <span className="text-yellow-400 font-bold text-sm mt-1">{orderedPlayers[3].hand?.length || 0} carte</span>
                    </div>
                  </div>
                )}
                
                {/* CENTER TABLE */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-gradient-to-br from-green-800/50 to-green-900/50 rounded-3xl p-6 min-w-[280px] min-h-[180px] flex items-center justify-center gap-6">
                    {/* Draw pile */}
                    <button
                      onClick={() => isMyTurn && drawCard()}
                      disabled={!isMyTurn}
                      className={`transition-all ${isMyTurn ? 'hover:scale-105 cursor-pointer' : 'opacity-50 cursor-default'}`}
                    >
                      <div className="relative">
                        <CardBack type="uno" size="normal" />
                        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-white text-xs font-bold bg-black/50 px-2 py-0.5 rounded-full">
                          {deckCount}
                        </span>
                      </div>
                    </button>
                    
                    {/* Discard pile */}
                    {topCard && (
                      <UnoCard 
                        card={topCard}
                        size="normal"
                        isPlayable={false}
                      />
                    )}
                  </div>
                </div>
                
                {/* BOTTOM - MY CARDS */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md">
                  <div className={`p-3 rounded-xl ${gameState.currentTurn === playerId ? 'bg-green-500/20 ring-2 ring-green-400' : 'bg-black/20'}`}>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-white font-medium">Tu</span>
                      <span className="text-yellow-400 font-bold">{myCards.length} carte</span>
                    </div>
                    <div className="flex justify-center gap-1 flex-wrap">
                      {myCards.map((card, i) => {
                        const canPlay = canPlayCard(card);
                        return (
                          <UnoCard 
                            key={i}
                            card={card}
                            size="normal"
                            onClick={() => canPlay && playCard(card.id)}
                            isPlayable={canPlay}
                            disabled={!canPlay}
                          />
                        );
                      })}
                    </div>
                    {isMyTurn && (
                      <p className="text-center text-green-400 font-bold text-sm mt-2">🎯 TOCCA A TE!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => { setView('home'); setGameState(null); setMyCards([]); }}
            className="p-3 text-white/60 hover:text-white transition-colors text-center"
          >
            ← Esci
          </button>
        </main>
      );
    }

    // NOME CITTÀ GAME
    if (gameType === 'nomecitta') {
      const currentLetter = gameState.currentLetter as string;
      const roundNumber = gameState.roundNumber as number || 1;
      const phase = gameState.phase as string;
      const myPlayer = (gameState.players as any[])?.find(p => p.id === playerId);
      const myAnswers = myPlayer?.answers || {};
      const allAnswers = gameState.allAnswers as Record<string, Record<string, string>> || {};
      const scores = gameState.scores as Record<string, number> || {};
      const hostPlayer = players.find(p => p.isHost);
      const isPlayerHost = hostPlayer?.id === playerId;
      const categories = ['Nome', 'Città', 'Cosa', 'Animale', 'Frutto', 'Oggetto'];
      
      return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-pink-900/20 to-gray-900 flex flex-col items-center p-4">
          {notificationEl}
          
          <h1 className="text-3xl font-bold text-white mb-4">📝 Nome Città</h1>
          
          {phase === 'rolling' && (
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-6xl">🎲</span>
              </div>
              <button
                onClick={async () => {
                  const res = await gameApi('chooseLetter', { roomCode, playerId });
                  if (res.success) {
                    setGameState(res.gameState);
                    setLocalTimer(90);
                    showNotification(`Lettera: ${res.rolledLetter}!`, 'success');
                  }
                }}
                className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 text-white font-bold rounded-2xl text-xl"
              >
                🎲 TIRA IL DADO!
              </button>
            </div>
          )}
          
          {phase === 'writing' && (
            <div className="w-full max-w-md">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 text-center mb-4">
                <span className="text-6xl font-bold text-white">{currentLetter}</span>
                <p className="text-white/80 mt-1">Round {roundNumber}</p>
              </div>
              
              <div className={`rounded-xl p-4 text-center mb-4 ${localTimer <= 15 ? 'bg-red-500/30 border-2 border-red-400' : 'bg-black/30'}`}>
                <span className="text-2xl font-bold text-white">
                  ⏱️ {Math.floor(localTimer / 60)}:{(localTimer % 60).toString().padStart(2, '0')}
                </span>
              </div>
              
              <div className="bg-black/30 rounded-2xl p-4 mb-4">
                {categories.map(cat => (
                  <div key={cat} className="mb-3">
                    <label className="text-gray-300 text-sm">{cat}</label>
                    <input
                      type="text"
                      placeholder={`${cat} con ${currentLetter}...`}
                      defaultValue={myAnswers[cat] || ''}
                      onBlur={async (e) => {
                        const newAnswers = { ...myAnswers, [cat]: e.target.value.toUpperCase() };
                        await gameApi('submitAnswer', { roomCode, playerId, answers: newAnswers });
                      }}
                      className="w-full px-4 py-2 bg-gray-800 border border-white/10 rounded-xl text-white mt-1"
                    />
                  </div>
                ))}
              </div>
              
              <button
                onClick={async () => {
                  const inputs = document.querySelectorAll('input');
                  const newAnswers: Record<string, string> = {};
                  inputs.forEach((input, i) => {
                    newAnswers[categories[i]] = (input as HTMLInputElement).value.toUpperCase();
                  });
                  const res = await gameApi('finishWriting', { roomCode, playerId, answers: newAnswers });
                  if (res.success) {
                    setGameState(res.gameState);
                    showNotification('Hai finito!', 'success');
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl"
              >
                ✅ HO FINITO!
              </button>
            </div>
          )}
          
          {phase === 'review' && (
            <div className="w-full max-w-md">
              <h2 className="text-xl font-bold text-green-400 text-center mb-4">Risultati Round {roundNumber}</h2>
              
              {Object.entries(allAnswers).map(([pid, answers]) => {
                const player = players.find(p => p.id === pid);
                return (
                  <div key={pid} className="bg-black/30 rounded-xl p-4 mb-3">
                    <p className="text-white font-bold mb-2">{player?.name} {player?.isCpu && '🤖'}</p>
                    {categories.map(cat => {
                      const answer = (answers as any)[cat] || '-';
                      const isValid = answer && answer.length > 1 && answer.startsWith(currentLetter);
                      return (
                        <div key={cat} className="flex justify-between py-1 border-b border-white/10">
                          <span className="text-gray-400">{cat}</span>
                          <span className={isValid ? 'text-green-400' : 'text-red-400'}>{answer} {isValid ? '✓' : '✗'}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              
              <div className="bg-yellow-500/20 rounded-xl p-4 mb-4">
                <p className="text-yellow-400 font-bold mb-2">Punteggi</p>
                {Object.entries(scores).sort(([,a], [,b]) => (b as number) - (a as number)).map(([pid, score]) => {
                  const player = players.find(p => p.id === pid);
                  return (
                    <div key={pid} className="flex justify-between py-1">
                      <span className="text-white">{player?.name}</span>
                      <span className="text-green-400 font-bold">{score as number} pt</span>
                    </div>
                  );
                })}
              </div>
              
              {isPlayerHost && (
                <button
                  onClick={async () => {
                    const res = await gameApi('nextRound', { roomCode, playerId });
                    if (res.success) {
                      setGameState(res.gameState);
                      setLocalTimer(90);
                    }
                  }}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl"
                >
                  🎲 PROSSIMO ROUND
                </button>
              )}
            </div>
          )}
          
          {phase === 'gameOver' && (
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold text-white mb-4">Partita Finita!</h2>
              <div className="bg-black/30 rounded-xl p-4">
                {Object.entries(scores).sort(([,a], [,b]) => (b as number) - (a as number)).map(([pid, score], i) => {
                  const player = players.find(p => p.id === pid);
                  return (
                    <div key={pid} className={`flex justify-between p-2 rounded-lg ${i === 0 ? 'bg-yellow-500/30' : ''}`}>
                      <span className="text-white font-bold">{i === 0 && '👑 '}{player?.name}</span>
                      <span className="text-yellow-400 font-bold">{score as number} pt</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <button onClick={() => { setView('home'); setGameState(null); }} className="mt-4 text-white/60">
            ← Esci
          </button>
        </main>
      );
    }

    // INDOVINA CHI GAME
    if (gameType === 'indovinachi') {
      const phase = gameState.phase as string;
      const isGameOver = phase === 'gameOver';
      const myPlayer = (gameState.players as any[])?.find(p => p.id === playerId);
      const mySecret = myPlayer?.secretCharacter || secretCharacter;
      const mySecretChar = CHARACTERS.find(c => c.id === mySecret);
      const opponent = (gameState.players as any[])?.find(p => p.id !== playerId);
      const myEliminated = myPlayer?.eliminatedCharacters || eliminatedCharacters;
      const isMyTurnToAsk = gameState.currentQuestioner === playerId;
      
      // Select character phase
      if (phase === 'selecting') {
        return (
          <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex flex-col items-center p-4">
            <h1 className="text-3xl font-bold text-white mb-4">🔍 Indovina Chi</h1>
            <p className="text-white mb-4">Scegli il tuo personaggio segreto!</p>
            
            {/* Show selected character if any */}
            {mySecret > 0 && (
              <div className="bg-purple-500/20 rounded-xl p-3 mb-4 text-center">
                <p className="text-green-400 font-bold">Hai scelto:</p>
                <p className="text-white text-xl">{CHARACTERS.find(c => c.id === mySecret)?.name}</p>
              </div>
            )}
            
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 max-w-4xl">
              {CHARACTERS.map(char => (
                <button
                  key={char.id}
                  onClick={async () => {
                    if (mySecret <= 0) {
                      await gameApi('selectCharacter', { roomCode, playerId, characterId: char.id });
                      setSecretCharacter(char.id);
                    }
                  }}
                  disabled={mySecret > 0}
                  className={`p-2 rounded-xl transition-all ${
                    mySecret === char.id 
                      ? 'bg-purple-500 ring-2 ring-purple-300' 
                      : mySecret > 0 
                        ? 'bg-gray-700/50 opacity-50'
                        : 'bg-gray-700 hover:bg-purple-600'
                  }`}
                >
                  <img src={char.image} alt={char.name} className="w-full aspect-square object-cover rounded-lg mb-1" />
                  <p className="text-white text-xs font-medium truncate">{char.name}</p>
                </button>
              ))}
            </div>
            
            {mySecret > 0 && (
              <p className="text-yellow-400 mt-4">Aspettando che l'avversario scelga...</p>
            )}
            
            <button onClick={() => { setView('home'); setGameState(null); }} className="mt-4 text-white/60">← Esci</button>
          </main>
        );
      }
      
      // Playing phase
      return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex flex-col items-center p-4">
          {notificationEl}
          <h1 className="text-2xl font-bold text-white mb-4">🔍 Indovina Chi</h1>
          
          {isGameOver ? (
            <div className="text-center">
              <div className="text-6xl mb-4">{gameState.winner === playerId ? '🎉' : '😢'}</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {gameState.winner === playerId ? 'HAI VINTO!' : 'HAI PERSO!'}
              </h2>
              <p className="text-gray-400 mb-4">{gameState.winMessage as string}</p>
            </div>
          ) : (
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* My board */}
              <div className="bg-black/30 rounded-2xl p-4">
                <p className="text-white font-bold mb-2">I tuoi personaggi (il tuo segreto: {mySecretChar?.name})</p>
                <div className="grid grid-cols-6 gap-1">
                  {CHARACTERS.filter(c => !myEliminated.includes(c.id)).map(char => (
                    <div key={char.id} className={`p-1 rounded ${mySecret === char.id ? 'ring-2 ring-green-400' : ''}`}>
                      <img src={char.image} alt={char.name} className="w-full aspect-square object-cover rounded" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Questions */}
              <div className="bg-black/30 rounded-2xl p-4">
                {isMyTurnToAsk && !gameState.waitingForAnswer ? (
                  <div>
                    <p className="text-white font-bold mb-2">Fai una domanda:</p>
                    <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                      {QUESTIONS.map(q => (
                        <button
                          key={q.key}
                          onClick={async () => {
                            await gameApi('askQuestion', { roomCode, playerId, questionKey: q.key, targetPlayerId: opponent?.id });
                          }}
                          className="p-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm"
                        >
                          {q.text}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : gameState.waitingForAnswer && gameState.targetPlayerId === playerId ? (
                  <div>
                    <p className="text-white font-bold mb-2">Domanda: {gameState.currentQuestion as string}</p>
                    <div className="flex gap-4 justify-center mt-4">
                      <button
                        onClick={async () => {
                          await gameApi('answerQuestion', { roomCode, playerId, answer: true });
                        }}
                        className="px-8 py-4 bg-green-500 text-white font-bold rounded-xl text-xl"
                      >
                        SÌ ✓
                      </button>
                      <button
                        onClick={async () => {
                          await gameApi('answerQuestion', { roomCode, playerId, answer: false });
                        }}
                        className="px-8 py-4 bg-red-500 text-white font-bold rounded-xl text-xl"
                      >
                        NO ✗
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400">Aspettando il tuo turno...</p>
                )}
                
                {/* Guess button */}
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-white font-bold mb-2">Indovina il personaggio:</p>
                  <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
                    {CHARACTERS.filter(c => !myEliminated.includes(c.id)).map(char => (
                      <button
                        key={char.id}
                        onClick={async () => {
                          const confirm = window.confirm(`Sei sicuro che il personaggio sia ${char.name}?`);
                          if (confirm) {
                            const res = await gameApi('makeGuess', { roomCode, playerId, characterId: char.id });
                            if (res.success) {
                              setGameState(res.gameState);
                            }
                          }
                        }}
                        className="p-1 bg-blue-600 hover:bg-blue-500 rounded text-xs text-white"
                      >
                        {char.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <button onClick={() => { setView('home'); setGameState(null); }} className="mt-4 text-white/60">← Esci</button>
        </main>
      );
    }

    // DAMA GAME
    if (gameType === 'dama') {
      const board = gameState.board as (string | null)[][];
      const isGameOver = gameState.phase === 'gameOver';
      const winner = gameState.winner as string;
      const myColor = 'white'; // Player is always white
      
      const handleMove = async (fromX: number, fromY: number, toX: number, toY: number) => {
        const res = await gameApi('movePiece', { roomCode, playerId, from: { x: fromX, y: fromY }, to: { x: toX, y: toY } });
        if (res.success) {
          setGameState(res.gameState);
          setSelectedPiece(null);
        }
      };
      
      return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-900/20 to-gray-900 flex flex-col items-center justify-center p-4">
          <h1 className="text-3xl font-bold text-white mb-4">♛ Dama</h1>
          
          {isGameOver ? (
            <div className="text-center">
              <div className="text-6xl mb-4">{winner === playerId ? '🎉' : '😢'}</div>
              <h2 className="text-2xl font-bold text-white mb-4">{winner === playerId ? 'HAI VINTO!' : 'HAI PERSO!'}</h2>
            </div>
          ) : (
            <>
              {isMyTurn && <div className="bg-green-500 px-4 py-2 rounded-full text-white font-bold mb-4">🎯 È il tuo turno!</div>}
              
              <div className="bg-amber-800 p-2 rounded-xl shadow-2xl">
                {board.map((row, y) => (
                  <div key={y} className="flex">
                    {row.map((cell, x) => {
                      const isBlack = (x + y) % 2 === 1;
                      const isSelected = selectedPiece?.x === x && selectedPiece?.y === y;
                      const canMoveTo = selectedPiece && isMyTurn && isBlack && !cell;
                      
                      return (
                        <div
                          key={x}
                          onClick={() => {
                            if (cell && cell.includes('white') && isMyTurn) {
                              setSelectedPiece({ x, y });
                            } else if (canMoveTo && selectedPiece) {
                              handleMove(selectedPiece.x, selectedPiece.y, x, y);
                            }
                          }}
                          className={`w-10 h-10 md:w-14 md:h-14 flex items-center justify-center cursor-pointer transition-all ${
                            isBlack ? 'bg-amber-900' : 'bg-amber-200'
                          } ${isSelected ? 'ring-2 ring-yellow-400' : ''} ${canMoveTo ? 'hover:bg-green-600' : ''}`}
                        >
                          {cell === 'white' && <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg border-2 border-gray-300"></div>}
                          {cell === 'white-king' && <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full shadow-lg border-2 border-yellow-400 flex items-center justify-center text-xl">👑</div>}
                          {cell === 'black' && <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-800 rounded-full shadow-lg border-2 border-gray-600"></div>}
                          {cell === 'black-king' && <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-800 rounded-full shadow-lg border-2 border-yellow-400 flex items-center justify-center text-xl">👑</div>}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                  <span className="text-white">Tu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                  <span className="text-white">Avversario</span>
                </div>
              </div>
            </>
          )}
          
          <button onClick={() => { setView('home'); setGameState(null); }} className="mt-4 text-white/60">← Esci</button>
        </main>
      );
    }

    // SCOPA GAME
    if (gameType === 'scopa') {
      const tableCards = (gameState.tableCards as any[]) || [];
      const isGameOver = gameState.phase === 'gameOver';
      const winner = gameState.winner as string;
      const myPlayer = (gameState.players as any[])?.find(p => p.id === playerId);
      const myScore = myPlayer?.scopas || 0;
      const myCollected = myPlayer?.collectedCards?.length || 0;
      
      return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-900/20 to-gray-900 flex flex-col">
          {notificationEl}
          
          <div className="p-4 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">🪙 Scopa</h1>
            <div className="flex justify-center gap-4">
              {(gameState.players as any[])?.map((p: any) => (
                <div key={p.id} className={`px-4 py-2 rounded-xl ${gameState.currentTurn === p.id ? 'bg-green-500/30 ring-2 ring-green-400' : 'bg-black/20'}`}>
                  <span className="text-white font-medium">{p.name}</span>
                  <span className="text-yellow-400 ml-2">Scope: {p.scopas || 0}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Table */}
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-green-900/50 rounded-3xl p-6 min-w-[400px]">
              <p className="text-white/60 text-center mb-4">Carte sul tavolo: {tableCards.length}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {tableCards.map((card: any, i: number) => (
                  <div key={i} className="w-16 h-24 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-300 flex flex-col items-center justify-center">
                    <span className="text-2xl">{card.suit}</span>
                    <span className="text-lg font-bold text-amber-900">{card.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* My cards */}
          <div className="bg-black/40 p-4">
            {isMyTurn && <p className="text-center text-green-400 font-bold mb-2">🎯 È il tuo turno!</p>}
            <div className="flex justify-center gap-2">
              {myCards.map((card, i) => (
                <button
                  key={i}
                  onClick={() => isMyTurn && playCard(card.id)}
                  disabled={!isMyTurn}
                  className={`w-16 h-24 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 transition-all ${
                    isMyTurn ? 'border-amber-400 hover:-translate-y-2 cursor-pointer' : 'border-amber-200 opacity-70'
                  }`}
                >
                  <span className="text-2xl">{card.suit}</span>
                  <span className="text-lg font-bold text-amber-900">{card.value}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-white/60 mt-2">Carte raccolte: {myCollected} | Scope: {myScore}</p>
          </div>
          
          <button onClick={() => { setView('home'); setGameState(null); }} className="p-4 text-white/60">← Esci</button>
        </main>
      );
    }

    // MERCANTE IN FIERA GAME
    if (gameType === 'mercanteinfiera') {
      const phase = gameState.phase as string;
      const isGameOver = phase === 'gameOver';
      const myPlayer = (gameState.players as any[])?.find(p => p.id === playerId);
      const myMoney = myPlayer?.money || 100;
      const myCards = myPlayer?.cards || [];
      const currentAuction = gameState.currentAuction as any;
      
      return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900 flex flex-col items-center p-4">
          {notificationEl}
          <h1 className="text-2xl font-bold text-white mb-4">🎪 Mercante in Fiera</h1>
          
          {isGameOver ? (
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-white mb-4">Partita Finita!</h2>
              {(gameState.winners as any[])?.map((w: any) => (
                <p key={w.id} className="text-yellow-400 text-xl">{w.name} vince!</p>
              ))}
            </div>
          ) : phase === 'auction' && currentAuction ? (
            <div className="text-center">
              <div className="bg-black/30 rounded-2xl p-6 mb-4">
                <p className="text-white text-xl mb-2">Carta all'asta: #{currentAuction.cardNumber}</p>
                <p className="text-yellow-400 text-2xl">Offerta attuale: {currentAuction.highestBid}€</p>
                {currentAuction.highestBidderId && (
                  <p className="text-gray-400">Da: {(gameState.players as any[])?.find(p => p.id === currentAuction.highestBidderId)?.name}</p>
                )}
              </div>
              
              {gameState.currentTurn === playerId && (
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={async () => {
                      const bid = currentAuction.highestBid + 5;
                      if (bid <= myMoney) {
                        await gameApi('mercanteBid', { roomCode, playerId, amount: bid });
                      }
                    }}
                    disabled={currentAuction.highestBid + 5 > myMoney}
                    className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl disabled:opacity-50"
                  >
                    Offri {currentAuction.highestBid + 5}€
                  </button>
                  <button
                    onClick={async () => {
                      await gameApi('mercantePass', { roomCode, playerId });
                    }}
                    className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl"
                  >
                    Passa
                  </button>
                </div>
              )}
            </div>
          ) : phase === 'playing' || phase === 'revelation' ? (
            <div className="text-center">
              <p className="text-white text-xl mb-4">Fase eliminazione - Round {gameState.currentExtraction?.roundNumber}</p>
              <button
                onClick={async () => {
                  await gameApi('mercanteStartElimination', { roomCode, playerId });
                }}
                className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl"
              >
                🎲 Estrai Carte
              </button>
            </div>
          ) : null}
          
          {/* Player info */}
          <div className="mt-6 bg-black/30 rounded-xl p-4 w-full max-w-md">
            <p className="text-white font-bold">Il tuo denaro: {myMoney}€</p>
            <p className="text-white mt-2">Le tue carte: {myCards.map((c: any) => c.number).join(', ') || 'Nessuna'}</p>
          </div>
          
          <button onClick={() => { setView('home'); setGameState(null); }} className="mt-4 text-white/60">← Esci</button>
        </main>
      );
    }

    // Other games - show simplified view
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex flex-col items-center justify-center p-4">
        {notificationEl}
        {opponentActionEl}
        
        <h1 className="text-3xl font-bold text-white mb-4">{game.emoji} {game.name}</h1>
        {isMyTurn && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 rounded-full text-white font-bold mb-4">
            🎯 È il tuo turno!
          </div>
        )}
        
        <div className="bg-black/30 rounded-2xl p-6 max-w-sm text-center">
          <p className="text-gray-400">Il gioco è in corso...</p>
          <p className="text-white mt-2">Fase: {gameState.phase as string}</p>
        </div>
        
        <button
          onClick={() => { setView('home'); setGameState(null); }}
          className="mt-6 px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20"
        >
          ← Esci
        </button>
      </main>
    );
  }

  return null;
}

// Global Styles for Animations
const globalStyles = `
  @keyframes fade-in-up {
    0% { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    100% { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes card-enter {
    0% { 
      opacity: 0; 
      transform: translateY(30px) scale(0.95); 
    }
    100% { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out forwards;
  }
  
  .animate-card-enter {
    animation: card-enter 0.5s ease-out forwards;
  }
`;
