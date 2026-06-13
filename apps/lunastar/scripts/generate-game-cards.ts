import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './public/images/games';

async function generateGameCard(prompt: string, filename: string) {
  console.log(`🎨 Generating: ${filename}`);
  console.log(`   Prompt: ${prompt.substring(0, 80)}...`);
  
  const zai = await ZAI.create();
  
  const response = await zai.images.generations.create({
    prompt: prompt,
    size: '1344x768' // Landscape for game cards
  });
  
  const imageBase64 = response.data[0].base64;
  const buffer = Buffer.from(imageBase64, 'base64');
  const outputPath = path.join(OUTPUT_DIR, filename);
  
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Saved: ${outputPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  
  return outputPath;
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  console.log('🎮 PartySally - Generating Game Card Images...\n');
  
  // Forza 4 Card
  const forza4Prompt = `minimalistic futuristic board game card design for "Connect Four" game, 
    top-down isometric view of a glowing game board with 7 columns, 
    neon red and yellow circular discs stacked vertically, 
    dark sci-fi background with purple and cyan ambient lighting, 
    ultra sharp, 4k resolution, cinematic lighting, 
    gaming thumbnail style, professional game art, 
    glass morphism UI elements, no text`;
  
  await generateGameCard(forza4Prompt, 'forza4-card.png');
  
  // Tris Card
  const trisPrompt = `sleek modern tic-tac-toe game card design, 
    isometric view of a dark glass game board with glowing grid lines,
    neon cyan X symbols and pink O symbols on the board,
    cyberpunk aesthetic with purple and blue neon accents,
    minimal design, high contrast, ultra sharp details,
    gaming thumbnail style, professional game art,
    glass morphism UI elements, no text, 4k resolution`;
  
  await generateGameCard(trisPrompt, 'tris-card.png');
  
  // Hero background
  const heroPrompt = `abstract gaming background, 
    dark gradient from deep purple to dark blue,
    floating geometric shapes with neon glow effects,
    purple and cyan color scheme,
    glass morphism elements, modern gaming aesthetic,
    subtle particle effects, no text, 
    ultra wide format, 4k resolution`;
  
  await generateGameCard(heroPrompt, 'hero-bg.png');
  
  console.log('\n🎉 All game cards generated successfully!');
}

main().catch(console.error);
