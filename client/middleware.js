import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl; // Extract pathname from the request URL

  const token = request.cookies.get("token")?.value;

  const protectedRoutes = [
    "/dashboard",
    "/current-session",
    "/client-session",
    "/client-management",
    "/session-history",
    "/services",
    "/invoice",
  ];

  const authRoutes = ["/login", "/sign-up", "/reset-password"];

  const isAuthRoute = authRoutes.includes(pathname);

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    const loginUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
