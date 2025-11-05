"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"],
});

interface HeroProps {
  title: string;
  subtitle?: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function Hero({
  title,
  subtitle,
  description,
  ctaLabel = "Get Started",
  ctaHref = "/home",
}: HeroProps) {
  return (
    <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto max-w-4xl text-center space-y-6 sm:space-y-8">
        <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${instrumentSerif.className} px-2`}>
          {title}
          {subtitle && (
            <>
              <br />
              <span className="text-primary underline decoration-primary decoration-2 underline-offset-4">
                {subtitle}
              </span>
            </>
          )}
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-2">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4 px-4 sm:px-0 w-full sm:w-auto">
          <Link href={ctaHref} className="w-full sm:w-auto">
            <Button size="lg" className="rounded-lg w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all touch-manipulation min-h-[44px] text-base sm:text-lg">
              {ctaLabel}
            </Button>
          </Link>
          <Link href="" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="rounded-lg w-full sm:w-auto border-primary text-primary hover:bg-accent hover:border-primary/80 touch-manipulation min-h-[44px] text-base sm:text-lg">
              View Demo
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

