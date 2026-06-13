// Game data for seeding
export const GAMES_DATA = [
  {
    id: 'besti-venetia',
    title: 'BESTI DI VENETIA',
    description: 'Un RPG completo stile Tuxemon ambientato in Veneto! Esplora la regione Venetia, cattura 35+ Besti uniche come Fogaron, Spritzilla e Gondrago. Sconfiggi la Compagnia della Polenta e diventa il campione!',
    category: 'adventure',
    thumbnail: '/games/besti-venetia/thumbnail.png',
    gamePath: '/games/besti-venetia/index.html',
    isActive: true,
    isMultiplayer: false,
    maxPlayers: 1
  },
  {
    id: 'pokemona',
    title: 'POKÉMONA - Edizione Italiana',
    description: 'Un RPG completo con grafica pixel art stile GBA! Esplora il Paesello, cattura creature italiane come Pizzocchero, Spritz, Maranza e Terronio. Sistema di battaglia a turni, dialoghi con NPC e tanto altro!',
    category: 'adventure',
    thumbnail: '/games/pokemona/thumbnail.png',
    gamePath: '/games/pokemona/index.html',
    isActive: true,
    isMultiplayer: false,
    maxPlayers: 1
  },
  {
    id: 'space-shooter',
    title: 'Space Shooter',
    description: 'Distruggi i nemici e sopravvivi il più a lungo possibile in questo classico arcade spaziale. Accumula punti eliminando flotte di astronavi nemiche!',
    category: 'action',
    thumbnail: '/games/space-shooter/thumbnail.png',
    gamePath: '/games/space-shooter/index.html',
    isActive: true,
    isMultiplayer: true,
    maxPlayers: 4
  },
  {
    id: 'puzzle-blocks',
    title: 'Puzzle Blocks',
    description: 'Un puzzle game coinvolgente dove devi allineare blocchi colorati per eliminarli. Più blocchi elimini, più punti guadagni!',
    category: 'puzzle',
    thumbnail: '/games/puzzle-blocks/thumbnail.png',
    gamePath: '/games/puzzle-blocks/index.html',
    isActive: true,
    isMultiplayer: false,
    maxPlayers: 1
  },
  {
    id: 'racing-championship',
    title: 'Racing Championship',
    description: 'Competi in gare adrenalitiche su circuiti impegnativi. Usa le tue abilità di guida per tagliare il traguardo per primo!',
    category: 'racing',
    thumbnail: '/games/racing/thumbnail.png',
    gamePath: '/games/racing/index.html',
    isActive: true,
    isMultiplayer: true,
    maxPlayers: 4
  },
  {
    id: 'arcade-jumper',
    title: 'Arcade Jumper',
    description: 'Salta tra le piattaforme e raccogli monete evitando ostacoli. Un platform game classico con un tocco moderno!',
    category: 'arcade',
    thumbnail: '/games/jumper/thumbnail.png',
    gamePath: '/games/jumper/index.html',
    isActive: true,
    isMultiplayer: false,
    maxPlayers: 1
  }
]

export const CATEGORIES = [
  { id: 'adventure', name: 'Avventura', icon: '🗺️' },
  { id: 'action', name: 'Azione', icon: '⚔️' },
  { id: 'puzzle', name: 'Puzzle', icon: '🧩' },
  { id: 'racing', name: 'Racing', icon: '🏎️' },
  { id: 'arcade', name: 'Arcade', icon: '👾' },
  { id: 'sports', name: 'Sport', icon: '⚽' },
  { id: 'strategy', name: 'Strategia', icon: '🎯' },
  { id: 'other', name: 'Altro', icon: '🎮' }
]
