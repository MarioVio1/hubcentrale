'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// ==================== CONFIG ====================
const CONFIG = {
  TILE_SIZE: 16,
  SCALE: 2,
  CANVAS_WIDTH: 240,
  CANVAS_HEIGHT: 160,
  ENCOUNTER_RATE: 0.04,
  CATCH_RATE_BASE: 0.3
}

const TILE = CONFIG.TILE_SIZE
const SCALE = CONFIG.SCALE
const TILE_SCALED = TILE * SCALE

// ==================== COLORS ====================
const COLORS = {
  black: '#0f380f', dark: '#306230', light: '#8bac0f', lightest: '#9bbc0f',
  grass: '#8bac0f', tallGrass: '#306230',
  path: '#c8b898', route: '#d8c898',
  water: '#3878b8', tree: '#306230',
  city: '#a8b878', gym: '#8858a8',
}

// ==================== TYPES ====================
interface Creature {
  id: number; name: string; type: string; desc: string;
  stats: { hp: number; atk: number; def: number; spd: number };
  moves: string[]; spriteId: number;
}

interface BattleCreature extends Creature {
  level: number; hp: number; maxHp: number;
  atk: number; def: number; spd: number; exp: number;
}

interface Gym {
  city: string; leader: string; type: string; badge: string;
  beaten: boolean; team: { creatureId: number; level: number }[];
}

// ==================== MOVES ====================
const MOVES: Record<string, { power: number; type: string; acc: number }> = {
  Polentata: { power: 45, type: 'normale', acc: 100 },
  Grattuggia: { power: 55, type: 'normale', acc: 95 },
  Schiacciata: { power: 70, type: 'lotta', acc: 90 },
  Fulmine: { power: 55, type: 'elettro', acc: 95 },
  Ghiacciolo: { power: 45, type: 'ghiaccio', acc: 100 },
  Bollicine: { power: 35, type: 'acqua', acc: 100 },
  AcquaAlta: { power: 70, type: 'acqua', acc: 85 },
  Fiammata: { power: 55, type: 'fuoco', acc: 95 },
  Roccia: { power: 50, type: 'terra', acc: 90 },
  Confusione: { power: 45, type: 'psico', acc: 100 },
  Fogliama: { power: 45, type: 'erba', acc: 100 },
  Dragoraggio: { power: 75, type: 'drago', acc: 90 },
  Maschera: { power: 55, type: 'buio', acc: 95 },
  Neve: { power: 50, type: 'ghiaccio', acc: 95 },
  Arena: { power: 65, type: 'lotta', acc: 90 },
  Amore: { power: 50, type: 'psico', acc: 100 },
  Stramazzo: { power: 80, type: 'lotta', acc: 80 },
  Tiramisu: { power: 55, type: 'normale', acc: 100 },
  Spritzata: { power: 50, type: 'acqua', acc: 100 },
  Prosecco: { power: 45, type: 'acqua', acc: 100 },
  Veleno: { power: 55, type: 'veleno', acc: 95 },
}

// ==================== CREATURES ====================
const CREATURES: Creature[] = [
  { id: 1, name: "Bigolo", type: "normale", desc: "Creatura di pasta", stats: { hp: 50, atk: 55, def: 45, spd: 40 }, moves: ["Polentata", "Grattuggia", "Schiacciata", "Tiramisu"], spriteId: 0 },
  { id: 2, name: "Aquileon", type: "elettro", desc: "Nato tra le Dolomiti", stats: { hp: 45, atk: 50, def: 40, spd: 60 }, moves: ["Fulmine", "Grattuggia", "Schiacciata", "Polentata"], spriteId: 1 },
  { id: 3, name: "Lagunello", type: "acqua", desc: "Spirito della Laguna", stats: { hp: 60, atk: 50, def: 55, spd: 50 }, moves: ["AcquaAlta", "Bollicine", "Spritzata", "Ghiacciolo"], spriteId: 2 },
  { id: 4, name: "Palladio", type: "terra", desc: "Spirito dell'architettura", stats: { hp: 70, atk: 45, def: 75, spd: 20 }, moves: ["Roccia", "Schiacciata", "Grattuggia", "Polentata"], spriteId: 3 },
  { id: 5, name: "Bacicin", type: "normale", desc: "Dolce tipico", stats: { hp: 55, atk: 50, def: 50, spd: 45 }, moves: ["Polentata", "Tiramisu", "Grattuggia"], spriteId: 4 },
  { id: 6, name: "Olimpico", type: "lotta", desc: "Spirito del teatro", stats: { hp: 60, atk: 70, def: 50, spd: 40 }, moves: ["Schiacciata", "Arena", "Stramazzo"], spriteId: 5 },
  { id: 7, name: "Berico", type: "erba", desc: "Delle colline", stats: { hp: 55, atk: 45, def: 55, spd: 50 }, moves: ["Fogliama", "Polentata"], spriteId: 6 },
  { id: 8, name: "Retrone", type: "acqua", desc: "Spirito del fiume", stats: { hp: 50, atk: 55, def: 45, spd: 55 }, moves: ["AcquaAlta", "Bollicine"], spriteId: 7 },
  { id: 9, name: "Santo", type: "psico", desc: "Protettore", stats: { hp: 65, atk: 55, def: 60, spd: 30 }, moves: ["Confusione", "Amore"], spriteId: 8 },
  { id: 10, name: "Botanico", type: "erba", desc: "Dell'Orto", stats: { hp: 60, atk: 50, def: 55, spd: 35 }, moves: ["Fogliama", "Veleno"], spriteId: 9 },
  { id: 11, name: "Specola", type: "elettro", desc: "Osservatore", stats: { hp: 45, atk: 65, def: 40, spd: 60 }, moves: ["Fulmine", "Confusione"], spriteId: 12 },
  { id: 12, name: "Arena", type: "lotta", desc: "Spirito anfiteatro", stats: { hp: 75, atk: 75, def: 60, spd: 25 }, moves: ["Arena", "Stramazzo"], spriteId: 14 },
  { id: 13, name: "Giulietta", type: "psico", desc: "Simbolo d'amore", stats: { hp: 50, atk: 45, def: 50, spd: 65 }, moves: ["Amore", "Confusione"], spriteId: 15 },
  { id: 14, name: "Doge", type: "drago", desc: "Antico sovrano", stats: { hp: 75, atk: 70, def: 65, spd: 30 }, moves: ["Dragoraggio", "AcquaAlta"], spriteId: 20 },
  { id: 15, name: "Maschera", type: "buio", desc: "Spirito Carnevale", stats: { hp: 50, atk: 60, def: 45, spd: 65 }, moves: ["Maschera", "Confusione"], spriteId: 22 },
  { id: 16, name: "Spritz", type: "acqua", desc: "Spirito aperitivo", stats: { hp: 45, atk: 55, def: 40, spd: 70 }, moves: ["Spritzata", "Prosecco"], spriteId: 25 },
  { id: 17, name: "Tiramisù", type: "normale", desc: "Dolce trevigiano", stats: { hp: 60, atk: 55, def: 50, spd: 45 }, moves: ["Tiramisu", "Amore"], spriteId: 28 },
  { id: 18, name: "Grappa", type: "fuoco", desc: "Spirito forte", stats: { hp: 45, atk: 75, def: 40, spd: 55 }, moves: ["Fiammata", "Schiacciata"], spriteId: 32 },
  { id: 19, name: "Alpino", type: "lotta", desc: "Guerriero montagna", stats: { hp: 65, atk: 70, def: 55, spd: 35 }, moves: ["Schiacciata", "Neve"], spriteId: 33 },
  { id: 20, name: "Dolomiti", type: "ghiaccio", desc: "Spirito vette", stats: { hp: 70, atk: 60, def: 65, spd: 25 }, moves: ["Neve", "Ghiacciolo"], spriteId: 44 },
  { id: 21, name: "Marmolada", type: "ghiaccio", desc: "Regina Dolomiti", stats: { hp: 75, atk: 65, def: 70, spd: 20 }, moves: ["Neve", "Dragoraggio"], spriteId: 45 },
  { id: 22, name: "Serenissimo", type: "drago", desc: "LEGGENUARIO", stats: { hp: 90, atk: 85, def: 80, spd: 35 }, moves: ["Dragoraggio", "AcquaAlta", "Stramazzo"], spriteId: 50 },
]

// ==================== GYMS ====================
const GYMS: Gym[] = [
  { city: "vicenza", leader: "Capitan Bèrico", type: "terra", badge: "Medaglia Palladio", beaten: false, team: [{ creatureId: 4, level: 12 }, { creatureId: 6, level: 14 }] },
  { city: "padova", leader: "Prof. Bo", type: "psico", badge: "Medaglia Santo", beaten: false, team: [{ creatureId: 9, level: 18 }, { creatureId: 11, level: 20 }] },
  { city: "verona", leader: "Arena Maximus", type: "lotta", badge: "Medaglia Arena", beaten: false, team: [{ creatureId: 6, level: 25 }, { creatureId: 12, level: 27 }] },
  { city: "treviso", leader: "Conte Prosecco", type: "acqua", badge: "Medaglia Sile", beaten: false, team: [{ creatureId: 16, level: 32 }, { creatureId: 17, level: 34 }] },
  { city: "bassano", leader: "Alpin Grappa", type: "fuoco", badge: "Medaglia Ponte", beaten: false, team: [{ creatureId: 18, level: 38 }, { creatureId: 19, level: 40 }] },
  { city: "chioggia", leader: "Amm. Laguna", type: "acqua", badge: "Medaglia Mare", beaten: false, team: [{ creatureId: 3, level: 44 }, { creatureId: 16, level: 46 }] },
  { city: "belluno", leader: "Maestro Dolomiti", type: "ghiaccio", badge: "Medaglia Vette", beaten: false, team: [{ creatureId: 20, level: 50 }, { creatureId: 21, level: 52 }] },
  { city: "venezia", leader: "Doge Serenissimo", type: "drago", badge: "Medaglia Leone", beaten: false, team: [{ creatureId: 14, level: 58 }, { creatureId: 22, level: 60 }] },
]

// ==================== WORLD ====================
const WORLD_WIDTH = 160
const WORLD_HEIGHT = 100

const CITIES: Record<string, { x: number; y: number; w: number; h: number; name: string }> = {
  vicenza: { x: 20, y: 35, w: 22, h: 18, name: "Vicensa" },
  padova: { x: 48, y: 35, w: 22, h: 18, name: "Padoa" },
  venezia: { x: 76, y: 38, w: 28, h: 22, name: "Venesia" },
  treviso: { x: 48, y: 15, w: 22, h: 16, name: "Treviso" },
  verona: { x: 2, y: 28, w: 16, h: 22, name: "Verona" },
  bassano: { x: 25, y: 12, w: 18, h: 14, name: "Bassan" },
  chioggia: { x: 78, y: 70, w: 22, h: 16, name: "Cioxa" },
  belluno: { x: 42, y: 2, w: 22, h: 12, name: "Bełun" },
}

const WILD_ZONES: Record<string, number[]> = {
  vicenza: [4, 5, 6, 7, 8],
  padova: [9, 10, 11],
  verona: [6, 12, 13],
  venezia: [14, 15, 16],
  treviso: [16, 17],
  bassano: [18, 19],
  chioggia: [3, 16],
  belluno: [20, 21],
  route: [1, 2, 3, 4, 5, 7, 8],
}

// ==================== INTERIORS ====================
const INTERIORS: Record<string, { name: string; width: number; height: number; npcs: { name: string; x: number; y: number; dialog: string[]; sprite: string; isGym?: boolean; gymCity?: string }[] }> = {
  house_vicenza: { name: "Caxa", width: 10, height: 8, npcs: [{ name: "Mamma", x: 5, y: 3, dialog: ["Ciao fiòło!", "Va in xiro par el Veneto!"], sprite: 'woman' }] },
  gym_vicenza: { name: "Pałestra Vicensa", width: 12, height: 10, npcs: [{ name: "Capitan Bèrico", x: 6, y: 4, dialog: ["Son el Capitan!", "Te sfido!"], sprite: 'prof', isGym: true, gymCity: 'vicenza' }] },
  gym_padova: { name: "Pałestra Padoa", width: 12, height: 10, npcs: [{ name: "Prof. Bo", x: 6, y: 4, dialog: ["La mente vinse!"], sprite: 'prof', isGym: true, gymCity: 'padova' }] },
  gym_verona: { name: "Pałestra Arena", width: 12, height: 10, npcs: [{ name: "Arena Maximus", x: 6, y: 4, dialog: ["Par l'Arena!"], sprite: 'prof', isGym: true, gymCity: 'verona' }] },
  gym_treviso: { name: "Pałestra Treviso", width: 12, height: 10, npcs: [{ name: "Conte Prosecco", x: 6, y: 4, dialog: ["El vin me dà forsa!"], sprite: 'prof', isGym: true, gymCity: 'treviso' }] },
  gym_bassano: { name: "Pałestra Bassan", width: 12, height: 10, npcs: [{ name: "Alpin Grappa", x: 6, y: 4, dialog: ["La grapa ła brusa!"], sprite: 'prof', isGym: true, gymCity: 'bassano' }] },
  gym_chioggia: { name: "Pałestra Cioxa", width: 12, height: 10, npcs: [{ name: "Amm. Laguna", x: 6, y: 4, dialog: ["El mar xe me regno!"], sprite: 'prof', isGym: true, gymCity: 'chioggia' }] },
  gym_belluno: { name: "Pałestra Bełun", width: 12, height: 10, npcs: [{ name: "Maestro Dolomiti", x: 6, y: 4, dialog: ["El giaso xe eterno!"], sprite: 'prof', isGym: true, gymCity: 'belluno' }] },
  gym_venezia: { name: "Pałestra Dogal", width: 12, height: 10, npcs: [{ name: "Doge Serenissimo", x: 6, y: 4, dialog: ["I draghi i me obedisie!"], sprite: 'prof', isGym: true, gymCity: 'venezia' }] },
}

// ==================== MAIN COMPONENT ====================
export default function PokemonaGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const battleRef = useRef<HTMLCanvasElement>(null)
  
  const playerRef = useRef({
    name: '', gender: '', sprite: 'player',
    x: 30, y: 42, px: 30 * TILE_SCALED, py: 42 * TILE_SCALED,
    facing: 'down', map: 'world', interior: null as string | null,
    team: [] as BattleCreature[], bag: [{ name: "Pokéball", qty: 15 }, { name: "Pozione", qty: 5 }],
    money: 3000, hasStarter: false, badges: [] as string[],
    gymBeaten: [] as string[],
  })
  
  const battleDataRef = useRef<{
    ally: BattleCreature; enemy: BattleCreature;
    phase: string; menuIdx: number; moveIdx: number; itemIdx: number;
    message: string; isGym: boolean; gymCity: string;
  } | null>(null)
  
  const worldRef = useRef<string[][]>([])
  const keysRef = useRef<Set<string>>(new Set())
  const animRef = useRef(0)
  const lastMoveRef = useRef(0)
  const gymsRef = useRef<Gym[]>(JSON.parse(JSON.stringify(GYMS)))
  const spritesRef = useRef<HTMLImageElement[]>([])
  const tileCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map())
  const charCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map())
  
  const [mounted, setMounted] = useState(false)
  const [screen, setScreen] = useState('title')
  const [titleIdx, setTitleIdx] = useState(0)
  const [hasSave, setHasSave] = useState(false)
  const [introStep, setIntroStep] = useState(0)
  const [dialog, setDialog] = useState<{ lines: string[]; idx: number; speaker: string } | null>(null)
  const [starterIdx, setStarterIdx] = useState(0)
  const [menuIdx, setMenuIdx] = useState(0)
  const [nameInput, setNameInput] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [keyX, setKeyX] = useState(0)
  const [keyY, setKeyY] = useState(0)
  const [blink, setBlink] = useState(true)
  const [genderIdx, setGenderIdx] = useState(0)
  const [saveMsg, setSaveMsg] = useState(false)
  const [badgeShow, setBadgeShow] = useState<string | null>(null)
  
  // ==================== INIT ====================
  useEffect(() => {
    // Load sprites
    for (let i = 0; i < 60; i++) {
      const img = new Image()
      img.src = `/sprites/besti/sprite_${String(i).padStart(3, '0')}.png`
      spritesRef.current.push(img)
    }
    
    // Generate world
    const tiles: string[][] = []
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      tiles[y] = []
      for (let x = 0; x < WORLD_WIDTH; x++) {
        let t = 'grass'
        if (x < 2 || x >= WORLD_WIDTH - 2 || y < 2 || y >= WORLD_HEIGHT - 2) t = 'tree'
        else if (Math.random() < 0.06) t = 'tallGrass'
        tiles[y][x] = t
      }
    }
    
    // Cities
    Object.entries(CITIES).forEach(([key, c]) => {
      for (let y = c.y; y < c.y + c.h; y++) {
        for (let x = c.x; x < c.x + c.w; x++) {
          if (tiles[y]?.[x]) tiles[y][x] = 'city'
        }
      }
      // Paths
      const mx = c.x + Math.floor(c.w / 2)
      const my = c.y + Math.floor(c.h / 2)
      for (let x = c.x; x < c.x + c.w; x++) if (tiles[my]?.[x]) tiles[my][x] = 'path'
      for (let y = c.y; y < c.y + c.h; y++) if (tiles[y]?.[mx]) tiles[y][mx] = 'path'
      // Gym
      if (tiles[c.y + 3]?.[mx]) tiles[c.y + 3][mx] = 'gym'
      // Door
      if (tiles[c.y + 5]?.[mx + 3]) tiles[c.y + 5][mx + 3] = 'door'
    })
    
    // Routes
    const routes = [['vicenza', 'padova'], ['padova', 'venezia'], ['padova', 'treviso'], ['vicenza', 'verona'], ['vicenza', 'bassano'], ['treviso', 'belluno'], ['venezia', 'chioggia']]
    routes.forEach(([a, b]) => {
      const ca = CITIES[a], cb = CITIES[b]
      if (!ca || !cb) return
      let x = ca.x + Math.floor(ca.w / 2), y = ca.y + Math.floor(ca.h / 2)
      const tx = cb.x + Math.floor(cb.w / 2), ty = cb.y + Math.floor(cb.h / 2)
      while (x !== tx || y !== ty) {
        if (tiles[y]?.[x] && tiles[y][x] !== 'city') tiles[y][x] = 'route'
        if (Math.random() < 0.5) x += x < tx ? 1 : (x > tx ? -1 : 0)
        else y += y < ty ? 1 : (y > ty ? -1 : 0)
      }
    })
    
    worldRef.current = tiles
    
    // Load save
    const saved = localStorage.getItem('pokemona_v3')
    if (saved) {
      try {
        const d = JSON.parse(saved)
        if (d.team?.length > 0) {
          Object.assign(playerRef.current, d)
          playerRef.current.px = d.x * TILE_SCALED
          playerRef.current.py = d.y * TILE_SCALED
          setHasSave(true)
          setTitleIdx(1)
        }
        if (d.gyms) gymsRef.current = d.gyms
      } catch {}
    }
    
    setMounted(true)
  }, [])
  
  // ==================== HELPERS ====================
  const getCity = (x: number, y: number) => {
    for (const [k, c] of Object.entries(CITIES)) {
      if (x >= c.x && x < c.x + c.w && y >= c.y && y < c.y + c.h) return k
    }
    return 'route'
  }
  
  const createCreature = (id: number, level: number): BattleCreature => {
    const base = CREATURES.find(c => c.id === id) || CREATURES[0]
    const m = 1 + (level - 5) * 0.1
    return { ...base, level, hp: Math.floor(base.stats.hp * m), maxHp: Math.floor(base.stats.hp * m), atk: Math.floor(base.stats.atk * m), def: Math.floor(base.stats.def * m), spd: Math.floor(base.stats.spd * m), exp: 0 }
  }
  
  const getTile = (t: string) => {
    if (tileCacheRef.current.has(t)) return tileCacheRef.current.get(t)!
    const c = document.createElement('canvas')
    c.width = c.height = TILE
    const x = c.getContext('2d')!
    
    if (t === 'grass') { x.fillStyle = COLORS.light; x.fillRect(0, 0, TILE, TILE) }
    else if (t === 'tallGrass') { x.fillStyle = COLORS.light; x.fillRect(0, 0, TILE, TILE); x.fillStyle = COLORS.tallGrass; for (let i = 0; i < 5; i++) x.fillRect(i * 3, 0, 2, 16) }
    else if (t === 'path' || t === 'route') { x.fillStyle = COLORS.route; x.fillRect(0, 0, TILE, TILE) }
    else if (t === 'city') { x.fillStyle = COLORS.city; x.fillRect(0, 0, TILE, TILE) }
    else if (t === 'water') { x.fillStyle = COLORS.water; x.fillRect(0, 0, TILE, TILE) }
    else if (t === 'tree') { x.fillStyle = COLORS.light; x.fillRect(0, 0, TILE, TILE); x.fillStyle = COLORS.tree; x.beginPath(); x.arc(8, 8, 7, 0, Math.PI * 2); x.fill() }
    else if (t === 'gym') { x.fillStyle = COLORS.gym; x.fillRect(0, 0, TILE, TILE); x.fillStyle = '#a868d8'; x.fillRect(2, 2, 12, 12) }
    else if (t === 'door') { x.fillStyle = '#a84838'; x.fillRect(4, 0, 8, 16) }
    else if (t === 'floor') { x.fillStyle = '#c8a878'; x.fillRect(0, 0, TILE, TILE) }
    else if (t === 'wall') { x.fillStyle = '#b8a888'; x.fillRect(0, 0, TILE, TILE) }
    else if (t === 'mat') { x.fillStyle = '#683828'; x.fillRect(2, 4, 12, 8) }
    else { x.fillStyle = COLORS.light; x.fillRect(0, 0, TILE, TILE) }
    
    tileCacheRef.current.set(t, c)
    return c
  }
  
  const getChar = (type: string, facing: string, frame: number) => {
    const key = `${type}_${facing}_${frame}`
    if (charCacheRef.current.has(key)) return charCacheRef.current.get(key)!
    const c = document.createElement('canvas')
    c.width = c.height = TILE
    const x = c.getContext('2d')!
    
    const colors: Record<string, { s: string; h: string; sh: string; p: string }> = {
      player: { s: '#f8c8a8', h: '#302010', sh: '#3088d0', p: '#282840' },
      boy: { s: '#f8c8a8', h: '#502808', sh: '#d85030', p: '#383850' },
      woman: { s: '#f8c8a8', h: '#783018', sh: '#d83078', p: '#383850' },
      prof: { s: '#f8c8a8', h: '#383838', sh: '#f8f8f8', p: '#181818' },
      clown: { s: '#ffffff', h: '#ff4040', sh: '#ff40ff', p: '#40ff40' },
    }
    const o = colors[type] || colors.player
    const w = frame === 1 ? 1 : frame === 2 ? -1 : 0
    
    x.fillStyle = 'rgba(0,0,0,0.2)'
    x.beginPath(); x.ellipse(8, 14, 4, 2, 0, 0, Math.PI * 2); x.fill()
    x.fillStyle = o.p; x.fillRect(5, 11, 2, 4 + w); x.fillRect(9, 11, 2, 4 - w)
    x.fillStyle = o.sh; x.fillRect(3, 6, 10, 6)
    x.fillStyle = o.s; x.fillRect(2 + w, 7, 2, 4); x.fillRect(12 - w, 7, 2, 4); x.fillRect(4, 1, 8, 6)
    x.fillStyle = o.h; x.fillRect(4, 0, 8, 3)
    x.fillStyle = '#181818'
    if (facing === 'down') { x.fillRect(5, 3, 2, 1); x.fillRect(9, 3, 2, 1) }
    else if (facing === 'up') { x.fillRect(5, 4, 2, 1); x.fillRect(9, 4, 2, 1) }
    else if (facing === 'left') { x.fillRect(4, 3, 2, 1) }
    else if (facing === 'right') { x.fillRect(10, 3, 2, 1) }
    
    charCacheRef.current.set(key, c)
    return c
  }
  
  const saveGame = useCallback(() => {
    const p = playerRef.current
    localStorage.setItem('pokemona_v3', JSON.stringify({
      name: p.name, gender: p.gender, sprite: p.sprite,
      x: p.x, y: p.y, map: p.map, interior: p.interior,
      team: p.team, bag: p.bag, money: p.money, hasStarter: p.hasStarter,
      badges: p.badges, gymBeaten: p.gymBeaten, gyms: gymsRef.current
    }))
    setSaveMsg(true)
    setTimeout(() => setSaveMsg(false), 1500)
  }, [])
  
  // ==================== RENDER ====================
  const renderGame = useCallback(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    
    ctx.imageSmoothingEnabled = false
    
    const p = playerRef.current
    
    // Get tiles
    let tiles: string[][] = []
    let w = WORLD_WIDTH, h = WORLD_HEIGHT
    let px = p.px, py = p.py
    
    if (p.interior) {
      const int = INTERIORS[p.interior]
      if (int) {
        tiles = []
        for (let y = 0; y < int.height; y++) {
          tiles[y] = []
          for (let x = 0; x < int.width; x++) {
            if (y === 0 || y === int.height - 1 || x === 0 || x === int.width - 1) tiles[y][x] = 'wall'
            else if (y === int.height - 1 && x >= int.width / 2 - 1 && x <= int.width / 2 + 1) tiles[y][x] = 'mat'
            else tiles[y][x] = 'floor'
          }
        }
        w = int.width; h = int.height
        px = p.x * TILE_SCALED; py = p.y * TILE_SCALED
      }
    } else {
      tiles = worldRef.current
    }
    
    // Camera
    const camX = Math.max(0, Math.min(px - CONFIG.CANVAS_WIDTH / 2 + TILE_SCALED / 2, w * TILE_SCALED - CONFIG.CANVAS_WIDTH))
    const camY = Math.max(0, Math.min(py - CONFIG.CANVAS_HEIGHT / 2 + TILE_SCALED / 2, h * TILE_SCALED - CONFIG.CANVAS_HEIGHT))
    
    // Background
    ctx.fillStyle = COLORS.light
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)
    
    // Tiles
    const sx = Math.floor(camX / TILE_SCALED)
    const sy = Math.floor(camY / TILE_SCALED)
    const ex = Math.min(w, sx + Math.ceil(CONFIG.CANVAS_WIDTH / TILE_SCALED) + 2)
    const ey = Math.min(h, sy + Math.ceil(CONFIG.CANVAS_HEIGHT / TILE_SCALED) + 2)
    
    for (let y = sy; y < ey; y++) {
      for (let x = sx; x < ex; x++) {
        const t = tiles[y]?.[x]
        if (t) ctx.drawImage(getTile(t), x * TILE_SCALED - camX, y * TILE_SCALED - camY, TILE_SCALED, TILE_SCALED)
      }
    }
    
    // NPCs
    if (p.interior) {
      const int = INTERIORS[p.interior]
      int?.npcs.forEach(n => {
        ctx.drawImage(getChar(n.sprite, 'down', 0), n.x * TILE_SCALED - camX, n.y * TILE_SCALED - camY, TILE_SCALED, TILE_SCALED)
      })
    }
    
    // Player
    animRef.current = (animRef.current + 1) % 60
    const frame = keysRef.current.size > 0 ? Math.floor(animRef.current / 10) % 3 : 0
    ctx.drawImage(getChar(p.sprite, p.facing, frame), px - camX, py - camY, TILE_SCALED, TILE_SCALED)
    
    // UI
    ctx.fillStyle = COLORS.black
    ctx.fillRect(2, 2, 65, 12)
    ctx.fillStyle = COLORS.lightest
    ctx.font = '8px monospace'
    const cityName = p.interior ? INTERIORS[p.interior]?.name : (CITIES[getCity(p.x, p.y)]?.name || 'Rotta')
    ctx.fillText(cityName || '', 4, 10)
    
    ctx.fillStyle = COLORS.black
    ctx.fillRect(CONFIG.CANVAS_WIDTH - 45, 2, 43, 12)
    ctx.fillStyle = '#f8d030'
    ctx.fillText('M:' + p.badges.length + ' $' + p.money, CONFIG.CANVAS_WIDTH - 43, 10)
    
    // Dialog
    if (dialog) {
      ctx.fillStyle = COLORS.lightest
      ctx.strokeStyle = COLORS.black
      ctx.lineWidth = 2
      ctx.fillRect(4, CONFIG.CANVAS_HEIGHT - 34, CONFIG.CANVAS_WIDTH - 8, 30)
      ctx.strokeRect(4, CONFIG.CANVAS_HEIGHT - 34, CONFIG.CANVAS_WIDTH - 8, 30)
      ctx.fillStyle = COLORS.black
      ctx.font = '7px monospace'
      ctx.fillText(dialog.speaker + ':', 8, CONFIG.CANVAS_HEIGHT - 22)
      ctx.fillText(dialog.lines[dialog.idx], 8, CONFIG.CANVAS_HEIGHT - 10)
      if (dialog.idx < dialog.lines.length - 1) ctx.fillText('▼', CONFIG.CANVAS_WIDTH - 12, CONFIG.CANVAS_HEIGHT - 8)
    }
    
    if (saveMsg) {
      ctx.fillStyle = COLORS.dark
      ctx.fillRect(CONFIG.CANVAS_WIDTH / 2 - 45, 10, 90, 16)
      ctx.fillStyle = COLORS.lightest
      ctx.font = '8px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SALVATO!', CONFIG.CANVAS_WIDTH / 2, 22)
      ctx.textAlign = 'left'
    }
  }, [dialog, saveMsg, getCity])
  
  const renderBattle = useCallback(() => {
    const cv = battleRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const b = battleDataRef.current
    if (!b) return
    
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = COLORS.light
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)
    
    // Ground
    ctx.fillStyle = COLORS.dark
    for (let i = 0; i < 12; i++) ctx.fillRect(i * 22 + 4, CONFIG.CANVAS_HEIGHT - 40, 16, 40)
    
    // Enemy
    const es = spritesRef.current[b.enemy.spriteId]
    if (es?.complete && es.naturalWidth > 0) ctx.drawImage(es, CONFIG.CANVAS_WIDTH - 70, 8, 60, 60)
    else {
      ctx.fillStyle = ['#f86048', '#58a8e8', '#78c850'][b.enemy.spriteId % 3]
      ctx.beginPath(); ctx.ellipse(CONFIG.CANVAS_WIDTH - 40, 38, 25, 20, 0, 0, Math.PI * 2); ctx.fill()
    }
    
    // Enemy stats
    ctx.fillStyle = COLORS.lightest; ctx.strokeStyle = COLORS.black; ctx.lineWidth = 2
    ctx.fillRect(4, 4, 100, 24); ctx.strokeRect(4, 4, 100, 24)
    ctx.fillStyle = COLORS.black; ctx.font = 'bold 8px monospace'
    ctx.fillText(b.enemy.name + ' L' + b.enemy.level, 8, 14)
    ctx.fillStyle = COLORS.dark; ctx.fillRect(8, 18, 80, 6)
    ctx.fillStyle = b.enemy.hp > b.enemy.maxHp * 0.3 ? COLORS.black : '#c03028'
    ctx.fillRect(8, 18, 80 * Math.max(0, b.enemy.hp / b.enemy.maxHp), 6)
    
    // Ally
    const as = spritesRef.current[b.ally.spriteId]
    if (as?.complete && as.naturalWidth > 0) ctx.drawImage(as, 16, CONFIG.CANVAS_HEIGHT - 95, 56, 56)
    else {
      ctx.fillStyle = ['#f86048', '#f8d030', '#58a8e8'][b.ally.spriteId % 3]
      ctx.beginPath(); ctx.ellipse(44, CONFIG.CANVAS_HEIGHT - 67, 22, 18, 0, 0, Math.PI * 2); ctx.fill()
    }
    
    // Ally stats
    ctx.fillStyle = COLORS.lightest; ctx.strokeStyle = COLORS.black
    ctx.fillRect(CONFIG.CANVAS_WIDTH - 104, CONFIG.CANVAS_HEIGHT - 65, 100, 32); ctx.strokeRect(CONFIG.CANVAS_WIDTH - 104, CONFIG.CANVAS_HEIGHT - 65, 100, 32)
    ctx.fillStyle = COLORS.black; ctx.font = 'bold 8px monospace'
    ctx.fillText(b.ally.name + ' L' + b.ally.level, CONFIG.CANVAS_WIDTH - 100, CONFIG.CANVAS_HEIGHT - 53)
    ctx.fillStyle = COLORS.dark; ctx.fillRect(CONFIG.CANVAS_WIDTH - 100, CONFIG.CANVAS_HEIGHT - 46, 80, 6)
    ctx.fillStyle = b.ally.hp > b.ally.maxHp * 0.3 ? COLORS.black : '#c03028'
    ctx.fillRect(CONFIG.CANVAS_WIDTH - 100, CONFIG.CANVAS_HEIGHT - 46, 80 * Math.max(0, b.ally.hp / b.ally.maxHp), 6)
    ctx.fillText(b.ally.hp + '/' + b.ally.maxHp, CONFIG.CANVAS_WIDTH - 60, CONFIG.CANVAS_HEIGHT - 35)
    
    // Menu
    if (b.phase === 'menu') {
      ctx.fillStyle = COLORS.lightest; ctx.strokeStyle = COLORS.black
      ctx.fillRect(CONFIG.CANVAS_WIDTH - 72, 32, 68, 52); ctx.strokeRect(CONFIG.CANVAS_WIDTH - 72, 32, 68, 52)
      ctx.fillStyle = COLORS.black; ctx.font = '8px monospace'
      const items = ['LOTTA', 'BESTI', 'OGGETTO', 'FUGGI']
      items.forEach((it, i) => ctx.fillText((i === b.menuIdx ? '>' : ' ') + it, CONFIG.CANVAS_WIDTH - 68, 44 + i * 11))
    }
    
    // Moves
    if (b.phase === 'moves') {
      ctx.fillStyle = COLORS.lightest; ctx.strokeStyle = COLORS.black
      ctx.fillRect(4, CONFIG.CANVAS_HEIGHT - 26, CONFIG.CANVAS_WIDTH - 8, 22); ctx.strokeRect(4, CONFIG.CANVAS_HEIGHT - 26, CONFIG.CANVAS_WIDTH - 8, 22)
      ctx.fillStyle = COLORS.black; ctx.font = '7px monospace'
      b.ally.moves.forEach((m, i) => ctx.fillText((i === b.moveIdx ? '>' : ' ') + m, 8 + (i % 2) * 60, CONFIG.CANVAS_HEIGHT - 14 + Math.floor(i / 2) * 8))
    }
    
    // Items
    if (b.phase === 'items') {
      ctx.fillStyle = COLORS.lightest; ctx.strokeStyle = COLORS.black
      ctx.fillRect(4, CONFIG.CANVAS_HEIGHT - 26, CONFIG.CANVAS_WIDTH - 8, 22); ctx.strokeRect(4, CONFIG.CANVAS_HEIGHT - 26, CONFIG.CANVAS_WIDTH - 8, 22)
      ctx.fillStyle = COLORS.black; ctx.font = '7px monospace'
      playerRef.current.bag.forEach((it, i) => ctx.fillText((i === b.itemIdx ? '>' : ' ') + it.name + ' x' + it.qty, 8, CONFIG.CANVAS_HEIGHT - 14 + i * 7))
    }
    
    // Message
    if (b.message) {
      ctx.fillStyle = COLORS.lightest; ctx.strokeStyle = COLORS.black
      ctx.fillRect(4, CONFIG.CANVAS_HEIGHT - 26, CONFIG.CANVAS_WIDTH - 8, 22); ctx.strokeRect(4, CONFIG.CANVAS_HEIGHT - 26, CONFIG.CANVAS_WIDTH - 8, 22)
      ctx.fillStyle = COLORS.black; ctx.font = '8px monospace'
      ctx.fillText(b.message, 8, CONFIG.CANVAS_HEIGHT - 10)
    }
  }, [])
  
  const renderTitle = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return
    const ctx = cv.getContext('2d'); if (!ctx) return
    ctx.imageSmoothingEnabled = false
    
    ctx.fillStyle = COLORS.black; ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)
    ctx.fillStyle = COLORS.lightest; ctx.font = 'bold 16px monospace'; ctx.textAlign = 'center'
    ctx.fillText('POKEMONA', CONFIG.CANVAS_WIDTH / 2, 35)
    ctx.font = '8px monospace'
    ctx.fillText('Version Veneto', CONFIG.CANVAS_WIDTH / 2, 50)
    ctx.fillText('OPEN WORLD', CONFIG.CANVAS_WIDTH / 2, 62)
    
    const s = spritesRef.current[0]
    if (s?.complete && s.naturalWidth > 0) ctx.drawImage(s, CONFIG.CANVAS_WIDTH / 2 - 25, 72, 50, 50)
    
    ctx.textAlign = 'left'; ctx.font = '8px monospace'
    ctx.fillText(titleIdx === 0 ? '> NUOVO' : '  NUOVO', 80, 140)
    if (hasSave) ctx.fillText(titleIdx === 1 ? '> CONTINUA' : '  CONTINUA', 80, 152)
  }, [titleIdx, hasSave])
  
  const renderIntro = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return
    const ctx = cv.getContext('2d'); if (!ctx) return
    ctx.fillStyle = COLORS.black; ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)
    ctx.fillStyle = COLORS.lightest; ctx.font = '8px monospace'; ctx.textAlign = 'center'
    const texts = [
      ['Ciao, fiòło!', 'Benvegnù a POKEMONA!'],
      ['El Veneto xe vasto!', 'Xe un mondo aperto!'],
      ['Catura i Besti!', 'Sconfigzi 8 Cai!'],
      ['Come te ciame?'],
    ]
    const t = texts[introStep] || texts[0]
    t.forEach((l, i) => ctx.fillText(l, CONFIG.CANVAS_WIDTH / 2, 50 + i * 14))
    ctx.textAlign = 'left'; ctx.fillText('Premi A', 4, CONFIG.CANVAS_HEIGHT - 8)
  }, [introStep])
  
  const renderName = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return
    const ctx = cv.getContext('2d'); if (!ctx) return
    ctx.fillStyle = COLORS.black; ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)
    ctx.fillStyle = COLORS.lightest; ctx.font = '8px monospace'; ctx.textAlign = 'center'
    ctx.fillText('Nome?', CONFIG.CANVAS_WIDTH / 2, 20)
    ctx.fillStyle = COLORS.dark; ctx.fillRect(30, 30, CONFIG.CANVAS_WIDTH - 60, 18)
    ctx.fillStyle = COLORS.lightest; ctx.fillText(nameInput + (blink ? '_' : ''), CONFIG.CANVAS_WIDTH / 2, 43)
    ctx.textAlign = 'left'; ctx.font = '7px monospace'
    const rows = ['ABCDEFGH', 'IJKLMNOP', 'QRSTUVWX', 'YZ!?,. -', 'abcdefgh', 'ijklmnop']
    rows.forEach((row, y) => {
      for (let x = 0; x < 8; x++) {
        ctx.fillStyle = (x === keyX && y === keyY) ? COLORS.dark : COLORS.lightest
        if (x === keyX && y === keyY) ctx.fillRect(20 + x * 26 - 2, 50 + y * 14 - 10, 24, 12)
        ctx.fillStyle = (x === keyX && y === keyY) ? COLORS.black : COLORS.lightest
        ctx.fillText(row[x] || '', 20 + x * 26, 50 + y * 14)
      }
    })
  }, [nameInput, keyX, keyY, blink])
  
  const renderGender = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return
    const ctx = cv.getContext('2d'); if (!ctx) return
    ctx.fillStyle = COLORS.black; ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)
    ctx.fillStyle = COLORS.lightest; ctx.font = '8px monospace'; ctx.textAlign = 'center'
    ctx.fillText('Chi sei?', CONFIG.CANVAS_WIDTH / 2, 20)
    const genders = [{ l: 'RAGAZZO', s: 'boy' }, { l: 'RAGAZZA', s: 'woman' }, { l: 'TRANS', s: 'clown' }]
    genders.forEach((g, i) => {
      const x = 40 + i * 70
      if (i === genderIdx) { ctx.fillStyle = COLORS.dark; ctx.fillRect(x - 28, 45, 56, 55) }
      ctx.drawImage(getChar(g.s, 'down', 0), x - 8, 55, 32, 32)
      ctx.fillStyle = i === genderIdx ? COLORS.black : COLORS.lightest
      ctx.font = '6px monospace'
      ctx.fillText(g.l, x, 95)
    })
  }, [genderIdx])
  
  const renderStarter = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return
    const ctx = cv.getContext('2d'); if (!ctx) return
    ctx.fillStyle = COLORS.black; ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)
    ctx.fillStyle = COLORS.lightest; ctx.font = '8px monospace'; ctx.textAlign = 'center'
    ctx.fillText('Scegli!', CONFIG.CANVAS_WIDTH / 2, 16)
    const starters = CREATURES.slice(0, 3)
    starters.forEach((c, i) => {
      const x = 40 + i * 70
      if (i === starterIdx) { ctx.fillStyle = COLORS.dark; ctx.fillRect(x - 25, 35, 50, 70) }
      const s = spritesRef.current[c.spriteId]
      if (s?.complete && s.naturalWidth > 0) ctx.drawImage(s, x - 18, 45, 36, 36)
      ctx.fillStyle = COLORS.lightest; ctx.font = '7px monospace'
      ctx.fillText(c.name, x, 90)
    })
  }, [starterIdx])
  
  const renderMenu = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return
    const ctx = cv.getContext('2d'); if (!ctx) return
    ctx.fillStyle = COLORS.black; ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)
    ctx.fillStyle = COLORS.lightest; ctx.font = '8px monospace'
    const items = ['BESTI', 'ZAINO', 'MEDAGLIE', 'SALVA', 'ESCI']
    items.forEach((it, i) => ctx.fillText((i === menuIdx ? '>' : ' ') + it, 8, 16 + i * 10))
    
    const p = playerRef.current
    ctx.font = '7px monospace'
    if (menuIdx === 0) p.team.forEach((c, i) => ctx.fillText(c.name + ' L' + c.level + ' ' + c.hp + '/' + c.maxHp, 8, 75 + i * 10))
    if (menuIdx === 1) p.bag.forEach((it, i) => ctx.fillText(it.name + ' x' + it.qty, 8, 75 + i * 10))
    if (menuIdx === 2) { ctx.fillText('Medaglie: ' + p.badges.length + '/8', 8, 75); p.badges.forEach((b, i) => ctx.fillText((i + 1) + '. ' + b, 8, 90 + i * 10)) }
    if (menuIdx === 3 && saveMsg) { ctx.fillStyle = COLORS.dark; ctx.fillRect(50, 70, 140, 20); ctx.fillStyle = COLORS.lightest; ctx.textAlign = 'center'; ctx.fillText('SALVATO!', CONFIG.CANVAS_WIDTH / 2, 84) }
  }, [menuIdx, saveMsg])
  
  const renderBadge = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return
    const ctx = cv.getContext('2d'); if (!ctx) return
    ctx.fillStyle = COLORS.black; ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT)
    ctx.fillStyle = '#f8d030'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center'
    ctx.fillText('HAI VINTO!', CONFIG.CANVAS_WIDTH / 2, 40)
    ctx.fillStyle = COLORS.lightest; ctx.font = '8px monospace'
    ctx.fillText(badgeShow || '', CONFIG.CANVAS_WIDTH / 2, 70)
    ctx.fillText('Premi A', CONFIG.CANVAS_WIDTH / 2, 110)
  }, [badgeShow])
  
  // ==================== INPUT ====================
  const handleBtn = useCallback((btn: string) => {
    if (screen === 'title') {
      if (btn === 'up' || btn === 'down') setTitleIdx(hasSave ? (titleIdx + 1) % 2 : 0)
      if (btn === 'a') { if (titleIdx === 1 && hasSave) setScreen('overworld'); else setScreen('intro') }
    }
    else if (screen === 'intro') {
      if (btn === 'a') { if (introStep < 3) setIntroStep(introStep + 1); else setScreen('name') }
    }
    else if (screen === 'name') {
      const rows = ['ABCDEFGH', 'IJKLMNOP', 'QRSTUVWX', 'YZ!?,. -', 'abcdefgh', 'ijklmnop']
      if (btn === 'up') setKeyY(keyY === 0 ? 5 : keyY - 1)
      if (btn === 'down') setKeyY(keyY === 5 ? 0 : keyY + 1)
      if (btn === 'left') setKeyX(keyX === 0 ? 7 : keyX - 1)
      if (btn === 'right') setKeyX(keyX === 7 ? 0 : keyX + 1)
      if (btn === 'a') { const c = rows[keyY]?.[keyX]; if (c && nameInput.length < 8) setNameInput(nameInput + c) }
      if (btn === 'b') setNameInput(nameInput.slice(0, -1))
      if (btn === 'start' && nameInput.length > 0) { playerRef.current.name = nameInput; setPlayerName(nameInput); setScreen('gender') }
    }
    else if (screen === 'gender') {
      if (btn === 'left') setGenderIdx((genderIdx + 2) % 3)
      if (btn === 'right') setGenderIdx((genderIdx + 1) % 3)
      if (btn === 'a') {
        playerRef.current.gender = ['ragazzo', 'ragazza', 'trans'][genderIdx]
        playerRef.current.sprite = ['boy', 'woman', 'clown'][genderIdx]
        setScreen('starter')
      }
    }
    else if (screen === 'starter') {
      if (btn === 'left') setStarterIdx((starterIdx + 2) % 3)
      if (btn === 'right') setStarterIdx((starterIdx + 1) % 3)
      if (btn === 'a') {
        playerRef.current.team = [createCreature(CREATURES[starterIdx].id, 5)]
        playerRef.current.hasStarter = true
        setScreen('overworld')
      }
    }
    else if (screen === 'overworld') {
      if (btn === 'start') setScreen('menu')
      if (btn === 'select') saveGame()
      if (dialog) {
        if (btn === 'a') {
          // Gym battle
          if (dialog.speaker.includes('Bèrico') || dialog.speaker.includes('Bo') || dialog.speaker.includes('Maximus') || dialog.speaker.includes('Prosecco') || dialog.speaker.includes('Grappa') || dialog.speaker.includes('Laguna') || dialog.speaker.includes('Dolomiti') || dialog.speaker.includes('Serenissimo')) {
            const p = playerRef.current
            const city = p.interior?.replace('gym_', '') || getCity(p.x, p.y)
            const gym = gymsRef.current.find(g => g.city === city)
            if (gym && !gym.beaten && p.team.length > 0) {
              setDialog(null)
              battleDataRef.current = {
                ally: { ...p.team[0] },
                enemy: createCreature(gym.team[0].creatureId, gym.team[0].level),
                phase: 'menu', menuIdx: 0, moveIdx: 0, itemIdx: 0,
                message: gym.leader + ' ti sfida!', isGym: true, gymCity: city
              }
              setScreen('battle')
              return
            }
          }
          if (dialog.idx < dialog.lines.length - 1) setDialog({ ...dialog, idx: dialog.idx + 1 })
          else setDialog(null)
        }
      } else if (btn === 'a') {
        const p = playerRef.current
        let tx = p.x, ty = p.y
        if (p.facing === 'up') ty--
        if (p.facing === 'down') ty++
        if (p.facing === 'left') tx--
        if (p.facing === 'right') tx++
        if (p.interior) {
          const npc = INTERIORS[p.interior]?.npcs.find(n => n.x === tx && n.y === ty)
          if (npc) setDialog({ lines: npc.dialog, idx: 0, speaker: npc.name })
        }
      }
    }
    else if (screen === 'menu') {
      if (btn === 'up') setMenuIdx((menuIdx + 4) % 5)
      if (btn === 'down') setMenuIdx((menuIdx + 1) % 5)
      if (btn === 'a') { if (menuIdx === 3) saveGame(); if (menuIdx === 4) setScreen('overworld') }
      if (btn === 'b' || btn === 'start') setScreen('overworld')
    }
    else if (screen === 'battle') {
      const b = battleDataRef.current; if (!b) return
      
      if (b.phase === 'menu') {
        if (btn === 'up') b.menuIdx = (b.menuIdx + 3) % 4
        if (btn === 'down') b.menuIdx = (b.menuIdx + 1) % 4
        if (btn === 'a') {
          if (b.menuIdx === 0) b.phase = 'moves'
          if (b.menuIdx === 2) { b.phase = 'items'; b.itemIdx = 0 }
          if (b.menuIdx === 3 && !b.isGym) { b.message = 'Fuggito!'; setTimeout(() => { setScreen('overworld'); battleDataRef.current = null }, 800) }
        }
      }
      else if (b.phase === 'moves') {
        if (btn === 'up') b.moveIdx = (b.moveIdx + 3) % 4
        if (btn === 'down') b.moveIdx = (b.moveIdx + 1) % 4
        if (btn === 'left' || btn === 'right') b.moveIdx = (b.moveIdx + 2) % 4
        if (btn === 'a') {
          const move = b.ally.moves[b.moveIdx]
          const md = MOVES[move] || { power: 40, acc: 100 }
          if (Math.random() * 100 <= md.acc) {
            const dmg = Math.max(1, Math.floor(b.ally.atk * md.power / (b.enemy.def * 2)))
            b.enemy.hp = Math.max(0, b.enemy.hp - dmg)
            b.message = b.ally.name + ' usa ' + move + '!'
          } else {
            b.message = b.ally.name + ' ha mancato!'
          }
          b.phase = 'anim'
          
          setTimeout(() => {
            if (b.enemy.hp <= 0) {
              b.message = b.enemy.name + ' KO!'
              b.ally.exp += b.enemy.level * 15
              if (b.ally.exp >= b.ally.level * 25) {
                b.ally.level++; b.ally.maxHp += 5; b.ally.hp = Math.min(b.ally.hp + 5, b.ally.maxHp); b.ally.atk += 2; b.ally.def += 2
                b.message = b.ally.name + ' L' + b.ally.level + '!'
              }
              if (b.isGym) {
                const gym = gymsRef.current.find(g => g.city === b.gymCity)
                if (gym) { gym.beaten = true; playerRef.current.badges.push(gym.badge); playerRef.current.money += 500; setBadgeShow(gym.badge) }
              }
              const idx = playerRef.current.team.findIndex(t => t.id === b.ally.id)
              if (idx >= 0) playerRef.current.team[idx] = { ...b.ally }
              setTimeout(() => { battleDataRef.current = null; setScreen(b.isGym ? 'badge' : 'overworld') }, 1200)
            } else {
              // Enemy turn
              const em = b.enemy.moves[Math.floor(Math.random() * b.enemy.moves.length)]
              const emd = MOVES[em] || { power: 40, acc: 100 }
              if (Math.random() * 100 <= emd.acc) {
                const edmg = Math.max(1, Math.floor(b.enemy.atk * emd.power / (b.ally.def * 2)))
                b.ally.hp = Math.max(0, b.ally.hp - edmg)
                b.message = b.enemy.name + ' usa ' + em + '!'
              } else {
                b.message = b.enemy.name + ' ha mancato!'
              }
              setTimeout(() => {
                if (b.ally.hp <= 0) { b.message = b.ally.name + ' KO!'; setTimeout(() => { playerRef.current.team.forEach(t => t.hp = t.maxHp); setScreen('overworld'); battleDataRef.current = null }, 1200) }
                else { b.phase = 'menu'; b.message = '' }
              }, 1000)
            }
          }, 1000)
        }
        if (btn === 'b') b.phase = 'menu'
      }
      else if (b.phase === 'items') {
        const items = playerRef.current.bag
        if (btn === 'up') b.itemIdx = (b.itemIdx + items.length - 1) % items.length
        if (btn === 'down') b.itemIdx = (b.itemIdx + 1) % items.length
        if (btn === 'a' && items[b.itemIdx]) {
          const item = items[b.itemIdx]
          if (item.name === 'Pokéball' && !b.isGym) {
            b.message = 'Lanci Pokéball...'
            b.phase = 'anim'
            setTimeout(() => {
              const rate = CONFIG.CATCH_RATE_BASE + (1 - b.enemy.hp / b.enemy.maxHp) * 0.4
              if (Math.random() < rate) {
                b.message = 'Hai catturato ' + b.enemy.name + '!'
                const caught = createCreature(b.enemy.id, b.enemy.level)
                if (playerRef.current.team.length < 6) playerRef.current.team.push(caught)
                item.qty--; if (item.qty <= 0) playerRef.current.bag = playerRef.current.bag.filter(i => i !== item)
                setTimeout(() => { setScreen('overworld'); battleDataRef.current = null }, 1500)
              } else {
                b.message = b.enemy.name + ' scappa!'
                item.qty--; if (item.qty <= 0) playerRef.current.bag = playerRef.current.bag.filter(i => i !== item)
                setTimeout(() => { b.phase = 'menu'; b.message = '' }, 1000)
              }
            }, 1500)
          } else if (item.name === 'Pozione') {
            b.ally.hp = Math.min(b.ally.maxHp, b.ally.hp + 20)
            b.message = b.ally.name + ' +20 HP!'
            item.qty--; if (item.qty <= 0) playerRef.current.bag = playerRef.current.bag.filter(i => i !== item)
            setTimeout(() => { b.phase = 'menu'; b.message = '' }, 1000)
          } else {
            b.message = 'Non puoi!'
            setTimeout(() => { b.phase = 'menu'; b.message = '' }, 800)
          }
        }
        if (btn === 'b') b.phase = 'menu'
      }
    }
    else if (screen === 'badge') {
      if (btn === 'a') { setBadgeShow(null); setScreen('overworld') }
    }
  }, [screen, titleIdx, hasSave, introStep, nameInput, keyX, keyY, genderIdx, starterIdx, dialog, menuIdx, saveGame, saveMsg, getCity])
  
  const handleDPadDown = useCallback((dir: string) => {
    if (screen === 'overworld' && !dialog) keysRef.current.add(dir)
    else handleBtn(dir)
  }, [screen, dialog, handleBtn])
  
  const handleDPadUp = useCallback((dir: string) => keysRef.current.delete(dir), [])
  
  // ==================== KEYBOARD ====================
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const map: Record<string, string> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', z: 'a', x: 'b', Enter: 'start', Shift: 'select' }
      const btn = map[e.key]
      if (!btn) return
      if (screen === 'overworld' && !dialog && ['up', 'down', 'left', 'right'].includes(btn)) keysRef.current.add(btn)
      else handleBtn(btn)
    }
    const up = (e: KeyboardEvent) => {
      const map: Record<string, string> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }
      keysRef.current.delete(map[e.key])
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [handleBtn, screen, dialog])
  
  // ==================== GAME LOOP ====================
  useEffect(() => {
    const loop = () => {
      if (screen === 'overworld' && !dialog) {
        const p = playerRef.current
        const now = Date.now()
        if (now - lastMoveRef.current >= 150) {
          let dx = 0, dy = 0
          if (keysRef.current.has('up')) { dy = -1; p.facing = 'up' }
          if (keysRef.current.has('down')) { dy = 1; p.facing = 'down' }
          if (keysRef.current.has('left')) { dx = -1; p.facing = 'left' }
          if (keysRef.current.has('right')) { dx = 1; p.facing = 'right' }
          
          if (dx !== 0 || dy !== 0) {
            lastMoveRef.current = now
            
            let tiles: string[][] = []
            let w = WORLD_WIDTH, h = WORLD_HEIGHT
            if (p.interior) {
              const int = INTERIORS[p.interior]
              if (int) {
                tiles = Array.from({ length: int.height }, (_, y) =>
                  Array.from({ length: int.width }, (_, x) =>
                    y === 0 || y === int.height - 1 || x === 0 || x === int.width - 1 ? 'wall' : (y === int.height - 1 && x >= int.width / 2 - 1 && x <= int.width / 2 + 1 ? 'mat' : 'floor')
                  )
                )
                w = int.width; h = int.height
              }
            } else {
              tiles = worldRef.current
            }
            
            let newX = p.x + dx, newY = p.y + dy
            if (p.interior) { newX = Math.floor(p.px / TILE_SCALED) + dx; newY = Math.floor(p.py / TILE_SCALED) + dy }
            
            const tile = tiles[newY]?.[newX]
            const blocked = ['tree', 'water', 'wall']
            const npcBlock = p.interior && INTERIORS[p.interior]?.npcs.some(n => n.x === newX && n.y === newY)
            
            if (tile && !blocked.includes(tile) && !npcBlock && newX >= 0 && newX < w && newY >= 0 && newY < h) {
              if (p.interior) {
                p.px = newX * TILE_SCALED; p.py = newY * TILE_SCALED
                if (tile === 'mat') { p.interior = null; p.x = 30; p.y = 42; p.px = p.x * TILE_SCALED; p.py = p.y * TILE_SCALED }
              } else {
                p.x = newX; p.y = newY; p.px = newX * TILE_SCALED; p.py = newY * TILE_SCALED
                
                // Gym
                if (tile === 'gym') {
                  const city = getCity(newX, newY)
                  const gym = 'gym_' + city
                  if (INTERIORS[gym]) { p.interior = gym; p.x = 6; p.y = 5; p.px = p.x * TILE_SCALED; p.py = p.y * TILE_SCALED }
                }
                
                // Door
                if (tile === 'door') { p.interior = 'house_vicenza'; p.x = 5; p.y = 6; p.px = p.x * TILE_SCALED; p.py = p.y * TILE_SCALED }
                
                // Wild
                if (tile === 'tallGrass' && p.team.length > 0 && Math.random() < CONFIG.ENCOUNTER_RATE) {
                  const zone = WILD_ZONES[getCity(newX, newY)] || WILD_ZONES.route
                  const wildId = zone[Math.floor(Math.random() * zone.length)]
                  const wild = CREATURES.find(c => c.id === wildId) || CREATURES[0]
                  const level = Math.max(3, p.team[0].level + Math.floor(Math.random() * 4) - 2)
                  battleDataRef.current = {
                    ally: { ...p.team[0] },
                    enemy: createCreature(wild.id, level),
                    phase: 'menu', menuIdx: 0, moveIdx: 0, itemIdx: 0,
                    message: 'Un ' + wild.name + ' selvatico L' + level + '!', isGym: false, gymCity: ''
                  }
                  setScreen('battle')
                }
              }
            }
          }
        }
      }
      
      // Render
      if (screen === 'title') renderTitle()
      else if (screen === 'intro') renderIntro()
      else if (screen === 'name') renderName()
      else if (screen === 'gender') renderGender()
      else if (screen === 'starter') renderStarter()
      else if (screen === 'overworld') renderGame()
      else if (screen === 'menu') renderMenu()
      else if (screen === 'badge') renderBadge()
      
      requestAnimationFrame(loop)
    }
    
    requestAnimationFrame(loop)
  }, [screen, dialog, renderTitle, renderIntro, renderName, renderGender, renderStarter, renderGame, renderMenu, renderBadge, getCity])
  
  // Battle render
  useEffect(() => {
    const loop = () => {
      if (screen === 'battle') renderBattle()
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)
  }, [screen, renderBattle])
  
  // Blink
  useEffect(() => { const i = setInterval(() => setBlink(b => !b), 500); return () => clearInterval(i) }, [])
  
  if (!mounted) return null
  
  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center p-2">
      <div className="relative w-full max-w-[400px] aspect-[3/4] flex flex-col bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
        <div className="flex-1 bg-[#0f380f] relative flex items-center justify-center p-2">
          <canvas ref={canvasRef} width={CONFIG.CANVAS_WIDTH} height={CONFIG.CANVAS_HEIGHT} className="w-full h-full" style={{ imageRendering: 'pixelated' }} />
          <canvas ref={battleRef} width={CONFIG.CANVAS_WIDTH} height={CONFIG.CANVAS_HEIGHT} className="absolute top-2 left-2 right-2 bottom-2" style={{ imageRendering: 'pixelated', display: screen === 'battle' ? 'block' : 'none' }} />
        </div>
        <div className="h-[42%] bg-gradient-to-b from-gray-800 to-gray-900 p-3 flex flex-col justify-between">
          <div className="flex justify-center items-center gap-6">
            <div className="relative w-[100px] h-[100px]">
              <button className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 bg-gray-700 rounded-lg active:bg-gray-600 flex items-center justify-center" onMouseDown={() => handleDPadDown('up')} onMouseUp={() => handleDPadUp('up')} onTouchStart={e => { e.preventDefault(); handleDPadDown('up') }} onTouchEnd={() => handleDPadUp('up')}><span className="text-white text-lg">▲</span></button>
              <button className="absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-9 bg-gray-700 rounded-lg active:bg-gray-600 flex items-center justify-center" onMouseDown={() => handleDPadDown('down')} onMouseUp={() => handleDPadUp('down')} onTouchStart={e => { e.preventDefault(); handleDPadDown('down') }} onTouchEnd={() => handleDPadUp('down')}><span className="text-white text-lg">▼</span></button>
              <button className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 bg-gray-700 rounded-lg active:bg-gray-600 flex items-center justify-center" onMouseDown={() => handleDPadDown('left')} onMouseUp={() => handleDPadUp('left')} onTouchStart={e => { e.preventDefault(); handleDPadDown('left') }} onTouchEnd={() => handleDPadUp('left')}><span className="text-white text-lg">◀</span></button>
              <button className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 bg-gray-700 rounded-lg active:bg-gray-600 flex items-center justify-center" onMouseDown={() => handleDPadDown('right')} onMouseUp={() => handleDPadUp('right')} onTouchStart={e => { e.preventDefault(); handleDPadDown('right') }} onTouchEnd={() => handleDPadUp('right')}><span className="text-white text-lg">▶</span></button>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-gray-600 rounded-full" />
            </div>
            <div className="relative w-[85px] h-[85px]">
              <button className="absolute top-1 right-0 w-11 h-11 bg-red-600 rounded-full active:bg-red-500 flex items-center justify-center text-white font-bold" onMouseDown={() => handleBtn('a')} onTouchStart={e => { e.preventDefault(); handleBtn('a') }}>A</button>
              <button className="absolute bottom-1 left-0 w-11 h-11 bg-yellow-600 rounded-full active:bg-yellow-500 flex items-center justify-center text-white font-bold" onMouseDown={() => handleBtn('b')} onTouchStart={e => { e.preventDefault(); handleBtn('b') }}>B</button>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <button className="px-5 py-1.5 bg-gray-600 rounded-full active:bg-gray-500 text-white text-xs" onMouseDown={() => handleBtn('select')} onTouchStart={e => { e.preventDefault(); handleBtn('select') }}>SELECT</button>
            <button className="px-5 py-1.5 bg-gray-600 rounded-full active:bg-gray-500 text-white text-xs" onMouseDown={() => handleBtn('start')} onTouchStart={e => { e.preventDefault(); handleBtn('start') }}>START</button>
          </div>
        </div>
      </div>
      <p className="mt-2 text-gray-500 text-xs text-center">Frecce = Muovi | Z = A | X = B | Enter = Start | Shift = Salva</p>
    </div>
  )
}
