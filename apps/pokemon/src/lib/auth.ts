import { cookies } from "next/headers";
import { db } from "./db";
import crypto from "crypto";

// Simple password hashing using SHA-256
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Verify password
export function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
}

// Generate a session token
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Session duration in milliseconds (7 days)
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

// Set session cookie
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000, // in seconds
    path: "/",
  });
}

// Clear session cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
}

// Get current user from session
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  // For simplicity, we'll store session tokens in a simple format
  // The token format is: userId.timestamp.signature
  const parts = sessionToken.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [userId, timestamp] = parts;
  const sessionTime = parseInt(timestamp, 10);

  // Check if session is expired
  if (Date.now() - sessionTime > SESSION_DURATION) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      avatar: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

// Create session token for user
export function createUserSessionToken(userId: string): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHash("sha256")
    .update(`${userId}.${timestamp}.${process.env.NEXTAUTH_SECRET || "default-secret"}`)
    .digest("hex")
    .slice(0, 16);
  return `${userId}.${timestamp}.${signature}`;
}
