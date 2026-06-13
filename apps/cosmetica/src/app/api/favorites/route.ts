import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Fetch user's favorites
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ favorites: [] });
    }

    const favorites = await db.favorite.findMany({
      where: { userId },
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const result = favorites.map((f) => ({
      id: f.product.id,
      name: f.product.name,
      brand: f.product.brand,
      brandCountry: f.product.brandCountry,
      productType: f.product.productType,
      price: f.product.price,
      rating: f.product.rating,
      reviewCount: f.product.reviewCount,
      skinTypes: JSON.parse(f.product.skinTypes || "[]"),
      skinConcerns: JSON.parse(f.product.skinConcerns || "[]"),
      isKorean: f.product.isKorean,
      isVegan: f.product.isVegan,
      isCrueltyFree: f.product.isCrueltyFree,
      imageUrl: f.product.imageUrl,
    }));

    return NextResponse.json({ favorites: result });
  } catch (error) {
    console.error("Favorites API error:", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}

// POST - Add to favorites
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json({ error: "userId and productId required" }, { status: 400 });
    }

    // Check if already favorited
    const existing = await db.favorite.findFirst({
      where: { userId, productId },
    });

    if (existing) {
      return NextResponse.json({ message: "Already in favorites", isFavorite: true });
    }

    await db.favorite.create({
      data: { userId, productId },
    });

    return NextResponse.json({ message: "Added to favorites", isFavorite: true });
  } catch (error) {
    console.error("Add favorite error:", error);
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}

// DELETE - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, productId } = body;

    if (!userId || !productId) {
      return NextResponse.json({ error: "userId and productId required" }, { status: 400 });
    }

    await db.favorite.deleteMany({
      where: { userId, productId },
    });

    return NextResponse.json({ message: "Removed from favorites", isFavorite: false });
  } catch (error) {
    console.error("Remove favorite error:", error);
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
  }
}
