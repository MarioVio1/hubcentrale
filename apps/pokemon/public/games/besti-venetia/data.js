// ================================================
// BESTI DI VENETIA - Game Data
// Complete RPG data following Tuxemon structure
// ================================================

// ==================== TYPES ====================
const TYPES = {
    fuoco: { color: '#e74c3c', icon: '🔥', strong: ['natura', 'ghiaccio'], weak: ['acqua', 'terra'] },
    acqua: { color: '#3498db', icon: '💧', strong: ['fuoco', 'terra'], weak: ['elettrico', 'natura'] },
    natura: { color: '#27ae60', icon: '🌿', strong: ['acqua', 'terra'], weak: ['fuoco', 'veleno'] },
    aria: { color: '#9b59b6', icon: '💨', strong: ['lotta'], weak: ['elettrico', 'ghiaccio'] },
    elettrico: { color: '#f1c40f', icon: '⚡', strong: ['acqua', 'aria'], weak: ['terra'] },
    terra: { color: '#d35400', icon: '🪨', strong: ['fuoco', 'elettrico'], weak: ['acqua', 'natura'] },
    ghiaccio: { color: '#00bcd4', icon: '❄️', strong: ['natura', 'aria'], weak: ['fuoco', 'lotta'] },
    lotta: { color: '#e91e63', icon: '👊', strong: ['ghiaccio', 'normale'], weak: ['aria', 'psico'] },
    psico: { color: '#9c27b0', icon: '🔮', strong: ['lotta', 'veleno'], weak: ['aria', 'normale'] },
    veleno: { color: '#8bc34a', icon: '☠️', strong: ['natura'], weak: ['terra', 'psico'] },
    normale: { color: '#9e9e9e', icon: '⭐', strong: [], weak: ['lotta'] },
    dolce: { color: '#ff9800', icon: '🍰', strong: ['psico'], weak: ['acqua'] }
};

// ==================== MOVES ====================
const MOVES = {
    // Normal moves
    azionata: { name: 'Azionata', type: 'normale', power: 40, accuracy: 100, pp: 35, desc: 'Un attacco base.' },
    placca: { name: 'Placca', type: 'normale', power: 50, accuracy: 95, pp: 25, desc: 'Colpisce con forza.' },
    morso: { name: 'Morso', type: 'normale', power: 60, accuracy: 100, pp: 20, desc: 'Un morso potente.' },
    
    // Fire moves
    fiammata: { name: 'Fiammata', type: 'fuoco', power: 40, accuracy: 100, pp: 25, desc: 'Una piccola fiamma.' },
    falò: { name: 'Falò', type: 'fuoco', power: 70, accuracy: 90, pp: 15, desc: 'Un grande falò veneto.' },
    brace_tradizione: { name: 'Brace Tradizione', type: 'fuoco', power: 90, accuracy: 85, pp: 10, desc: 'Il calore dei falò tradizionali.' },
    
    // Water moves
    schizzo: { name: 'Schizzo', type: 'acqua', power: 40, accuracy: 100, pp: 25, desc: 'Uno schizzo d\'acqua.' },
    onda_canal: { name: 'Onda Canal', type: 'acqua', power: 65, accuracy: 95, pp: 20, desc: 'L\'onda dei canali.' },
    marea: { name: 'Marea', type: 'acqua', power: 85, accuracy: 90, pp: 15, desc: 'L\'alta marea veneziana.' },
    
    // Nature moves
    frustata: { name: 'Frustata', type: 'natura', power: 45, accuracy: 100, pp: 25, desc: 'Una frustata di radici.' },
    fogliame: { name: 'Fogliame', type: 'natura', power: 55, accuracy: 95, pp: 20, desc: 'Una raffica di foglie.' },
    radicchio: { name: 'Radicchio', type: 'natura', power: 75, accuracy: 90, pp: 15, desc: 'Il potere del radicchio trevigiano!' },
    
    // Air moves
    ventata: { name: 'Ventata', type: 'aria', power: 40, accuracy: 100, pp: 25, desc: 'Una ventata di aria.' },
    bufera: { name: 'Bufera', type: 'aria', power: 70, accuracy: 90, pp: 15, desc: 'Una bufera forte.' },
    bora: { name: 'Bora', type: 'aria', power: 90, accuracy: 85, pp: 10, desc: 'La potente bora triestina!' },
    
    // Electric moves
    scossa: { name: 'Scossa', type: 'elettrico', power: 40, accuracy: 100, pp: 25, desc: 'Una piccola scossa.' },
    scarica: { name: 'Scarica', type: 'elettrico', power: 65, accuracy: 95, pp: 20, desc: 'Una scarica elettrica.' },
    vespatron: { name: 'Vespatron', type: 'elettrico', power: 85, accuracy: 90, pp: 15, desc: 'La velocità di una Vespa!' },
    
    // Earth moves
    lancio: { name: 'Lancio', type: 'terra', power: 45, accuracy: 95, pp: 25, desc: 'Lancia terriccio.' },
    terremoto: { name: 'Terremoto', type: 'terra', power: 80, accuracy: 85, pp: 15, desc: 'Un terremoto veneto!' },
    polentata: { name: 'Polentata', type: 'terra', power: 100, accuracy: 80, pp: 10, desc: 'Una polentata devastante!' },
    
    // Ice moves
    brina: { name: 'Brina', type: 'ghiaccio', power: 45, accuracy: 100, pp: 25, desc: 'Una spruzzata di brina.' },
    ghiacciata: { name: 'Ghiacciata', type: 'ghiaccio', power: 65, accuracy: 95, pp: 20, desc: 'Gela il nemico.' },
    dolomiti: { name: 'Dolomiti', type: 'ghiaccio', power: 90, accuracy: 85, pp: 10, desc: 'Il freddo delle Dolomiti!' },
    
    // Fighting moves
    pugno: { name: 'Pugno', type: 'lotta', power: 50, accuracy: 100, pp: 25, desc: 'Un pugno diretto.' },
    arena: { name: 'Arena', type: 'lotta', power: 75, accuracy: 90, pp: 15, desc: 'Lo spirito dell\'Arena di Verona!' },
    gladiatore: { name: 'Gladiatore', type: 'lotta', power: 95, accuracy: 85, pp: 10, desc: 'L\'attacco del gladiatore!' },
    
    // Psychic moves
    confusione: { name: 'Confusione', type: 'psico', power: 50, accuracy: 100, pp: 25, desc: 'Confonde il nemico.' },
    maschera: { name: 'Maschera', type: 'psico', power: 70, accuracy: 95, pp: 20, desc: 'Il mistero delle maschere veneziane.' },
    serenissima: { name: 'Serenissima', type: 'psico', power: 95, accuracy: 85, pp: 10, desc: 'Il potere antico di Venezia!' },
    
    // Poison moves
    smog: { name: 'Smog', type: 'veleno', power: 45, accuracy: 100, pp: 25, desc: 'Una nuvola di smog.' },
    nebbia: { name: 'Nebbia', type: 'veleno', power: 65, accuracy: 95, pp: 20, desc: 'La nebbia della pianura padana.' },
    
    // Sweet moves
    dolcezza: { name: 'Dolcezza', type: 'dolce', power: 50, accuracy: 100, pp: 25, desc: 'Un attacco dolce.' },
    tiramisu: { name: 'Tiramisù', type: 'dolce', power: 80, accuracy: 90, pp: 15, desc: 'La dolcezza del tiramisù!' },
    
    // Status moves
    cura: { name: 'Cura', type: 'normale', power: 0, accuracy: 100, pp: 20, desc: 'Recupera HP.', heal: 30 },
    velocità: { name: 'Velocità', type: 'normale', power: 0, accuracy: 100, pp: 20, desc: 'Aumenta la velocità.', boost: 'speed' },
    difesa: { name: 'Difesa', type: 'normale', power: 0, accuracy: 100, pp: 20, desc: 'Aumenta la difesa.', boost: 'defense' }
};

// ==================== MONSTERS (BESTI) ====================
const MONSTERS = [
    // ===== STARTERS =====
    {
        id: 1,
        slug: 'fogaron',
        name: 'Fogaron',
        type: ['fuoco'],
        description: 'Nato dai falò tradizionali veneti, il suo corpo emana calore.',
        sprite: '🔥',
        baseStats: { hp: 45, attack: 60, defense: 40, spAtk: 55, spDef: 45, speed: 55 },
        moves: ['fiammata', 'azionata', 'cura'],
        evolution: { evolvesTo: 'fogarox', level: 16 },
        learnset: { 8: 'falò', 16: 'brace_tradizione', 24: 'velocità' },
        wildLocation: null, // Starter
        catchRate: 45,
        expYield: 64
    },
    {
        id: 2,
        slug: 'fogarox',
        name: 'Fogarox',
        type: ['fuoco'],
        description: 'La sua fiamma brucia intensamente. Si dice porti fortuna ai villaggi.',
        sprite: '🔥',
        baseStats: { hp: 65, attack: 80, defense: 55, spAtk: 75, spDef: 60, speed: 75 },
        moves: ['falò', 'azionata', 'cura', 'brace_tradizione'],
        evolution: { evolvesTo: 'fogardrago', level: 36 },
        learnset: { 24: 'brace_tradizione', 32: 'velocità' },
        catchRate: 30,
        expYield: 142
    },
    {
        id: 3,
        slug: 'fogardrago',
        name: 'Fogardrago',
        type: ['fuoco', 'aria'],
        description: 'Il re dei falò veneti. Le sue ali sono fatte di puro fuoco.',
        sprite: '🐉',
        baseStats: { hp: 85, attack: 105, defense: 70, spAtk: 100, spDef: 75, speed: 95 },
        moves: ['brace_tradizione', 'bora', 'cura', 'gladiatore'],
        evolution: null,
        learnset: { 40: 'bora', 48: 'gladiatore' },
        catchRate: 15,
        expYield: 240
    },
    {
        id: 4,
        slug: 'radicor',
        name: 'Radicor',
        type: ['natura'],
        description: 'Una creatura che ama il radicchio trevigiano.',
        sprite: '🌱',
        baseStats: { hp: 50, attack: 45, defense: 55, spAtk: 50, spDef: 60, speed: 45 },
        moves: ['frustata', 'azionata', 'cura'],
        evolution: { evolvesTo: 'radicorso', level: 16 },
        learnset: { 8: 'fogliame', 16: 'radicchio', 24: 'difesa' },
        wildLocation: null, // Starter
        catchRate: 45,
        expYield: 64
    },
    {
        id: 5,
        slug: 'radicorso',
        name: 'Radicorso',
        type: ['natura', 'veleno'],
        description: 'Le sue foglie sono tossiche ma il suo cuore è gentile.',
        sprite: '🌿',
        baseStats: { hp: 70, attack: 65, defense: 75, spAtk: 70, spDef: 80, speed: 60 },
        moves: ['radicchio', 'nebbia', 'cura', 'fogliame'],
        evolution: { evolvesTo: 'radicorso_re', level: 36 },
        learnset: { 24: 'radicchio', 32: 'difesa' },
        catchRate: 30,
        expYield: 142
    },
    {
        id: 6,
        slug: 'radicorso_re',
        name: 'Radicorso Re',
        type: ['natura', 'veleno'],
        description: 'Il re delle campagne venete. Il suo radicchio è leggendario.',
        sprite: '👑',
        baseStats: { hp: 90, attack: 85, defense: 95, spAtk: 90, spDef: 100, speed: 70 },
        moves: ['radicchio', 'nebbia', 'cura', 'terremoto'],
        evolution: null,
        learnset: { 40: 'terremoto', 48: 'serenissima' },
        catchRate: 15,
        expYield: 240
    },
    {
        id: 7,
        slug: 'canalot',
        name: 'Canalot',
        type: ['acqua'],
        description: 'Vive nei canali di Venezia, nuotando tra le gondole.',
        sprite: '💧',
        baseStats: { hp: 45, attack: 50, defense: 45, spAtk: 55, spDef: 50, speed: 60 },
        moves: ['schizzo', 'azionata', 'cura'],
        evolution: { evolvesTo: 'canalisk', level: 16 },
        learnset: { 8: 'onda_canal', 16: 'marea', 24: 'velocità' },
        wildLocation: null, // Starter
        catchRate: 45,
        expYield: 64
    },
    {
        id: 8,
        slug: 'canalisk',
        name: 'Canalisk',
        type: ['acqua'],
        description: 'Si muove elegantemente nei canali, rispettato dai gondolieri.',
        sprite: '🌊',
        baseStats: { hp: 65, attack: 70, defense: 60, spAtk: 80, spDef: 70, speed: 80 },
        moves: ['onda_canal', 'azionata', 'cura', 'marea'],
        evolution: { evolvesTo: 'canalagon', level: 36 },
        learnset: { 24: 'marea', 32: 'velocità' },
        catchRate: 30,
        expYield: 142
    },
    {
        id: 9,
        slug: 'canalagon',
        name: 'Canalagon',
        type: ['acqua', 'aria'],
        description: 'Il guardiano dei canali. Può creare onde giganti.',
        sprite: '🐲',
        baseStats: { hp: 85, attack: 90, defense: 75, spAtk: 105, spDef: 85, speed: 100 },
        moves: ['marea', 'bufera', 'cura', 'bora'],
        evolution: null,
        learnset: { 40: 'bora', 48: 'serenissima' },
        catchRate: 15,
        expYield: 240
    },
    
    // ===== COMMON BESTI =====
    {
        id: 10,
        slug: 'gabbianzo',
        name: 'Gabbianzo',
        type: ['aria', 'normale'],
        description: 'Ruba panini ai turisti e attacca in gruppo. Molto rumoroso!',
        sprite: '🕊️',
        baseStats: { hp: 40, attack: 55, defense: 35, spAtk: 40, spDef: 35, speed: 70 },
        moves: ['ventata', 'azionata', 'placca'],
        evolution: { evolvesTo: 'gabbianator', level: 22 },
        learnset: { 12: 'bufera' },
        wildLocation: ['canalborgo', 'spritzia', 'gardalago'],
        catchRate: 190,
        expYield: 50
    },
    {
        id: 11,
        slug: 'gabbianator',
        name: 'Gabbianator',
        type: ['aria', 'normale'],
        description: 'Un gabbiano guerriero. Guida stormti di Gabbianzo.',
        sprite: '🦅',
        baseStats: { hp: 70, attack: 85, defense: 55, spAtk: 70, spDef: 55, speed: 100 },
        moves: ['bufera', 'placca', 'morso', 'ventata'],
        evolution: null,
        learnset: { 30: 'bora' },
        wildLocation: ['gardalago'],
        catchRate: 90,
        expYield: 154
    },
    {
        id: 12,
        slug: 'spritzino',
        name: 'Spritzino',
        type: ['acqua', 'fuoco'],
        description: 'Nato nei bar di Venetia, è sempre frizzante e allegro!',
        sprite: '🍹',
        baseStats: { hp: 45, attack: 45, defense: 40, spAtk: 60, spDef: 55, speed: 65 },
        moves: ['schizzo', 'fiammata', 'dolcezza'],
        evolution: { evolvesTo: 'spritzilla', level: 25 },
        learnset: { 12: 'onda_canal', 18: 'falò' },
        wildLocation: ['spritzia'],
        catchRate: 120,
        expYield: 68
    },
    {
        id: 13,
        slug: 'spritzilla',
        name: 'Spritzilla',
        type: ['acqua', 'fuoco'],
        description: 'La sua bevanda preferita è lo Spritz. È il re dell\'aperitivo!',
        sprite: '🥃',
        baseStats: { hp: 75, attack: 70, defense: 65, spAtk: 95, spDef: 80, speed: 85 },
        moves: ['onda_canal', 'falò', 'dolcezza', 'marea'],
        evolution: null,
        learnset: { 32: 'marea', 40: 'brace_tradizione' },
        wildLocation: [],
        catchRate: 60,
        expYield: 178
    },
    {
        id: 14,
        slug: 'gondolo',
        name: 'Gondolo',
        type: ['acqua'],
        description: 'Una creatura che imita le gondole. I gondolieri la adorano.',
        sprite: '🚣',
        baseStats: { hp: 55, attack: 50, defense: 60, spAtk: 45, spDef: 55, speed: 50 },
        moves: ['schizzo', 'azionata', 'difesa'],
        evolution: { evolvesTo: 'gondrago', level: 28 },
        learnset: { 14: 'onda_canal' },
        wildLocation: ['canalborgo', 'spritzia'],
        catchRate: 150,
        expYield: 72
    },
    {
        id: 15,
        slug: 'gondrago',
        name: 'Gondrago',
        type: ['acqua', 'aria'],
        description: 'Un drago gondola leggendario. Solca i canali con eleganza.',
        sprite: '🐉',
        baseStats: { hp: 80, attack: 80, defense: 85, spAtk: 75, spDef: 80, speed: 75 },
        moves: ['onda_canal', 'ventata', 'difesa', 'marea'],
        evolution: null,
        learnset: { 35: 'marea', 42: 'bora' },
        wildLocation: [],
        catchRate: 70,
        expYield: 185
    },
    {
        id: 16,
        slug: 'polentel',
        name: 'Polentel',
        type: ['terra'],
        description: 'Fatto di polenta morbida. Si rotola nelle campagne.',
        sprite: '🧈',
        baseStats: { hp: 60, attack: 50, defense: 65, spAtk: 40, spDef: 60, speed: 35 },
        moves: ['lancio', 'azionata', 'difesa'],
        evolution: { evolvesTo: 'polentaur', level: 26 },
        learnset: { 12: 'terremoto' },
        wildLocation: ['trevisella', 'padovana'],
        catchRate: 170,
        expYield: 65
    },
    {
        id: 17,
        slug: 'polentaur',
        name: 'Polentaur',
        type: ['terra'],
        description: 'Un gigante di polenta. La sua polentata è leggendaria!',
        sprite: '🧌',
        baseStats: { hp: 90, attack: 85, defense: 90, spAtk: 60, spDef: 85, speed: 50 },
        moves: ['terremoto', 'placca', 'difesa', 'polentata'],
        evolution: null,
        learnset: { 34: 'polentata' },
        wildLocation: [],
        catchRate: 75,
        expYield: 180
    },
    {
        id: 18,
        slug: 'salamin',
        name: 'Salamin',
        type: ['normale'],
        description: 'Un mostro salamella. Ama le grigliate estive.',
        sprite: '🌭',
        baseStats: { hp: 50, attack: 60, defense: 45, spAtk: 50, spDef: 45, speed: 55 },
        moves: ['azionata', 'morso', 'placca'],
        evolution: { evolvesTo: 'salamastro', level: 24 },
        learnset: { 14: 'pugno' },
        wildLocation: ['padovana', 'vicentia'],
        catchRate: 160,
        expYield: 68
    },
    {
        id: 19,
        slug: 'salamastro',
        name: 'Salamastro',
        type: ['normale', 'fuoco'],
        description: 'Maestro delle grigliate. Il suo profumo attira chiunque.',
        sprite: '🍖',
        baseStats: { hp: 80, attack: 95, defense: 70, spAtk: 75, spDef: 65, speed: 75 },
        moves: ['placca', 'falò', 'morso', 'pugno'],
        evolution: null,
        learnset: { 32: 'fiammata', 38: 'arena' },
        wildLocation: [],
        catchRate: 80,
        expYield: 172
    },
    {
        id: 20,
        slug: 'formaggion',
        name: 'Formaggion',
        type: ['terra'],
        description: 'Un mostro di formaggio parmigiano. Molto apprezzato.',
        sprite: '🧀',
        baseStats: { hp: 65, attack: 55, defense: 80, spAtk: 50, spDef: 75, speed: 30 },
        moves: ['lancio', 'azionata', 'difesa'],
        evolution: { evolvesTo: 'parmageddon', level: 30 },
        learnset: { 16: 'terremoto' },
        wildLocation: ['vicentia'],
        catchRate: 140,
        expYield: 78
    },
    {
        id: 21,
        slug: 'parmageddon',
        name: 'Parmageddon',
        type: ['terra'],
        description: 'Il re dei formaggi. Può devastare con il suo potere caseario!',
        sprite: '🧀',
        baseStats: { hp: 95, attack: 85, defense: 110, spAtk: 70, spDef: 100, speed: 45 },
        moves: ['terremoto', 'polentata', 'difesa', 'lancio'],
        evolution: null,
        learnset: { 38: 'polentata' },
        wildLocation: [],
        catchRate: 65,
        expYield: 195
    },
    {
        id: 22,
        slug: 'vespolo',
        name: 'Vespolo',
        type: ['elettrico'],
        description: 'Veloce come una Vespa, corre per le strade di Venetia.',
        sprite: '🏍️',
        baseStats: { hp: 40, attack: 45, defense: 35, spAtk: 55, spDef: 40, speed: 90 },
        moves: ['scossa', 'azionata', 'velocità'],
        evolution: { evolvesTo: 'vespatron', level: 25 },
        learnset: { 12: 'scarica' },
        wildLocation: ['canalborgo', 'padovana', 'veronara'],
        catchRate: 150,
        expYield: 68
    },
    {
        id: 23,
        slug: 'vespatron',
        name: 'Vespatron',
        type: ['elettrico'],
        description: 'Il signore delle due ruote. Nessuno può superarlo in velocità!',
        sprite: '🏍️',
        baseStats: { hp: 65, attack: 70, defense: 55, spAtk: 90, spDef: 60, speed: 120 },
        moves: ['scarica', 'azionata', 'velocità', 'vespatron'],
        evolution: null,
        learnset: { 32: 'vespatron' },
        wildLocation: [],
        catchRate: 70,
        expYield: 175
    },
    {
        id: 24,
        slug: 'mascarin',
        name: 'Mascarin',
        type: ['psico'],
        description: 'Porta una maschera veneziana. Nessuno ha mai visto il suo vero volto.',
        sprite: '🎭',
        baseStats: { hp: 55, attack: 40, defense: 50, spAtk: 75, spDef: 65, speed: 60 },
        moves: ['confusione', 'azionata', 'cura'],
        evolution: { evolvesTo: 'mascarion', level: 28 },
        learnset: { 14: 'maschera' },
        wildLocation: ['canalborgo', 'spritzia'],
        catchRate: 130,
        expYield: 75
    },
    {
        id: 25,
        slug: 'mascarion',
        name: 'Mascarion',
        type: ['psico'],
        description: 'Il mistero vivente del Carnevale. I suoi poteri psichici sono immensi.',
        sprite: '🎭',
        baseStats: { hp: 80, attack: 60, defense: 70, spAtk: 110, spDef: 90, speed: 80 },
        moves: ['maschera', 'confusione', 'cura', 'serenissima'],
        evolution: null,
        learnset: { 36: 'serenissima' },
        wildLocation: [],
        catchRate: 60,
        expYield: 185
    },
    {
        id: 26,
        slug: 'tiramisu',
        name: 'Tiramisu',
        type: ['dolce'],
        description: 'Nato nelle cucine venete. Porta gioia ovunque vada.',
        sprite: '🍰',
        baseStats: { hp: 60, attack: 45, defense: 55, spAtk: 70, spDef: 60, speed: 50 },
        moves: ['dolcezza', 'azionata', 'cura'],
        evolution: { evolvesTo: 'tiramisuper', level: 30 },
        learnset: { 16: 'tiramisu' },
        wildLocation: ['trevisella', 'padovana'],
        catchRate: 140,
        expYield: 72
    },
    {
        id: 27,
        slug: 'tiramisuper',
        name: 'Tiramisuper',
        type: ['dolce', 'psico'],
        description: 'La dolcezza perfetta. Chi lo assaggia si sente invincibile!',
        sprite: '🎂',
        baseStats: { hp: 90, attack: 70, defense: 80, spAtk: 100, spDef: 85, speed: 70 },
        moves: ['tiramisu', 'dolcezza', 'cura', 'maschera'],
        evolution: null,
        learnset: { 38: 'serenissima' },
        wildLocation: [],
        catchRate: 65,
        expYield: 190
    },
    {
        id: 28,
        slug: 'nebbiolo',
        name: 'Nebbiolo',
        type: ['veleno'],
        description: 'Vive nella nebbia della pianura padana. É quasi invisibile.',
        sprite: '🌫️',
        baseStats: { hp: 50, attack: 55, defense: 50, spAtk: 65, spDef: 60, speed: 55 },
        moves: ['smog', 'azionata', 'nebbia'],
        evolution: null,
        learnset: { 18: 'nebbia' },
        wildLocation: ['padovana', 'trevisella'],
        catchRate: 130,
        expYield: 70
    },
    {
        id: 29,
        slug: 'colombix',
        name: 'Colombix',
        type: ['aria'],
        description: 'Una colomba pacifica che porta fortuna ai viaggiatori.',
        sprite: '🕊️',
        baseStats: { hp: 45, attack: 40, defense: 45, spAtk: 60, spDef: 55, speed: 75 },
        moves: ['ventata', 'cura', 'velocità'],
        evolution: null,
        learnset: { 15: 'bufera' },
        wildLocation: ['canalborgo', 'vicentia', 'trevisella'],
        catchRate: 160,
        expYield: 62
    },
    {
        id: 30,
        slug: 'nevelet',
        name: 'Nevelet',
        type: ['ghiaccio'],
        description: 'Nato dalla neve delle Dolomiti. Ama il freddo.',
        sprite: '❄️',
        baseStats: { hp: 50, attack: 55, defense: 55, spAtk: 60, spDef: 55, speed: 55 },
        moves: ['brina', 'azionata', 'difesa'],
        evolution: { evolvesTo: 'dolomor', level: 28 },
        learnset: { 14: 'ghiacciata' },
        wildLocation: ['dolomax'],
        catchRate: 140,
        expYield: 72
    },
    {
        id: 31,
        slug: 'dolomor',
        name: 'Dolomor',
        type: ['ghiaccio', 'terra'],
        description: 'Lo spirito delle Dolomiti. Le sue montagne sono eterne.',
        sprite: '🏔️',
        baseStats: { hp: 85, attack: 80, defense: 95, spAtk: 85, spDef: 90, speed: 50 },
        moves: ['ghiacciata', 'terremoto', 'difesa', 'dolomiti'],
        evolution: null,
        learnset: { 36: 'dolomiti' },
        wildLocation: [],
        catchRate: 60,
        expYield: 188
    },
    {
        id: 32,
        slug: 'vignel',
        name: 'Vignel',
        type: ['natura'],
        description: 'Vive tra i vigneti del Veneto. Ama il sole.',
        sprite: '🍇',
        baseStats: { hp: 50, attack: 50, defense: 45, spAtk: 65, spDef: 50, speed: 55 },
        moves: ['frustata', 'azionata', 'cura'],
        evolution: { evolvesTo: 'vignarbor', level: 22 },
        learnset: { 12: 'fogliame' },
        wildLocation: ['trevisella', 'vicentia'],
        catchRate: 150,
        expYield: 65
    },
    {
        id: 33,
        slug: 'vignarbor',
        name: 'Vignarbor',
        type: ['natura'],
        description: 'Un albero di vite animato. Produce uva speciale.',
        sprite: '🌳',
        baseStats: { hp: 80, attack: 70, defense: 75, spAtk: 90, spDef: 70, speed: 50 },
        moves: ['fogliame', 'frustata', 'cura', 'radicchio'],
        evolution: null,
        learnset: { 30: 'radicchio' },
        wildLocation: [],
        catchRate: 75,
        expYield: 168
    },
    {
        id: 34,
        slug: 'lagorino',
        name: 'Lagorino',
        type: ['acqua'],
        description: 'Un piccolo spirito del lago di Garda.',
        sprite: '🐠',
        baseStats: { hp: 45, attack: 45, defense: 50, spAtk: 60, spDef: 55, speed: 65 },
        moves: ['schizzo', 'azionata', 'cura'],
        evolution: null,
        learnset: { 16: 'onda_canal' },
        wildLocation: ['gardalago'],
        catchRate: 160,
        expYield: 68
    },
    {
        id: 35,
        slug: 'smogatto',
        name: 'Smogatto',
        type: ['veleno', 'aria'],
        description: 'Un gatto di città che vive tra i tetti e lo smog.',
        sprite: '🐱',
        baseStats: { hp: 55, attack: 60, defense: 45, spAtk: 65, spDef: 50, speed: 80 },
        moves: ['smog', 'ventata', 'morso'],
        evolution: null,
        learnset: { 18: 'nebbia' },
        wildLocation: ['padovana', 'veronara'],
        catchRate: 130,
        expYield: 72
    },
    
    // ===== LEGENDARY BESTI =====
    {
        id: 100,
        slug: 'dolomitor',
        name: 'Dolomitor',
        type: ['ghiaccio', 'terra'],
        description: 'Il guardiano leggendario delle Dolomiti. Il suo potere è antico.',
        sprite: '🏔️',
        baseStats: { hp: 110, attack: 100, defense: 120, spAtk: 90, spDef: 110, speed: 70 },
        moves: ['dolomiti', 'terremoto', 'ghiacciata', 'polentata'],
        evolution: null,
        learnset: {},
        wildLocation: ['dolomax_cave'],
        catchRate: 3,
        expYield: 340,
        legendary: true
    },
    {
        id: 101,
        slug: 'lagorion',
        name: 'Lagorion',
        type: ['acqua', 'psico'],
        description: 'Lo spirito leggendario del lago di Garda. Protegge le acque.',
        sprite: '🌊',
        baseStats: { hp: 100, attack: 80, defense: 90, spAtk: 120, spDef: 110, speed: 90 },
        moves: ['marea', 'serenissima', 'onda_canal', 'maschera'],
        evolution: null,
        learnset: {},
        wildLocation: ['gardalago_deep'],
        catchRate: 3,
        expYield: 340,
        legendary: true
    },
    {
        id: 102,
        slug: 'serenissima_legend',
        name: 'Serenissima',
        type: ['aria', 'psico'],
        description: 'Lo spirito antico di Venezia. Il suo potere è sconfinato.',
        sprite: '👑',
        baseStats: { hp: 105, attack: 85, defense: 95, spAtk: 130, spDef: 115, speed: 100 },
        moves: ['serenissima', 'bora', 'maschera', 'cura'],
        evolution: null,
        learnset: {},
        wildLocation: ['canalborgo_palace'],
        catchRate: 3,
        expYield: 340,
        legendary: true
    }
];

// ==================== MAPS ====================
const MAPS = {
    // ===== STARTER TOWN =====
    canalborgo: {
        id: 'canalborgo',
        name: 'Canalborgo',
        description: 'Un piccolo villaggio con canali e barche colorate.',
        type: 'town',
        width: 30,
        height: 25,
        tiles: null, // Generated
        npcs: [
            {
                id: 'prof_barcaro',
                name: 'Prof. Barcaro',
                sprite: 'oldman',
                x: 15,
                y: 8,
                facing: 'down',
                role: 'professor',
                dialog: {
                    initial: "Benvenuto a Canalborgo!\nIo sono il Professor Barcaro.\nStudio le creature chiamate Besti.\n\nQueste creature vivono in tutta\nla regione di Venetia.\n\nVuoi diventare un Allenatore\ndi Besti? Allora scegli la tua\nprima compagna!",
                    post_starter: "Ottima scelta!\nLa tua Besti sarà un'amica fedele.\n\nParla con mia nipote Lucia\nper avere qualche consiglio.",
                    generic: "Le Besti sono creature meravigliose.\nTrattale sempre con rispetto!"
                }
            },
            {
                id: 'lucia',
                name: 'Lucia',
                sprite: 'girl',
                x: 8,
                y: 12,
                facing: 'right',
                role: 'npc',
                dialog: {
                    initial: "Ciao! Sono Lucia, la nipote\ndel professore.\n\nTi do un consiglio: esplora\nl'erba alta per trovare Besti\nselvatiche!\n\nMa stai attento, alcune sono\nmolto forti.",
                    generic: "L'erba alta è piena di sorprese!\nPorta sempre delle Bestiball\ncon te."
                }
            },
            {
                id: 'mamma',
                name: 'Mamma',
                sprite: 'woman',
                x: 5,
                y: 5,
                facing: 'down',
                role: 'heal',
                dialog: {
                    initial: "Oh, tesoro! Sei pronto per\nil tuo viaggio?\n\nLascia che curi le tue Besti\nprima di partire!",
                    heal: "Ecco fatto! Le tue Besti\nsono tutte guarite.\n\nRicordati di tornare quando\nhai bisogno di riposo!",
                    generic: "Torna quando vuoi, tesoro!\nLa porta di casa è sempre aperta."
                }
            },
            {
                id: 'gondoliere',
                name: 'Gondoliere Mario',
                sprite: 'sailor',
                x: 25,
                y: 18,
                facing: 'up',
                role: 'npc',
                dialog: {
                    initial: "Ahò! Sono Mario, il gondoliere.\nVuoi attraversare il canale?\n\nC'è una Besti che mi ha rubato\nil cappello! Se me lo ritrovi,\nti porto gratis ovunque!",
                    quest_complete: "Grazie mille! Ecco il mio\ncappello! Ti porto a Spritzia\nquando vuoi!",
                    generic: "I canali di Venetia sono belli,\nma attenzione alle Besti d'acqua!"
                }
            }
        ],
        encounters: ['gabbianzo', 'gondolo', 'colombix'],
        encounterRate: 0.05,
        connections: {
            north: { map: 'spritzia_path', x: 15, y: 23 },
            east: { map: 'canalborgo_port', x: 1, y: 18 }
        },
        poi: [
            { id: 'lab', name: 'Laboratorio', x: 14, y: 6, width: 4, height: 4 },
            { id: 'player_home', name: 'Casa', x: 4, y: 3, width: 3, height: 3 },
            { id: 'port', name: 'Porto', x: 24, y: 16, width: 4, height: 6 }
        ],
        music: 'town'
    },
    
    // ===== FIRST CITY =====
    spritzia: {
        id: 'spritzia',
        name: 'Spritzia',
        description: 'La città degli aperitivi e delle piazze animate.',
        type: 'city',
        width: 40,
        height: 35,
        tiles: null,
        npcs: [
            {
                id: 'bepi',
                name: 'Bepi lo Spritzaro',
                sprite: 'bartender',
                x: 20,
                y: 20,
                facing: 'down',
                role: 'gym_leader',
                gymType: 'acqua',
                badge: 'Badge Aperitivo',
                team: [
                    { slug: 'gondolo', level: 12 },
                    { slug: 'spritzino', level: 14 }
                ],
                dialog: {
                    before: "Benvenuto alla mia palestra!\nSono Bepi, il maestro dell'acqua!\n\nCome lo Spritz che miscolo\ncon maestria, così domino\nle Besti d'acqua!\n\nVuoi sfidarmi? Vediamo\nse sei all'altezza!",
                    win: "Ah! Mi hai battuto!\nSei forte come un Aperol!\n\nEcco il Badge Aperitivo!\nÈ tuo, te lo sei meritato!",
                    post: "Con questo badge, le Besti\nfino al livello 30 ti obbediranno.\n\nTorna quando vuoi per\nun altro aperitivo... ehmm,\nvoglio dire, battaglia!"
                }
            },
            {
                id: 'barista',
                name: 'Barista Anna',
                sprite: 'woman',
                x: 35,
                y: 15,
                facing: 'left',
                role: 'shop',
                shopType: 'items',
                dialog: {
                    initial: "Benvenuto al Bar Veneto!\nVuoi comprare qualcosa?",
                    generic: "Torno quando vuoi!\nLo Spritz è sempre pronto!"
                }
            }
        ],
        encounters: ['gabbianzo', 'spritzino', 'gondolo'],
        encounterRate: 0.04,
        connections: {
            south: { map: 'canalborgo', x: 15, y: 1 },
            north: { map: 'padovana_path', x: 20, y: 33 }
        },
        buildings: [
            { id: 'gym', name: 'Palestra Spritzia', x: 18, y: 18, width: 6, height: 6 },
            { id: 'pokemon_center', name: 'Centro Besti', x: 5, y: 5, width: 4, height: 3 },
            { id: 'shop', name: 'Negozio', x: 33, y: 13, width: 3, height: 3 }
        ],
        music: 'city'
    },
    
    // ===== SECOND CITY =====
    veronara: {
        id: 'veronara',
        name: 'Veronara',
        description: 'La città romantica con l\'Arena per combattimenti leggendari.',
        type: 'city',
        width: 40,
        height: 35,
        tiles: null,
        npcs: [
            {
                id: 'giuliano',
                name: 'Giuliano',
                sprite: 'fighter',
                x: 20,
                y: 20,
                facing: 'down',
                role: 'gym_leader',
                gymType: 'lotta',
                badge: 'Badge Arena',
                team: [
                    { slug: 'salamin', level: 18 },
                    { slug: 'salamastro', level: 22 }
                ],
                dialog: {
                    before: "Sono Giuliano, il gladiatore\ndell'Arena!\n\nCome i miei antenati che\ncombattevano qui, io lotto\ncon onore e forza!\n\nPreparati a una battaglia\nda ricordare!",
                    win: "Per Giove! Sei forte!\nHai lo spirito di un vero\nlottatore!\n\nIl Badge Arena è tuo!",
                    post: "L'Arena ricorderà per sempre\nla nostra battaglia!\nContinua ad allenarti!"
                }
            }
        ],
        encounters: ['vespolo', 'salamin', 'smogatto'],
        encounterRate: 0.04,
        connections: {
            south: { map: 'padovana', x: 20, y: 1 },
            west: { map: 'vicentia', x: 38, y: 17 }
        },
        buildings: [
            { id: 'arena', name: 'Arena', x: 18, y: 18, width: 8, height: 6 },
            { id: 'pokemon_center', name: 'Centro Besti', x: 5, y: 5, width: 4, height: 3 }
        ],
        music: 'arena'
    },
    
    // ===== THIRD CITY =====
    padovana: {
        id: 'padovana',
        name: 'Padovana',
        description: 'La città universitaria con il laboratorio avanzato delle Besti.',
        type: 'city',
        width: 40,
        height: 35,
        tiles: null,
        npcs: [
            {
                id: 'alma',
                name: 'Prof.ssa Alma',
                sprite: 'scientist',
                x: 20,
                y: 12,
                facing: 'down',
                role: 'gym_leader',
                gymType: 'psico',
                badge: 'Badge Sapienza',
                team: [
                    { slug: 'mascarin', level: 24 },
                    { slug: 'nebbiolo', level: 22 },
                    { slug: 'mascarion', level: 26 }
                ],
                dialog: {
                    before: "Sono la Professoressa Alma.\nStudio le Besti da anni.\n\nIl potere della mente\nsupera ogni forza fisica!\n\nDimostrami che il tuo\nintelletto è all'altezza!",
                    win: "Intrigante... Hai una mente\naffilata come la mia!\n\nIl Badge Sapienza è tuo!",
                    post: "Continua a studiare le Besti.\nOgni creatura ha segreti\nda scoprire!"
                }
            }
        ],
        encounters: ['vespolo', 'nebbiolo', 'polentel', 'tiramisu'],
        encounterRate: 0.04,
        connections: {
            south: { map: 'spritzia', x: 20, y: 1 },
            north: { map: 'veronara', x: 20, y: 33 },
            west: { map: 'vicentia_path', x: 38, y: 17 }
        },
        buildings: [
            { id: 'university', name: 'Università', x: 18, y: 10, width: 6, height: 5 },
            { id: 'lab', name: 'Laboratorio Avanzato', x: 25, y: 10, width: 4, height: 4 },
            { id: 'pokemon_center', name: 'Centro Besti', x: 5, y: 5, width: 4, height: 3 }
        ],
        music: 'academic'
    },
    
    // ===== FOURTH CITY =====
    vicentia: {
        id: 'vicentia',
        name: 'Vicentia',
        description: 'La città elegante con palazzi progettati dal grande Palladio.',
        type: 'city',
        width: 40,
        height: 35,
        tiles: null,
        npcs: [
            {
                id: 'palladio',
                name: 'Conte Palladio',
                sprite: 'noble',
                x: 20,
                y: 18,
                facing: 'down',
                role: 'gym_leader',
                gymType: 'terra',
                badge: 'Badge Palazzo',
                team: [
                    { slug: 'polentel', level: 28 },
                    { slug: 'formaggion', level: 30 },
                    { slug: 'polentaur', level: 32 }
                ],
                dialog: {
                    before: "Sono il Conte Palladio.\nCome i miei palazzi, le mie\nBesti sono solidi e duraturi.\n\nLa terra è la base di tutto!\nProvami che puoi scalfire\nle mie difese!",
                    win: "Notevole! La tua determinazione\nha scosso le mie fondamenta!\n\nIl Badge Palazzo è tuo!",
                    post: "La bellezza sta nella forza.\nContinua a costruire il tuo\nfuturo con solidità!"
                }
            }
        ],
        encounters: ['vignel', 'formaggion', 'salamin'],
        encounterRate: 0.04,
        connections: {
            east: { map: 'veronara', x: 1, y: 17 },
            south: { map: 'padovana', x: 20, y: 33 }
        },
        buildings: [
            { id: 'villa', name: 'Villa Palladio', x: 18, y: 16, width: 6, height: 6 },
            { id: 'pokemon_center', name: 'Centro Besti', x: 5, y: 5, width: 4, height: 3 }
        ],
        music: 'elegant'
    },
    
    // ===== FIFTH CITY =====
    trevisella: {
        id: 'trevisella',
        name: 'Trevisella',
        description: 'La città tranquilla circondata da campagne e fiumi.',
        type: 'city',
        width: 35,
        height: 30,
        tiles: null,
        npcs: [
            {
                id: 'nonna_gina',
                name: 'Nonna Gina',
                sprite: 'grandma',
                x: 18,
                y: 15,
                facing: 'down',
                role: 'gym_leader',
                gymType: 'natura',
                badge: 'Badge Campagna',
                team: [
                    { slug: 'vignel', level: 26 },
                    { slug: 'tiramisu', level: 28 },
                    { slug: 'vignarbor', level: 30 }
                ],
                dialog: {
                    before: "Oh, che carino!\nVuoi battere questa povera\nvecchietta?\n\nLe mie Besti sono come i miei\nnipoti: li cresco con amore\ne sono molto forti!\n\nForza, vediamo cosa sai fare!",
                    win: "Bravo, bravo!\nMi hai battuta onestamente!\n\nIl Badge Campagna è tuo,\ntesoro!",
                    post: "Torna a trovarmi, ti preparo\nla polenta! E già che ci sei,\nallenati ancora!"
                }
            }
        ],
        encounters: ['vignel', 'radicor', 'polentel', 'tiramisu'],
        encounterRate: 0.05,
        connections: {
            east: { map: 'padovana', x: 1, y: 15 }
        },
        buildings: [
            { id: 'house', name: 'Casa della Nonna', x: 16, y: 13, width: 5, height: 5 },
            { id: 'pokemon_center', name: 'Centro Besti', x: 5, y: 5, width: 4, height: 3 }
        ],
        music: 'peaceful'
    },
    
    // ===== MOUNTAIN AREA =====
    dolomax: {
        id: 'dolomax',
        name: 'Dolomax',
        description: 'Le montagne maestose dove vivono Besti di ghiaccio.',
        type: 'dungeon',
        width: 50,
        height: 40,
        tiles: null,
        npcs: [
            {
                id: 'mountain_guide',
                name: 'Guida Alpina',
                sprite: 'hiker',
                x: 25,
                y: 35,
                facing: 'up',
                role: 'npc',
                dialog: {
                    initial: "Attenzione, escursionista!\nLe Dolomiti sono pericolose.\n\nLe Besti di ghiaccio qui\nsono molto forti.\n\nPrendi questo: ti servirà!",
                    give_item: { item: 'anti_gelo', qty: 3 },
                    generic: "Il freddo è il tuo nemico,\nma anche la tua arma!\nUsa Besti di ghiaccio!"
                }
            }
        ],
        encounters: ['nevelet', 'dolomor', 'colombix'],
        encounterRate: 0.08,
        connections: {
            south: { map: 'vicentia', x: 25, y: 38 }
        },
        legendary: 'dolomitor',
        music: 'mountain'
    },
    
    // ===== LAKE AREA =====
    gardalago: {
        id: 'gardalago',
        name: 'Gardalago',
        description: 'Il maestoso lago di Garda, casa di Besti acquatici.',
        type: 'water',
        width: 45,
        height: 35,
        tiles: null,
        npcs: [
            {
                id: 'fisherman',
                name: 'Pescatore Toni',
                sprite: 'fisherman',
                x: 10,
                y: 20,
                facing: 'right',
                role: 'npc',
                dialog: {
                    initial: "Ah, la pesca! Il mio sport\npreferito.\n\nHo visto una Besti enorme\nnel mezzo del lago.\n\nDicono sia un leggendario...",
                    generic: "Il lago nasconde molti segreti.\nPescare qui è magico!"
                }
            }
        ],
        encounters: ['gondolo', 'lagorino', 'gabbianzo', 'spritzino'],
        encounterRate: 0.06,
        connections: {
            north: { map: 'dolomax', x: 22, y: 1 }
        },
        legendary: 'lagorion',
        music: 'lake'
    },
    
    // ===== ENEMY HQ =====
    polenta_castle: {
        id: 'polenta_castle',
        name: 'Castello della Polenta',
        description: 'Il quartier generale della Compagnia della Polenta.',
        type: 'dungeon',
        width: 40,
        height: 40,
        tiles: null,
        npcs: [
            {
                id: 'nando',
                name: 'Nando il Tassista',
                sprite: 'driver',
                x: 15,
                y: 20,
                facing: 'down',
                role: 'admin',
                team: [
                    { slug: 'vespolo', level: 35 },
                    { slug: 'vespatron', level: 38 },
                    { slug: 'smogatto', level: 36 }
                ],
                dialog: {
                    before: "Ahò! Dove credi di andare?\nIo guido qui!\n\nLa Compagnia della Polenta\ndomina queste terre!\n\nPreparati, ti porto per\nuna strada che non ti piace!",
                    win: "Ma che...! Mi hai fregato!\nNon sei un turista qualsiasi!\n\nIl Doge ti aspetta...\nMa non sarà facile!"
                }
            },
            {
                id: 'toni',
                name: 'Toni il Turista',
                sprite: 'tourist',
                x: 25,
                y: 20,
                facing: 'down',
                role: 'admin',
                team: [
                    { slug: 'gabbianzo', level: 34 },
                    { slug: 'colombix', level: 35 },
                    { slug: 'gabbianator', level: 37 }
                ],
                dialog: {
                    before: "Scusa, dov'è l'uscita?\nScherzavo! Non esci vivo!\n\nSono Toni, e mi sono perso\nqui dentro anni fa!\n\nOra lavoro per il Doge!\nPreparati a perdere!",
                    win: "Va bene, va bene!\nMi arrendo!\n\nL'uscita è a destra...\nOps, no, a sinistra!"
                }
            },
            {
                id: 'chiara',
                name: 'Chiara l\'Influencer',
                sprite: 'influencer',
                x: 20,
                y: 30,
                facing: 'down',
                role: 'admin',
                team: [
                    { slug: 'mascarin', level: 38 },
                    { slug: 'spritzilla', level: 40 },
                    { slug: 'mascarion', level: 42 }
                ],
                dialog: {
                    before: "Ciao bell*! Mi stai seguendo?\n\nHo 3 milioni di follower\nche guarderanno la tua\nsconfitta!\n\n#TeamPolenta per sempre!\n#SconfittaImminente!",
                    win: "No! I miei like stanno\ncrollando!\n\nUnfollow per tutti!\nMa il Doge ti distruggerà!"
                }
            },
            {
                id: 'gigi',
                name: 'Gigi lo Spritzaro',
                sprite: 'bartender',
                x: 30,
                y: 30,
                facing: 'down',
                role: 'admin',
                team: [
                    { slug: 'spritzino', level: 36 },
                    { slug: 'gondolo', level: 38 },
                    { slug: 'spritzilla', level: 41 }
                ],
                dialog: {
                    before: "Cosa prendi? Uno Spritz?\nNo, ti do una batosta!\n\nLavoro per il Doge ora!\nLa polenta è il mio nuovo\ningrediente segreto!\n\nBrindiamo alla tua fine!",
                    win: "Hic! Mi hai fatto girare\nla testa!\n\nIl Doge è nella sala del\ntrono... In bocca al lupo!"
                }
            },
            {
                id: 'doge',
                name: 'Il Doge della Polenta',
                sprite: 'king',
                x: 20,
                y: 38,
                facing: 'down',
                role: 'boss',
                team: [
                    { slug: 'polentaur', level: 45 },
                    { slug: 'parmageddon', level: 47 },
                    { slug: 'spritzilla', level: 46 },
                    { slug: 'gondrago', level: 48 },
                    { slug: 'dolomor', level: 50 }
                ],
                dialog: {
                    before: "Ah, il giovane che ha osato\nsfidare la Compagnia!\n\nIo sono il Doge della Polenta!\nCon il mio esercito di Besti\ndominerò Venetia!\n\nLa polenta sarà l'unico\ncibo, lo Spritz l'unica\nbevanda!\n\nNessuno può fermarmi!\nNemmeno tu!\n\nPreparati a conoscere\nil vero potere!",
                    win: "IMPOSSIBILE!\n\nCome hai potuto battermi?\nIo sono il DOGE!\n\n...Forse la polenta non\nera la risposta.\n\nVa bene, mi arrendo.\nLa Compagnia della Polenta\nè sciolta.\n\nSei il nuovo campione\ndi Venetia!\n\nIl tuo nome sarà ricordato\nper sempre!\n\nMa ricorda: la vera vittoria\nnon è battere gli altri,\nma aiutarli a crescere.\n\nAddio, campione."
                }
            }
        ],
        encounters: [],
        encounterRate: 0,
        connections: {
            south: { map: 'veronara', x: 20, y: 38 }
        },
        music: 'boss'
    }
};

// ==================== ITEMS ====================
const ITEMS = {
    // Balls
    bestiball: { 
        id: 'bestiball', 
        name: 'Bestiball', 
        type: 'ball', 
        price: 200, 
        catchRate: 1.0,
        desc: 'Una sfera per catturare Besti selvatiche.'
    },
    superball: { 
        id: 'superball', 
        name: 'Superball', 
        type: 'ball', 
        price: 600, 
        catchRate: 1.5,
        desc: 'Una Bestiball migliorata. Cattura più facilmente.'
    },
    iperball: { 
        id: 'iperball', 
        name: 'Iperball', 
        type: 'ball', 
        price: 1200, 
        catchRate: 2.0,
        desc: 'La migliore sfera per catturare Besti.'
    },
    
    // Healing
    pozione: { 
        id: 'pozione', 
        name: 'Pozione', 
        type: 'heal', 
        price: 300, 
        healAmount: 20,
        desc: 'Recupera 20 HP di una Bestia.'
    },
    superpozione: { 
        id: 'superpozione', 
        name: 'Superpozione', 
        type: 'heal', 
        price: 700, 
        healAmount: 50,
        desc: 'Recupera 50 HP di una Bestia.'
    },
    iperpozione: { 
        id: 'iperpozione', 
        name: 'Iperpozione', 
        type: 'heal', 
        price: 1200, 
        healAmount: 120,
        desc: 'Recupera 120 HP di una Bestia.'
    },
    cura_totale: { 
        id: 'cura_totale', 
        name: 'Cura Totale', 
        type: 'full_heal', 
        price: 600,
        desc: 'Cura tutti i problemi di stato.'
    },
    restaura: { 
        id: 'restaura', 
        name: 'Restaura', 
        type: 'revive', 
        price: 1500, 
        healPercent: 50,
        desc: 'Riporta in vita una Bestia KO con metà HP.'
    },
    
    // Status
    anti_gelo: { 
        id: 'anti_gelo', 
        name: 'Anti-Gelo', 
        type: 'status', 
        price: 250,
        status: 'freeze',
        desc: 'Cura lo stato congelato.'
    },
    anti_veleno: { 
        id: 'anti_veleno', 
        name: 'Anti-Veleno', 
        type: 'status', 
        price: 250,
        status: 'poison',
        desc: 'Cura lo stato avvelenato.'
    },
    
    // Battle
    elisir: { 
        id: 'elisir', 
        name: 'Elisir', 
        type: 'pp', 
        price: 500,
        ppRestore: 10,
        desc: 'Recupera 10 PP di una mossa.'
    },
    
    // Special
    polenta_doro: { 
        id: 'polenta_doro', 
        name: 'Polenta d\'Oro', 
        type: 'key', 
        price: 0,
        desc: 'Una polenta speciale. Chi sa cosa fa?'
    },
    chiave_castello: { 
        id: 'chiave_castello', 
        name: 'Chiave del Castello', 
        type: 'key', 
        price: 0,
        desc: 'Apre le porte del Castello della Polenta.'
    }
};

// ==================== STORY EVENTS ====================
const STORY_EVENTS = {
    game_start: {
        id: 'game_start',
        trigger: 'new_game',
        actions: [
            { type: 'teleport', map: 'canalborgo', x: 15, y: 15 },
            { type: 'dialog', speaker: '???', text: '...' },
            { type: 'dialog', speaker: 'Mamma', text: 'Sveglia! È tardissimo!\nIl Professor Barcaro ti aspetta!\n\nCorri al laboratorio!' }
        ]
    },
    choose_starter: {
        id: 'choose_starter',
        trigger: 'talk_professor',
        condition: { not_has_starter: true },
        actions: [
            { type: 'show_starter_selection' }
        ]
    },
    first_battle: {
        id: 'first_battle',
        trigger: 'after_starter',
        actions: [
            { type: 'dialog', speaker: 'Rivale', text: 'Ehi! Hai scelto la tua Bestia?\nFacciamo una battaglia!\nDevo testare la mia!' },
            { type: 'battle', trainer: 'rival_1' }
        ]
    },
    encounter_polenta: {
        id: 'encounter_polenta',
        trigger: 'map_enter',
        condition: { map: 'spritzia', first_time: true },
        actions: [
            { type: 'dialog', speaker: 'Membro Polenta', text: 'Fermati!\nQuesta città ora appartiene\nalla Compagnia della Polenta!' },
            { type: 'battle', trainer: 'grunt_1' },
            { type: 'dialog', speaker: 'Membro Polenta', text: 'Grr! Il Doge lo saprà!\nCi rivedremo!' }
        ]
    }
};

// ==================== TRAINERS ====================
const TRAINERS = {
    rival_1: {
        id: 'rival_1',
        name: 'Rivale',
        type: 'rival',
        team: [
            { slug: 'gabbianzo', level: 5 }
        ],
        money: 100,
        dialog: {
            before: 'La mia Bestia è la più forte!',
            win: 'Wow! Sei fortissimo!\nDevo allenarmi ancora!',
            after: 'Ti batterò la prossima volta!'
        }
    },
    grunt_1: {
        id: 'grunt_1',
        name: 'Recluta Polenta',
        type: 'grunt',
        team: [
            { slug: 'polentel', level: 10 },
            { slug: 'gabbianzo', level: 8 }
        ],
        money: 200,
        dialog: {
            before: 'Per la Polenta!',
            win: 'Il Doge non sarà contento...',
            after: 'Ricordati di noi!'
        }
    }
};

// ==================== QUESTS ====================
const QUESTS = {
    gondoliere_hat: {
        id: 'gondoliere_hat',
        name: 'Il Cappello del Gondoliere',
        description: 'Mario ha perso il suo cappello. Trovalo!',
        giver: 'gondoliere',
        steps: [
            { type: 'find_item', item: 'cappello', map: 'canalborgo', x: 20, y: 10 },
            { type: 'return_to', npc: 'gondoliere' }
        ],
        rewards: [
            { type: 'item', item: 'superball', qty: 5 },
            { type: 'money', amount: 500 },
            { type: 'access', map: 'spritzia_fast' }
        ]
    },
    polenta_secret: {
        id: 'polenta_secret',
        name: 'Il Segreto della Polenta',
        description: 'Scopri il piano segreto della Compagnia.',
        giver: 'alma',
        steps: [
            { type: 'defeat', trainer: 'grunt_1' },
            { type: 'defeat', trainer: 'grunt_2' },
            { type: 'find_item', item: 'documento_segreto', map: 'padovana' },
            { type: 'return_to', npc: 'alma' }
        ],
        rewards: [
            { type: 'item', item: 'chiave_castello', qty: 1 },
            { type: 'exp', amount: 500 }
        ]
    }
};

// ==================== TILES ====================
const TILE_TYPES = {
    grass: { walkable: true, encounter: false, sprite: 'grass' },
    tall_grass: { walkable: true, encounter: true, sprite: 'tall_grass' },
    water: { walkable: false, encounter: false, sprite: 'water' },
    path: { walkable: true, encounter: false, sprite: 'path' },
    wall: { walkable: false, encounter: false, sprite: 'wall' },
    door: { walkable: true, encounter: false, sprite: 'door', action: 'enter' },
    bridge: { walkable: true, encounter: false, sprite: 'bridge' },
    tree: { walkable: false, encounter: false, sprite: 'tree' },
    house: { walkable: false, encounter: false, sprite: 'house' },
    rock: { walkable: false, encounter: false, sprite: 'rock' },
    sand: { walkable: true, encounter: false, sprite: 'sand' },
    snow: { walkable: true, encounter: true, sprite: 'snow' },
    ice: { walkable: true, encounter: false, sprite: 'ice', slide: true }
};

// ==================== DIALOGUES ====================
const DIALOGUES = {
    sign_canalborgo: {
        text: 'BENVENUTI A CANALBORGO\nVillaggio dei Canali\n\n"Chi trova una Bestia,\ntrova un amico per sempre"'
    },
    sign_spritzia: {
        text: 'BENVENUTI A SPRITZIA\nCittà dell\'Aperitivo\n\n"Uno Spritz al giorno\ntoglie il medico di torno"\n...forse.'
    },
    random_npc_1: {
        text: 'Hai visto? C\'è uno Spritzino\nche gira per la piazza!\n\nÈ arancione e frizzante!'
    },
    random_npc_2: {
        text: 'Mia nonna dice che le Besti\nportano fortuna.\n\nIo dico che portano guai!'
    },
    random_npc_3: {
        text: 'La Compagnia della Polenta?\nMai sentita.\n\n...O forse sì? Boh!'
    }
};

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TYPES, MOVES, MONSTERS, MAPS, ITEMS, STORY_EVENTS, TRAINERS, QUESTS, TILE_TYPES, DIALOGUES };
}
