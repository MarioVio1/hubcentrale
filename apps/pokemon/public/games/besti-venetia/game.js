// ================================================
// BESTI DI VENETIA - Game Engine
// Complete RPG Engine with Battle System
// GBA-style controls: D-Pad, A, B, Start, Select
// ================================================

// ==================== CANVAS SETUP ====================
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const battleCanvas = document.getElementById('battle-screen');
const battleCtx = battleCanvas.getContext('2d');

// ==================== CONFIG ====================
const CONFIG = {
    TILE_SIZE: 16,
    SCALE: 2,
    CANVAS_WIDTH: 480,
    CANVAS_HEIGHT: 320,
    PLAYER_SPEED: 2,
    ENCOUNTER_RATE: 0.05,
    DIALOG_SPEED: 25
};

const TILE = CONFIG.TILE_SIZE;
const SCALE = CONFIG.SCALE;
const TILE_SCALED = TILE * SCALE;

// ==================== COLORS ====================
const COLORS = {
    grass: '#78C850', grassD: '#5A9A38', grassL: '#90D870',
    tallGrass: '#68B040', tallGrassD: '#508830',
    path: '#D8C8A0', pathD: '#B8A880',
    water: '#5098D8', waterD: '#3878B8', waterL: '#70B8F8',
    sand: '#E8D8A0', sandD: '#C8B880',
    snow: '#E8F0F8', snowD: '#C8D8E8',
    ice: '#A8D8F8', iceD: '#88C0E8',
    treeTrunk: '#805830', treeTrunkD: '#604020',
    treeLeaf: '#48B048', treeLeafD: '#308030', treeLeafL: '#68C868',
    roof: '#C84040', roofD: '#983030',
    wall: '#E8D8C0', wallD: '#C8B8A0',
    door: '#684830', window: '#88C8F8',
    skin: '#F8C090', skinD: '#D8A070', skinL: '#FFE0B0',
    hair: '#583820', hairD: '#382010',
    shirt: '#4ecdc4', shirtD: '#3db8a8',
    pants: '#505068', pantsD: '#303048',
    hat: '#ff6b35', hatD: '#c44d22', hatL: '#ffaa80',
    white: '#FFFFFF', black: '#202020',
    orange: '#ff6b35', teal: '#4ecdc4'
};

// ==================== PLAYER STATE ====================
const player = {
    x: 15, y: 15,
    px: 15 * TILE_SCALED,
    py: 15 * TILE_SCALED,
    facing: 'down',
    moving: false,
    map: 'canalborgo',
    name: 'Allenatore',
    team: [],
    box: [],
    bag: [
        { id: 'bestiball', qty: 10 },
        { id: 'pozione', qty: 5 }
    ],
    money: 3000,
    badges: [],
    caught: [],
    seen: [],
    questProgress: {},
    flags: {}
};

// ==================== GAME STATE ====================
const game = {
    screen: 'title',
    menuOpen: false,
    menuSelect: 0,
    dialog: null,
    dialogIndex: 0,
    dialogTimer: 0,
    battle: null,
    lastEncounter: 0,
    titleSelect: 0,
    starterSelect: 0,
    choseStarter: false,
    showMap: false
};

// ==================== INPUT ====================
const keys = {};
const justPressed = {};

// Focus handling
const focusOverlay = document.getElementById('focus-overlay');
let gameFocused = false;

function activateGame() {
    gameFocused = true;
    focusOverlay.classList.add('hidden');
    canvas.focus();
}

focusOverlay.addEventListener('click', activateGame);
focusOverlay.addEventListener('touchstart', (e) => {
    e.preventDefault();
    activateGame();
});

// Keyboard
document.addEventListener('keydown', e => {
    if (!keys[e.key]) justPressed[e.key] = true;
    keys[e.key] = true;
    if (!gameFocused) activateGame();
    
    // Prevent default for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', e => {
    keys[e.key] = false;
});

// Key mapping (Z = A, X = B, Enter = Start, Shift = Select)
document.addEventListener('keydown', e => {
    if (e.key === 'z' || e.key === 'Z') {
        if (!keys['Enter']) justPressed['Enter'] = true;
        keys['Enter'] = true;
    }
    if (e.key === 'x' || e.key === 'X') {
        if (!keys['Escape']) justPressed['Escape'] = true;
        keys['Escape'] = true;
    }
    if (e.key === ' ') {
        if (!keys['Select']) justPressed['Select'] = true;
        keys['Select'] = true;
    }
});

document.addEventListener('keyup', e => {
    if (e.key === 'z' || e.key === 'Z') keys['Enter'] = false;
    if (e.key === 'x' || e.key === 'X') keys['Escape'] = false;
    if (e.key === ' ') keys['Select'] = false;
});

// Mobile controls with visual feedback
document.querySelectorAll('[data-key]').forEach(btn => {
    const key = btn.dataset.key;
    
    // Touch events
    btn.addEventListener('touchstart', e => {
        e.preventDefault();
        keys[key] = true;
        justPressed[key] = true;
        btn.classList.add('pressed');
        if (!gameFocused) activateGame();
    });
    
    btn.addEventListener('touchend', e => {
        e.preventDefault();
        keys[key] = false;
        btn.classList.remove('pressed');
    });
    
    btn.addEventListener('touchcancel', e => {
        keys[key] = false;
        btn.classList.remove('pressed');
    });
    
    // Mouse events for desktop testing
    btn.addEventListener('mousedown', e => {
        e.preventDefault();
        keys[key] = true;
        justPressed[key] = true;
        btn.classList.add('pressed');
    });
    
    btn.addEventListener('mouseup', e => {
        keys[key] = false;
        btn.classList.remove('pressed');
    });
    
    btn.addEventListener('mouseleave', e => {
        keys[key] = false;
        btn.classList.remove('pressed');
    });
});

// ==================== UI ELEMENTS ====================
const titleScreen = document.getElementById('title-screen');
const dialogBox = document.getElementById('dialog-box');
const dialogText = document.getElementById('dialog-text');
const dialogSpeaker = document.getElementById('dialog-speaker');
const gameMenu = document.getElementById('game-menu');
const hud = document.getElementById('hud');
const hudContent = document.getElementById('hud-content');
const starterScreen = document.getElementById('starter-screen');
const starterContainer = document.getElementById('starter-container');
const pokedexScreen = document.getElementById('pokedex-screen');
const pokedexList = document.getElementById('pokedex-list');
const teamScreen = document.getElementById('team-screen');
const teamList = document.getElementById('team-list');
const bagScreen = document.getElementById('bag-screen');
const bagList = document.getElementById('bag-list');
const choiceBox = document.getElementById('choice-box');
const choiceList = document.getElementById('choice-list');

// ==================== TILE SPRITES ====================
function createTileSprite(drawFunc) {
    const c = document.createElement('canvas');
    c.width = c.height = TILE;
    const x = c.getContext('2d');
    drawFunc(x);
    return c;
}

const TILE_SPRITES = {
    grass: createTileSprite(x => {
        x.fillStyle = COLORS.grass;
        x.fillRect(0, 0, TILE, TILE);
        x.fillStyle = COLORS.grassD;
        for (let i = 0; i < 6; i++) x.fillRect(Math.random()*12+2, Math.random()*12+2, 1, 1);
        x.fillStyle = COLORS.grassL;
        for (let i = 0; i < 4; i++) x.fillRect(Math.random()*12+2, Math.random()*12+2, 1, 1);
    }),
    
    tallGrass: createTileSprite(x => {
        x.fillStyle = COLORS.grass;
        x.fillRect(0, 0, TILE, TILE);
        x.fillStyle = COLORS.tallGrass;
        for (let i = 0; i < 5; i++) {
            const px = i * 3 + 1;
            x.fillRect(px, 4, 2, 12);
            x.fillRect(px + 1, 2, 1, 2);
        }
        x.fillStyle = COLORS.tallGrassD;
        x.fillRect(2, 5, 1, 10);
        x.fillRect(8, 6, 1, 9);
    }),
    
    path: createTileSprite(x => {
        x.fillStyle = COLORS.path;
        x.fillRect(0, 0, TILE, TILE);
        x.fillStyle = COLORS.pathD;
        x.fillRect(2, 2, 4, 2);
        x.fillRect(10, 8, 3, 2);
        x.fillRect(4, 12, 5, 2);
    }),
    
    water: createTileSprite(x => {
        x.fillStyle = COLORS.water;
        x.fillRect(0, 0, TILE, TILE);
        x.fillStyle = COLORS.waterL;
        x.fillRect(4, 2, 6, 2);
        x.fillRect(2, 8, 8, 2);
        x.fillStyle = COLORS.waterD;
        x.fillRect(6, 6, 4, 1);
    }),
    
    tree: createTileSprite(x => {
        x.fillStyle = COLORS.treeTrunk;
        x.fillRect(6, 10, 4, 6);
        x.fillStyle = COLORS.treeLeaf;
        x.fillRect(3, 1, 10, 10);
        x.fillRect(2, 3, 12, 6);
        x.fillStyle = COLORS.treeLeafD;
        x.fillRect(3, 1, 10, 2);
        x.fillStyle = COLORS.treeLeafL;
        x.fillRect(10, 3, 3, 4);
    }),
    
    house: createTileSprite(x => {
        x.fillStyle = COLORS.roof;
        x.fillRect(1, 1, 14, 5);
        x.fillStyle = COLORS.roofD;
        x.fillRect(1, 5, 14, 1);
        x.fillStyle = COLORS.wall;
        x.fillRect(2, 6, 12, 10);
        x.fillStyle = COLORS.door;
        x.fillRect(6, 9, 4, 7);
        x.fillStyle = COLORS.window;
        x.fillRect(10, 8, 3, 3);
    }),
    
    snow: createTileSprite(x => {
        x.fillStyle = COLORS.snow;
        x.fillRect(0, 0, TILE, TILE);
        x.fillStyle = COLORS.snowD;
        x.fillRect(2, 3, 4, 1);
        x.fillRect(8, 10, 5, 1);
    }),
    
    ice: createTileSprite(x => {
        x.fillStyle = COLORS.ice;
        x.fillRect(0, 0, TILE, TILE);
        x.fillStyle = COLORS.iceD;
        x.fillRect(2, 2, 8, 1);
        x.fillRect(4, 8, 6, 1);
    }),
    
    sand: createTileSprite(x => {
        x.fillStyle = COLORS.sand;
        x.fillRect(0, 0, TILE, TILE);
        x.fillStyle = COLORS.sandD;
        x.fillRect(3, 4, 3, 2);
        x.fillRect(10, 10, 4, 2);
    })
};

// ==================== PLAYER SPRITE ====================
function createPlayerSprite(facing) {
    const c = document.createElement('canvas');
    c.width = c.height = TILE;
    const x = c.getContext('2d');
    
    // Hat
    x.fillStyle = COLORS.hat;
    if (facing === 'down') {
        x.fillRect(3, 0, 10, 3);
        x.fillRect(2, 1, 12, 2);
        x.fillStyle = COLORS.hatD;
        x.fillRect(2, 2, 12, 1);
        x.fillStyle = COLORS.hatL;
        x.fillRect(5, 1, 4, 1);
    } else if (facing === 'up') {
        x.fillStyle = COLORS.hatD;
        x.fillRect(3, 0, 10, 4);
        x.fillRect(2, 1, 12, 3);
    } else {
        x.fillRect(3, 0, 10, 4);
        x.fillStyle = COLORS.hatD;
        x.fillRect(facing === 'left' ? 3 : 10, 0, 3, 4);
    }
    
    // Hair
    x.fillStyle = COLORS.hair;
    if (facing === 'down') x.fillRect(4, 3, 8, 2);
    else if (facing === 'left') x.fillRect(3, 4, 4, 2);
    else if (facing === 'right') x.fillRect(9, 4, 4, 2);
    
    // Face
    x.fillStyle = COLORS.skin;
    if (facing === 'down') {
        x.fillRect(4, 5, 8, 5);
        x.fillStyle = COLORS.black;
        x.fillRect(5, 6, 2, 2);
        x.fillRect(9, 6, 2, 2);
    } else if (facing === 'up') {
        x.fillStyle = COLORS.hairD;
        x.fillRect(4, 4, 8, 3);
    } else {
        x.fillRect(5, 5, 6, 5);
        x.fillStyle = COLORS.black;
        x.fillRect(facing === 'left' ? 6 : 8, 6, 2, 2);
    }
    
    // Shirt
    x.fillStyle = COLORS.shirt;
    x.fillRect(3, 10, 10, 4);
    x.fillStyle = COLORS.shirtD;
    x.fillRect(3, 13, 10, 1);
    
    // Pants
    x.fillStyle = COLORS.pants;
    x.fillRect(4, 14, 8, 2);
    x.fillStyle = COLORS.pantsD;
    x.fillRect(4, 14, 3, 2);
    
    return c;
}

const PLAYER_SPRITES = {
    down: createPlayerSprite('down'),
    up: createPlayerSprite('up'),
    left: createPlayerSprite('left'),
    right: createPlayerSprite('right')
};

// ==================== NPC SPRITES ====================
function createNPCSprite(type) {
    const c = document.createElement('canvas');
    c.width = c.height = TILE;
    const x = c.getContext('2d');
    
    const sprites = {
        oldman: () => {
            x.fillStyle = '#888';
            x.fillRect(4, 2, 8, 4);
            x.fillStyle = COLORS.skin;
            x.fillRect(4, 5, 8, 5);
            x.fillStyle = COLORS.black;
            x.fillRect(5, 6, 2, 2);
            x.fillRect(9, 6, 2, 2);
            x.fillStyle = '#8B4513';
            x.fillRect(3, 10, 10, 6);
        },
        girl: () => {
            x.fillStyle = '#8B4513';
            x.fillRect(4, 1, 8, 5);
            x.fillStyle = COLORS.skin;
            x.fillRect(4, 5, 8, 5);
            x.fillStyle = COLORS.black;
            x.fillRect(5, 6, 2, 2);
            x.fillRect(9, 6, 2, 2);
            x.fillStyle = '#FF69B4';
            x.fillRect(3, 10, 10, 6);
        },
        woman: () => {
            x.fillStyle = '#DEB887';
            x.fillRect(4, 1, 8, 6);
            x.fillStyle = COLORS.skin;
            x.fillRect(4, 5, 8, 5);
            x.fillStyle = COLORS.black;
            x.fillRect(5, 6, 2, 2);
            x.fillRect(9, 6, 2, 2);
            x.fillStyle = '#4ecdc4';
            x.fillRect(3, 10, 10, 6);
        },
        scientist: () => {
            x.fillStyle = '#fff';
            x.fillRect(3, 1, 10, 6);
            x.fillStyle = COLORS.skin;
            x.fillRect(4, 5, 8, 5);
            x.fillStyle = COLORS.black;
            x.fillRect(5, 6, 2, 2);
            x.fillRect(9, 6, 2, 2);
            x.fillStyle = '#fff';
            x.fillRect(3, 10, 10, 6);
        },
        bartender: () => {
            x.fillStyle = '#2C2C2C';
            x.fillRect(4, 2, 8, 4);
            x.fillStyle = COLORS.skin;
            x.fillRect(4, 5, 8, 5);
            x.fillStyle = COLORS.black;
            x.fillRect(5, 6, 2, 2);
            x.fillRect(9, 6, 2, 2);
            x.fillStyle = '#8B4513';
            x.fillRect(3, 10, 10, 6);
            x.fillStyle = '#fff';
            x.fillRect(6, 11, 4, 1);
        },
        fighter: () => {
            x.fillStyle = '#8B0000';
            x.fillRect(4, 2, 8, 4);
            x.fillStyle = COLORS.skin;
            x.fillRect(4, 5, 8, 5);
            x.fillStyle = COLORS.black;
            x.fillRect(5, 6, 2, 2);
            x.fillRect(9, 6, 2, 2);
            x.fillStyle = '#8B0000';
            x.fillRect(3, 10, 10, 6);
        },
        noble: () => {
            x.fillStyle = '#FFD700';
            x.fillRect(4, 0, 8, 6);
            x.fillStyle = COLORS.skin;
            x.fillRect(4, 5, 8, 5);
            x.fillStyle = COLORS.black;
            x.fillRect(5, 6, 2, 2);
            x.fillRect(9, 6, 2, 2);
            x.fillStyle = '#800080';
            x.fillRect(3, 10, 10, 6);
        },
        grandma: () => {
            x.fillStyle = '#ccc';
            x.fillRect(4, 1, 8, 5);
            x.fillStyle = COLORS.skin;
            x.fillRect(4, 5, 8, 5);
            x.fillStyle = COLORS.black;
            x.fillRect(5, 6, 2, 2);
            x.fillRect(9, 6, 2, 2);
            x.fillStyle = '#8B4513';
            x.fillRect(3, 10, 10, 6);
        },
        hiker: () => {
            x.fillStyle = '#4169E1';
            x.fillRect(4, 2, 8, 4);
            x.fillStyle = COLORS.skin;
            x.fillRect(4, 5, 8, 5);
            x.fillStyle = COLORS.black;
            x.fillRect(5, 6, 2, 2);
            x.fillRect(9, 6, 2, 2);
            x.fillStyle = '#8B4513';
            x.fillRect(3, 10, 10, 6);
        },
        sailor: () => {
            x.fillStyle = '#fff';
            x.fillRect(4, 2, 8, 4);
            x.fillStyle = COLORS.skin;
            x.fillRect(4, 5, 8, 5);
            x.fillStyle = COLORS.black;
            x.fillRect(5, 6, 2, 2);
            x.fillRect(9, 6, 2, 2);
            x.fillStyle = '#1E90FF';
            x.fillRect(3, 10, 10, 6);
        },
        driver: () => {
            x.fillStyle = '#2C2C2C';
            x.fillRect(4, 2, 8, 4);
            x.fillStyle = COLORS.skin;
            x.fillRect(4, 5, 8, 5);
            x.fillStyle = COLORS.black;
            x.fillRect(5, 6, 2, 2);
            x.fillRect(9, 6, 2, 2);
            x.fillStyle = '#FFD700';
            x.fillRect(3, 10, 10, 4);
            x.fillStyle = '#1a1a1a';
            x.fillRect(3, 14, 10, 2);
        },
        tourist: () => {
            x.fillStyle = '#FF6347';
            x.fillRect(4, 1, 8, 5);
            x.fillStyle = COLORS.skin;
            x.fillRect(4, 5, 8, 5);
            x.fillStyle = COLORS.black;
            x.fillRect(5, 6, 2, 2);
            x.fillRect(9, 6, 2, 2);
            x.fillStyle = '#90EE90';
            x.fillRect(3, 10, 10, 6);
        },
        influencer: () => {
            x.fillStyle = '#FF69B4';
            x.fillRect(4, 1, 8, 5);
            x.fillStyle = COLORS.skin;
            x.fillRect(4, 5, 8, 5);
            x.fillStyle = COLORS.black;
            x.fillRect(5, 6, 2, 2);
            x.fillRect(9, 6, 2, 2);
            x.fillStyle = '#FF1493';
            x.fillRect(3, 10, 10, 6);
        },
        king: () => {
            x.fillStyle = '#FFD700';
            x.fillRect(2, 0, 12, 6);
            x.fillStyle = COLORS.skin;
            x.fillRect(4, 5, 8, 5);
            x.fillStyle = COLORS.black;
            x.fillRect(5, 6, 2, 2);
            x.fillRect(9, 6, 2, 2);
            x.fillStyle = '#800020';
            x.fillRect(3, 10, 10, 6);
        }
    };
    
    if (sprites[type]) sprites[type]();
    else sprites.girl();
    
    return c;
}

// ==================== MAP GENERATION ====================
function generateMapTiles(mapId) {
    const map = MAPS[mapId];
    if (!map) return;
    
    map.tiles = [];
    const isSnow = map.type === 'dungeon' && mapId.includes('dolomax');
    const isWater = map.type === 'water';
    
    for (let y = 0; y < map.height; y++) {
        map.tiles[y] = [];
        for (let x = 0; x < map.width; x++) {
            if (x === 0 || x === map.width - 1 || y === 0 || y === map.height - 1) {
                map.tiles[y][x] = isWater ? 'water' : 'tree';
                continue;
            }
            
            if (isWater) {
                map.tiles[y][x] = Math.random() < 0.7 ? 'water' : (Math.random() < 0.3 ? 'tallGrass' : 'grass');
                continue;
            }
            
            if (isSnow) {
                if (Math.random() < 0.15) map.tiles[y][x] = 'tree';
                else if (Math.random() < 0.2) map.tiles[y][x] = 'tallGrass';
                else map.tiles[y][x] = Math.random() < 0.3 ? 'snow' : 'grass';
                continue;
            }
            
            if (Math.random() < 0.2) map.tiles[y][x] = 'tallGrass';
            else if (Math.random() < 0.05 && map.type !== 'town') map.tiles[y][x] = 'tree';
            else if (Math.random() < 0.1 && map.type === 'city') map.tiles[y][x] = 'path';
            else map.tiles[y][x] = 'grass';
        }
    }
    
    if (map.npcs) {
        map.npcs.forEach(npc => {
            if (map.tiles[npc.y]?.[npc.x]) map.tiles[npc.y][npc.x] = 'path';
        });
    }
    
    if (map.connections) {
        Object.entries(map.connections).forEach(([dir, conn]) => {
            if (conn) {
                for (let i = -2; i <= 2; i++) {
                    if (dir === 'north' && map.tiles[0]?.[conn.x + i]) map.tiles[0][conn.x + i] = 'path';
                    if (dir === 'south' && map.tiles[map.height - 1]?.[conn.x + i]) map.tiles[map.height - 1][conn.x + i] = 'path';
                    if (dir === 'east' && map.tiles[conn.y + i]?.[map.width - 1]) map.tiles[conn.y + i][map.width - 1] = 'path';
                    if (dir === 'west' && map.tiles[conn.y + i]?.[0]) map.tiles[conn.y + i][0] = 'path';
                }
            }
        });
    }
}

// Generate all maps
if (typeof MAPS !== 'undefined') {
    Object.keys(MAPS).forEach(generateMapTiles);
}

// ==================== DIALOG SYSTEM ====================
function showDialog(text, speaker = '') {
    game.dialog = { text, speaker };
    game.dialogIndex = 0;
    game.dialogTimer = 0;
    dialogSpeaker.textContent = speaker;
    dialogText.textContent = '';
    dialogBox.style.display = 'block';
}

function hideDialog() {
    game.dialog = null;
    dialogBox.style.display = 'none';
}

function updateDialog() {
    if (!game.dialog) return;
    game.dialogTimer++;
    if (game.dialogTimer >= 2) {
        game.dialogTimer = 0;
        if (game.dialogIndex < game.dialog.text.length) {
            game.dialogIndex++;
            dialogText.textContent = game.dialog.text.substring(0, game.dialogIndex);
        }
    }
}

// ==================== MENU SYSTEM ====================
function toggleMenu() {
    if (player.team.length === 0) {
        showDialog('Non hai ancora Besti!\nParla con il Professor Barcaro.', 'Sistema');
        return;
    }
    game.menuOpen = !game.menuOpen;
    game.menuSelect = 0;
    gameMenu.style.display = game.menuOpen ? 'block' : 'none';
    updateMenuSelection();
}

function updateMenuSelection() {
    document.querySelectorAll('.menu-option').forEach((item, i) => {
        item.classList.toggle('selected', i === game.menuSelect);
    });
}

function handleMenuAction(action) {
    game.menuOpen = false;
    gameMenu.style.display = 'none';
    
    switch (action) {
        case 'team': showTeamScreen(); break;
        case 'bag': showBagScreen(); break;
        case 'pokedex': showPokedexScreen(); break;
        case 'save': saveGame(); break;
        case 'close': break;
    }
}

// ==================== SCREENS ====================
function showTeamScreen() {
    teamScreen.style.display = 'flex';
    teamList.innerHTML = '';
    
    if (player.team.length === 0) {
        teamList.innerHTML = '<p style="color: #888; font-size: 8px; text-align: center; padding: 20px;">Nessuna Bestia nella squadra!</p>';
        return;
    }
    
    player.team.forEach((monster, i) => {
        const div = document.createElement('div');
        div.className = 'list-item';
        const hpPercent = (monster.hp / monster.maxHp) * 100;
        const hpClass = hpPercent < 25 ? 'low' : hpPercent < 50 ? 'mid' : '';
        const typeIcon = TYPES[monster.type[0]]?.icon || '⭐';
        div.innerHTML = `
            <div class="sprite">${monster.sprite}</div>
            <div class="info">
                <div class="name">${monster.name}</div>
                <div class="detail">Lv.${monster.level} | ${typeIcon} ${monster.type[0]}</div>
                <div class="hp-bar"><div class="fill ${hpClass}" style="width: ${hpPercent}%"></div></div>
            </div>
        `;
        teamList.appendChild(div);
    });
    
    for (let i = player.team.length; i < 6; i++) {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = '<div class="sprite">?</div><div class="info"><div class="name" style="color: #666">Slot vuoto</div></div>';
        teamList.appendChild(div);
    }
}

function showBagScreen() {
    bagScreen.style.display = 'flex';
    bagList.innerHTML = '';
    
    if (player.bag.length === 0) {
        bagList.innerHTML = '<p style="color: #888; font-size: 8px; text-align: center; padding: 20px;">Zaino vuoto!</p>';
        return;
    }
    
    player.bag.forEach(item => {
        const itemData = ITEMS?.[item.id];
        if (!itemData) return;
        
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div class="info">
                <div class="name">${itemData.name}</div>
                <div class="detail">${itemData.desc || ''}</div>
            </div>
            <div style="color: #4ecdc4; font-size: 7px;">x${item.qty}</div>
        `;
        bagList.appendChild(div);
    });
}

function showPokedexScreen() {
    pokedexScreen.style.display = 'flex';
    pokedexList.innerHTML = '';
    
    if (typeof MONSTERS === 'undefined') return;
    
    MONSTERS.forEach(monster => {
        const caught = player.caught.includes(monster.id);
        const seen = player.seen.includes(monster.id);
        
        const div = document.createElement('div');
        div.className = `list-item ${caught ? 'caught' : ''}`;
        div.innerHTML = `
            <div class="sprite">${seen ? monster.sprite : '?'}</div>
            <div class="info">
                <div class="name">${seen ? monster.name : '???'}</div>
                <div class="detail">#${String(monster.id).padStart(3, '0')}</div>
            </div>
        `;
        pokedexList.appendChild(div);
    });
}

window.closePanel = function(id) {
    document.getElementById(id).style.display = 'none';
};

// ==================== BATTLE SYSTEM ====================
function startBattle(enemyMonster, isTrainer = false, trainerData = null) {
    if (typeof MONSTERS === 'undefined') return;
    
    game.screen = 'battle';
    battleCanvas.style.display = 'block';
    
    const monsterData = MONSTERS.find(m => m.slug === enemyMonster.slug);
    if (!monsterData) return;
    
    const level = enemyMonster.level || Math.floor(Math.random() * 5) + 3;
    const stats = calculateStats(monsterData, level);
    
    game.battle = {
        enemy: { ...monsterData, level, hp: stats.maxHp, maxHp: stats.maxHp, stats },
        ally: { ...player.team[0] },
        phase: 'intro',
        message: `Un ${monsterData.name} selvatico\nè apparso!`,
        menuSelect: 0,
        moveSelect: 0,
        isTrainer,
        trainerData
    };
    
    if (!player.seen.includes(monsterData.id)) player.seen.push(monsterData.id);
    
    setTimeout(() => {
        game.battle.phase = 'menu';
        game.battle.message = 'Cosa vuoi fare?';
        drawBattle();
    }, 1500);
    
    drawBattle();
}

function calculateStats(monster, level) {
    const base = monster.baseStats || monster.base_stats || { hp: 50, attack: 50, defense: 50, spAtk: 50, spDef: 50, speed: 50 };
    return {
        maxHp: Math.floor((base.hp * 2 * level / 100) + level + 10),
        attack: Math.floor((base.attack * 2 * level / 100) + 5),
        defense: Math.floor((base.defense * 2 * level / 100) + 5),
        spAtk: Math.floor((base.spAtk * 2 * level / 100) + 5),
        spDef: Math.floor((base.spDef * 2 * level / 100) + 5),
        speed: Math.floor((base.speed * 2 * level / 100) + 5)
    };
}

function drawBattle() {
    const b = game.battle;
    if (!b) return;
    
    battleCtx.fillStyle = '#90D870';
    battleCtx.fillRect(0, 0, 480, 320);
    
    battleCtx.fillStyle = '#78C850';
    for (let i = 0; i < 20; i++) battleCtx.fillRect(i * 25, 240, 20, 80);
    
    // Enemy
    battleCtx.font = '48px serif';
    battleCtx.fillText(b.enemy.sprite, 350, 80);
    drawBattleInfo(battleCtx, 20, 15, 140, 45, b.enemy);
    
    // Ally
    battleCtx.font = '56px serif';
    battleCtx.fillText(b.ally.sprite, 60, 200);
    drawBattleInfo(battleCtx, 290, 195, 140, 45, b.ally);
    
    // Message box
    battleCtx.fillStyle = '#F8F8F8';
    battleCtx.strokeStyle = '#333';
    battleCtx.lineWidth = 4;
    battleCtx.beginPath();
    battleCtx.roundRect(15, 230, 280, 75, 8);
    battleCtx.fill();
    battleCtx.stroke();
    
    battleCtx.fillStyle = '#333';
    battleCtx.font = '9px "Press Start 2P"';
    battleCtx.fillText(b.message, 25, 265);
    
    // Menu
    if (b.phase === 'menu') {
        battleCtx.fillStyle = '#F8F8F8';
        battleCtx.beginPath();
        battleCtx.roundRect(310, 230, 155, 75, 8);
        battleCtx.fill();
        battleCtx.stroke();
        
        const opts = ['COMBATTI', 'OGGETTO', 'BESTIA', 'FUGA'];
        opts.forEach((opt, i) => {
            battleCtx.fillStyle = i === b.menuSelect ? COLORS.orange : '#333';
            battleCtx.fillText((i === b.menuSelect ? '► ' : '  ') + opt, 320, 255 + i * 15);
        });
    }
    
    if (b.phase === 'moves') {
        battleCtx.fillStyle = '#F8F8F8';
        battleCtx.beginPath();
        battleCtx.roundRect(260, 230, 205, 75, 8);
        battleCtx.fill();
        battleCtx.stroke();
        
        const moves = b.ally.moves || ['azionata'];
        moves.forEach((moveId, i) => {
            const move = MOVES?.[moveId] || { name: moveId };
            battleCtx.fillStyle = i === b.moveSelect ? COLORS.orange : '#333';
            battleCtx.fillText((i === b.moveSelect ? '► ' : '  ') + move.name, 270, 255 + i * 15);
        });
    }
    
    if (b.phase === 'catch') {
        battleCtx.fillStyle = '#F8F8F8';
        battleCtx.beginPath();
        battleCtx.roundRect(260, 230, 205, 75, 8);
        battleCtx.fill();
        battleCtx.stroke();
        
        battleCtx.fillStyle = '#333';
        battleCtx.fillText('Vuoi catturare', 270, 255);
        battleCtx.fillText(b.enemy.name + '?', 270, 275);
        battleCtx.fillStyle = b.menuSelect === 0 ? COLORS.orange : '#333';
        battleCtx.fillText((b.menuSelect === 0 ? '► ' : '  ') + 'SI\'', 270, 295);
        battleCtx.fillStyle = b.menuSelect === 1 ? COLORS.orange : '#333';
        battleCtx.fillText((b.menuSelect === 1 ? '► ' : '  ') + 'NO', 340, 295);
    }
}

function drawBattleInfo(ctx, x, y, w, h, monster) {
    ctx.fillStyle = '#F8F8F8';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#333';
    ctx.font = '7px "Press Start 2P"';
    ctx.fillText(monster.name?.substring(0, 10) || '???', x + 8, y + 12);
    ctx.fillText('Lv.' + (monster.level || '?'), x + w - 35, y + 12);
    
    ctx.fillStyle = '#333';
    ctx.fillRect(x + 8, y + 18, w - 16, 8);
    
    const hpPct = Math.max(0, (monster.hp || 0) / (monster.maxHp || 1));
    ctx.fillStyle = hpPct > 0.5 ? '#38B038' : hpPct > 0.2 ? '#F8C800' : '#F83030';
    ctx.fillRect(x + 10, y + 20, (w - 20) * hpPct, 4);
    
    ctx.fillStyle = '#333';
    ctx.font = '5px "Press Start 2P"';
    ctx.fillText(`${monster.hp || '?'}/${monster.maxHp || '?'}`, x + 8, y + 36);
}

function handleBattleInput() {
    const b = game.battle;
    if (!b) return;
    
    if (b.phase === 'menu') {
        if (justPressed['ArrowUp'] && b.menuSelect > 0) b.menuSelect--;
        if (justPressed['ArrowDown'] && b.menuSelect < 3) b.menuSelect++;
        if (justPressed['Enter']) {
            if (b.menuSelect === 0) {
                b.phase = 'moves';
                b.moveSelect = 0;
            } else if (b.menuSelect === 3) {
                if (!b.isTrainer && Math.random() > 0.3) {
                    b.message = 'Sei fuggito!';
                    setTimeout(() => endBattle(false), 1000);
                } else {
                    b.message = 'Non puoi fuggire!';
                    setTimeout(() => { b.phase = 'menu'; drawBattle(); }, 1000);
                }
            } else {
                b.message = 'Non disponibile!';
                setTimeout(() => { b.phase = 'menu'; drawBattle(); }, 1000);
            }
        }
    } else if (b.phase === 'moves') {
        const moves = b.ally.moves || ['azionata'];
        if (justPressed['ArrowUp'] && b.moveSelect > 0) b.moveSelect--;
        if (justPressed['ArrowDown'] && b.moveSelect < moves.length - 1) b.moveSelect++;
        if (justPressed['Enter']) executeMove(b.moveSelect);
        if (justPressed['Escape']) b.phase = 'menu';
    } else if (b.phase === 'catch') {
        if (justPressed['ArrowLeft'] || justPressed['ArrowRight']) b.menuSelect = b.menuSelect === 0 ? 1 : 0;
        if (justPressed['Enter']) {
            if (b.menuSelect === 0) attemptCatch();
            else { b.phase = 'menu'; b.menuSelect = 0; }
        }
    }
    
    drawBattle();
}

function executeMove(index) {
    const b = game.battle;
    const moves = b.ally.moves || ['azionata'];
    const moveId = moves[index];
    const move = MOVES?.[moveId] || { name: moveId, type: 'normale', power: 40 };
    
    if (move.heal) {
        b.ally.hp = Math.min(b.ally.maxHp, b.ally.hp + move.heal);
        b.message = `${b.ally.name} si cura!\n+${move.heal} HP!`;
        b.phase = 'result';
        setTimeout(() => { b.phase = 'menu'; b.message = 'Cosa vuoi fare?'; drawBattle(); }, 1500);
        drawBattle();
        return;
    }
    
    const power = move.power || 40;
    const level = b.ally.level || 5;
    const attack = b.ally.stats?.attack || 50;
    const defense = b.enemy.stats?.defense || 50;
    
    let effectiveness = 1;
    const moveType = move.type;
    const enemyTypes = b.enemy.type || ['normale'];
    
    enemyTypes.forEach(t => {
        const typeData = TYPES?.[moveType];
        if (typeData) {
            if (typeData.strong?.includes(t)) effectiveness *= 2;
            if (typeData.weak?.includes(t)) effectiveness *= 0.5;
        }
    });
    
    const baseDmg = Math.floor(((((2 * level / 5 + 2) * power * attack / defense) / 50) + 2) * (Math.random() * 0.15 + 0.85));
    const damage = Math.floor(baseDmg * effectiveness);
    
    b.enemy.hp = Math.max(0, b.enemy.hp - damage);
    
    let msg = `${b.ally.name} usa\n${move.name}!\n`;
    if (effectiveness > 1) msg += 'Superefficace!\n';
    if (effectiveness < 1) msg += 'Non molto efficace...\n';
    msg += `-${damage} HP!`;
    
    b.message = msg;
    b.phase = 'result';
    
    setTimeout(() => {
        if (b.enemy.hp <= 0) {
            const exp = b.enemy.level * 15;
            b.message = `${b.enemy.name} è KO!\n+${exp} EXP!`;
            
            if (b.ally.exp === undefined) b.ally.exp = 0;
            b.ally.exp += exp;
            
            const expNeeded = b.ally.level * b.ally.level * 10;
            if (b.ally.exp >= expNeeded) {
                b.ally.level++;
                b.ally.exp = 0;
                b.message += `\n${b.ally.name} sale al\nlivello ${b.ally.level}!`;
            }
            
            setTimeout(() => {
                endBattle(true);
                showDialog(`${b.ally.name} ha vinto!\nGuadagni ${exp} EXP!`, 'Battaglia');
            }, 2000);
        } else if (!b.isTrainer && b.enemy.hp < b.enemy.maxHp * 0.3) {
            b.phase = 'catch';
            b.menuSelect = 0;
            b.message = 'Vuoi catturare\n' + b.enemy.name + '?';
            drawBattle();
        } else {
            enemyMove();
        }
    }, 1500);
    
    drawBattle();
}

function enemyMove() {
    const b = game.battle;
    const moves = b.enemy.moves || ['azionata'];
    const moveId = moves[Math.floor(Math.random() * moves.length)];
    const move = MOVES?.[moveId] || { name: moveId, type: 'normale', power: 40 };
    
    const power = move.power || 40;
    const level = b.enemy.level || 5;
    const attack = b.enemy.stats?.attack || 50;
    const defense = b.ally.stats?.defense || 50;
    
    const baseDmg = Math.floor(((((2 * level / 5 + 2) * power * attack / defense) / 50) + 2) * (Math.random() * 0.15 + 0.85));
    const damage = Math.floor(baseDmg * (0.5 + Math.random() * 0.5));
    
    b.ally.hp = Math.max(0, b.ally.hp - damage);
    player.team[0].hp = b.ally.hp;
    
    b.message = `${b.enemy.name} usa\n${move.name}!\n-${damage} HP!`;
    
    setTimeout(() => {
        if (b.ally.hp <= 0) {
            b.message = `${b.ally.name} è KO!`;
            setTimeout(() => {
                endBattle(false);
                showDialog('Hai perso... Le tue Besti\nsono state curate.', 'Battaglia');
                player.team.forEach(m => m.hp = m.maxHp);
            }, 1500);
        } else {
            b.phase = 'menu';
            b.message = 'Cosa vuoi fare?';
        }
        drawBattle();
    }, 1200);
    
    drawBattle();
}

function attemptCatch() {
    const b = game.battle;
    
    const ballIdx = player.bag.findIndex(i => i.id === 'bestiball' || i.id === 'superball' || i.id === 'iperball');
    if (ballIdx === -1) {
        b.message = 'Non hai Bestiball!';
        setTimeout(() => { b.phase = 'menu'; drawBattle(); }, 1000);
        drawBattle();
        return;
    }
    
    player.bag[ballIdx].qty--;
    if (player.bag[ballIdx].qty <= 0) player.bag.splice(ballIdx, 1);
    
    const ballData = ITEMS?.[player.bag[ballIdx]?.id] || { name: 'Bestiball', catchRate: 1 };
    const catchRate = (ballData.catchRate || 1) * (1 - b.enemy.hp / b.enemy.maxHp) * 100;
    
    b.message = 'Lanci una ' + (ballData.name || 'Bestiball') + '...';
    
    setTimeout(() => {
        if (Math.random() * 100 < catchRate + (b.enemy.catchRate || 150)) {
            b.message = `Gotcha!\n${b.enemy.name} è stato catturato!`;
            
            if (player.team.length < 6) {
                player.team.push({ ...b.enemy, exp: 0, moves: [...(b.enemy.moves || ['azionata'])] });
            }
            
            if (!player.caught.includes(b.enemy.id)) player.caught.push(b.enemy.id);
            
            setTimeout(() => {
                endBattle(true);
                showDialog(`${b.enemy.name} è stato aggiunto\nalla tua squadra!`, 'Cattura');
            }, 2000);
        } else {
            b.message = 'Oh no! È scappato!';
            setTimeout(() => { b.phase = 'menu'; b.message = 'Cosa vuoi fare?'; drawBattle(); }, 1500);
        }
        drawBattle();
    }, 1500);
    
    drawBattle();
}

function endBattle(won) {
    game.screen = 'overworld';
    game.battle = null;
    battleCanvas.style.display = 'none';
}

// ==================== RENDER ====================
function render() {
    if (game.screen !== 'overworld') return;
    
    const map = MAPS?.[player.map];
    if (!map || !map.tiles) return;
    
    const camX = Math.max(0, Math.min(player.px - CONFIG.CANVAS_WIDTH / 2 + TILE_SCALED / 2, map.width * TILE_SCALED - CONFIG.CANVAS_WIDTH));
    const camY = Math.max(0, Math.min(player.py - CONFIG.CANVAS_HEIGHT / 2 + TILE_SCALED / 2, map.height * TILE_SCALED - CONFIG.CANVAS_HEIGHT));
    
    ctx.fillStyle = COLORS.grass;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    const startX = Math.max(0, Math.floor(camX / TILE_SCALED));
    const startY = Math.max(0, Math.floor(camY / TILE_SCALED));
    const endX = Math.min(map.width, startX + Math.ceil(CONFIG.CANVAS_WIDTH / TILE_SCALED) + 2);
    const endY = Math.min(map.height, startY + Math.ceil(CONFIG.CANVAS_HEIGHT / TILE_SCALED) + 2);
    
    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const tile = map.tiles[y]?.[x];
            if (tile && TILE_SPRITES[tile]) {
                ctx.drawImage(TILE_SPRITES[tile], x * TILE_SCALED - camX, y * TILE_SCALED - camY, TILE_SCALED, TILE_SCALED);
            }
        }
    }
    
    if (map.npcs) {
        map.npcs.forEach(npc => {
            const sprite = createNPCSprite(npc.sprite);
            ctx.drawImage(sprite, npc.x * TILE_SCALED - camX, npc.y * TILE_SCALED - camY, TILE_SCALED, TILE_SCALED);
        });
    }
    
    ctx.drawImage(PLAYER_SPRITES[player.facing], player.px - camX, player.py - camY, TILE_SCALED, TILE_SCALED);
}

// ==================== MOVEMENT ====================
function updateMovement() {
    if (game.screen !== 'overworld' || game.dialog || game.menuOpen) return;
    
    const map = MAPS?.[player.map];
    if (!map) return;
    
    let dx = 0, dy = 0;
    
    if (keys['ArrowUp']) { dy = -1; player.facing = 'up'; }
    else if (keys['ArrowDown']) { dy = 1; player.facing = 'down'; }
    else if (keys['ArrowLeft']) { dx = -1; player.facing = 'left'; }
    else if (keys['ArrowRight']) { dx = 1; player.facing = 'right'; }
    
    if (dx !== 0 || dy !== 0) {
        const newX = player.px + dx * CONFIG.PLAYER_SPEED;
        const newY = player.py + dy * CONFIG.PLAYER_SPEED;
        
        const tileX = Math.floor(newX / TILE_SCALED);
        const tileY = Math.floor(newY / TILE_SCALED);
        
        const tile = map.tiles[tileY]?.[tileX];
        if (tile && tile !== 'water' && tile !== 'tree') {
            player.px = newX;
            player.py = newY;
            player.x = tileX;
            player.y = tileY;
            
            // Check for tall grass encounter
            if (tile === 'tallGrass' && player.team.length > 0) {
                if (Math.random() < CONFIG.ENCOUNTER_RATE) {
                    const encounters = map.encounters || ['gabbianzo'];
                    const slug = encounters[Math.floor(Math.random() * encounters.length)];
                    startBattle({ slug, level: Math.floor(Math.random() * 5) + 3 });
                }
            }
        }
    }
}

// ==================== INTERACTION ====================
function interact() {
    const map = MAPS?.[player.map];
    if (!map || !map.npcs) return;
    
    let targetX = player.x;
    let targetY = player.y;
    
    if (player.facing === 'up') targetY--;
    else if (player.facing === 'down') targetY++;
    else if (player.facing === 'left') targetX--;
    else if (player.facing === 'right') targetX++;
    
    const npc = map.npcs.find(n => n.x === targetX && n.y === targetY);
    if (npc) {
        const dialog = npc.dialog?.initial || npc.dialog?.generic || '...';
        showDialog(dialog, npc.name);
    }
}

// ==================== STARTER SELECTION ====================
function showStarterSelection() {
    starterScreen.style.display = 'flex';
    starterContainer.innerHTML = '';
    game.starterSelect = 0;
    
    const starters = [
        { slug: 'fogaron', name: 'Fogaron', type: 'fuoco', sprite: '🔥', desc: 'Tipo Fuoco - Falò veneto' },
        { slug: 'radicor', name: 'Radicor', type: 'natura', sprite: '🌱', desc: 'Tipo Natura - Radicchio' },
        { slug: 'canalot', name: 'Canalot', type: 'acqua', sprite: '💧', desc: 'Tipo Acqua - Canale' }
    ];
    
    starters.forEach((s, i) => {
        const card = document.createElement('div');
        card.className = `starter-card ${i === 0 ? 'selected' : ''}`;
        card.innerHTML = `
            <div class="sprite">${s.sprite}</div>
            <div class="name">${s.name}</div>
            <div class="type">${s.desc}</div>
        `;
        card.onclick = () => selectStarter(s, card);
        starterContainer.appendChild(card);
    });
}

function selectStarter(starter, card) {
    document.querySelectorAll('.starter-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    
    const monsterData = MONSTERS?.find(m => m.slug === starter.slug);
    if (!monsterData) return;
    
    const stats = calculateStats(monsterData, 5);
    player.team.push({
        ...monsterData,
        level: 5,
        hp: stats.maxHp,
        maxHp: stats.maxHp,
        stats,
        exp: 0
    });
    
    if (!player.caught.includes(monsterData.id)) player.caught.push(monsterData.id);
    if (!player.seen.includes(monsterData.id)) player.seen.push(monsterData.id);
    
    starterScreen.style.display = 'none';
    game.choseStarter = true;
    
    showDialog(`Hai scelto ${starter.name}!\nUn'ottima scelta!`, 'Professor Barcaro');
}

// ==================== SAVE/LOAD ====================
function saveGame() {
    const saveData = {
        player: {
            name: player.name,
            x: player.x,
            y: player.y,
            map: player.map,
            team: player.team,
            bag: player.bag,
            money: player.money,
            badges: player.badges,
            caught: player.caught,
            seen: player.seen
        }
    };
    localStorage.setItem('besti_venetia_save', JSON.stringify(saveData));
    showDialog('Partita salvata!', 'Sistema');
}

function loadGame() {
    const saveData = localStorage.getItem('besti_venetia_save');
    if (saveData) {
        const data = JSON.parse(saveData);
        Object.assign(player, data.player);
        player.px = player.x * TILE_SCALED;
        player.py = player.y * TILE_SCALED;
        return true;
    }
    return false;
}

// ==================== TITLE SCREEN ====================
function handleTitleInput() {
    const items = document.querySelectorAll('#title-screen .menu-item');
    
    if (justPressed['ArrowUp'] && game.titleSelect > 0) {
        game.titleSelect--;
        items.forEach((item, i) => item.classList.toggle('selected', i === game.titleSelect));
    }
    if (justPressed['ArrowDown'] && game.titleSelect < 1) {
        game.titleSelect++;
        items.forEach((item, i) => item.classList.toggle('selected', i === game.titleSelect));
    }
    if (justPressed['Enter']) {
        if (game.titleSelect === 0) {
            // New game
            titleScreen.style.display = 'none';
            game.screen = 'overworld';
            showStarterSelection();
            updateHUD();
        } else {
            // Continue
            if (loadGame()) {
                titleScreen.style.display = 'none';
                game.screen = 'overworld';
                updateHUD();
            } else {
                showDialog('Nessun salvataggio trovato!', 'Sistema');
            }
        }
    }
}

// ==================== HUD ====================
function updateHUD() {
    if (game.screen !== 'overworld') {
        hud.style.display = 'none';
        return;
    }
    
    hud.style.display = 'block';
    const map = MAPS?.[player.map];
    const teamInfo = player.team.length > 0 ? `${player.team[0].name} Lv.${player.team[0].level}` : 'Nessuna Bestia';
    hudContent.innerHTML = `${map?.name || '???'}<br>${teamInfo}<br>💰 ${player.money}`;
}

// ==================== GAME LOOP ====================
function gameLoop() {
    // Clear justPressed
    Object.keys(justPressed).forEach(k => justPressed[k] = false);
    
    // Handle input based on screen
    if (game.screen === 'title') {
        handleTitleInput();
    } else if (game.screen === 'overworld') {
        if (game.battle) {
            handleBattleInput();
        } else if (game.dialog) {
            updateDialog();
            if (justPressed['Enter'] || justPressed['Escape']) {
                if (game.dialogIndex >= game.dialog.text.length) {
                    hideDialog();
                } else {
                    game.dialogIndex = game.dialog.text.length;
                    dialogText.textContent = game.dialog.text;
                }
            }
        } else if (game.menuOpen) {
            if (justPressed['ArrowUp'] && game.menuSelect > 0) game.menuSelect--;
            if (justPressed['ArrowDown'] && game.menuSelect < 4) game.menuSelect++;
            if (justPressed['Enter']) {
                const actions = ['team', 'bag', 'pokedex', 'save', 'close'];
                handleMenuAction(actions[game.menuSelect]);
            }
            if (justPressed['Escape']) toggleMenu();
            updateMenuSelection();
        } else {
            updateMovement();
            if (justPressed['Enter']) interact();
            if (justPressed['Start'] || justPressed[' ']) toggleMenu();
            if (justPressed['Select']) {
                // Show map toggle
                game.showMap = !game.showMap;
            }
        }
        
        render();
        updateHUD();
    }
    
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
