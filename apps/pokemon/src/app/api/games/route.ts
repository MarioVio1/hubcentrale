import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { GAMES_DATA } from "@/lib/game-utils";

// GET: List all active games
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where: {
      isActive?: boolean;
      category?: string;
    } = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (category) {
      where.category = category;
    }

    let games = await db.game.findMany({
      where,
      orderBy: { createdAt: "desc" },
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
      },
    });

    // If no games in database, return seed data
    if (games.length === 0) {
      games = GAMES_DATA.map(game => ({
        ...game,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { scores: 0 }
      }));
    }

    return NextResponse.json({ games });
  } catch (error) {
    console.error("Get games error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new game (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, category, thumbnail, gamePath, isMultiplayer, maxPlayers } = body;

    // Validate required fields
    if (!title || !description || !category || !thumbnail || !gamePath) {
      return NextResponse.json(
        { error: "Title, description, category, thumbnail, and gamePath are required" },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ["action", "puzzle", "racing", "arcade", "sports", "strategy", "adventure", "other"];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(", ")}` },
        { status: 400 }
      );
    }

    const game = await db.game.create({
      data: {
        title,
        description,
        category,
        thumbnail,
        gamePath,
        isMultiplayer: isMultiplayer ?? false,
        maxPlayers: maxPlayers ?? 4,
        isActive: true,
      },
    });

    return NextResponse.json({
      message: "Game created successfully",
      game,
    }, { status: 201 });
  } catch (error) {
    console.error("Create game error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
