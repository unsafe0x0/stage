import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js 16+ Proxy
 * 
 * No authentication required - all routes are publicly accessible.
 */
export async function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
  ],
};

