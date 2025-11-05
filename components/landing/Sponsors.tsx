"use client";

import Image from "next/image";
import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import { Globe } from "lucide-react";
import { FaXTwitter, FaGithub } from "react-icons/fa6";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"],
});

export interface Sponsor {
  name: string;
  avatar?: string;
  avatarAlt?: string;
  amount?: string;
  amountType?: "one time" | "monthly" | "yearly";
  total?: string;
  github?: string;
  website?: string;
  twitter?: string;
  isSpecial?: boolean;
  specialSince?: string;
  url?: string;
}

interface SponsorsProps {
  title?: string;
  sponsors?: Sponsor[];
  showDescription?: boolean;
}

const defaultSponsors: Sponsor[] = [
  {
    name: "Arinjay Wyawhare",
    avatar: "/arinjay.jpg",
    avatarAlt: "arinjay wyawhare",
    amount: "₹420.69",
    amountType: "one time",
    total: "₹420.69",
    github: "jaywyawhare",
    twitter: "jaywyawhare",
    website: "https://jaywyawhare-github-io.vercel.app",
    url: "https://x.com/jaywyawhare",
  },
];

export function Sponsors({ 
  title = "Our Sponsors", 
  sponsors = defaultSponsors,
  showDescription = false 
}: SponsorsProps) {
  const hasSponsors = sponsors && sponsors.length > 0;

  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6 border-t border-border bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <h2 className={`text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 px-2 ${instrumentSerif.className}`}>
          {title}
        </h2>
        {hasSponsors ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sponsors.map((sponsor, index) => {
              const content = (
                <div className="group relative rounded-xl border border-border/50 bg-background/95 backdrop-blur-sm hover:border-border hover:shadow-lg transition-all duration-200 overflow-hidden">

                  <div className="p-5 sm:p-6">
                    <div className="flex gap-4 items-start">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {sponsor.avatar ? (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-border/50 bg-muted">
                            <Image
                              src={sponsor.avatar}
                              alt={sponsor.avatarAlt || sponsor.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-border/50">
                            <span className="text-xl sm:text-2xl font-bold text-primary">
                              {sponsor.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1.5 truncate">
                          {sponsor.name}
                        </h3>
                        
                        {sponsor.amount && (
                          <div className="mb-2.5">
                            <p className="text-sm font-medium text-primary">
                              {sponsor.amount} {sponsor.amountType || "one time"}
                            </p>
                            {sponsor.total && (
                              <p className="text-xs text-primary/80 mt-0.5">
                                Total: {sponsor.total}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Social Links */}
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          {sponsor.github && (
                            <a
                              href={`https://github.com/${sponsor.github}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-foreground/80 hover:text-foreground transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaGithub className="w-3.5 h-3.5" />
                              <span>github.com/{sponsor.github}</span>
                            </a>
                          )}
                          {sponsor.twitter && (
                            <a
                              href={`https://twitter.com/${sponsor.twitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-foreground/80 hover:text-foreground transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaXTwitter className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[120px]">
                                x.com/{sponsor.twitter}
                              </span>
                            </a>
                          )}
                          {sponsor.website && (
                            <a
                              href={sponsor.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs text-foreground/80 hover:text-foreground transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Globe className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[120px]">
                                {sponsor.website.replace(/^https?:\/\//, '')}
                              </span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );

              if (sponsor.url) {
                return (
                  <Link
                    key={index}
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div key={index}>
                  {content}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-6 text-base sm:text-lg">
              Become a sponsor and support Stage development
            </p>
            <Link
              href="https://buymeacoffee.com/code_kartik"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              Sponsor Stage
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
