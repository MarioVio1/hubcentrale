import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET: Get leaderboard (filterable by game)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: {
      gameId?: string;
      userId?: string;
    } = {};

    if (gameId) {
      where.gameId = gameId;
    }

    if (userId) {
      where.userId = userId;
    }

    const scores = await db.score.findMany({
      where,
      orderBy: { score: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        score: true,
        data: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            category: true,
            thumbnail: true,
          },
        },
      },
    });

    // Get total count for pagination
    const total = await db.score.count({ where });

    return NextResponse.json({
      scores,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Get scores error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Submit new score
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gameId, score, data } = body;

    // Validate required fields
    if (!gameId || score === undefined || score === null) {
      return NextResponse.json(
        { error: "Game ID and score are required" },
        { status: 400 }
      );
    }

    // Validate score is a number
    if (typeof score !== "number" || score < 0) {
      return NextResponse.json(
        { error: "Score must be a non-negative number" },
        { status: 400 }
      );
    }

    // Check if game exists
    const game = await db.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    // Check if game is active
    if (!game.isActive) {
      return NextResponse.json(
        { error: "Cannot submit score for inactive game" },
        { status: 400 }
      );
    }

    // Create score
    const newScore = await db.score.create({
      data: {
        userId: user.id,
        gameId,
        score,
        data: data ? JSON.stringify(data) : null,
      },
      select: {
        id: true,
        score: true,
        data: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        game: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });

    // Check if this is a new high score for the user
    const previousHighScore = await db.score.findFirst({
      where: {
        userId: user.id,
        gameId,
        score: { gt: score },
      },
    });

    const isNewHighScore = !previousHighScore;

    return NextResponse.json({
      message: "Score submitted successfully",
      score: newScore,
      isNewHighScore,
    }, { status: 201 });
  } catch (error) {
    console.error("Submit score error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
