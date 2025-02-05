import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const requireAuth: string[] = [
  "/chat",
  "/api",
  "/reporting",
  "/unauthorized",
  "/persona",
  "/prompt"
];
const requireAdmin: string[] = ["/reporting"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = await getToken({ req: request });

  // If it’s an admin route but user lacks admin token, rewrite to unauthorized
  if (requireAdmin.some((path) => pathname.startsWith(path))) {
    if (!token?.isAdmin) {
      return NextResponse.rewrite(new URL("/unauthorized", request.url));
    }
  }

  // Otherwise let it pass
  return NextResponse.next();
}

// note that middleware is not applied to api/auth as this is required to logon (i.e. requires anon access)
export const config = {
  matcher: [
    "/unauthorized/:path*",
    "/reporting/:path*",
    "/api/chat:path*",
    "/api/images:path*",
    "/chat/:path*",
  ],
};
