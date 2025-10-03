import { NextResponse } from "next/server";


export function middleware(request) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;
  const user = request.cookies.get("user")?.value;
  const accountVerified = request.cookies.get("accountVerified")?.value;
  const userObj = user && JSON.parse(user);
  const admin = [3, 4].includes(userObj?.role_id);

  const protectedRoutes = [
    "/dashboard",
    "/current-session",
    "/client-session",
    "/client-management",
    "/session-history",
    "/services",
    "/invoice",
    "/consent-management",
    "/fee-split-management",
  ];

  const authRoutes = ["/login", "/reset-password"];

  const isAuthRoute = authRoutes.includes(pathname);
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && (!token || accountVerified !== "true")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && token) {
    if (accountVerified === "true") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (!admin && ["/services", "/invoice"].includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
