import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skinType = searchParams.get("skinType");
    const productType = searchParams.get("productType");
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const concern = searchParams.get("concern");
    const isKorean = searchParams.get("isKorean");
    const search = searchParams.get("search");
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build where clause
    const where: Record<string, unknown> = {};

    // Direct product ID lookup (fastest)
    if (productId) {
      const product = await db.product.findUnique({
        where: { productId },
      });
      
      if (product) {
        return NextResponse.json({
          products: [formatProduct(product)],
          total: 1,
        });
      }
      
      return NextResponse.json({
        products: [],
        total: 0,
      });
    }

    // Search query (name or brand)
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { brand: { contains: search } },
        { productType: { contains: search } },
      ];
    }

    if (productType) {
      where.productType = productType;
    }

    if (category) {
      where.category = category;
    }

    if (brand) {
      where.brand = { contains: brand };
    }

    if (isKorean === "true") {
      where.isKorean = true;
    }

    // Fetch products
    const products = await db.product.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        rating: "desc",
      },
    });

    // Filter by skin type if provided
    let filteredProducts = products;
    if (skinType) {
      filteredProducts = products.filter((p) => {
        const types = p.skinTypes ? p.skinTypes.toLowerCase() : "";
        return types.includes("all") || types.includes(skinType.toLowerCase());
      });
    }

    // Filter by concern if provided
    if (concern) {
      filteredProducts = filteredProducts.filter((p) => {
        const concerns = p.skinConcerns ? p.skinConcerns.toLowerCase() : "";
        return concerns.includes(concern.toLowerCase());
      });
    }

    // Transform for frontend
    const result = filteredProducts.map(formatProduct);

    return NextResponse.json({
      products: result,
      total: result.length,
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

function formatProduct(p: {
  id: string;
  productId: string;
  name: string;
  brand: string;
  brandCountry: string | null;
  category: string;
  productType: string;
  description: string | null;
  ingredients: string;
  keyIngredients: string | null;
  skinTypes: string | null;
  skinConcerns: string | null;
  hairTypes: string | null;
  hairConcerns: string | null;
  price: number | null;
  currency: string;
  size: string | null;
  imageUrl: string | null;
  imageUrlAlt: string | null;
  rating: number;
  reviewCount: number;
  isKorean: boolean;
  isVegan: boolean;
  isCrueltyFree: boolean;
  officialUrl: string | null;
  redcareUrl: string | null;
  dfarmaUrl: string | null;
  sephoraUrl: string | null;
  amazonUrl: string | null;
  yesStyleUrl: string | null;
}) {
  return {
    id: p.id,
    productId: p.productId,
    name: p.name,
    brand: p.brand,
    brandCountry: p.brandCountry,
    category: p.category,
    productType: p.productType,
    description: p.description,
    ingredients: p.ingredients,
    keyIngredients: p.keyIngredients,
    skinTypes: p.skinTypes,
    skinConcerns: p.skinConcerns,
    hairTypes: p.hairTypes,
    hairConcerns: p.hairConcerns,
    price: p.price,
    currency: p.currency,
    size: p.size,
    imageUrl: p.imageUrl,
    imageUrlAlt: p.imageUrlAlt,
    rating: p.rating,
    reviewCount: p.reviewCount,
    isKorean: p.isKorean,
    isVegan: p.isVegan,
    isCrueltyFree: p.isCrueltyFree,
    // Shop links
    officialUrl: p.officialUrl,
    redcareUrl: p.redcareUrl,
    dfarmaUrl: p.dfarmaUrl,
    sephoraUrl: p.sephoraUrl,
    amazonUrl: p.amazonUrl,
    yesStyleUrl: p.yesStyleUrl,
  };
}
