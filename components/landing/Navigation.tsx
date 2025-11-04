"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { GithubLogo } from "@phosphor-icons/react";

interface NavigationProps {
  ctaLabel?: string;
  ctaHref?: string;
}

export function Navigation({ 
  ctaLabel = "Editor", 
  ctaHref = "/home" 
}: NavigationProps) {
  return (
    <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image 
            src="/logo.png" 
            alt="Stage" 
            width={32} 
            height={32}
            className="h-8 w-8"
          />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://github.com/KartikLabhshetwar/stage"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
            aria-label="GitHub repository"
          >
            <GithubLogo className="h-5 w-5 text-gray-700 hover:text-gray-900" />
          </a>
          <Link href={ctaHref}>
            <Button className="bg-blue-600 text-white hover:bg-blue-700 text-sm px-3 sm:px-4 py-2 touch-manipulation">
              {ctaLabel}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

