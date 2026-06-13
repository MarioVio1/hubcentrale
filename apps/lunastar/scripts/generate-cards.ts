import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const outputDir = './public/images';

// Briscola card prompts - Italian playing cards style
const briscolaSuits = [
  { name: 'denari', emoji: '🪙', color: 'gold coins' },
  { name: 'coppe', emoji: '🏆', color: 'bronze cups' },
  { name: 'spade', emoji: '⚔️', color: 'silver swords' },
  { name: 'bastoni', emoji: '🪵', color: 'wooden clubs' },
];

const briscolaValues = ['A', '2', '3', '4', '5', '6', '7', 'J', 'Q', 'K'];

// UNO card prompts
const unoColors = ['red', 'blue', 'green', 'yellow'];
const unoNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const unoSpecials = ['Skip', 'Reverse', 'Draw Two'];
const unoWilds = ['Wild', 'Wild Draw Four'];

// Face prompts for Indovina Chi (40 diverse faces)
const facePrompts = [
  // Men - Young
  'Portrait of a young Italian man, short brown hair, no beard, friendly smile, white background, cartoon illustration style',
  'Portrait of a young Italian man, blonde curly hair, glasses, clean shaven, white background, cartoon illustration style',
  'Portrait of a young Italian man, black spiky hair, blue eyes, white background, cartoon illustration style',
  'Portrait of a young Italian man, red hair, freckles, baseball cap, white background, cartoon illustration style',
  'Portrait of a young Italian man, brown wavy hair, mustache, white background, cartoon illustration style',
  
  // Men - Adult
  'Portrait of an adult Italian man, brown hair, full beard, serious expression, white background, cartoon illustration style',
  'Portrait of an adult Italian man, black hair, glasses, mustache, white background, cartoon illustration style',
  'Portrait of an adult Italian man, bald, goatee beard, white background, cartoon illustration style',
  'Portrait of an adult Italian man, gray hair, beard, hat, white background, cartoon illustration style',
  'Portrait of an adult Italian man, brown hair slicked back, white background, cartoon illustration style',
  'Portrait of an adult Italian man, black hair, sunglasses, white background, cartoon illustration style',
  'Portrait of an adult Italian man, blonde hair, blue eyes, white background, cartoon illustration style',
  
  // Men - Elder
  'Portrait of an elderly Italian man, white hair, glasses, mustache, white background, cartoon illustration style',
  'Portrait of an elderly Italian man, bald, white beard, hat, white background, cartoon illustration style',
  'Portrait of an elderly Italian man, gray hair, wrinkles, white background, cartoon illustration style',
  'Portrait of an elderly Italian man, white hair, bowler hat, white background, cartoon illustration style',
  
  // Women - Young
  'Portrait of a young Italian woman, long blonde hair, blue eyes, white background, cartoon illustration style',
  'Portrait of a young Italian woman, black straight hair, glasses, white background, cartoon illustration style',
  'Portrait of a young Italian woman, brown curly hair, earrings, white background, cartoon illustration style',
  'Portrait of a young Italian woman, red hair, freckles, white background, cartoon illustration style',
  'Portrait of a young Italian woman, short black hair, white background, cartoon illustration style',
  'Portrait of a young Italian woman, blonde ponytail, headband, white background, cartoon illustration style',
  
  // Women - Adult
  'Portrait of an adult Italian woman, brown hair bun, glasses, white background, cartoon illustration style',
  'Portrait of an adult Italian woman, black wavy hair, pearl earrings, white background, cartoon illustration style',
  'Portrait of an adult Italian woman, blonde bob cut, white background, cartoon illustration style',
  'Portrait of an adult Italian woman, brown hair, flower in hair, white background, cartoon illustration style',
  'Portrait of an adult Italian woman, black hair, hoop earrings, white background, cartoon illustration style',
  'Portrait of an adult Italian woman, auburn hair, glasses, white background, cartoon illustration style',
  'Portrait of an adult Italian woman, brown hair, hat, white background, cartoon illustration style',
  'Portrait of an adult Italian woman, black hair, red lipstick, white background, cartoon illustration style',
  
  // Women - Elder
  'Portrait of an elderly Italian woman, white curly hair, glasses, white background, cartoon illustration style',
  'Portrait of an elderly Italian woman, gray hair bun, pearls, white background, cartoon illustration style',
  'Portrait of an elderly Italian woman, white hair, flower hat, white background, cartoon illustration style',
  'Portrait of an elderly Italian woman, gray short hair, kind smile, white background, cartoon illustration style',
  'Portrait of an elderly Italian woman, white hair, scarf, white background, cartoon illustration style',
  
  // Extra diverse faces
  'Portrait of an Italian man with thick eyebrows, black hair, white background, cartoon illustration style',
  'Portrait of an Italian woman with glasses and curly brown hair, white background, cartoon illustration style',
  'Portrait of an Italian man with a beret, brown hair, white background, cartoon illustration style',
  'Portrait of an Italian woman with long black hair, white background, cartoon illustration style',
  'Portrait of an Italian man with sideburns, brown hair, white background, cartoon illustration style',
  'Portrait of an Italian woman with short red hair, white background, cartoon illustration style',
  'Portrait of an Italian man with gray beard and mustache, white background, cartoon illustration style',
  'Portrait of an Italian woman with blonde hair and ribbon, white background, cartoon illustration style',
];

async function generateBriscolaCards() {
  console.log('Generating Briscola cards...');
  const zai = await ZAI.create();
  const dir = path.join(outputDir, 'briscola-cards');
  
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (const suit of briscolaSuits) {
    for (let i = 0; i < briscolaValues.length; i++) {
      const value = briscolaValues[i];
      const filename = `${suit.name}-${value.toLowerCase()}.png`;
      const filepath = path.join(dir, filename);
      
      if (fs.existsSync(filepath)) {
        console.log(`Skipping ${filename} (already exists)`);
        continue;
      }

      const prompt = `Italian playing card, ${suit.name} suit, ${suit.color}, value ${value}, traditional tarot style design, ornate border, vintage aesthetic, high quality digital art`;
      
      try {
        const response = await zai.images.generations.create({
          prompt,
          size: '768x1344' // Portrait card ratio
        });
        
        const buffer = Buffer.from(response.data[0].base64, 'base64');
        fs.writeFileSync(filepath, buffer);
        console.log(`✓ Generated ${filename}`);
      } catch (e) {
        console.error(`✗ Failed ${filename}:`, e);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 2000)); // 2 second delay to avoid rate limiting
    }
  }
}

async function generateUnoCards() {
  console.log('Generating UNO cards...');
  const zai = await ZAI.create();
  const dir = path.join(outputDir, 'uno-cards');
  
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Number cards
  for (const color of unoColors) {
    for (const num of unoNumbers) {
      const filename = `${color}-${num}.png`;
      const filepath = path.join(dir, filename);
      
      if (fs.existsSync(filepath)) {
        console.log(`Skipping ${filename} (already exists)`);
        continue;
      }

      const prompt = `UNO playing card, ${color} background, large number ${num} in center, classic UNO card design, white oval in center, high quality`;
      
      try {
        const response = await zai.images.generations.create({
          prompt,
          size: '768x1344'
        });
        
        const buffer = Buffer.from(response.data[0].base64, 'base64');
        fs.writeFileSync(filepath, buffer);
        console.log(`✓ Generated ${filename}`);
      } catch (e) {
        console.error(`✗ Failed ${filename}:`, e);
      }
      
      await new Promise(r => setTimeout(r, 2000)); // 2 second delay to avoid rate limiting
    }
  }

  // Special cards (Skip, Reverse, Draw Two) for each color
  for (const color of unoColors) {
    for (const special of unoSpecials) {
      const filename = `${color}-${special.toLowerCase().replace(' ', '-')}.png`;
      const filepath = path.join(dir, filename);
      
      if (fs.existsSync(filepath)) {
        console.log(`Skipping ${filename} (already exists)`);
        continue;
      }

      let symbolDesc = '';
      if (special === 'Skip') symbolDesc = 'crossed circle symbol';
      else if (special === 'Reverse') symbolDesc = 'double arrow symbol';
      else symbolDesc = '+2 symbol with two cards';

      const prompt = `UNO playing card, ${color} background, ${symbolDesc}, ${special} card, classic UNO design, white oval center, high quality`;
      
      try {
        const response = await zai.images.generations.create({
          prompt,
          size: '768x1344'
        });
        
        const buffer = Buffer.from(response.data[0].base64, 'base64');
        fs.writeFileSync(filepath, buffer);
        console.log(`✓ Generated ${filename}`);
      } catch (e) {
        console.error(`✗ Failed ${filename}:`, e);
      }
      
      await new Promise(r => setTimeout(r, 2000)); // 2 second delay to avoid rate limiting
    }
  }

  // Wild cards
  for (const wild of unoWilds) {
    const filename = `wild-${wild.toLowerCase().replace(' ', '-')}.png`;
    const filepath = path.join(dir, filename);
    
    if (fs.existsSync(filepath)) {
      console.log(`Skipping ${filename} (already exists)`);
      continue;
    }

    const desc = wild === 'Wild' ? 'colorful swirl pattern' : 'colorful +4 pattern';
    const prompt = `UNO playing card, black background, ${desc}, ${wild} card, four colors red blue green yellow, classic UNO design, high quality`;
    
    try {
      const response = await zai.images.generations.create({
        prompt,
        size: '768x1344'
      });
      
      const buffer = Buffer.from(response.data[0].base64, 'base64');
      fs.writeFileSync(filepath, buffer);
      console.log(`✓ Generated ${filename}`);
    } catch (e) {
      console.error(`✗ Failed ${filename}:`, e);
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
}

async function generateFaces() {
  console.log('Generating Indovina Chi faces...');
  const zai = await ZAI.create();
  const dir = path.join(outputDir, 'faces');
  
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  for (let i = 0; i < facePrompts.length; i++) {
    const filename = `face-${i + 1}.png`;
    const filepath = path.join(dir, filename);
    
    if (fs.existsSync(filepath)) {
      console.log(`Skipping ${filename} (already exists)`);
      continue;
    }

    try {
      const response = await zai.images.generations.create({
        prompt: facePrompts[i],
        size: '1024x1024'
      });
      
      const buffer = Buffer.from(response.data[0].base64, 'base64');
      fs.writeFileSync(filepath, buffer);
      console.log(`✓ Generated ${filename}`);
    } catch (e) {
      console.error(`✗ Failed ${filename}:`, e);
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--briscola')) {
    await generateBriscolaCards();
  } else if (args.includes('--uno')) {
    await generateUnoCards();
  } else if (args.includes('--faces')) {
    await generateFaces();
  } else if (args.includes('--all')) {
    await generateBriscolaCards();
    await generateUnoCards();
    await generateFaces();
  } else {
    console.log('Usage: npx ts-node scripts/generate-cards.ts [--briscola|--uno|--faces|--all]');
    console.log('Please specify what to generate.');
  }
  
  console.log('Done!');
}

main().catch(console.error);
