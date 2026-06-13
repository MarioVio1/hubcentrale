import { NextRequest, NextResponse } from "next/server";
import { db } from "@pokemon/lib/db";
import { getCurrentUser } from "@pokemon/lib/auth";

// GET: Get game details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const game = await db.game.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        thumbnail: true,
        gamePath: true,
        isActive: true,
        isMultiplayer: true,
        maxPlayers: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { scores: true },
        },
        scores: {
          take: 10,
          orderBy: { score: "desc" },
          select: {
            id: true,
            score: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ game });
  } catch (error) {
    console.error("Get game error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update game (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, category, thumbnail, gamePath, isActive, isMultiplayer, maxPlayers } = body;

    // Check if game exists
    const existingGame = await db.game.findUnique({
      where: { id },
    });

    if (!existingGame) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // Validate category if provided
    if (category) {
      const validCategories = ["action", "puzzle", "racing", "arcade", "sports", "strategy", "adventure", "other"];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${validCategories.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const updateData: {
      title?: string;
      description?: string;
      category?: string;
      thumbnail?: string;
      gamePath?: string;
      isActive?: boolean;
      isMultiplayer?: boolean;
      maxPlayers?: number;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (gamePath !== undefined) updateData.gamePath = gamePath;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isMultiplayer !== undefined) updateData.isMultiplayer = isMultiplayer;
    if (maxPlayers !== undefined) updateData.maxPlayers = maxPlayers;

    const game = await db.game.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Game updated successfully",
      game,
    });
  } catch (error) {
    console.error("Update game error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete game (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if game exists
    const existingGame = await db.game.findUnique({
      where: { id },
    });

    if (!existingGame) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // Delete game (cascade will handle related records)
    await db.game.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Game deleted successfully",
    });
  } catch (error) {
    console.error("Delete game error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
