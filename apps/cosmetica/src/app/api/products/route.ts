import { NextRequest, NextResponse } from "next/server";
import { products as staticProducts } from "@/lib/products-static";

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
  miinUrl: string | null;
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
    miinUrl: (s as { miinUrl?: string }).miinUrl ?? null,
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
    miinUrl: p.miinUrl,
  };
}

const allProducts: RawProduct[] = staticProducts.map(staticToRaw);

export async function GET(request: NextRequest) {
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

  let results = allProducts;

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

  results.sort((a, b) => b.rating - a.rating);
  const paginated = results.slice(offset, offset + limit);

  return NextResponse.json({
    products: paginated.map(formatProduct),
    total: results.length,
  });
}
