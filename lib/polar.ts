import { Polar } from "@polar-sh/sdk";

/**
 * Polar.sh SDK Client Configuration
 * 
 * This module initializes the Polar.js SDK client for server-side operations.
 * 
 * Required Environment Variables:
 * - POLAR_ACCESS_TOKEN: Your Polar.sh API access token
 * 
 * Usage:
 * - Import this client in API routes and server actions
 * - Use for creating checkouts, verifying webhooks, etc.
 */

if (!process.env.POLAR_ACCESS_TOKEN) {
  throw new Error(
    "POLAR_ACCESS_TOKEN environment variable is required. " +
    "Get your access token from https://polar.sh/dashboard/settings/api-keys"
  );
}

export const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
});

/**
 * Get Polar.sh organization ID from environment
 */
export function getOrganizationId(): string {
  const orgId = process.env.POLAR_ORGANIZATION_ID;
  if (!orgId) {
    throw new Error(
      "POLAR_ORGANIZATION_ID environment variable is required. " +
      "Find it in your Polar.sh dashboard settings"
    );
  }
  return orgId;
}

/**
 * Get webhook secret for verifying webhook signatures
 */
export function getWebhookSecret(): string {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "POLAR_WEBHOOK_SECRET environment variable is required. " +
      "Set this to a secure random string for webhook verification"
    );
  }
  return secret;
}
