import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET: Get room details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const room = await db.room.findUnique({
      where: { code: code.toUpperCase() },
      select: {
        id: true,
        code: true,
        status: true,
        maxPlayers: true,
        createdAt: true,
        updatedAt: true,
        game: {
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            thumbnail: true,
            gamePath: true,
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
        players: {
          select: {
            id: true,
            isHost: true,
            isReady: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error("Get room error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Join room
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const { code } = await params;

    const room = await db.room.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        players: true,
        game: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Check if room is in waiting status
    if (room.status !== "waiting") {
      return NextResponse.json(
        { error: "Room is not accepting new players" },
        { status: 400 }
      );
    }

    // Check if player is already in the room
    const existingPlayer = room.players.find((p) => p.userId === user.id);
    if (existingPlayer) {
      return NextResponse.json(
        { error: "You are already in this room" },
        { status: 400 }
      );
    }

    // Check if room is full
    if (room.players.length >= room.maxPlayers) {
      return NextResponse.json(
        { error: "Room is full" },
        { status: 400 }
      );
    }

    // Add player to room
    await db.roomPlayer.create({
      data: {
        roomId: room.id,
        userId: user.id,
        isHost: false,
        isReady: false,
      },
    });

    // Get updated room
    const updatedRoom = await db.room.findUnique({
      where: { code: code.toUpperCase() },
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
            id: true,
            isHost: true,
            isReady: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    return NextResponse.json({
      message: "Joined room successfully",
      room: updatedRoom,
    });
  } catch (error) {
    console.error("Join room error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Leave room
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const { code } = await params;

    const room = await db.room.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        players: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // Find player
    const player = room.players.find((p) => p.userId === user.id);
    if (!player) {
      return NextResponse.json(
        { error: "You are not in this room" },
        { status: 400 }
      );
    }

    // If host is leaving
    if (player.isHost) {
      // Transfer host to another player or delete room
      const otherPlayers = room.players.filter((p) => p.userId !== user.id);

      if (otherPlayers.length > 0) {
        // Transfer host to the first other player
        const newHost = otherPlayers[0];
        await db.$transaction([
          db.roomPlayer.delete({
            where: { id: player.id },
          }),
          db.roomPlayer.update({
            where: { id: newHost.id },
            data: { isHost: true },
          }),
          db.room.update({
            where: { id: room.id },
            data: { hostId: newHost.userId },
          }),
        ]);

        return NextResponse.json({
          message: "Left room successfully. Host transferred to another player.",
        });
      } else {
        // No other players, delete the room
        await db.room.delete({
          where: { id: room.id },
        });

        return NextResponse.json({
          message: "Room deleted as you were the last player.",
        });
      }
    }

    // Regular player leaving
    await db.roomPlayer.delete({
      where: { id: player.id },
    });

    return NextResponse.json({
      message: "Left room successfully",
    });
  } catch (error) {
    console.error("Leave room error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
