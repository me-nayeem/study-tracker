import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { safeCallbackPath } from "@/lib/login-redirect";

const PUBLIC_ROUTES = ["/", "/login", "/developer", "/privacy", "/terms", "/dashboard"];

/**
 * Student pages anyone can browse: a paper's chapter list and a chapter's overview.
 * Only the overview itself; every chapter section (/chapter/<id>/lectures, …) needs login.
 */
const PUBLIC_PATTERNS = [/^\/paper\/[^/]+$/, /^\/chapter\/[^/]+$/];

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.includes(path) || PUBLIC_PATTERNS.some((pattern) => pattern.test(path));
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (path === "/login" && token) {
    const next = safeCallbackPath(request.nextUrl.searchParams.get("callbackUrl"));
    return NextResponse.redirect(new URL(next, request.url));
  }

  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  if (!token) {
    // come back to this page after signing in
    const login = new URL("/login", request.url);
    login.searchParams.set("callbackUrl", path + request.nextUrl.search);
    return NextResponse.redirect(login);
  }

  if (path.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (path.startsWith("/manager") && token.role !== "ADMIN" && token.role !== "MANAGER") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
