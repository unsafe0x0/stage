import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "@phosphor-icons/react";

/**
 * Checkout Cancel Page
 * 
 * Displayed when user cancels the checkout process
 */
export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle size={64} className="text-orange-500" weight="fill" />
          </div>
          <CardTitle className="text-2xl">Checkout Cancelled</CardTitle>
          <CardDescription>
            Your payment was not processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            You cancelled the checkout process. No charges were made to your account.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/#pricing">
              <Button className="w-full">
                View Pricing
              </Button>
            </Link>
            <Link href="/home">
              <Button variant="outline" className="w-full">
                Continue with Free Plan
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

