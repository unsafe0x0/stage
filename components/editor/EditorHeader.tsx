"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { GithubLogo } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
  className?: string;
}

export function EditorHeader({ className }: EditorHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl",
        "supports-[backdrop-filter]:bg-background/70",
        className
      )}
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex h-14 sm:h-16 items-center gap-2 sm:gap-4">
          <SidebarTrigger className="transition-opacity hover:opacity-80 touch-manipulation" />
          
          <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
            <Image 
              src="/logo.png" 
              alt="Stage" 
              width={32} 
              height={32}
              className="h-7 w-7 sm:h-8 sm:w-8"
            />
          </Link>

          <div className="flex-1" />

          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4">
            <a
              href="https://github.com/KartikLabhshetwar/stage"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "p-2 rounded-lg transition-colors touch-manipulation",
                "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
              aria-label="GitHub repository"
            >
              <GithubLogo className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

