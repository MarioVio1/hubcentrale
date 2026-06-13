import { NextRequest, NextResponse } from "next/server";
import { db } from "@cosmetica/lib/db";
import crypto from "crypto";

// POST - Login/Register
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    let user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user
      user = await db.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          password: crypto.randomBytes(16).toString("hex"), // Random password for now
        },
      });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, skinType, skinConcerns, hairType, hairConcerns, age, climate, country } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (skinType !== undefined) updateData.skinType = skinType;
    if (skinConcerns !== undefined) updateData.skinConcerns = JSON.stringify(skinConcerns);
    if (hairType !== undefined) updateData.hairType = hairType;
    if (hairConcerns !== undefined) updateData.hairConcerns = JSON.stringify(hairConcerns);
    if (age !== undefined) updateData.age = age;
    if (climate !== undefined) updateData.climate = climate;
    if (country !== undefined) updateData.country = country;

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// GET - Get user profile
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        favorites: {
          include: { product: true },
          take: 10,
        },
        routines: {
          include: { items: true },
          take: 5,
        },
        reviews: {
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}
