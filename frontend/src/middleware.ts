import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require auth
const PROTECTED = ["/chat", "/admin"];
const PUBLIC = ["/", "/login", "/api/auth"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith("/api/auth"))) {
    return NextResponse.next();
  }

  // Protect /chat and /admin
  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    const auth = req.cookies.get("demo_auth");
    if (!auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
