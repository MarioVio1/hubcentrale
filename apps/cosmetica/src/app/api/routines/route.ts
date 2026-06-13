import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Fetch routines
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const routineId = searchParams.get("routineId");

    if (routineId) {
      // Fetch single routine
      const routine = await db.routine.findUnique({
        where: { id: routineId },
        include: {
          items: {
            include: { product: true },
            orderBy: { stepOrder: "asc" },
          },
        },
      });
      return NextResponse.json({ routine });
    }

    if (!userId) {
      return NextResponse.json({ routines: [] });
    }

    const routines = await db.routine.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { stepOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ routines });
  } catch (error) {
    console.error("Fetch routines error:", error);
    return NextResponse.json({ error: "Failed to fetch routines" }, { status: 500 });
  }
}

// POST - Create routine
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description, skinType, items, isPublic } = body;

    if (!userId || !name) {
      return NextResponse.json({ error: "userId and name required" }, { status: 400 });
    }

    // Create routine with items
    const routine = await db.routine.create({
      data: {
        userId,
        name,
        description,
        skinType,
        isPublic: isPublic || false,
        items: items
          ? {
              create: items.map((item: { stepOrder: number; productId?: string; customName?: string; timeOfDay: string; notes?: string }) => ({
                stepOrder: item.stepOrder,
                productId: item.productId,
                customName: item.customName,
                timeOfDay: item.timeOfDay,
                notes: item.notes,
              })),
            }
          : undefined,
      },
      include: {
        items: {
          include: { product: true },
          orderBy: { stepOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ routine });
  } catch (error) {
    console.error("Create routine error:", error);
    return NextResponse.json({ error: "Failed to create routine" }, { status: 500 });
  }
}

// DELETE - Delete routine
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { routineId, userId } = body;

    if (!routineId || !userId) {
      return NextResponse.json({ error: "routineId and userId required" }, { status: 400 });
    }

    // Verify ownership
    const routine = await db.routine.findUnique({
      where: { id: routineId },
    });

    if (!routine || routine.userId !== userId) {
      return NextResponse.json({ error: "Routine not found or unauthorized" }, { status: 404 });
    }

    await db.routine.delete({
      where: { id: routineId },
    });

    return NextResponse.json({ message: "Routine deleted" });
  } catch (error) {
    console.error("Delete routine error:", error);
    return NextResponse.json({ error: "Failed to delete routine" }, { status: 500 });
  }
}
