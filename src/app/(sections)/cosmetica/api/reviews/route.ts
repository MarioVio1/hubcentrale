import { NextRequest, NextResponse } from "next/server";
import { db } from "@cosmetica/lib/db";

// GET - Fetch reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");
    const skinType = searchParams.get("skinType");

    if (productId) {
      // Fetch reviews for a product
      const reviews = await db.review.findMany({
        where: { productId },
        include: {
          user: {
            select: { name: true, skinType: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      // Calculate stats
      const stats = await db.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: true,
      });

      return NextResponse.json({
        reviews,
        stats: {
          averageRating: stats._avg.rating || 0,
          totalReviews: stats._count,
        },
      });
    }

    if (userId) {
      // Fetch user's reviews
      const reviews = await db.review.findMany({
        where: { userId },
        include: {
          product: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return NextResponse.json({ reviews });
    }

    // Fetch all reviews with optional skin type filter
    const where: Record<string, unknown> = {};
    if (skinType) {
      where.skinType = skinType;
    }

    const reviews = await db.review.findMany({
      where,
      include: {
        user: { select: { name: true } },
        product: { select: { name: true, brand: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST - Create review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      productId,
      rating,
      title,
      content,
      skinType,
      age,
      concernTreated,
      usageDuration,
      beforeImage,
      afterImage,
    } = body;

    if (!userId || !productId || !rating || !content) {
      return NextResponse.json({ error: "userId, productId, rating, and content required" }, { status: 400 });
    }

    // Check if user already reviewed this product
    const existingReview = await db.review.findFirst({
      where: { userId, productId },
    });

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 400 });
    }

    const review = await db.review.create({
      data: {
        userId,
        productId,
        rating,
        title,
        content,
        skinType,
        age,
        concernTreated,
        usageDuration,
        beforeImage,
        afterImage,
      },
    });

    // Update product rating
    const productReviews = await db.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;

    await db.product.update({
      where: { id: productId },
      data: {
        rating: avgRating,
        reviewCount: productReviews.length,
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

// PUT - Update review
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, userId, ...updateData } = body;

    if (!reviewId || !userId) {
      return NextResponse.json({ error: "reviewId and userId required" }, { status: 400 });
    }

    // Verify ownership
    const review = await db.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.userId !== userId) {
      return NextResponse.json({ error: "Review not found or unauthorized" }, { status: 404 });
    }

    const updatedReview = await db.review.update({
      where: { id: reviewId },
      data: updateData,
    });

    return NextResponse.json({ review: updatedReview });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

// DELETE - Delete review
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, userId } = body;

    if (!reviewId || !userId) {
      return NextResponse.json({ error: "reviewId and userId required" }, { status: 400 });
    }

    // Verify ownership
    const review = await db.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.userId !== userId) {
      return NextResponse.json({ error: "Review not found or unauthorized" }, { status: 404 });
    }

    await db.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ message: "Review deleted" });
  } catch (error) {
    console.error("Delete review error:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
