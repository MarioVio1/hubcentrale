import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

// Define unique character prompts for faces 34-50
const FACES_TO_GENERATE = [
  // YOUNG WOMEN continued (34-40)
  { id: 34, name: 'Martina', prompt: 'Portrait illustration of a young Italian woman, brown hair, wearing glasses, no hat, no beard, no earrings, friendly smile, cartoon style, colorful, simple background, high quality character design' },
  { id: 35, name: 'Chiara', prompt: 'Portrait illustration of a young Italian woman, blonde hair, wearing a stylish hat, no glasses, no beard, wearing earrings, cheerful expression, cartoon style, colorful, simple background, high quality character design' },
  { id: 36, name: 'Alessia', prompt: 'Portrait illustration of a young Italian woman, black hair, wearing red glasses, no hat, no beard, no earrings, confident look, cartoon style, colorful, simple background, high quality character design' },
  { id: 37, name: 'Beatrice', prompt: 'Portrait illustration of a young Italian woman, brown wavy hair, no glasses, no hat, no beard, pearl earrings, elegant smile, cartoon style, colorful, simple background, high quality character design' },
  { id: 38, name: 'Camilla', prompt: 'Portrait illustration of a young Italian woman, blonde curly hair, wearing round glasses, wearing a beret hat, no beard, no earrings, artistic vibe, cartoon style, colorful, simple background, high quality character design' },
  { id: 39, name: 'Sara', prompt: 'Portrait illustration of a young Italian woman, black straight hair, no glasses, no hat, no beard, gold hoop earrings, bright smile, cartoon style, colorful, simple background, high quality character design' },
  { id: 40, name: 'Valentina', prompt: 'Portrait illustration of a young Italian woman, red wavy hair, wearing black glasses, no hat, no beard, small earrings, playful expression, cartoon style, colorful, simple background, high quality character design' },
  
  // ADULT WOMEN (41-46)
  { id: 41, name: 'Laura', prompt: 'Portrait illustration of an adult Italian woman, brown hair in a bun, wearing reading glasses, no hat, no beard, elegant earrings, professional look, cartoon style, colorful, simple background, high quality character design' },
  { id: 42, name: 'Elena', prompt: 'Portrait illustration of an adult Italian woman, blonde shoulder-length hair, no glasses, no hat, no beard, no earrings, warm smile, cartoon style, colorful, simple background, high quality character design' },
  { id: 43, name: 'Francesca', prompt: 'Portrait illustration of an adult Italian woman, black hair, wearing stylish glasses, wearing a sun hat, no beard, dangling earrings, sophisticated look, cartoon style, colorful, simple background, high quality character design' },
  { id: 44, name: 'Anna', prompt: 'Portrait illustration of an adult Italian woman, brown hair, no glasses, no hat, no beard, no earrings, gentle smile, cartoon style, colorful, simple background, high quality character design' },
  { id: 45, name: 'Maria', prompt: 'Portrait illustration of an adult Italian woman, blonde hair with highlights, wearing blue glasses, no hat, no beard, small earrings, caring expression, cartoon style, colorful, simple background, high quality character design' },
  { id: 46, name: 'Rosa', prompt: 'Portrait illustration of an adult Italian woman, red curly hair, no glasses, wearing a wide-brim hat, no beard, flower earrings, joyful expression, cartoon style, colorful, simple background, high quality character design' },
  
  // ELDER WOMEN (47-50)
  { id: 47, name: 'Lucia', prompt: 'Portrait illustration of an elderly Italian woman, white short hair, wearing glasses, no hat, no beard, no earrings, kind smile, cartoon style, colorful, simple background, high quality character design' },
  { id: 48, name: 'Angela', prompt: 'Portrait illustration of an elderly Italian woman, white curly hair, no glasses, wearing a headscarf, no beard, pearl earrings, grandmotherly look, cartoon style, colorful, simple background, high quality character design' },
  { id: 49, name: 'Teresa', prompt: 'Portrait illustration of an elderly Italian woman, white wavy hair, wearing vintage glasses, no hat, no beard, gold earrings, wise expression, cartoon style, colorful, simple background, high quality character design' },
  { id: 50, name: 'Giovanna', prompt: 'Portrait illustration of an elderly Italian woman, gray hair, no glasses, wearing a knitted hat, no beard, no earrings, warm grandmother smile, cartoon style, colorful, simple background, high quality character design' },
];

async function generateFaces() {
  const zai = await ZAI.create();
  const outputDir = path.join(process.cwd(), 'public', 'images', 'faces');
  
  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log(`Generating ${FACES_TO_GENERATE.length} unique face illustrations...`);
  console.log('This may take a few minutes due to rate limiting.\n');
  
  for (let i = 0; i < FACES_TO_GENERATE.length; i++) {
    const face = FACES_TO_GENERATE[i];
    const outputPath = path.join(outputDir, `face-${face.id}.png`);
    
    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`✓ Face ${face.id} (${face.name}) already exists, skipping...`);
      continue;
    }
    
    console.log(`[${i + 1}/${FACES_TO_GENERATE.length}] Generating face ${face.id}: ${face.name}...`);
    
    try {
      const response = await zai.images.generations.create({
        prompt: face.prompt,
        size: '1024x1024'
      });
      
      const imageBase64 = response.data[0].base64;
      const buffer = Buffer.from(imageBase64, 'base64');
      fs.writeFileSync(outputPath, buffer);
      
      console.log(`✓ Generated: face-${face.id}.png (${face.name})`);
      
      // Add delay to avoid rate limiting (2 seconds between requests)
      if (i < FACES_TO_GENERATE.length - 1) {
        console.log('  Waiting 2 seconds...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`✗ Failed to generate face ${face.id}: ${error}`);
      // Continue with next face
    }
  }
  
  console.log('\n✓ Face generation complete!');
}

// Run the script
generateFaces().catch(console.error);
