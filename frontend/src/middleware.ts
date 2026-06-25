import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper to decode JWT token payload in Next.js Edge middleware
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isAuthRedirectPage = pathname === "/login" || pathname === "/register";
  const isPublicPage = isAuthRedirectPage || pathname === "/forgot-password" || pathname === "/reset-password" || pathname === "/verify-email";

  // 0. Detect and delete invalid/mock tokens (e.g. mock-token-session-key), then redirect appropriately
  if (token && token.split('.').length !== 3) {
    const response = isPublicPage ? NextResponse.next() : NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }

  // 1. If user has a token and visits login/register, redirect to dashboard
  if (token && isAuthRedirectPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 2. If user does not have a token and is accessing a protected page (not public), redirect to /login
  if (!token && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Role-Based Route Protection (RBAC)
  if (token) {
    const payload = decodeJwt(token);
    if (!payload || !payload.role) {
      // Invalid token payload, let's treat as unauthenticated
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }

    const userRole = payload.role; // SUPER_ADMIN or ADMIN

    // Only SUPER_ADMIN and ADMIN can access user management (/users) and system settings (/settings)
    const isSuperAdminRoute = pathname.startsWith("/users") || pathname.startsWith("/settings");
    if (isSuperAdminRoute && userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/access-denied", request.url));
    }
  }

  return NextResponse.next();
}

// Config file matcher rules
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes proxy)
     * - access-denied page
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|access-denied|_next/static|_next/image|favicon.ico).*)",
  ],
};
