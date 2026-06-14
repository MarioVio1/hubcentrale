import { NextRequest, NextResponse } from "next/server";
import { products as staticProducts } from "@/lib/products-static";

const isClientError = (err: unknown) =>
  err instanceof Error && (
    err.message.includes("Can't reach database") ||
    err.message.includes("does not exist") ||
    err.message.includes("getaddrinfo") ||
    err.message.includes("connect ECONNREFUSED") ||
    err.message.includes("Environment variable") ||
    err.message.includes("DATABASE_URL")
  );

interface RawProduct {
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
}

function staticToRaw(s: typeof staticProducts[number]): RawProduct {
  return {
    id: s.productId,
    productId: s.productId,
    name: s.name,
    brand: s.brand,
    brandCountry: s.brandCountry ?? null,
    category: s.category,
    productType: s.productType,
    description: s.description ?? null,
    ingredients: s.ingredients,
    keyIngredients: s.keyIngredients ?? null,
    skinTypes: s.skinTypes ?? null,
    skinConcerns: s.skinConcerns ?? null,
    hairTypes: (s as { hairTypes?: string }).hairTypes ?? null,
    hairConcerns: (s as { hairConcerns?: string }).hairConcerns ?? null,
    price: s.price ?? null,
    currency: 'EUR',
    size: s.size ?? null,
    imageUrl: s.imageUrl ?? null,
    imageUrlAlt: (s as { imageUrlAlt?: string }).imageUrlAlt ?? null,
    rating: s.rating,
    reviewCount: s.reviewCount,
    isKorean: s.isKorean,
    isVegan: s.isVegan,
    isCrueltyFree: s.isCrueltyFree,
    officialUrl: s.officialUrl ?? null,
    redcareUrl: null,
    dfarmaUrl: null,
    sephoraUrl: (s as { sephoraUrl?: string }).sephoraUrl ?? null,
    amazonUrl: (s as { amazonUrl?: string }).amazonUrl ?? null,
    yesStyleUrl: (s as { yesStyleUrl?: string }).yesStyleUrl ?? null,
  };
}

function formatProduct(p: RawProduct) {
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
    officialUrl: p.officialUrl,
    redcareUrl: p.redcareUrl,
    dfarmaUrl: p.dfarmaUrl,
    sephoraUrl: p.sephoraUrl,
    amazonUrl: p.amazonUrl,
    yesStyleUrl: p.yesStyleUrl,
  };
}

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

    // Try Prisma first
    try {
      const { db } = await import("@/lib/db");

      if (productId) {
        const product = await db.product.findUnique({ where: { productId } });
        if (product) {
          return NextResponse.json({ products: [formatProduct(product)], total: 1 });
        }
        return NextResponse.json({ products: [], total: 0 });
      }

      const where: Record<string, unknown> = {};
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { brand: { contains: search } },
          { productType: { contains: search } },
        ];
      }
      if (productType) where.productType = productType;
      if (category) where.category = category;
      if (brand) where.brand = { contains: brand };
      if (isKorean === "true") where.isKorean = true;

      const prismaProducts = await db.product.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { rating: "desc" },
      });

      let filtered = prismaProducts;
      if (skinType) {
        filtered = filtered.filter(p =>
          p.skinTypes?.toLowerCase().includes("all") ||
          p.skinTypes?.toLowerCase().includes(skinType.toLowerCase())
        );
      }
      if (concern) {
        filtered = filtered.filter(p =>
          p.skinConcerns?.toLowerCase().includes(concern.toLowerCase())
        );
      }

      return NextResponse.json({
        products: filtered.map(formatProduct),
        total: filtered.length,
      });
    } catch (dbErr) {
      if (!isClientError(dbErr)) throw dbErr;
      // Fall through to static data
    }

    // Fallback: static data
    let results: RawProduct[] = staticProducts.map(staticToRaw);

    if (productId) {
      results = results.filter(p => p.productId === productId);
      return NextResponse.json({ products: results.map(formatProduct), total: results.length });
    }

    if (search) {
      const q = search.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.productType.toLowerCase().includes(q)
      );
    }
    if (productType) results = results.filter(p => p.productType === productType);
    if (category) results = results.filter(p => p.category === category);
    if (brand) results = results.filter(p => p.brand.toLowerCase().includes(brand.toLowerCase()));
    if (isKorean === "true") results = results.filter(p => p.isKorean);
    if (skinType) {
      results = results.filter(p =>
        p.skinTypes?.toLowerCase().includes("all") ||
        p.skinTypes?.toLowerCase().includes(skinType.toLowerCase())
      );
    }
    if (concern) {
      results = results.filter(p =>
        p.skinConcerns?.toLowerCase().includes(concern.toLowerCase())
      );
    }

    // Sort by rating desc
    results.sort((a, b) => b.rating - a.rating);

    // Paginate
    const paginated = results.slice(offset, offset + limit);

    return NextResponse.json({
      products: paginated.map(formatProduct),
      total: results.length,
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
