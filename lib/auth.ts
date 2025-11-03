import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { nextCookies } from "better-auth/next-js";
import { polar, checkout } from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";

const prisma = new PrismaClient();

/**
 * Better Auth Configuration
 * 
 * This configuration includes:
 * - Email/Password authentication
 * - Google OAuth provider
 * - Polar.sh payment integration via @polar-sh/better-auth plugin
 * - Enhanced session management with cookie caching
 * - Email verification support
 * - Secure cookie settings for production
 * 
 * Required Environment Variables:
 * - BETTER_AUTH_SECRET: Secret key for encryption and hashing (required)
 * - DATABASE_URL: PostgreSQL connection string (required)
 * - POLAR_ACCESS_TOKEN: Polar.sh API access token (required for payments)
 * - POLAR_PRODUCT_ID: Polar.sh product ID (required for checkout)
 * 
 * Optional Environment Variables:
 * - BETTER_AUTH_URL: Base URL of your application (defaults to http://localhost:3000)
 * - POLAR_SUCCESS_URL: Success redirect URL (defaults to /checkout/success?checkout_id={CHECKOUT_ID})
 * - GOOGLE_CLIENT_ID: Google OAuth client ID (for Google sign-in)
 * - GOOGLE_CLIENT_SECRET: Google OAuth client secret (for Google sign-in)
 */
// Validate that required environment variables are set
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error(
    "BETTER_AUTH_SECRET environment variable is required. " +
    "Generate one using: openssl rand -base64 32"
  );
}

// Validate Polar.sh environment variables (warn instead of throw for development)
if (!process.env.POLAR_ACCESS_TOKEN) {
  console.warn(
    "⚠️  POLAR_ACCESS_TOKEN is not set. Polar.sh checkout will not work. " +
    "Get your access token from https://polar.sh/dashboard/settings/api-keys"
  );
}

if (!process.env.POLAR_PRODUCT_ID) {
  console.warn(
    "⚠️  POLAR_PRODUCT_ID is not set. Polar.sh checkout will not work. " +
    "Get your product ID from your Polar.sh dashboard."
  );
}

export const auth = betterAuth({
  // Secret key for encryption and hashing
  // This is REQUIRED for secure authentication
  // Generate one using: openssl rand -base64 32
  // Better Auth will also automatically read from process.env.BETTER_AUTH_SECRET
  // but we set it explicitly here for clarity
  secret: process.env.BETTER_AUTH_SECRET,
  
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  
  // Email/Password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true if you want email verification
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  
  // Social providers (Google OAuth)
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      strategy: "jwe", // Encrypted tokens for better security
    },
  },
  
  // Trusted origins for CORS
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  ].filter(Boolean) as string[],
  
  // Base path for auth endpoints
  basePath: "/api/auth",
  
  // Base URL (used for redirects and OAuth callbacks)
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  
  // Next.js cookies plugin for Server Actions support
  plugins: [
    nextCookies(),
    // Polar.sh payment integration (only if env vars are set)
    ...(process.env.POLAR_ACCESS_TOKEN && process.env.POLAR_PRODUCT_ID
      ? [
          polar({
            client: new Polar({
              accessToken: process.env.POLAR_ACCESS_TOKEN,
            }),
            createCustomerOnSignUp: true,
            use: [
              checkout({
                products: [
                  {
                    productId: process.env.POLAR_PRODUCT_ID,
                    slug: "stage", // Custom slug for easy reference in Checkout URL, e.g. /checkout/stage
                  },
                ],
                successUrl:
                  process.env.POLAR_SUCCESS_URL ||
                  `${process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"}/checkout/success?checkout_id={CHECKOUT_ID}`,
                authenticatedUsersOnly: true,
              }),
            ],
          }),
        ]
      : []),
  ],
});

