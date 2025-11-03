import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "@phosphor-icons/react";

/**
 * Checkout Success Page
 * 
 * Displayed after successful payment completion
 * Redirects to /home after 3 seconds
 */
export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 size={64} className="text-green-500" weight="fill" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for upgrading to Pro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Your payment has been processed successfully. You now have access to all Pro features.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/home">
              <Button className="w-full">
                Go to Editor
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

