import { NextResponse } from "next/server";
import { getCurrentUser } from "@pokemon/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (user) {
      return NextResponse.json({
        authenticated: true,
        user,
      });
    } else {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }
}
