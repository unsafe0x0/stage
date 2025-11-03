import { polar, getOrganizationId } from "./polar";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Payment Helper Functions
 * 
 * Server-side functions for handling Polar.sh payments integration
 */

export interface CreateCheckoutParams {
  userId: string;
  userEmail: string;
  userName: string;
  productPriceId: string;
  successUrl: string;
  returnUrl: string;
}

/**
 * Create a checkout session for a one-time purchase
 */
export async function createCheckoutSession({
  userId,
  userEmail,
  userName,
  productPriceId,
  successUrl,
  returnUrl,
}: CreateCheckoutParams) {
  try {
    const result = await polar.checkouts.create({
      productPriceId,
      customerEmail: userEmail,
      customerName: userName,
      successUrl,
      returnUrl,
      metadata: {
        userId,
        source: "web",
      },
    });

    if (!result.ok) {
      console.error("Failed to create checkout:", result.error);
      throw new Error("Failed to create checkout session");
    }

    return {
      success: true,
      checkoutUrl: result.value.url,
      checkoutId: result.value.id,
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

/**
 * Handle order.paid webhook event
 * Updates the user's order status in the database
 */
export async function handleOrderPaid(orderData: {
  id: string;
  customer_id: string;
  product_id: string;
  product_price_id: string;
  amount: number;
  currency: string;
  status: string;
}) {
  try {
    // Find user by Polar customer ID
    const user = await prisma.user.findUnique({
      where: { polarCustomerId: orderData.customer_id },
    });

    if (!user) {
      console.warn(`User not found for Polar customer ID: ${orderData.customer_id}`);
      return { success: false, error: "User not found" };
    }

    // Check if order already exists
    const existingOrder = await prisma.order.findUnique({
      where: { polarOrderId: orderData.id },
    });

    if (existingOrder) {
      // Update existing order
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          status: orderData.status,
          updatedAt: new Date(),
        },
      });
      return { success: true, order: existingOrder };
    }

    // Create new order
    const order = await prisma.order.create({
      data: {
        polarOrderId: orderData.id,
        userId: user.id,
        productId: orderData.product_id,
        priceId: orderData.product_price_id,
        amount: orderData.amount,
        currency: orderData.currency,
        status: orderData.status,
      },
    });

    return { success: true, order };
  } catch (error) {
    console.error("Error handling order paid:", error);
    throw error;
  }
}

/**
 * Check if a user has Pro access (has a paid order)
 */
export async function checkUserProStatus(userId: string): Promise<boolean> {
  try {
    const order = await prisma.order.findFirst({
      where: {
        userId,
        status: "paid",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return !!order;
  } catch (error) {
    console.error("Error checking user Pro status:", error);
    return false;
  }
}

/**
 * Link Polar customer ID to user account
 */
export async function linkPolarCustomer(
  userId: string,
  polarCustomerId: string
) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { polarCustomerId },
    });
  } catch (error) {
    console.error("Error linking Polar customer:", error);
    throw error;
  }
}

