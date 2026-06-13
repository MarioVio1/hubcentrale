import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@cosmetica/lib/db";

// Cache ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

// Cache for generated images (simple in-memory cache)
const imageCache = new Map<string, string>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: "Query richiesta" }, { status: 400 });
    }

    // Check cache first
    const cacheKey = query.toLowerCase().trim();
    if (imageCache.has(cacheKey)) {
      const base64Data = imageCache.get(cacheKey)!;
      const buffer = Buffer.from(base64Data, 'base64');
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        },
      });
    }

    // Check if we have the product in database with an image
    const dbProduct = await db.product.findFirst({
      where: {
        OR: [
          { name: { contains: query } },
          { brand: { contains: query } },
        ]
      }
    });

    if (dbProduct?.imageUrl) {
      // Return the database image URL as redirect
      return NextResponse.redirect(new URL(dbProduct.imageUrl, request.url).toString());
    }

    // Generate image using AI
    const zai = await getZAI();
    
    // Build a prompt for skincare product packaging
    const prompt = `Professional product photography of ${query}, skincare beauty product, 
elegant packaging with pump or tube, clean white or pastel background, 
soft studio lighting, high-end cosmetic brand aesthetic, 
minimalist design, premium quality, detailed texture, commercial product shot`;

    const response = await zai.images.generations.create({
      prompt: prompt,
      size: '1024x1024'
    });

    const imageBase64 = response.data[0].base64;
    
    // Cache the result
    imageCache.set(cacheKey, imageBase64);
    
    // Limit cache size
    if (imageCache.size > 100) {
      const firstKey = imageCache.keys().next().value;
      imageCache.delete(firstKey);
    }

    const buffer = Buffer.from(imageBase64, 'base64');
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });

  } catch (error) {
    console.error("Product image generation error:", error);
    
    // Return a placeholder image or redirect to a default
    // For now, redirect to a placeholder
    return NextResponse.redirect('data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect fill="#fce7f3" width="400" height="400"/>
        <text x="200" y="180" text-anchor="middle" fill="#ec4899" font-family="Arial" font-size="16" font-weight="bold">Prodotto</text>
        <text x="200" y="210" text-anchor="middle" fill="#be185d" font-family="Arial" font-size="14">Skincare</text>
        <text x="200" y="240" text-anchor="middle" fill="#be185d" font-family="Arial" font-size="12">K-Beauty</text>
      </svg>
    `));
  }
}
