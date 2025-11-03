"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CheckoutButtonProps {
  slug?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive";
}

/**
 * CheckoutButton Component
 * 
 * Uses Better Auth's built-in Polar.sh checkout endpoint
 * Redirects to /api/auth/polar/checkout/{slug}
 */
export function CheckoutButton({
  slug = "stage", // Default slug matches the one in auth.ts
  children,
  className,
  variant = "default",
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = () => {
    setIsLoading(true);
    // Redirect to Better Auth's Polar checkout endpoint
    // This endpoint is automatically created by the @polar-sh/better-auth plugin
    window.location.href = `/api/auth/polar/checkout/${slug}`;
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
      variant={variant}
    >
      {isLoading ? "Loading..." : children}
    </Button>
  );
}

