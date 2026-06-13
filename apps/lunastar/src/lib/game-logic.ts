// ============= GAME LOGIC UTILITIES =============
import { randomBytes } from 'crypto'

export function genCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export function genPlayerId(): string {
  return 'player_' + randomBytes(6).toString('hex')
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const AVATARS = ['🦊', '🐱', '🐶', '🦁', '🐸', '🐵', '🦄', '🐻', '🐼', '🐨', '🦋', '🐙']

// ============= CARD DECKS =============
export const PUNCHLINES = [
  { id: 'p1', text: "E questo è il motivo per cui non mi invitate più.", category: 'dark' },
  { id: 'p2', text: "Il mio avvocato dice di non commentare.", category: 'dark' },
  { id: 'p3', text: "Nessuno ha riso. Era un funerale.", category: 'dark' },
  { id: 'p4', text: "Sono stato bandito da 5 stati e 3 continenti.", category: 'absurd' },
  { id: 'p5', text: "Gli alieni mi hanno rispedito indietro: 'No grazie'.", category: 'absurd' },
  { id: 'p6', text: "La NASA mi ha contattato per studi.", category: 'absurd' },
  { id: 'p7', text: "Ho creato una nuova terapia: l'evitamento.", category: 'surreal' },
  { id: 'p8', text: "Ora vivo in una realtà alternativa.", category: 'surreal' },
  { id: 'p9', text: "La mia famiglia mi ha diseredato. Due volte.", category: 'crude' },
  { id: 'p10', text: "Sono diventato la leggenda negativa del villaggio.", category: 'crude' },
  { id: 'p11', text: "Il mio video ha avuto 2 visualizzazioni: io e mia mamma.", category: 'normal' },
  { id: 'p12', text: "Ho deciso di non uscire mai più.", category: 'normal' },
  { id: 'p13', text: "Mi hanno dato un premio: 'Peggior decisione'.", category: 'normal' },
  { id: 'p14', text: "È finita su YouTube. 3 milioni di visualizzazioni di vergogna.", category: 'crude' },
  { id: 'p15', text: "La mia terapista ha iniziato a piangere. Per lei.", category: 'dark' },
  { id: 'p16', text: "Ho dovuto cambiare identità. Di nuovo.", category: 'surreal' },
  { id: 'p17', text: "Abbiamo scoperto di essere fratelli. A fine serata.", category: 'crude' },
  { id: 'p18', text: "Ha ottenuto la promozione. Io un avvocato.", category: 'dark' },
  { id: 'p19', text: "I bambini del quartiere mi chiamano 'quello strano'.", category: 'normal' },
  { id: 'p20', text: "Il museo degli errori ha una mia sezione dedicata.", category: 'surreal' },
  { id: 'p21', text: "Mia nonna ha smesso di parlarmi dopo quello.", category: 'dark' },
  { id: 'p22', text: "Il mio cane mi ha guardato con delusione.", category: 'normal' },
  { id: 'p23', text: "Sono stato licenziato via email. Dalla mia mamma.", category: 'absurd' },
  { id: 'p24', text: "Ora ho un file presso l'FBI.", category: 'surreal' },
  { id: 'p25', text: "Il mio ex ha sposato il mio avvocato.", category: 'crude' },
  { id: 'p26', text: "Sono diventato un meme. Uno di quelli brutti.", category: 'normal' },
  { id: 'p27', text: "Mi hanno chiesto di non tornare più.", category: 'dark' },
  { id: 'p28', text: "La polizia mi ha dato un passaggio a casa.", category: 'crude' },
  { id: 'p29', text: "Ho vinto il premio 'Peggior cliente dell'anno'.", category: 'normal' },
  { id: 'p30', text: "Il mio gatto è scappato di casa.", category: 'normal' },
  { id: 'p31', text: "Il mio pesce rosso è il mio unico amico.", category: 'normal' },
  { id: 'p32', text: "Ho pianto davanti a tutti al McDonald's.", category: 'normal' },
  { id: 'p33', text: "Il mio capo mi ha chiesto se stavo bene. Non stavo bene.", category: 'dark' },
  { id: 'p34', text: "Ho sbagliato stanza ed era una riunione di Alcolisti Anonimi.", category: 'absurd' },
  { id: 'p35', text: "Mi hanno confuso con il pony express.", category: 'absurd' },
]

export const SETUPS = [
  { id: 's1', text: "Il mio dottore mi ha detto che mi restano 6 mesi...", panel: 1 },
  { id: 's2', text: "...così ho sparato al dottore.", panel: 2 },
  { id: 's3', text: "La mia ex mi ha detto 'Spero tu muoia solo'...", panel: 1 },
  { id: 's4', text: "...così ho comprato biglietti per uno.", panel: 2 },
  { id: 's5', text: "Ho deciso di cambiare vita e diventare...", panel: 1 },
  { id: 's6', text: "...un avocado professionista.", panel: 2 },
  { id: 's7', text: "Il mio capo mi ha chiesto di andare oltre...", panel: 1 },
  { id: 's8', text: "...così ho attraversato il muro.", panel: 2 },
  { id: 's9', text: "Mi sono svegliato e tutto era fatto di...", panel: 1 },
  { id: 's10', text: "...formaggio cheddar.", panel: 2 },
  { id: 's11', text: "Il mio primo bacio è stato...", panel: 1 },
  { id: 's12', text: "...con mia cugina al matrimonio.", panel: 2 },
  { id: 's13', text: "Finalmente ho trovato l'amore della mia vita...", panel: 1 },
  { id: 's14', text: "...ma era un poster.", panel: 2 },
  { id: 's15', text: "Ho vinto alla lotteria!", panel: 1 },
  { id: 's16', text: "...nel sogno.", panel: 2 },
  { id: 's17', text: "Il mio gatto mi ha guardato e ha detto...", panel: 1 },
  { id: 's18', text: "...''Sei una delusione.''", panel: 2 },
  { id: 's19', text: "Sono entrato in unaSETUPSoteca...", panel: 1 },
  { id: 's20', text: "...e ho dimenticato perché.", panel: 2 },
]

export const PHRASES = [
  "Ero a letto quando improvvisamente...",
  "Il mio capo mi ha detto che...",
  "Non avrei mai pensato che...",
  "Il mio primo bacio è stato...",
  "Mia madre ha scoperto che...",
  "Al matrimonio ho visto...",
  "La cosa più imbarazzante che ho fatto è...",
  "Il mio ex mi ha mandato un messaggio che diceva...",
  "Ho raccontato a mia nonna che...",
  "Il mio medico mi ha consigliato di...",
  "La cosa più strana nel mio frigo è...",
  "Il mio vicino di casa pensa che io sia...",
  "Ho dovuto spiegare alla polizia che...",
  "Il mio appuntamento è finito quando...",
  "Ho scoperto che il mio animale domestico...",
]

export const QUESTIONS = [
  { question: "Qual è il segreto peggiore che hai mai detto?", correct: "Segreto" },
  { question: "Qual è la scusa più assurda che hai usato?", correct: "Scusa" },
  { question: "Cosa faresti con un milione di euro?", correct: "Soldi" },
  { question: "Qual è la tua abitudine più strana?", correct: "Abitudini" },
  { question: "Qual è la bugia più grande che hai detto?", correct: "Bugia" },
  { question: "Cosa fai di nascosto da tutti?", correct: "Segreto" },
]

export const MERCANTE_CARDS = [
  { id: 'm1', text: "Anello d'Oro", value: 100, emoji: "💍" },
  { id: 'm2', text: "Corona Reale", value: 150, emoji: "👑" },
  { id: 'm3', text: "Diamante Grosso", value: 200, emoji: "💎" },
  { id: 'm4', text: "Spada Magica", value: 80, emoji: "⚔️" },
  { id: 'm5', text: "Tappeto Volante", value: 120, emoji: "🧞" },
  { id: 'm6', text: "Pozione Segreta", value: 90, emoji: "🧪" },
  { id: 'm7', text: "Mappa del Tesoro", value: 180, emoji: "🗺️" },
  { id: 'm8', text: "Lampada Magica", value: 250, emoji: "🪔" },
  { id: 'm9', text: "Libro Antico", value: 70, emoji: "📖" },
  { id: 'm10', text: "Scettro del Potere", value: 300, emoji: "🔮" },
  { id: 'm11', text: "Pergamena Sacra", value: 110, emoji: "📜" },
  { id: 'm12', text: "Amuleto Protezione", value: 130, emoji: "🛡️" },
  { id: 'm13', text: "Cristallo Magico", value: 160, emoji: "💠" },
  { id: 'm14', text: "Tesoro Nascosto", value: 220, emoji: "💰" },
  { id: 'm15', text: "Pozione Amore", value: 85, emoji: "❤️" },
  { id: 'm16', text: "Piuma Fenice", value: 190, emoji: "🪶" },
]

// UNO Card colors and values
export const UNO_COLORS = ['red', 'blue', 'green', 'yellow'] as const
export const UNO_VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', '+2']
export const UNO_WILDS = ['wild', 'wild+4']

export function createUnoDeck() {
  const deck: any[] = []
  let id = 0
  
  // Add colored cards
  for (const color of UNO_COLORS) {
    // One 0 per color
    deck.push({ id: `u${id++}`, color, value: '0', type: 'number' })
    // Two of each 1-9, skip, reverse, +2 per color
    for (const value of UNO_VALUES.slice(1)) {
      deck.push({ id: `u${id++}`, color, value, type: value === 'skip' || value === 'reverse' || value === '+2' ? 'action' : 'number' })
      deck.push({ id: `u${id++}`, color, value, type: value === 'skip' || value === 'reverse' || value === '+2' ? 'action' : 'number' })
    }
  }
  
  // Add wild cards (4 of each)
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `u${id++}`, color: 'wild', value: 'wild', type: 'wild' })
    deck.push({ id: `u${id++}`, color: 'wild', value: 'wild+4', type: 'wild' })
  }
  
  return shuffle(deck)
}

export function canPlayUnoCard(card: any, topCard: any, currentColor: string): boolean {
  // Wild cards can always be played
  if (card.type === 'wild') return true
  
  // Match color or value
  if (card.color === currentColor) return true
  if (card.value === topCard.value) return true
  
  return false
}

export function getUnoCardColor(card: any): string {
  const colorMap: Record<string, string> = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-400',
    wild: 'bg-gradient-to-r from-red-500 via-yellow-400 to-green-500'
  }
  return colorMap[card.color] || 'bg-gray-500'
}
