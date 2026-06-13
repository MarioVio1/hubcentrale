import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";

// Generate a random room code
function generateRoomCode(): string {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

// GET: List rooms
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const where: {
      gameId?: string;
      status?: string;
    } = {};

    if (gameId) {
      where.gameId = gameId;
    }

    if (status) {
      where.status = status;
    }

    const rooms = await db.room.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        code: true,
        status: true,
        maxPlayers: true,
        createdAt: true,
        game: {
          select: {
            id: true,
            title: true,
            category: true,
            thumbnail: true,
            maxPlayers: true,
          },
        },
        host: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: { players: true },
        },
      },
    });

    // Get total count for pagination
    const total = await db.room.count({ where });

    return NextResponse.json({
      rooms,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Get rooms error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create room
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
    const { gameId, maxPlayers } = body;

    // Validate required fields
    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 }
      );
    }

    // Check if game exists and is multiplayer
    const game = await db.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 }
      );
    }

    if (!game.isMultiplayer) {
      return NextResponse.json(
        { error: "This game does not support multiplayer" },
        { status: 400 }
      );
    }

    // Validate maxPlayers
    const playerCount = maxPlayers || game.maxPlayers;
    if (playerCount < 2 || playerCount > game.maxPlayers) {
      return NextResponse.json(
        { error: `Max players must be between 2 and ${game.maxPlayers}` },
        { status: 400 }
      );
    }

    // Generate unique room code
    let roomCode = generateRoomCode();
    let attempts = 0;
    while (attempts < 10) {
      const existingRoom = await db.room.findUnique({
        where: { code: roomCode },
      });
      if (!existingRoom) break;
      roomCode = generateRoomCode();
      attempts++;
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { error: "Failed to generate unique room code" },
        { status: 500 }
      );
    }

    // Create room and add host as first player
    const room = await db.room.create({
      data: {
        code: roomCode,
        gameId,
        hostId: user.id,
        maxPlayers: playerCount,
        status: "waiting",
        players: {
          create: {
            userId: user.id,
            isHost: true,
            isReady: true,
          },
        },
      },
      select: {
        id: true,
        code: true,
        status: true,
        maxPlayers: true,
        createdAt: true,
        game: {
          select: {
            id: true,
            title: true,
            category: true,
            thumbnail: true,
          },
        },
        host: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        players: {
          select: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
            isHost: true,
            isReady: true,
            joinedAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Room created successfully",
      room,
    }, { status: 201 });
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
