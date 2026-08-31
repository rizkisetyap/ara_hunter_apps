import { NextResponse } from "next/server";
import type { NextRequest} from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(pathname)
  // Allow public routes:
  // - / (Home page)
  // - /login
  // - /api/auth/login (login endpoint - sets cookie, no auth required)
  // - Static files
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname === "/api/auth/login" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check API routes for x-api-key (ARA Hunter external API)
  // These routes are called by external systems, not browser clients
  if (pathname.startsWith("/api/screening/batch") || pathname.startsWith("/api/screening/journal") || pathname.startsWith("/api/emitens/active")) {
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json({ error: "Unauthorized: Missing x-api-key" }, { status: 401 });
    }
    const expectedApiKey = process.env.ARA_HUNTER_API_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (apiKey !== expectedApiKey) {
      return NextResponse.json({ error: "Unauthorized: Invalid x-api-key" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Check auth token in cookies for protected routes (browser-based admin access)
  const authToken = request.cookies.get("auth_token");
  if (!authToken) {
    // Redirect to login page if not authenticated
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};