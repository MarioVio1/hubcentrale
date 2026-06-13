import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, setSessionCookie, createUserSessionToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    // Validate input - need either email or username
    if ((!email && !username) || !password) {
      return NextResponse.json(
        { error: "Email/username and password are required" },
        { status: 400 }
      );
    }

    // Find user by email or username
    const user = await db.user.findFirst({
      where: email
        ? { email: email.toLowerCase() }
        : { username: username },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = createUserSessionToken(user.id);
    await setSessionCookie(sessionToken);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
