'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Shuffle, Undo2, Redo2 } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { SponsorButton } from '@/components/SponsorButton';

export function EditorBottomBar() {
  return (
    <div className="h-14 bg-white border-t border-gray-200 flex items-center justify-between px-6">
      {/* Left side - Open Source and Shuffle */}
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/KartikLabhshetwar/stage"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            variant="outline"
            className="h-9 px-4 rounded-xl bg-white hover:bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md transition-all font-medium gap-2"
          >
            <FaGithub className="size-4" />
            <span>Proudly Open Source</span>
          </Button>
        </a>
      </div>

      {/* Right side - Undo/Redo and Sponsor */}
      <div className="flex items-center gap-2">
        
        <SponsorButton variant="bar" />
      </div>
    </div>
  );
}

