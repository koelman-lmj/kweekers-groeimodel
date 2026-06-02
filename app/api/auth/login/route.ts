import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Get password from environment variable (server-side only)
    const sitePassword = process.env.SITE_PASSWORD;

    if (!sitePassword) {
      console.error("SITE_PASSWORD environment variable is not set");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Validate password (trim whitespace from both for comparison)
    const trimmedPassword = password?.trim();
    const trimmedSitePassword = sitePassword.trim();

    if (trimmedPassword === trimmedSitePassword) {
      // Create response with success
      const response = NextResponse.json({ success: true });
      
      // Check if request is over HTTPS using x-forwarded-proto header
      // This is set by Vercel/reverse proxies for the original protocol
      const forwardedProto = request.headers.get("x-forwarded-proto");
      const isSecure = forwardedProto === "https";
      
      // Set auth cookie on the response
      response.cookies.set({
        name: "site-auth",
        value: "authenticated",
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
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
