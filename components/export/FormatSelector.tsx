/**
 * Format selector component for export options
 */

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface FormatSelectorProps {
  format: 'png' | 'jpg';
  onFormatChange: (format: 'png' | 'jpg') => void;
}

export function FormatSelector({ format, onFormatChange }: FormatSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-foreground">Format</Label>
      <div className="flex gap-2">
        <Button
          variant={format === "png" ? "default" : "outline"}
          onClick={() => onFormatChange("png")}
          className={`flex-1 h-11 touch-manipulation ${format === "png" ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}`}
        >
          PNG
        </Button>
        <Button
          variant={format === "jpg" ? "default" : "outline"}
          onClick={() => onFormatChange("jpg")}
          className={`flex-1 h-11 touch-manipulation ${format === "jpg" ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}`}
        >
          JPG
        </Button>
      </div>
    </div>
  );
}

