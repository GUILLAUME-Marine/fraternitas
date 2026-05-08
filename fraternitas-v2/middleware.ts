import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register", "/auth/forgot-password"];
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/forgot-password"];
const ADMIN_ROUTES = ["/admin"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const path = nextUrl.pathname;
  const isLoggedIn = !!session?.user;
  const isAuthRoute = AUTH_ROUTES.some((r) => path.startsWith(r));
  const isPublic = PUBLIC_ROUTES.some((r) => path === r) || 
    path.startsWith("/auth/verify-email") ||
    path.startsWith("/auth/reset-password") ||
    path.startsWith("/api/auth");
  const isAdminRoute = ADMIN_ROUTES.some((r) => path.startsWith(r));

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect private routes
  if (!isPublic && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes
  if (isAdminRoute && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)"
  );

  return response;
});

export const config = {
  matcher: ["/((?!_next|api/auth|favicon.ico|.*\\..*).*)"],
};
