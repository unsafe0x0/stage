import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkUserProStatus } from "@/lib/payments";

/**
 * Check User Pro Status API Route
 * 
 * GET /api/payments/status
 * 
 * Returns whether the authenticated user has Pro access
 * (has a paid order in the database)
 */

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check Pro status
    const hasProAccess = await checkUserProStatus(session.user.id);

    return NextResponse.json({
      hasProAccess,
      userId: session.user.id,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to check status" },
      { status: 500 }
    );
  }
}

