import fs from 'fs'
import { createCanvas, loadImage } from 'canvas'

async function extractSprites() {
  const imagePath = './upload/F7D68827-19FF-4759-9453-C8274A8D9A03.png'
  const outputDir = './public/sprites/besti'
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  const img = await loadImage(imagePath)
  console.log(`Image size: ${img.width}x${img.height}`)
  
  // Detect sprite size - try different common sizes
  const spriteSize = 64 // Most Pokemon-style sprites are 64x64
  const cols = Math.floor(img.width / spriteSize)
  const rows = Math.floor(img.height / spriteSize)
  
  console.log(`Detected ${cols}x${rows} grid with ${spriteSize}px sprites`)
  console.log(`Total possible sprites: ${cols * rows}`)
  
  const canvas = createCanvas(spriteSize, spriteSize)
  const ctx = canvas.getContext('2d')
  
  let count = 0
  const spriteData: Array<{ index: number; x: number; y: number; hasContent: boolean }> = []
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      ctx.clearRect(0, 0, spriteSize, spriteSize)
      ctx.drawImage(
        img,
        col * spriteSize, row * spriteSize, spriteSize, spriteSize,
        0, 0, spriteSize, spriteSize
      )
      
      // Check if sprite has content
      const imageData = ctx.getImageData(0, 0, spriteSize, spriteSize)
      const data = imageData.data
      let hasContent = false
      let pixelCount = 0
      
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 10) { // Alpha channel > 10
          hasContent = true
          pixelCount++
        }
      }
      
      // Only save if sprite has significant content (more than 100 pixels)
      if (hasContent && pixelCount > 100) {
        const buffer = canvas.toBuffer('image/png')
        const filename = `sprite_${count.toString().padStart(3, '0')}.png`
        fs.writeFileSync(`${outputDir}/${filename}`, buffer)
        spriteData.push({ index: count, x: col, y: row, hasContent: true })
        count++
      }
    }
  }
  
  console.log(`\nExtracted ${count} sprites to ${outputDir}`)
  console.log(`\nSprite positions saved. First 10:`)
  spriteData.slice(0, 10).forEach(s => {
    console.log(`  Sprite ${s.index}: grid position (${s.x}, ${s.y})`)
  })
  
  // Save metadata
  fs.writeFileSync(`${outputDir}/metadata.json`, JSON.stringify({
    totalSprites: count,
    spriteSize,
    sourceImage: 'F7D68827-19FF-4759-9453-C8274A8D9A03.png',
    gridSize: { cols, rows },
    sprites: spriteData
  }, null, 2))
}

extractSprites().catch(console.error)
