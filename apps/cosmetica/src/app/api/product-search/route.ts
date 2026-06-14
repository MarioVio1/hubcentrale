import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";

// Cache ZAI instance
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, brand } = body;

    if (!productName) {
      return NextResponse.json({ error: "Nome prodotto richiesto" }, { status: 400 });
    }

    // First, search in local database
    const localProduct = await db.product.findFirst({
      where: {
        OR: [
          { name: { contains: productName } },
          { brand: { contains: productName } },
          brand ? { name: { contains: brand } } : {},
        ].filter(Boolean)
      }
    });

    if (localProduct) {
      return NextResponse.json({
        found: true,
        source: 'database',
        product: {
          id: localProduct.id,
          name: localProduct.name,
          brand: localProduct.brand,
          brandCountry: localProduct.brandCountry,
          productType: localProduct.productType,
          description: localProduct.description,
          price: localProduct.price,
          rating: localProduct.rating,
          reviewCount: localProduct.reviewCount,
          imageUrl: localProduct.imageUrl,
          keyIngredients: localProduct.keyIngredients ? JSON.parse(localProduct.keyIngredients as string) : [],
          skinTypes: localProduct.skinTypes ? JSON.parse(localProduct.skinTypes as string) : [],
          skinConcerns: localProduct.skinConcerns ? JSON.parse(localProduct.skinConcerns as string) : [],
          isKorean: localProduct.isKorean,
          isVegan: localProduct.isVegan,
          isCrueltyFree: localProduct.isCrueltyFree,
        }
      });
    }

    // If not found locally, search Korean beauty sites
    const zai = await getZAI();
    const searchQuery = `${brand ? brand + ' ' : ''}${productName} skincare prodotto beauty coreano`;
    const sites = ['miin-cosmetics.it', 'ovs.it/it/it/c/shaka', 'yesstyle.com', 'stylevana.com', 'cosrx.com', 'beautyofjoseon.com'];
    
    const searchResults = await zai.functions.invoke('web_search', {
      query: searchQuery + ' ' + sites.join(' OR '),
      num: 5
    });

    // Try to find the best result with product info
    let bestMatch = null;
    
    for (const result of searchResults) {
      // Look for official brand websites or major retailers
      const hostname = result.host_name.toLowerCase();
      if (
        hostname.includes('cosrx') || 
        hostname.includes('theordinary') || 
        hostname.includes('sephora') ||
        hostname.includes('yesstyle') ||
        hostname.includes('amazon') ||
        hostname.includes('miin-cosmetics') ||
        hostname.includes('ovs.it') ||
        hostname.includes('stylevana') ||
        hostname.includes('oliveyoung') ||
        hostname.includes('beautyofjoseon') ||
        hostname.includes('beauty') ||
        hostname.includes('skincare')
      ) {
        bestMatch = result;
        break;
      }
    }
    
    if (!bestMatch && searchResults.length > 0) {
      bestMatch = searchResults[0];
    }

    // Generate product image URL from search
    // Since we can't directly extract images from search results,
    // we'll use the product image generation or fallback
    const searchTerm = encodeURIComponent(`${brand || ''} ${productName} product packaging`.trim());
    
    return NextResponse.json({
      found: true,
      source: 'web_search',
      product: {
        name: productName,
        brand: brand || 'Unknown',
        description: bestMatch?.snippet || `Prodotto skincare: ${productName}`,
        imageUrl: `/api/product-image?q=${searchTerm}`,
        searchUrl: bestMatch?.url,
        searchResults: searchResults.slice(0, 3).map((r: { name: string; url: string; snippet: string }) => ({
          title: r.name,
          url: r.url,
          snippet: r.snippet
        }))
      }
    });

  } catch (error) {
    console.error("Product search error:", error);
    return NextResponse.json({
      found: false,
      error: "Errore nella ricerca del prodotto"
    });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: "Query richiesta" }, { status: 400 });
  }

  try {
    // Search in database
    const products = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { brand: { contains: query } },
          { productType: { contains: query } },
        ]
      },
      take: 10
    });

    return NextResponse.json({
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        productType: p.productType,
        imageUrl: p.imageUrl,
        price: p.price,
        rating: p.rating
      }))
    });
  } catch (error) {
    console.error("Product search error:", error);
    return NextResponse.json({ products: [] });
  }
}
