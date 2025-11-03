import { checkUserProStatus } from "./payments";

/**
 * Subscription Helper Functions
 * 
 * Client and server-side helpers for checking user subscription status
 */

/**
 * Check if a user has Pro access
 * Use this on the server side (in API routes, server components, server actions)
 * 
 * @param userId - The user's ID
 * @returns Promise<boolean> - Whether the user has Pro access
 */
export async function hasProAccess(userId: string): Promise<boolean> {
  return await checkUserProStatus(userId);
}

/**
 * Client-side function to check Pro status
 * Calls the /api/payments/status endpoint
 * 
 * @returns Promise<boolean> - Whether the current user has Pro access
 */
export async function checkProStatusClient(): Promise<boolean> {
  try {
    const response = await fetch("/api/payments/status");
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.hasProAccess || false;
  } catch (error) {
    console.error("Error checking Pro status:", error);
    return false;
  }
}

