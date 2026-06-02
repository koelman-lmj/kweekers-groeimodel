import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/api/auth/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get("site-auth");
  
  console.log("[v0] Middleware - path:", pathname);
  console.log("[v0] Middleware - cookie exists:", !!authCookie);
  console.log("[v0] Middleware - cookie value:", authCookie?.value);
  console.log("[v0] Middleware - all cookies:", request.cookies.getAll().map(c => c.name));

  if (!authCookie || authCookie.value !== "authenticated") {
    // Redirect to login page
    console.log("[v0] Middleware - redirecting to login");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log("[v0] Middleware - allowing access");
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
