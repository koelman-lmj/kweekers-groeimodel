import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Get password from environment variable (server-side only)
    const sitePassword = process.env.SITE_PASSWORD;

    if (!sitePassword) {
      console.error("[v0] SITE_PASSWORD environment variable is not set");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Validate password
    if (password === sitePassword) {
      // Set auth cookie
      const cookieStore = await cookies();
      cookieStore.set("site-auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Onjuist wachtwoord" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Ongeldige aanvraag" },
      { status: 400 }
    );
  }
}
