// ================================================
// POKÉMONA - Edizione Italiana
// Un RPG ispirato a Tuxemon e Pokémon
// ================================================

// ==================== CONFIGURAZIONE ====================
const CONFIG = {
    TILE_SIZE: 16,
    SCALE: 2,
    CANVAS_WIDTH: 480,
    CANVAS_HEIGHT: 320,
    PLAYER_SPEED: 2,
    ENCOUNTER_RATE: 0.06,
    DIALOG_SPEED: 30
};

const TILE = CONFIG.TILE_SIZE;
const SCALE = CONFIG.SCALE;
const TILE_SCALED = TILE * SCALE;

// ==================== CANVAS SETUP ====================
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const battleCanvas = document.getElementById('battle-screen');
const battleCtx = battleCanvas.getContext('2d');
battleCanvas.width = CONFIG.CANVAS_WIDTH;
battleCanvas.height = CONFIG.CANVAS_HEIGHT;

// ==================== COLORI ====================
const C = {
    grass: '#78C850', grassD: '#5A9A38', grassL: '#90D870',
    tallGrass: '#68B040', tallGrassD: '#508830',
    path: '#D8C8A0', pathD: '#B8A880',
    water: '#5098D8', waterD: '#3878B8', waterL: '#70B8F8',
    sand: '#E8D8A0', sandD: '#C8B880',
    treeTrunk: '#805830', treeTrunkD: '#604020',
    treeLeaf: '#48B048', treeLeafD: '#308030', treeLeafL: '#68C868',
    roof: '#C84040', roofD: '#983030',
    wall: '#E8D8C0', wallD: '#C8B8A0',
    door: '#684830', window: '#88C8F8',
    skin: '#F8C090', skinD: '#D8A070', skinL: '#FFE0B0',
    hair: '#583820', hairD: '#382010',
    shirt: '#4888F8', shirtD: '#2868C8',
    pants: '#505068', pantsD: '#303048',
    hat: '#F84040', hatD: '#C82020', hatL: '#FF6868',
    white: '#FFFFFF', black: '#202020',
    orange: '#F87830', orangeD: '#C85820',
    red: '#F83030', green: '#38B038', blue: '#3878D8'
};

// ==================== TIPI E EFFICACIA ====================
const TYPE_CHART = {
    'normale': {},
    'fuoco': { 'erba': 2, 'acqua': 0.5, 'fuoco': 0.5 },
    'acqua': { 'fuoco': 2, 'terra': 2, 'acqua': 0.5, 'erba': 0.5 },
    'erba': { 'acqua': 2, 'terra': 2, 'fuoco': 0.5, 'erba': 0.5 },
    'terra': { 'fuoco': 2, 'elettrico': 2, 'acqua': 0.5, 'erba': 0.5 },
    'elettrico': { 'acqua': 2, 'terra': 0.5 },
    'lotta': { 'normale': 2, 'buio': 2, 'psico': 0.5 },
    'psico': { 'lotta': 2, 'buio': 0.5 },
    'buio': { 'psico': 2, 'lotta': 0.5 }
};

// Mosse con potenza e tipo
const MOVES_DATA = {
    // Pizzocchero
    'Polentata': { power: 45, type: 'normale', effect: null },
    'BurroFuso': { power: 40, type: 'normale', effect: 'burn' },
    'Grattuggia': { power: 55, type: 'normale', effect: null },
    'Schiacciata': { power: 70, type: 'normale', effect: null },
    // Spritz
    'Frizzante': { power: 40, type: 'acqua', effect: null },
    'AperolSpray': { power: 50, type: 'acqua', effect: 'confuse' },
    'Ghiaccio': { power: 45, type: 'acqua', effect: 'freeze' },
    'Bollicine': { power: 35, type: 'acqua', effect: null },
    // Bigolare
    'Carena': { power: 50, type: 'normale', effect: null },
    'FariAbbaglianti': { power: 40, type: 'normale', effect: 'confuse' },
    'Rombo': { power: 55, type: 'normale', effect: null },
    'Clacsonata': { power: 65, type: 'normale', effect: null },
    // Altri
    'Affettata': { power: 50, type: 'normale', effect: null },
    'ProfumoDiParma': { power: 45, type: 'normale', effect: 'confuse' },
    'Crostini': { power: 40, type: 'normale', effect: null },
    'Grasso': { power: 35, type: 'normale', effect: 'heal' },
    'CaffèRistretto': { power: 50, type: 'psico', effect: null },
    'Mascarpone': { power: 45, type: 'normale', effect: 'heal' },
    'CacaoPolvere': { power: 40, type: 'normale', effect: null },
    'Sveglia': { power: 60, type: 'psico', effect: null },
    'Polentone': { power: 65, type: 'terra', effect: null },
    'FunghiPorcini': { power: 55, type: 'terra', effect: 'poison' },
    'FormaggioFuso': { power: 50, type: 'normale', effect: 'burn' },
    'Piastra': { power: 75, type: 'terra', effect: null },
    'Confusione': { power: 45, type: 'psico', effect: 'confuse' },
    'TestataVuota': { power: 55, type: 'psico', effect: null },
    'Ignoranza': { power: 40, type: 'psico', effect: 'lowerDef' },
    'Risa': { power: 35, type: 'psico', effect: 'confuse' },
    'AssoBastoni': { power: 60, type: 'normale', effect: null },
    'TreDenari': { power: 50, type: 'normale', effect: null },
    'Scopa': { power: 45, type: 'normale', effect: null },
    'Stramazzo': { power: 80, type: 'normale', effect: null },
    'MorsoOssuto': { power: 65, type: 'normale', effect: null },
    'MidolloEnergia': { power: 55, type: 'normale', effect: 'heal' },
    'Risotto': { power: 50, type: 'normale', effect: null },
    'Gremolada': { power: 45, type: 'normale', effect: null },
    'Terremoto': { power: 75, type: 'terra', effect: null },
    'OlioSanto': { power: 55, type: 'fuoco', effect: 'burn' },
    'Peperoncino': { power: 50, type: 'fuoco', effect: 'burn' },
    'Tarallo': { power: 40, type: 'normale', effect: null },
    'BananaStyle': { power: 55, type: 'buio', effect: null },
    'Tatuaggio': { power: 45, type: 'buio', effect: null },
    'Flex': { power: 60, type: 'buio', effect: 'lowerAtk' },
    'Story': { power: 40, type: 'buio', effect: 'confuse' },
    'Pezzottella': { power: 60, type: 'lotta', effect: null },
    'Arrampicata': { power: 50, type: 'lotta', effect: null },
    'CuoeCrapa': { power: 70, type: 'lotta', effect: null },
    'Basilico': { power: 45, type: 'normale', effect: 'heal' },
    'Rotolamento': { power: 50, type: 'normale', effect: null },
    'Pestata': { power: 55, type: 'normale', effect: null },
    'Burro': { power: 40, type: 'normale', effect: null },
    'Sugo': { power: 45, type: 'normale', effect: null },
    'AltaMarea': { power: 60, type: 'acqua', effect: null },
    'Gondola': { power: 45, type: 'acqua', effect: null },
    'Bricola': { power: 55, type: 'normale', effect: null },
    'AcquaAlta': { power: 70, type: 'acqua', effect: null },
    'Brace': { power: 55, type: 'fuoco', effect: 'burn' },
    'Griglia': { power: 65, type: 'fuoco', effect: null },
    'Fumo': { power: 40, type: 'fuoco', effect: 'lowerAcc' },
    'Cenere': { power: 50, type: 'fuoco', effect: null }
};

// ==================== SPRITE TILES ====================
function createTileSprite(drawFunc) {
    const c = document.createElement('canvas');
    c.width = c.height = TILE;
    const x = c.getContext('2d');
    drawFunc(x);
    return c;
}

const TILES = {
    grass: createTileSprite(x => {
        x.fillStyle = C.grass;
        x.fillRect(0, 0, TILE, TILE);
        x.fillStyle = C.grassD;
        for (let i = 0; i < 6; i++) x.fillRect(Math.random()*12+2, Math.random()*12+2, 1, 1);
        x.fillStyle = C.grassL;
        for (let i = 0; i < 4; i++) x.fillRect(Math.random()*12+2, Math.random()*12+2, 1, 1);
    }),
    tallGrass: createTileSprite(x => {
        x.fillStyle = C.grass;
        x.fillRect(0, 0, TILE, TILE);
        x.fillStyle = C.tallGrass;
        for (let i = 0; i < 5; i++) {
            const px = i * 3 + 1;
            x.fillRect(px, 4, 2, 12);
            x.fillRect(px + 1, 2, 1, 2);
        }
        x.fillStyle = C.tallGrassD;
        x.fillRect(2, 5, 1, 10);
        x.fillRect(8, 6, 1, 9);
    }),
    path: createTileSprite(x => {
        x.fillStyle = C.path;
        x.fillRect(0, 0, TILE, TILE);
        x.fillStyle = C.pathD;
        x.fillRect(2, 2, 4, 2);
        x.fillRect(10, 8, 3, 2);
        x.fillRect(4, 12, 5, 2);
    }),
    water: createTileSprite(x => {
        x.fillStyle = C.water;
        x.fillRect(0, 0, TILE, TILE);
        x.fillStyle = C.waterL;
        x.fillRect(4, 2, 6, 2);
        x.fillRect(2, 8, 8, 2);
        x.fillStyle = C.waterD;
        x.fillRect(6, 6, 4, 1);
    }),
    tree: createTileSprite(x => {
        x.fillStyle = C.treeTrunk;
        x.fillRect(6, 10, 4, 6);
        x.fillStyle = C.treeLeaf;
        x.fillRect(3, 1, 10, 10);
        x.fillRect(2, 3, 12, 6);
        x.fillStyle = C.treeLeafD;
        x.fillRect(3, 1, 10, 2);
        x.fillStyle = C.treeLeafL;
        x.fillRect(10, 3, 3, 4);
    }),
    house: createTileSprite(x => {
        x.fillStyle = C.roof;
        x.fillRect(1, 1, 14, 5);
        x.fillStyle = C.roofD;
        x.fillRect(1, 5, 14, 1);
        x.fillStyle = C.wall;
        x.fillRect(2, 6, 12, 10);
        x.fillStyle = C.door;
        x.fillRect(6, 9, 4, 7);
        x.fillStyle = C.window;
        x.fillRect(10, 8, 3, 3);
    }),
    shop: createTileSprite(x => {
        x.fillStyle = '#4169E1';
        x.fillRect(1, 1, 14, 5);
        x.fillStyle = '#2E4A9E';
        x.fillRect(1, 5, 14, 1);
        x.fillStyle = '#F5F5DC';
        x.fillRect(2, 6, 12, 10);
        x.fillStyle = '#228B22';
        x.fillRect(3, 8, 4, 4);
        x.fillStyle = '#FFD700';
        x.fillRect(9, 8, 4, 4);
        x.fillStyle = C.door;
        x.fillRect(6, 9, 4, 7);
    }),
    pokecenter: createTileSprite(x => {
        x.fillStyle = '#FF6B6B';
        x.fillRect(1, 1, 14, 5);
        x.fillStyle = '#CC5555';
        x.fillRect(1, 5, 14, 1);
        x.fillStyle = C.white;
        x.fillRect(2, 6, 12, 10);
        // Pokéball logo
        x.fillStyle = '#FF0000';
        x.fillRect(6, 3, 4, 3);
        x.fillStyle = '#FFFFFF';
        x.fillRect(6, 6, 4, 3);
        x.fillStyle = '#333';
        x.fillRect(6, 5, 4, 2);
        x.fillRect(7, 4, 2, 5);
        x.fillStyle = C.door;
        x.fillRect(6, 9, 4, 7);
    }),
    bridge: createTileSprite(x => {
        x.fillStyle = '#8B4513';
        x.fillRect(0, 4, TILE, 8);
        x.fillStyle = '#654321';
        x.fillRect(0, 4, TILE, 2);
        x.fillRect(0, 10, TILE, 2);
    })
};

// ==================== SPRITE GIOCATORE ====================
function createPlayerSprite(facing) {
    const c = document.createElement('canvas');
    c.width = c.height = TILE;
    const x = c.getContext('2d');
    
    const drawHead = (dir) => {
        x.fillStyle = C.hat;
        if (dir === 'down') {
            x.fillRect(3, 0, 10, 3);
            x.fillRect(2, 1, 12, 2);
            x.fillStyle = C.hatD;
            x.fillRect(2, 2, 12, 1);
            x.fillStyle = C.hatL;
            x.fillRect(5, 1, 4, 1);
        } else if (dir === 'up') {
            x.fillStyle = C.hatD;
            x.fillRect(3, 0, 10, 4);
            x.fillRect(2, 1, 12, 3);
        } else if (dir === 'left') {
            x.fillRect(3, 0, 10, 4);
            x.fillStyle = C.hatD;
            x.fillRect(3, 0, 3, 4);
        } else {
            x.fillRect(3, 0, 10, 4);
            x.fillStyle = C.hatD;
            x.fillRect(10, 0, 3, 4);
        }
        x.fillStyle = C.hair;
        if (dir === 'down') x.fillRect(4, 3, 8, 2);
        else if (dir === 'left') x.fillRect(3, 4, 4, 2);
        else if (dir === 'right') x.fillRect(9, 4, 4, 2);
        x.fillStyle = C.skin;
        if (dir === 'down') {
            x.fillRect(4, 5, 8, 5);
            x.fillStyle = C.black;
            x.fillRect(5, 6, 2, 2);
            x.fillRect(9, 6, 2, 2);
        } else if (dir === 'up') {
            x.fillStyle = C.hairD;
            x.fillRect(4, 4, 8, 3);
        } else {
            x.fillRect(5, 5, 6, 5);
            x.fillStyle = C.black;
            x.fillRect(dir === 'left' ? 6 : 8, 6, 2, 2);
        }
    };
    
    const drawBody = () => {
        x.fillStyle = C.shirt;
        x.fillRect(3, 10, 10, 4);
        x.fillStyle = C.shirtD;
        x.fillRect(3, 13, 10, 1);
        x.fillStyle = C.pants;
        x.fillRect(4, 14, 8, 2);
        x.fillStyle = C.pantsD;
        x.fillRect(4, 14, 3, 2);
    };
    
    drawHead(facing);
    drawBody();
    return c;
}

const PLAYER_SPRITES = {
    down: createPlayerSprite('down'),
    up: createPlayerSprite('up'),
    left: createPlayerSprite('left'),
    right: createPlayerSprite('right')
};

// ==================== SPRITE NPC ====================
function createNPCSprite(type) {
    const c = document.createElement('canvas');
    c.width = c.height = TILE;
    const x = c.getContext('2d');
    
    if (type === 'oldMan') {
        x.fillStyle = '#888';
        x.fillRect(4, 2, 8, 4);
        x.fillStyle = C.skin;
        x.fillRect(4, 5, 8, 5);
        x.fillStyle = C.black;
        x.fillRect(5, 6, 2, 2);
        x.fillRect(9, 6, 2, 2);
        x.fillStyle = '#8B4513';
        x.fillRect(3, 10, 10, 6);
    } else if (type === 'girl') {
        x.fillStyle = '#8B4513';
        x.fillRect(4, 1, 8, 5);
        x.fillStyle = C.skin;
        x.fillRect(4, 5, 8, 5);
        x.fillStyle = C.black;
        x.fillRect(5, 6, 2, 2);
        x.fillRect(9, 6, 2, 2);
        x.fillStyle = '#FF69B4';
        x.fillRect(3, 10, 10, 6);
    } else if (type === 'maranza') {
        x.fillStyle = '#2C2C2C';
        x.fillRect(3, 0, 10, 6);
        x.fillStyle = C.skin;
        x.fillRect(4, 5, 8, 5);
        x.fillStyle = C.black;
        x.fillRect(5, 6, 2, 2);
        x.fillRect(9, 6, 2, 2);
        x.fillStyle = '#FFD700';
        x.fillRect(3, 10, 10, 4);
        x.fillStyle = '#1a1a1a';
        x.fillRect(3, 14, 10, 2);
    } else if (type === 'shopkeeper') {
        x.fillStyle = '#228B22';
        x.fillRect(4, 2, 8, 4);
        x.fillStyle = C.skin;
        x.fillRect(4, 5, 8, 5);
        x.fillStyle = C.black;
        x.fillRect(5, 6, 2, 2);
        x.fillRect(9, 6, 2, 2);
        x.fillStyle = '#8B4513';
        x.fillRect(3, 10, 10, 6);
        // Grembiule
        x.fillStyle = '#FFF';
        x.fillRect(5, 11, 6, 5);
    } else if (type === 'nurse') {
        x.fillStyle = '#FF69B4';
        x.fillRect(4, 1, 8, 5);
        x.fillStyle = C.skin;
        x.fillRect(4, 5, 8, 5);
        x.fillStyle = C.black;
        x.fillRect(5, 6, 2, 2);
        x.fillRect(9, 6, 2, 2);
        x.fillStyle = '#FFF';
        x.fillRect(3, 10, 10, 6);
        // Croce rossa
        x.fillStyle = '#F00';
        x.fillRect(7, 11, 2, 4);
        x.fillRect(6, 12, 4, 2);
    } else {
        x.fillStyle = '#654321';
        x.fillRect(4, 2, 8, 4);
        x.fillStyle = C.skin;
        x.fillRect(4, 5, 8, 5);
        x.fillStyle = C.black;
        x.fillRect(5, 6, 2, 2);
        x.fillRect(9, 6, 2, 2);
        x.fillStyle = '#4169E1';
        x.fillRect(3, 10, 10, 6);
    }
    return c;
}

// ==================== CREATURE (POKÉMONA) ====================
const CREATURES = [
    { id: 1, name: "Pizzocchero", type: "normale", desc: "Creatura di pasta tipica delle valli bergamasche", stats: { hp: 50, atk: 55, def: 45, spd: 40 }, moves: ["Polentata", "BurroFuso", "Grattuggia", "Schiacciata"], colors: ['#F5DEB3', '#8B4513', '#654321'] },
    { id: 2, name: "Spritz", type: "acqua", desc: "Nato nei bar veneziani, frizzante e colorato", stats: { hp: 45, atk: 50, def: 40, spd: 60 }, moves: ["Frizzante", "AperolSpray", "Ghiaccio", "Bollicine"], colors: ['#FF6347', '#FFA500', '#FFE4B5'] },
    { id: 3, name: "Bigolare", type: "normale", desc: "Tipo losco che gira in Vespa di notte", stats: { hp: 55, atk: 60, def: 45, spd: 55 }, moves: ["Carena", "FariAbbaglianti", "Rombo", "Clacsonata"], colors: ['#2C2C2C', '#4A4A4A', '#FFD700'] },
    { id: 4, name: "Prosciuttoso", type: "normale", desc: "Creatura di salume, profumata e saporita", stats: { hp: 60, atk: 50, def: 50, spd: 30 }, moves: ["Affettata", "ProfumoDiParma", "Crostini", "Grasso"], colors: ['#FFB6C1', '#CD5C5C', '#F5F5DC'] },
    { id: 5, name: "Tiramisù", type: "psico", desc: "Dolce ma potente, ti tira su il morale", stats: { hp: 55, atk: 45, def: 45, spd: 50 }, moves: ["CaffèRistretto", "Mascarpone", "CacaoPolvere", "Sveglia"], colors: ['#DEB887', '#8B4513', '#FFF8DC'] },
    { id: 6, name: "Polentoso", type: "terra", desc: "Grosso e giallo, vive nelle cascine", stats: { hp: 70, atk: 65, def: 60, spd: 25 }, moves: ["Polentone", "FunghiPorcini", "FormaggioFuso", "Piastra"], colors: ['#FFD700', '#DAA520', '#8B4513'] },
    { id: 7, name: "Scimunito", type: "psico", desc: "Così scemo che confonde i nemici", stats: { hp: 50, atk: 40, def: 45, spd: 65 }, moves: ["Confusione", "TestataVuota", "Ignoranza", "Risa"], colors: ['#DDA0DD', '#9932CC', '#4B0082'] },
    { id: 8, name: "Briscola", type: "normale", desc: "Maestro di carte, gioca sempre l'asso", stats: { hp: 50, atk: 70, def: 40, spd: 45 }, moves: ["AssoBastoni", "TreDenari", "Scopa", "Stramazzo"], colors: ['#FFFFFF', '#FF0000', '#000000'] },
    { id: 9, name: "Ossobucone", type: "normale", desc: "Un osso da spolpare con morso letale", stats: { hp: 65, atk: 75, def: 55, spd: 25 }, moves: ["MorsoOssuto", "MidolloEnergia", "Risotto", "Gremolada"], colors: ['#F5DEB3', '#FFFFFF', '#8B4513'] },
    { id: 10, name: "Terronio", type: "terra", desc: "Arriva dal sud, terra fertile e calda", stats: { hp: 60, atk: 55, def: 65, spd: 35 }, moves: ["Terremoto", "OlioSanto", "Peperoncino", "Tarallo"], colors: ['#CD853F', '#FF4500', '#8B4513'] },
    { id: 11, name: "Maranza", type: "buio", desc: "Il ragazzo di periferia, capelli a banana", stats: { hp: 55, atk: 65, def: 50, spd: 55 }, moves: ["BananaStyle", "Tatuaggio", "Flex", "Story"], colors: ['#2C2C2C', '#FFD700', '#FF6347'] },
    { id: 12, name: "Scugnizzo", type: "lotta", desc: "Ragazzo di strada napoletano, scaltro", stats: { hp: 50, atk: 70, def: 40, spd: 65 }, moves: ["Pezzottella", "Arrampicata", "CuoeCrapa", "Basilico"], colors: ['#F5DEB3', '#1E90FF', '#DC143C'] },
    { id: 13, name: "Gnoccolo", type: "normale", desc: "Piccolo e morbido, rotola ovunque", stats: { hp: 55, atk: 45, def: 55, spd: 35 }, moves: ["Rotolamento", "Pestata", "Burro", "Sugo"], colors: ['#F5F5DC', '#DEB887', '#8B4513'] },
    { id: 14, name: "Lagunario", type: "acqua", desc: "Spirito della laguna veneziana", stats: { hp: 60, atk: 50, def: 55, spd: 50 }, moves: ["AltaMarea", "Gondola", "Bricola", "AcquaAlta"], colors: ['#4169E1', '#87CEEB', '#2F4F4F'] },
    { id: 15, name: "Carbonaio", type: "fuoco", desc: "Nato dalle braci del barbecue", stats: { hp: 55, atk: 70, def: 45, spd: 40 }, moves: ["Brace", "Griglia", "Fumo", "Cenere"], colors: ['#2C2C2C', '#FF4500', '#FFD700'] }
];

// ==================== NEGOZIO ====================
const SHOP_ITEMS = [
    { name: "Pokéball", price: 200, effect: "catch", desc: "Cattura creature selvatiche" },
    { name: "Superball", price: 600, effect: "catch", power: 1.5, desc: "Migliore per catturare" },
    { name: "Pozione", price: 300, effect: "heal", power: 20, desc: "Cura 20 HP" },
    { name: "Superpozione", price: 700, effect: "heal", power: 50, desc: "Cura 50 HP" },
    { name: "Iperpozione", price: 1500, effect: "heal", power: 120, desc: "Cura 120 HP" },
    { name: "Revitalizzante", price: 1500, effect: "revive", desc: "Riporta in vita un KO" },
    { name: "Antidoto", price: 100, effect: "cure", status: "poison", desc: "Cura avvelenamento" },
    { name: "Antibrucia", price: 250, effect: "cure", status: "burn", desc: "Cura scottature" }
];

// Disegna sprite creatura
function drawCreatureSprite(creature, size = 64) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d');
    const cx = size / 2;
    const cy = size / 2;
    
    x.fillStyle = creature.colors[0];
    x.beginPath();
    x.ellipse(cx, cy + 5, size * 0.35, size * 0.4, 0, 0, Math.PI * 2);
    x.fill();
    x.beginPath();
    x.ellipse(cx, cy - 8, size * 0.28, size * 0.22, 0, 0, Math.PI * 2);
    x.fill();
    x.fillStyle = creature.colors[1];
    x.beginPath();
    x.ellipse(cx, cy + 12, size * 0.28, size * 0.2, 0, 0, Math.PI);
    x.fill();
    x.fillStyle = '#000';
    x.fillRect(cx - 12, cy - 10, 8, 8);
    x.fillRect(cx + 4, cy - 10, 8, 8);
    x.fillStyle = '#FFF';
    x.fillRect(cx - 10, cy - 9, 3, 3);
    x.fillRect(cx + 6, cy - 9, 3, 3);
    x.fillStyle = creature.colors[2];
    x.beginPath();
    x.ellipse(cx, cy + 18, size * 0.2, size * 0.1, 0, 0, Math.PI);
    x.fill();
    
    return c;
}

// ==================== MAPPE ====================
const MAPS = {
    borgo_mina: {
        name: "Borgo Mina",
        width: 25,
        height: 20,
        music: 'town',
        npcs: [
            { x: 5, y: 5, sprite: 'oldMan', name: 'Nonno Gino', dialog: "Benvenuto a Borgo Mina!\nQui troverai molte creature\nitaliane da catturare.\n\nNell'erba alta si nascondono!", faceDir: 'down' },
            { x: 12, y: 8, sprite: 'girl', name: 'Lucia', dialog: "Ciao! Hai visto il mio\nSpritz? È così frizzante!", faceDir: 'left' },
            { x: 18, y: 12, sprite: 'maranza', name: 'Kevin', dialog: "Ehi bro, che dici?\nVuoi vedere il mio Flex?\n\nHo un Maranza pazzesco!", faceDir: 'up' },
            { x: 8, y: 15, sprite: 'shopkeeper', name: 'Mercante', type: 'shop', dialog: "Benvenuto nel mio negozio!\nVuoi comprare qualcosa?", faceDir: 'up' },
            { x: 3, y: 10, sprite: 'nurse', name: 'Infermiera', type: 'heal', dialog: "Vuoi curare le tue creature?", faceDir: 'right' }
        ],
        encounters: [0, 1, 2, 3, 5, 13],
        connections: { north: { map: 'foresta_nera', x: 12, y: 18 }, east: { map: 'spiaggia_adriatica', x: 1, y: 10 } },
        tiles: null
    },
    foresta_nera: {
        name: "Foresta Nera",
        width: 30,
        height: 25,
        music: 'forest',
        npcs: [
            { x: 15, y: 12, sprite: 'oldMan', name: 'Legnaiolo', dialog: "Questa foresta è antica...\nDicono che ci siano creature\nmolto rare qui.", faceDir: 'down' }
        ],
        encounters: [4, 6, 7, 10, 14],
        connections: { south: { map: 'borgo_mina', x: 12, y: 1 } },
        tiles: null
    },
    spiaggia_adriatica: {
        name: "Spiaggia Adriatica",
        width: 25,
        height: 20,
        music: 'beach',
        npcs: [
            { x: 12, y: 5, sprite: 'girl', name: 'Bagnante', dialog: "Che bella giornata!\nL'acqua è perfetta oggi.", faceDir: 'up' },
            { x: 20, y: 10, sprite: 'shopkeeper', name: 'Venditore', type: 'shop', dialog: "Acqua! Sangria! Spritz!\nVuoi qualcosa da bere?", faceDir: 'left' }
        ],
        encounters: [1, 2, 13, 14],
        connections: { west: { map: 'borgo_mina', x: 23, y: 10 } },
        tiles: null
    }
};

// Genera tiles mappa
function generateMapTiles(mapId) {
    const map = MAPS[mapId];
    map.tiles = [];
    
    for (let y = 0; y < map.height; y++) {
        map.tiles[y] = [];
        for (let x = 0; x < map.width; x++) {
            if (x === 0 || x === map.width - 1 || y === 0 || y === map.height - 1) {
                map.tiles[y][x] = 'tree';
                continue;
            }
            
            if (mapId === 'borgo_mina') {
                if ((x === 3 && y === 3) || (x === 20 && y === 4)) {
                    map.tiles[y][x] = 'house';
                } else if (x === 8 && y === 15) {
                    map.tiles[y][x] = 'shop';
                } else if (x === 3 && y === 10) {
                    map.tiles[y][x] = 'pokecenter';
                } else if (x >= 10 && x <= 15 && (y === 9 || y === 10)) {
                    map.tiles[y][x] = 'path';
                } else if (y >= 14 && y <= 17 && x >= 16 && x <= 20) {
                    map.tiles[y][x] = 'water';
                } else if (Math.random() < 0.2 && x > 2 && x < map.width - 2) {
                    map.tiles[y][x] = 'tallGrass';
                } else {
                    map.tiles[y][x] = 'grass';
                }
            } else if (mapId === 'foresta_nera') {
                if (Math.random() < 0.15) {
                    map.tiles[y][x] = 'tree';
                } else if (Math.random() < 0.3) {
                    map.tiles[y][x] = 'tallGrass';
                } else {
                    map.tiles[y][x] = 'grass';
                }
                if (x >= 13 && x <= 17) {
                    map.tiles[y][x] = 'path';
                }
            } else if (mapId === 'spiaggia_adriatica') {
                if (y <= 3) {
                    map.tiles[y][x] = 'water';
                } else if (y <= 6) {
                    map.tiles[y][x] = 'sand';
                } else if (Math.random() < 0.15) {
                    map.tiles[y][x] = 'tallGrass';
                } else {
                    map.tiles[y][x] = 'grass';
                }
                // Shop sulla spiaggia
                if (x === 20 && y === 10) {
                    map.tiles[y][x] = 'shop';
                }
            }
        }
    }
    
    map.npcs.forEach(npc => {
        map.tiles[npc.y][npc.x] = 'path';
    });
    
    if (map.connections.north) {
        const cx = map.connections.north.x;
        for (let i = -1; i <= 1; i++) {
            if (map.tiles[0][cx + i]) map.tiles[0][cx + i] = 'path';
        }
    }
    if (map.connections.south) {
        const cx = map.connections.south.x;
        for (let i = -1; i <= 1; i++) {
            if (map.tiles[map.height - 1][cx + i]) map.tiles[map.height - 1][cx + i] = 'path';
        }
    }
    if (map.connections.east) {
        const cy = map.connections.east.y;
        for (let i = -1; i <= 1; i++) {
            if (map.tiles[cy + i]) map.tiles[cy + i][map.width - 1] = 'path';
        }
    }
    if (map.connections.west) {
        const cy = map.connections.west.y;
        for (let i = -1; i <= 1; i++) {
            if (map.tiles[cy + i]) map.tiles[cy + i][0] = 'path';
        }
    }
}

Object.keys(MAPS).forEach(generateMapTiles);

// ==================== GIOCATORE ====================
const player = {
    x: 12, y: 8,
    px: 12 * TILE_SCALED, py: 8 * TILE_SCALED,
    facing: 'down', moving: false, map: 'borgo_mina',
    team: [{
        id: 1, name: "Pizzocchero", type: "normale",
        level: 5, exp: 0,
        hp: 50, maxHp: 50,
        atk: 55, def: 45, spd: 40,
        moves: ["Polentata", "BurroFuso", "Grattuggia", "Schiacciata"],
        status: null
    }],
    bag: [
        { name: "Pokéball", qty: 15, effect: "catch" },
        { name: "Pozione", qty: 5, effect: "heal", power: 20 }
    ],
    money: 3000,
    badges: 0,
    caught: [1]
};

// ==================== STATO GIOCO ====================
const game = {
    screen: 'title',
    menuOpen: false,
    menuSelect: 0,
    dialog: null,
    dialogIndex: 0,
    battle: null,
    shop: null,
    lastEncounter: 0,
    lastMove: 0,
    animation: null
};

// ==================== INPUT ====================
const keys = {};
const justPressed = {};

const focusOverlay = document.getElementById('focus-overlay');
let gameFocused = false;

function activateGame() {
    gameFocused = true;
    focusOverlay.classList.add('hidden');
    canvas.focus();
}

focusOverlay.addEventListener('click', () => { activateGame(); });
focusOverlay.addEventListener('touchstart', (e) => { e.preventDefault(); activateGame(); });
document.addEventListener('click', (e) => { if (!gameFocused && e.target !== focusOverlay) activateGame(); });

document.addEventListener('keydown', e => {
    e.preventDefault();
    if (!keys[e.key]) justPressed[e.key] = true;
    keys[e.key] = true;
    if (!gameFocused) activateGame();
});

document.addEventListener('keyup', e => { keys[e.key] = false; });

document.addEventListener('keydown', e => {
    if (e.key === 'z' || e.key === 'Z') { if (!keys['Enter']) justPressed['Enter'] = true; keys['Enter'] = true; }
    if (e.key === 'x' || e.key === 'X') { if (!keys['Escape']) justPressed['Escape'] = true; keys['Escape'] = true; }
});

document.addEventListener('keyup', e => {
    if (e.key === 'z' || e.key === 'Z') keys['Enter'] = false;
    if (e.key === 'x' || e.key === 'X') keys['Escape'] = false;
});

document.querySelectorAll('[data-key]').forEach(btn => {
    const key = btn.dataset.key;
    btn.addEventListener('touchstart', e => { e.preventDefault(); keys[key] = true; justPressed[key] = true; if (!gameFocused) activateGame(); });
    btn.addEventListener('touchend', e => { e.preventDefault(); keys[key] = false; });
    btn.addEventListener('mousedown', e => { e.preventDefault(); keys[key] = true; justPressed[key] = true; });
    btn.addEventListener('mouseup', e => { keys[key] = false; });
});

// ==================== UI ELEMENTS ====================
const titleScreen = document.getElementById('title-screen');
const dialogBox = document.getElementById('dialog-box');
const dialogText = document.getElementById('dialog-text');
const dialogSpeaker = document.getElementById('dialog-speaker');
const gameMenu = document.getElementById('game-menu');
const hud = document.getElementById('hud');
const hudContent = document.getElementById('hud-content');
const loadingScreen = document.getElementById('loading');

document.querySelectorAll('.title-menu-item').forEach(item => {
    item.addEventListener('click', () => {
        const action = item.dataset.action;
        if (action === 'new') startNewGame();
        else if (action === 'continue') loadGame();
    });
});

document.querySelectorAll('.menu-item').forEach((item, i) => {
    item.addEventListener('click', () => { handleMenuAction(item.dataset.action); });
});

// ==================== FUNZIONI GIOCO ====================
function startNewGame() {
    game.screen = 'overworld';
    titleScreen.style.display = 'none';
    hud.style.display = 'block';
    showDialog("Benvenuto allenatore!\nIl tuo primo amico è PIZZOCCHERO!\n\nUsa le frecce per muoverti.\nPremi A per interagire.\nPremi B per il menu.", "Prof. Minotto");
}

function loadGame() {
    const save = localStorage.getItem('pokemona_save');
    if (save) {
        const data = JSON.parse(save);
        Object.assign(player, data.player);
        player.px = player.x * TILE_SCALED;
        player.py = player.y * TILE_SCALED;
        game.screen = 'overworld';
        titleScreen.style.display = 'none';
        hud.style.display = 'block';
        showDialog("Bentornato!", "Sistema");
    } else {
        showDialog("Nessun salvataggio trovato!\nInizia una nuova partita.", "Sistema");
    }
}

function showDialog(text, speaker = '') {
    game.dialog = { text, speaker };
    game.dialogIndex = 0;
    dialogSpeaker.textContent = speaker;
    dialogText.textContent = '';
    dialogBox.style.display = 'block';
}

function hideDialog() {
    game.dialog = null;
    dialogBox.style.display = 'none';
}

function toggleMenu() {
    game.menuOpen = !game.menuOpen;
    gameMenu.style.display = game.menuOpen ? 'block' : 'none';
    game.menuSelect = 0;
    updateMenuSelection();
}

function updateMenuSelection() {
    document.querySelectorAll('.menu-item').forEach((item, i) => {
        item.classList.toggle('selected', i === game.menuSelect);
    });
}

function handleMenuAction(action) {
    switch (action) {
        case 'team':
            const team = player.team.map(c => `${c.name} Lv.${c.level}\nHP: ${c.hp}/${c.maxHp}${c.status ? ' ['+c.status+']' : ''}`).join('\n\n');
            showDialog(team || 'Team vuoto!', 'Team');
            break;
        case 'bag':
            const items = player.bag.map(i => `${i.name} x${i.qty}`).join('\n');
            showDialog(items || 'Zaino vuoto!', 'Zaino');
            break;
        case 'pokedex':
            const caught = player.caught.length;
            const total = CREATURES.length;
            showDialog(`Hai catturato ${caught} creature\nsu ${total} totali!\n\n${Math.floor(caught/total*100)}% completato`, 'Pokédex');
            break;
        case 'save':
            localStorage.setItem('pokemona_save', JSON.stringify({ player: player, map: player.map }));
            showDialog('Partita salvata!', 'Sistema');
            break;
        case 'close':
            toggleMenu();
            break;
    }
    game.menuOpen = false;
    gameMenu.style.display = 'none';
}

// ==================== MOVIMENTO ====================
function updateMovement() {
    if (game.screen !== 'overworld') return;
    if (game.dialog || game.menuOpen || game.shop) return;
    
    let dx = 0, dy = 0;
    
    if (keys['ArrowUp'] || keys['w']) { dy = -1; player.facing = 'up'; }
    if (keys['ArrowDown'] || keys['s']) { dy = 1; player.facing = 'down'; }
    if (keys['ArrowLeft'] || keys['a']) { dx = -1; player.facing = 'left'; }
    if (keys['ArrowRight'] || keys['d']) { dx = 1; player.facing = 'right'; }
    
    if (dx || dy) {
        const map = MAPS[player.map];
        const newPx = player.px + dx * CONFIG.PLAYER_SPEED * SCALE;
        const newPy = player.py + dy * CONFIG.PLAYER_SPEED * SCALE;
        const tx = Math.floor(newPx / TILE_SCALED);
        const ty = Math.floor(newPy / TILE_SCALED);
        
        const tile = map.tiles[ty]?.[tx];
        
        if (tile && tile !== 'water' && tile !== 'tree' && tile !== 'house' && tile !== 'shop' && tile !== 'pokecenter') {
            player.px = newPx;
            player.py = newPy;
            player.x = tx;
            player.y = ty;
            player.moving = true;
            
            checkEncounter();
            checkMapTransition();
        }
    } else {
        player.moving = false;
    }
    
    if (justPressed['Enter']) interact();
    if (justPressed['Escape']) toggleMenu();
    
    if (justPressed['Enter'] && game.dialog) {
        if (game.dialogIndex < game.dialog.text.length) {
            game.dialogIndex = game.dialog.text.length;
        } else {
            hideDialog();
        }
    }
    
    if (game.menuOpen) {
        if (justPressed['ArrowUp']) { game.menuSelect = (game.menuSelect - 1 + 5) % 5; updateMenuSelection(); }
        if (justPressed['ArrowDown']) { game.menuSelect = (game.menuSelect + 1) % 5; updateMenuSelection(); }
        if (justPressed['Enter']) {
            const actions = ['team', 'bag', 'pokedex', 'save', 'close'];
            handleMenuAction(actions[game.menuSelect]);
        }
        if (justPressed['Escape']) toggleMenu();
    }
}

function interact() {
    const map = MAPS[player.map];
    const fx = player.x + (player.facing === 'left' ? -1 : player.facing === 'right' ? 1 : 0);
    const fy = player.y + (player.facing === 'up' ? -1 : player.facing === 'down' ? 1 : 0);
    
    const npc = map.npcs.find(n => n.x === fx && n.y === fy);
    if (npc) {
        if (npc.type === 'shop') {
            openShop(npc);
        } else if (npc.type === 'heal') {
            healTeam();
            showDialog(npc.dialog, npc.name);
        } else {
            showDialog(npc.dialog, npc.name);
        }
    }
}

function healTeam() {
    player.team.forEach(c => {
        c.hp = c.maxHp;
        c.status = null;
    });
    showDialog("Le tue creature sono state\ncurate completamente!", "Infermiera");
}

// ==================== NEGOZIO ====================
function openShop(npc) {
    game.shop = {
        npc: npc,
        items: SHOP_ITEMS,
        select: 0,
        mode: 'buy' // buy, sell, confirm
    };
    showDialog(npc.dialog + "\n\nHai " + player.money + " monete.", npc.name);
}

function handleShopInput() {
    if (!game.shop) return;
    
    const shop = game.shop;
    
    if (shop.mode === 'buy') {
        if (justPressed['ArrowUp'] && shop.select > 0) shop.select--;
        if (justPressed['ArrowDown'] && shop.select < shop.items.length - 1) shop.select++;
        
        if (justPressed['Enter']) {
            const item = shop.items[shop.select];
            if (player.money >= item.price) {
                shop.mode = 'confirm';
                shop.confirmItem = item;
                showDialog(`Vuoi comprare\n${item.name} per ${item.price} monete?\n\nA = Si  B = No`, 'Conferma');
            } else {
                showDialog("Non hai abbastanza monete!", 'Negozio');
                setTimeout(() => showDialog("Cosa vuoi comprare?\n\nHai " + player.money + " monete.", shop.npc.name), 1500);
            }
        }
        
        if (justPressed['Escape']) {
            game.shop = null;
            hideDialog();
        }
    } else if (shop.mode === 'confirm') {
        if (justPressed['Enter']) {
            const item = shop.confirmItem;
            player.money -= item.price;
            
            // Aggiungi allo zaino
            const existing = player.bag.find(i => i.name === item.name);
            if (existing) {
                existing.qty++;
            } else {
                player.bag.push({ name: item.name, qty: 1, effect: item.effect, power: item.power });
            }
            
            showDialog(`Hai comprato ${item.name}!`, 'Negozio');
            setTimeout(() => {
                shop.mode = 'buy';
                showDialog("Cosa vuoi comprare?\n\nHai " + player.money + " monete.", shop.npc.name);
            }, 1500);
        }
        
        if (justPressed['Escape']) {
            shop.mode = 'buy';
            showDialog("Cosa vuoi comprare?\n\nHai " + player.money + " monete.", shop.npc.name);
        }
    }
    
    drawShop();
}

function drawShop() {
    if (!game.shop) return;
    
    const shop = game.shop;
    
    // Draw shop overlay on battle canvas
    battleCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    battleCtx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    // Title
    battleCtx.fillStyle = '#FFD700';
    battleCtx.font = '12px "Press Start 2P"';
    battleCtx.fillText('NEGOZIO', CONFIG.CANVAS_WIDTH / 2 - 40, 30);
    
    // Money
    battleCtx.fillStyle = '#FFF';
    battleCtx.font = '8px "Press Start 2P"';
    battleCtx.fillText('Monete: ' + player.money, 20, 50);
    
    // Items
    shop.items.forEach((item, i) => {
        const y = 70 + i * 28;
        
        // Selection highlight
        if (i === shop.select && shop.mode === 'buy') {
            battleCtx.fillStyle = 'rgba(255, 107, 53, 0.3)';
            battleCtx.fillRect(10, y - 5, CONFIG.CANVAS_WIDTH - 20, 24);
        }
        
        battleCtx.fillStyle = i === shop.select && shop.mode === 'buy' ? '#FF6B35' : '#FFF';
        battleCtx.fillText((i === shop.select && shop.mode === 'buy' ? '► ' : '  ') + item.name, 20, y + 8);
        
        battleCtx.fillStyle = '#FFD700';
        battleCtx.fillText(item.price + '¥', CONFIG.CANVAS_WIDTH - 80, y + 8);
        
        // Description
        battleCtx.fillStyle = '#888';
        battleCtx.font = '6px "Press Start 2P"';
        battleCtx.fillText(item.desc, 30, y + 18);
        battleCtx.font = '8px "Press Start 2P"';
    });
    
    // Instructions
    battleCtx.fillStyle = '#666';
    battleCtx.fillText('A=Compra  B=Esci', CONFIG.CANVAS_WIDTH - 150, CONFIG.CANVAS_HEIGHT - 20);
}

function checkEncounter() {
    const map = MAPS[player.map];
    const tile = map.tiles[player.y]?.[player.x];
    const now = Date.now();
    
    if (tile === 'tallGrass' && Math.random() < CONFIG.ENCOUNTER_RATE && now - game.lastEncounter > 2000) {
        game.lastEncounter = now;
        const creatureId = map.encounters[Math.floor(Math.random() * map.encounters.length)];
        startBattle(CREATURES[creatureId]);
    }
}

function checkMapTransition() {
    const map = MAPS[player.map];
    const conn = map.connections;
    
    if (conn.north && player.y === 0) changeMap(conn.north.map, conn.north.x, conn.north.y);
    else if (conn.south && player.y === map.height - 1) changeMap(conn.south.map, conn.south.x, conn.south.y);
    else if (conn.east && player.x === map.width - 1) changeMap(conn.east.map, conn.east.x, conn.east.y);
    else if (conn.west && player.x === 0) changeMap(conn.west.map, conn.west.x, conn.west.y);
}

function changeMap(newMap, x, y) {
    player.map = newMap;
    player.x = x;
    player.y = y;
    player.px = x * TILE_SCALED;
    player.py = y * TILE_SCALED;
    showDialog(`Sei arrivato a ${MAPS[newMap].name}`, '');
}

// ==================== BATTAGLIA MIGLIORATA ====================
function startBattle(creature) {
    game.screen = 'battle';
    battleCanvas.style.display = 'block';
    
    const level = Math.floor(Math.random() * 5) + 3;
    const baseStats = creature.stats;
    const maxHp = Math.floor(baseStats.hp + level * 2);
    
    game.battle = {
        enemy: {
            ...creature,
            level,
            hp: maxHp,
            maxHp,
            atk: Math.floor(baseStats.atk * (1 + level * 0.05)),
            def: Math.floor(baseStats.def * (1 + level * 0.05)),
            spd: Math.floor(baseStats.spd * (1 + level * 0.05)),
            status: null
        },
        ally: { ...player.team[0] },
        phase: 'intro',
        message: `Un ${creature.name} selvatico\nè apparso!`,
        menuSelect: 0,
        moveSelect: 0,
        animation: null,
        turn: 0
    };
    
    setTimeout(() => {
        game.battle.phase = 'menu';
        game.battle.message = 'Cosa vuoi fare?';
        drawBattle();
    }, 1500);
    
    drawBattle();
}

function drawBattle() {
    const b = game.battle;
    if (!b) return;
    
    // Sfondo
    battleCtx.fillStyle = '#90D870';
    battleCtx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    // Erba
    battleCtx.fillStyle = '#78C850';
    for (let i = 0; i < 20; i++) {
        battleCtx.fillRect(i * 25, CONFIG.CANVAS_HEIGHT - 80, 20, 80);
    }
    
    // Animazione attacco
    let enemyOffset = 0, allyOffset = 0;
    if (b.animation === 'allyAttack') {
        allyOffset = Math.sin(Date.now() / 50) * 10;
    } else if (b.animation === 'enemyAttack') {
        enemyOffset = Math.sin(Date.now() / 50) * 10;
    } else if (b.animation === 'enemyHit') {
        enemyOffset = Math.random() * 6 - 3;
    } else if (b.animation === 'allyHit') {
        allyOffset = Math.random() * 6 - 3;
    }
    
    // Nemico
    const enemySpr = drawCreatureSprite(b.enemy);
    battleCtx.drawImage(enemySpr, CONFIG.CANVAS_WIDTH - 150 + enemyOffset, 30, 90, 90);
    drawBattleInfo(battleCtx, 20, 15, 150, 50, b.enemy);
    
    // Alleato
    const allySpr = drawCreatureSprite(b.ally);
    battleCtx.drawImage(allySpr, 50 + allyOffset, CONFIG.CANVAS_HEIGHT - 190, 110, 110);
    drawBattleInfo(battleCtx, CONFIG.CANVAS_WIDTH - 170, CONFIG.CANVAS_HEIGHT - 130, 150, 50, b.ally);
    
    // Box messaggio
    battleCtx.fillStyle = '#F8F8F8';
    battleCtx.strokeStyle = '#333';
    battleCtx.lineWidth = 4;
    battleCtx.beginPath();
    battleCtx.roundRect(15, CONFIG.CANVAS_HEIGHT - 100, CONFIG.CANVAS_WIDTH - 200, 85, 8);
    battleCtx.fill();
    battleCtx.stroke();
    
    battleCtx.fillStyle = '#333';
    battleCtx.font = '10px "Press Start 2P"';
    battleCtx.fillText(b.message, 25, CONFIG.CANVAS_HEIGHT - 65);
    
    // Menu
    if (b.phase === 'menu') {
        battleCtx.fillStyle = '#F8F8F8';
        battleCtx.beginPath();
        battleCtx.roundRect(CONFIG.CANVAS_WIDTH - 175, CONFIG.CANVAS_HEIGHT - 100, 160, 85, 8);
        battleCtx.fill();
        battleCtx.stroke();
        
        const opts = ['COMBATTI', 'OGGETTO', 'CATTURA', 'FUGA'];
        opts.forEach((opt, i) => {
            battleCtx.fillStyle = i === b.menuSelect ? '#F87830' : '#333';
            battleCtx.fillText((i === b.menuSelect ? '► ' : '  ') + opt, CONFIG.CANVAS_WIDTH - 165, CONFIG.CANVAS_HEIGHT - 75 + i * 18);
        });
    }
    
    // Mosse
    if (b.phase === 'moves') {
        battleCtx.fillStyle = '#F8F8F8';
        battleCtx.beginPath();
        battleCtx.roundRect(CONFIG.CANVAS_WIDTH - 220, CONFIG.CANVAS_HEIGHT - 100, 205, 85, 8);
        battleCtx.fill();
        battleCtx.stroke();
        
        b.ally.moves.forEach((move, i) => {
            const moveData = MOVES_DATA[move] || { power: 40, type: 'normale' };
            battleCtx.fillStyle = i === b.moveSelect ? '#F87830' : '#333';
            battleCtx.fillText((i === b.moveSelect ? '► ' : '  ') + move, CONFIG.CANVAS_WIDTH - 210, CONFIG.CANVAS_HEIGHT - 75 + i * 18);
        });
    }
    
    // Menu oggetti
    if (b.phase === 'items') {
        battleCtx.fillStyle = '#F8F8F8';
        battleCtx.beginPath();
        battleCtx.roundRect(20, CONFIG.CANVAS_HEIGHT - 100, 250, 85, 8);
        battleCtx.fill();
        battleCtx.stroke();
        
        const items = player.bag.filter(i => i.effect === 'heal' || i.effect === 'catch');
        items.forEach((item, i) => {
            battleCtx.fillStyle = i === b.moveSelect ? '#F87830' : '#333';
            battleCtx.fillText((i === b.moveSelect ? '► ' : '  ') + `${item.name} x${item.qty}`, 30, CONFIG.CANVAS_HEIGHT - 75 + i * 18);
        });
        
        if (items.length === 0) {
            battleCtx.fillStyle = '#333';
            battleCtx.fillText('Nessun oggetto!', 30, CONFIG.CANVAS_HEIGHT - 60);
        }
    }
    
    // Effetti status
    if (b.enemy.status) {
        battleCtx.fillStyle = '#FF0000';
        battleCtx.font = '8px "Press Start 2P"';
        battleCtx.fillText(b.enemy.status.toUpperCase(), CONFIG.CANVAS_WIDTH - 80, 80);
    }
    if (b.ally.status) {
        battleCtx.fillStyle = '#FF0000';
        battleCtx.font = '8px "Press Start 2P"';
        battleCtx.fillText(b.ally.status.toUpperCase(), 60, CONFIG.CANVAS_HEIGHT - 200);
    }
}

function drawBattleInfo(ctx, x, y, w, h, creature) {
    ctx.fillStyle = '#F8F8F8';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#333';
    ctx.font = '8px "Press Start 2P"';
    ctx.fillText(creature.name, x + 8, y + 14);
    ctx.fillText('Lv.' + creature.level, x + w - 40, y + 14);
    
    // HP bar
    ctx.fillStyle = '#333';
    ctx.fillRect(x + 8, y + 22, w - 16, 10);
    
    const hpPct = Math.max(0, creature.hp / creature.maxHp);
    ctx.fillStyle = hpPct > 0.5 ? '#38B038' : hpPct > 0.2 ? '#F8C800' : '#F83030';
    ctx.fillRect(x + 10, y + 24, (w - 20) * hpPct, 6);
    
    ctx.fillStyle = '#333';
    ctx.font = '6px "Press Start 2P"';
    ctx.fillText(`${creature.hp}/${creature.maxHp}`, x + 8, y + 42);
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
            } else if (b.menuSelect === 1) {
                b.phase = 'items';
                b.moveSelect = 0;
            } else if (b.menuSelect === 2) {
                // Cattura
                tryCatch();
            } else if (b.menuSelect === 3) {
                if (Math.random() > 0.3) {
                    b.message = 'Sei fuggito!';
                    setTimeout(() => endBattle(false), 1000);
                } else {
                    b.message = 'Non puoi fuggire!';
                    setTimeout(() => { b.phase = 'menu'; drawBattle(); }, 1000);
                }
            }
        }
    } else if (b.phase === 'moves') {
        if (justPressed['ArrowUp'] && b.moveSelect > 0) b.moveSelect--;
        if (justPressed['ArrowDown'] && b.moveSelect < b.ally.moves.length - 1) b.moveSelect++;
        if (justPressed['Enter']) executeMove(b.moveSelect);
        if (justPressed['Escape']) b.phase = 'menu';
    } else if (b.phase === 'items') {
        const items = player.bag.filter(i => i.effect === 'heal');
        if (justPressed['ArrowUp'] && b.moveSelect > 0) b.moveSelect--;
        if (justPressed['ArrowDown'] && b.moveSelect < items.length - 1) b.moveSelect++;
        if (justPressed['Enter'] && items[b.moveSelect]) {
            applyItem(items[b.moveSelect]);
        }
        if (justPressed['Escape']) b.phase = 'menu';
    }
    
    drawBattle();
}

// ==================== SISTEMA COMBATTIMENTO MIGLIORATO ====================
function calculateDamage(attacker, defender, move) {
    const moveData = MOVES_DATA[move] || { power: 40, type: 'normale' };
    
    // Calcola efficacia tipo
    let effectiveness = 1;
    if (TYPE_CHART[moveData.type] && TYPE_CHART[moveData.type][defender.type]) {
        effectiveness = TYPE_CHART[moveData.type][defender.type];
    }
    
    // Formula danno
    const level = attacker.level;
    const attack = attacker.atk || 50;
    const defense = defender.def || 50;
    const power = moveData.power;
    
    let damage = Math.floor(((2 * level / 5 + 2) * power * attack / defense) / 50 + 2);
    damage = Math.floor(damage * effectiveness);
    
    // Random factor
    damage = Math.floor(damage * (0.85 + Math.random() * 0.15));
    
    // Critical hit (6.25% chance)
    if (Math.random() < 0.0625) {
        damage = Math.floor(damage * 1.5);
    }
    
    return { damage: Math.max(1, damage), effectiveness, moveData };
}

function executeMove(index) {
    const b = game.battle;
    const move = b.ally.moves[index];
    
    // Determina chi attacca per primo basato su velocità
    const allyFirst = b.ally.spd >= b.enemy.spd;
    
    // Animazione attacco alleato
    b.animation = 'allyAttack';
    b.phase = 'animating';
    
    const result = calculateDamage(b.ally, b.enemy, move);
    b.enemy.hp = Math.max(0, b.enemy.hp - result.damage);
    
    let effText = result.effectiveness > 1 ? '\nÈ superefficace!' : result.effectiveness < 1 ? '\nNon è molto efficace...' : '';
    
    setTimeout(() => {
        b.animation = 'enemyHit';
        b.message = `${b.ally.name} usa\n${move}!${effText}\n-${result.damage} HP!`;
        drawBattle();
    }, 300);
    
    setTimeout(() => {
        b.animation = null;
        
        // Applica effetti status
        if (result.moveData.effect && Math.random() < 0.3) {
            b.enemy.status = result.moveData.effect;
        }
        
        if (b.enemy.hp <= 0) {
            const exp = b.enemy.level * 15;
            b.message = `${b.enemy.name} è KO!\n+${exp} EXP!`;
            
            // Level up check
            b.ally.exp += exp;
            if (b.ally.exp >= b.ally.level * 20) {
                b.ally.level++;
                b.ally.maxHp += 5;
                b.ally.hp = Math.min(b.ally.hp + 5, b.ally.maxHp);
                b.ally.atk += 2;
                b.ally.def += 2;
                b.ally.spd += 1;
                b.message += `\n${b.ally.name} sale al\nlivello ${b.ally.level}!`;
            }
            
            setTimeout(() => {
                endBattle(true);
                showDialog(`${b.ally.name} ha vinto!\nGuadagni ${exp} EXP!`, 'Battaglia');
            }, 1500);
        } else {
            // Turno nemico
            setTimeout(() => enemyMove(), 800);
        }
        drawBattle();
    }, 1200);
}

function enemyMove() {
    const b = game.battle;
    const move = b.enemy.moves[Math.floor(Math.random() * b.enemy.moves.length)];
    
    b.animation = 'enemyAttack';
    
    const result = calculateDamage(b.enemy, b.ally, move);
    b.ally.hp = Math.max(0, b.ally.hp - result.damage);
    player.team[0].hp = b.ally.hp;
    
    let effText = result.effectiveness > 1 ? '\nÈ superefficace!' : result.effectiveness < 1 ? '\nNon è molto efficace...' : '';
    
    setTimeout(() => {
        b.animation = 'allyHit';
        b.message = `${b.enemy.name} usa\n${move}!${effText}\n-${result.damage} HP!`;
        drawBattle();
    }, 300);
    
    setTimeout(() => {
        b.animation = null;
        
        // Applica effetti status
        if (result.moveData.effect && Math.random() < 0.3) {
            b.ally.status = result.moveData.effect;
            player.team[0].status = result.moveData.effect;
        }
        
        if (b.ally.hp <= 0) {
            b.message = `${b.ally.name} è KO!`;
            setTimeout(() => {
                endBattle(false);
                showDialog('Hai perso...', 'Battaglia');
            }, 1500);
        } else {
            b.phase = 'menu';
            b.message = 'Cosa vuoi fare?';
        }
        drawBattle();
    }, 1200);
}

function applyItem(item) {
    const b = game.battle;
    
    if (item.effect === 'heal') {
        b.ally.hp = Math.min(b.ally.maxHp, b.ally.hp + item.power);
        player.team[0].hp = b.ally.hp;
        b.message = `${b.ally.name} recupera\n${item.power} HP!`;
        item.qty--;
        if (item.qty <= 0) {
            player.bag = player.bag.filter(i => i !== item);
        }
    }
    
    setTimeout(() => {
        b.phase = 'menu';
        enemyMove();
    }, 1000);
    
    drawBattle();
}

function tryCatch() {
    const b = game.battle;
    const ball = player.bag.find(i => i.effect === 'catch' && i.qty > 0);
    
    if (!ball) {
        b.message = 'Non hai Pokéball!';
        setTimeout(() => { b.phase = 'menu'; drawBattle(); }, 1000);
        return;
    }
    
    ball.qty--;
    if (ball.qty <= 0) {
        player.bag = player.bag.filter(i => i !== ball);
    }
    
    // Formula cattura
    const hpFactor = (1 - b.enemy.hp / b.enemy.maxHp) * 2;
    const levelFactor = (30 - b.enemy.level) / 30;
    const catchChance = Math.min(0.9, 0.2 + hpFactor * 0.4 + levelFactor * 0.2);
    
    // Moltiplicatore per tipo di palla
    const ballMultiplier = ball.power || 1;
    const finalChance = Math.min(1, catchChance * ballMultiplier);
    
    b.message = `Lanci ${ball.name}...`;
    b.phase = 'animating';
    
    // Animazione lancio
    setTimeout(() => {
        if (Math.random() < finalChance) {
            b.message = `Gotcha!\n${b.enemy.name} è stato catturato!`;
            
            // Aggiungi al team o catturati
            if (!player.caught.includes(b.enemy.id)) {
                player.caught.push(b.enemy.id);
            }
            
            // Aggiungi al team se c'è spazio
            if (player.team.length < 6) {
                player.team.push({
                    id: b.enemy.id,
                    name: b.enemy.name,
                    type: b.enemy.type,
                    level: b.enemy.level,
                    exp: 0,
                    hp: b.enemy.maxHp,
                    maxHp: b.enemy.maxHp,
                    atk: b.enemy.atk,
                    def: b.enemy.def,
                    spd: b.enemy.spd,
                    moves: b.enemy.moves,
                    status: null
                });
            }
            
            setTimeout(() => {
                endBattle(true);
                showDialog(`${b.enemy.name} è stato aggiunto\nal tuo team!`, 'Cattura');
            }, 1500);
        } else {
            b.message = 'Oh no!\nÈ scappato!';
            setTimeout(() => {
                b.phase = 'menu';
                enemyMove();
            }, 1000);
        }
        drawBattle();
    }, 1500);
    
    drawBattle();
}

function endBattle(won) {
    game.screen = 'overworld';
    game.battle = null;
    game.shop = null;
    battleCanvas.style.display = 'none';
    
    if (won && player.team[0].hp > 0) {
        player.team[0].exp += 15;
    }
}

// ==================== RENDER ====================
function render() {
    if (game.screen !== 'overworld') return;
    
    const map = MAPS[player.map];
    
    const camX = Math.max(0, Math.min(player.px - CONFIG.CANVAS_WIDTH / 2 + TILE_SCALED / 2, map.width * TILE_SCALED - CONFIG.CANVAS_WIDTH));
    const camY = Math.max(0, Math.min(player.py - CONFIG.CANVAS_HEIGHT / 2 + TILE_SCALED / 2, map.height * TILE_SCALED - CONFIG.CANVAS_HEIGHT));
    
    ctx.fillStyle = '#78C850';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    const startX = Math.max(0, Math.floor(camX / TILE_SCALED));
    const startY = Math.max(0, Math.floor(camY / TILE_SCALED));
    const endX = Math.min(map.width, startX + Math.ceil(CONFIG.CANVAS_WIDTH / TILE_SCALED) + 2);
    const endY = Math.min(map.height, startY + Math.ceil(CONFIG.CANVAS_HEIGHT / TILE_SCALED) + 2);
    
    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const tile = map.tiles[y]?.[x];
            if (tile && TILES[tile]) {
                ctx.drawImage(TILES[tile], x * TILE_SCALED - camX, y * TILE_SCALED - camY, TILE_SCALED, TILE_SCALED);
            }
        }
    }
    
    map.npcs.forEach(npc => {
        const sprite = createNPCSprite(npc.sprite);
        ctx.drawImage(sprite, npc.x * TILE_SCALED - camX, npc.y * TILE_SCALED - camY, TILE_SCALED, TILE_SCALED);
    });
    
    ctx.drawImage(PLAYER_SPRITES[player.facing], player.px - camX, player.py - camY, TILE_SCALED, TILE_SCALED);
    
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(player.px - camX + TILE_SCALED / 2, player.py - camY + TILE_SCALED - 4, TILE_SCALED / 3, TILE_SCALED / 8, 0, 0, Math.PI * 2);
    ctx.fill();
}

function updateHUD() {
    const c = player.team[0];
    const map = MAPS[player.map];
    hudContent.innerHTML = `${c.name} Lv.${c.level}<br>HP: ${c.hp}/${c.maxHp}<br>📍 ${map.name}<br>💰 ${player.money}`;
}

function updateDialog() {
    if (!game.dialog) return;
    
    if (game.dialogIndex < game.dialog.text.length) {
        game.dialogIndex++;
        dialogText.textContent = game.dialog.text.substring(0, game.dialogIndex);
    }
}

// ==================== GAME LOOP ====================
function gameLoop() {
    if (game.screen === 'overworld') {
        updateMovement();
        render();
        updateHUD();
        
        if (game.shop) {
            handleShopInput();
        }
    } else if (game.screen === 'battle') {
        handleBattleInput();
    }
    
    updateDialog();
    
    Object.keys(justPressed).forEach(k => justPressed[k] = false);
    
    requestAnimationFrame(gameLoop);
}

// ==================== RESPONSIVE CANVAS ====================
const gameContainer = document.getElementById('game-container');
const gameWrapper = document.getElementById('game-wrapper');

function resizeGame() {
    const maxWidth = window.innerWidth - 20;
    const maxHeight = window.innerHeight - 20;
    const isMobile = window.innerWidth <= 800 || ('ontouchstart' in window);
    const controlHeight = isMobile ? 180 : 0;
    const availableHeight = maxHeight - controlHeight;
    const scaleX = maxWidth / CONFIG.CANVAS_WIDTH;
    const scaleY = availableHeight / CONFIG.CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY, 2);
    
    const displayWidth = Math.floor(CONFIG.CANVAS_WIDTH * scale);
    const displayHeight = Math.floor(CONFIG.CANVAS_HEIGHT * scale);
    
    gameContainer.style.width = displayWidth + 'px';
    gameContainer.style.height = displayHeight + 'px';
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    battleCanvas.style.width = displayWidth + 'px';
    battleCanvas.style.height = displayHeight + 'px';
}

resizeGame();
window.addEventListener('resize', resizeGame);
window.addEventListener('orientationchange', () => { setTimeout(resizeGame, 100); });

document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - (window.lastTouchEnd || 0) < 300) { e.preventDefault(); }
    window.lastTouchEnd = now;
}, { passive: false });

// ==================== INIT ====================
function init() {
    loadingScreen.classList.add('hidden');
    resizeGame();
    gameLoop();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
