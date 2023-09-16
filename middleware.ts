import { NextRequest, NextResponse } from "next/server";

 export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|^.svg).*)',
    '/',
  ],
};

export async function middleware(req: NextRequest) {
  return NextResponse.next();
}