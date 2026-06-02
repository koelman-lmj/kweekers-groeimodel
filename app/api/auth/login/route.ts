import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Get password from environment variable (server-side only)
    const sitePassword = process.env.SITE_PASSWORD;

    console.log("[v0] Login attempt - env var exists:", !!sitePassword);

    if (!sitePassword) {
      console.error("[v0] SITE_PASSWORD environment variable is not set");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Validate password (trim whitespace from both for comparison)
    const trimmedPassword = password?.trim();
    const trimmedSitePassword = sitePassword.trim();
    
    const passwordMatch = trimmedPassword === trimmedSitePassword;
    console.log("[v0] Password match:", passwordMatch);

    if (passwordMatch) {
      // Create response with success
      const response = NextResponse.json({ success: true });
      
      // Check if request is over HTTPS
      const forwardedProto = request.headers.get("x-forwarded-proto");
      const isHttps = forwardedProto === "https";
      console.log("[v0] x-forwarded-proto:", forwardedProto, "isHttps:", isHttps);
      
      // Set auth cookie on the response
      // MUST match the protocol - secure:true for HTTPS, secure:false for HTTP
      response.cookies.set({
        name: "site-auth",
        value: "authenticated",
        httpOnly: true,
        secure: isHttps,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      console.log("[v0] Cookie set with secure:", isHttps);
      return response;
    }

    console.log("[v0] Password mismatch");
    return NextResponse.json(
      { success: false, error: "Onjuist wachtwoord" },
      { status: 401 }
    );
  } catch (error) {
    console.error("[v0] Login error:", error);
    return NextResponse.json(
      { success: false, error: "Ongeldige aanvraag" },
      { status: 400 }
    );
  }
}
