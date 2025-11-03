import { NextRequest, NextResponse } from "next/server";
import { getWebhookSecret } from "@/lib/polar";
import { handleOrderPaid, linkPolarCustomer } from "@/lib/payments";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";

/**
 * Polar.sh Webhook Handler
 * 
 * POST /api/payments/webhook
 * 
 * Handles webhook events from Polar.sh including:
 * - order.created
 * - order.paid
 * - customer.created (to link customer ID to user)
 * 
 * Verifies webhook signature for security
 */

export async function POST(request: NextRequest) {
  try {
    // Get raw body and headers for webhook verification
    const body = await request.text();
    const headers = Object.fromEntries(request.headers.entries());

    // Verify webhook signature using Polar SDK
    let event;
    try {
      event = validateEvent(
        body,
        headers,
        getWebhookSecret()
      );
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        console.error("Webhook verification failed:", error.message);
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
      throw error;
    }

    // Handle different event types
    switch (event.type) {
      case "order.created": {
        console.log("Order created:", event.data);
        // Order created - we'll update when it's paid
        break;
      }

      case "order.paid": {
        console.log("Order paid:", event.data);
        const order = event.data;
        await handleOrderPaid({
          id: order.id,
          customer_id: typeof order.customer === "string" 
            ? order.customer 
            : order.customer?.id || "",
          product_id: typeof order.product === "string"
            ? order.product
            : order.product?.id || "",
          product_price_id: typeof order.product_price === "string"
            ? order.product_price
            : order.product_price?.id || "",
          amount: order.amount || 0,
          currency: order.currency || "usd",
          status: order.status || "paid",
        });
        break;
      }

      case "customer.created": {
        console.log("Customer created:", event.data);
        const customer = event.data;
        // If we have userId in metadata, link the customer
        const userId = customer.metadata?.userId;
        if (userId) {
          await linkPolarCustomer(userId, customer.id);
        }
        break;
      }

      default: {
        console.log(`Unhandled webhook event type: ${event.type}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhook route to access raw body
export const runtime = "nodejs";

