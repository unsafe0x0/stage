"use client";

import { FaGithub } from "react-icons/fa";

interface FooterProps {
  brandName?: string;
  additionalText?: string;
}

export function Footer({ 
  brandName = "Stage", 
  additionalText = "" 
}: FooterProps) {
  return (
    <footer className="w-full border-t border-border py-4 sm:py-6 shrink-0 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} {brandName}. {additionalText}
          </p>
          <a
            href="https://github.com/KartikLabhshetwar/stage"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub repository"
          >
            <FaGithub className="h-4 w-4 text-current" />
            <span>View on GitHub</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

