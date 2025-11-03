import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createCheckoutSession } from "@/lib/payments";

/**
 * Create Checkout Session API Route
 * 
 * POST /api/payments/checkout
 * 
 * Creates a Polar.sh checkout session for authenticated users.
 * Requires:
 * - Valid authentication session
 * - productPriceId in request body (optional, defaults to env var)
 */

export async function POST(request: NextRequest) {
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

    // Get request body
    const body = await request.json().catch(() => ({}));
    const productPriceId = body.productPriceId || process.env.POLAR_PRICE_ID;

    if (!productPriceId) {
      return NextResponse.json(
        { error: "Product price ID is required" },
        { status: 400 }
      );
    }

    // Get base URL for redirect URLs
    const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 
                   process.env.BETTER_AUTH_URL || 
                   request.nextUrl.origin;

    // Create checkout session
    const result = await createCheckoutSession({
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      productPriceId,
      successUrl: `${baseUrl}/checkout/success`,
      returnUrl: `${baseUrl}/checkout/cancel`,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      checkoutId: result.checkoutId,
    });
  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

