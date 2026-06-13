import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './public/images/games';

const GAMES = [
  {
    id: 'forza4',
    prompt: `minimalistic futuristic Connect Four game card, isometric view of glowing game board with 7 columns, 
      neon red and yellow circular discs stacked vertically, dark sci-fi background with purple ambient lighting, 
      ultra sharp 4k, cinematic lighting, gaming thumbnail style, professional game art, glass morphism UI, no text`
  },
  {
    id: 'briscola',
    prompt: `elegant Italian playing cards Briscola game card, traditional Trevigiane card design with ornate borders,
      gold coins cups swords clubs symbols, vintage parchment texture, dramatic lighting, 
      casino game aesthetic, premium game thumbnail, 4k ultra sharp, no text`
  },
  {
    id: 'uno',
    prompt: `vibrant UNO card game design, colorful red blue green yellow cards fanned out,
      modern gradient background with dynamic lighting, wild cards and action cards visible,
      party game aesthetic, gaming thumbnail style, 4k ultra sharp, no text`
  },
  {
    id: 'scopa',
    prompt: `classic Italian Scopa card game, traditional playing cards with denari coppe spade bastoni suits,
      golden coins scattered on green felt table, elegant Italian card game aesthetic,
      warm lighting, premium game thumbnail, 4k ultra sharp, no text`
  },
  {
    id: 'indovinachi',
    prompt: `mystery guessing game board, grid of character portrait silhouettes with question marks,
      magnifying glass detective theme, purple and teal neon lighting, dark mysterious background,
      board game aesthetic, gaming thumbnail style, 4k ultra sharp, no text`
  },
  {
    id: 'nomecitta',
    prompt: `creative word game concept, floating letters and categories like cities animals objects,
      notebook paper texture with handwritten Italian words, colorful ink splashes,
      brain game aesthetic, gaming thumbnail style, 4k ultra sharp, no text`
  },
  {
    id: 'dama',
    prompt: `elegant checkers Dama board game, black and white checkerboard with red and black pieces,
      wooden board with glossy pieces, dramatic side lighting, classic board game aesthetic,
      gaming thumbnail style, 4k ultra sharp, no text`
  },
  {
    id: 'mercanteinfiera',
    prompt: `vintage Italian carnival game, golden tickets and auction gavel, circus tent background,
      money coins and prize cards scattered, festive fairground aesthetic with warm lights,
      gambling game thumbnail style, 4k ultra sharp, no text`
  }
];

async function generateGameCard(gameId: string, prompt: string) {
  console.log(`🎨 Generating: ${gameId}-card.png`);
  console.log(`   Prompt: ${prompt.substring(0, 80)}...`);
  
  const zai = await ZAI.create();
  
  const response = await zai.images.generations.create({
    prompt: prompt,
    size: '1344x768' // Landscape for game cards
  });
  
  const imageBase64 = response.data[0].base64;
  const buffer = Buffer.from(imageBase64, 'base64');
  const outputPath = path.join(OUTPUT_DIR, `${gameId}-card.png`);
  
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Saved: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  
  return outputPath;
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  console.log('🎮 GameHub - Generating AI Game Card Images...\n');
  
  for (const game of GAMES) {
    try {
      await generateGameCard(game.id, game.prompt);
    } catch (error) {
      console.error(`❌ Failed to generate ${game.id}:`, error);
    }
  }
  
  console.log('\n🎉 All game cards generated!');
}

main().catch(console.error);
