'use client';

import * as React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useImageStore } from '@/lib/store';
import { ExportDialog } from '@/components/canvas/dialogs/ExportDialog';
import { StyleTabs } from './style-tabs';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function SidebarLeft({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { uploadedImageUrl } = useImageStore();
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);

  const handleExport = async (format: 'png' | 'jpg', quality: number): Promise<string> => {
    const element = document.getElementById('image-render-card');
    if (!element) {
      throw new Error('Image render card not found');
    }

    // Use html2canvas directly with format options
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    // Convert canvas to data URL with specified format
    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    return canvas.toDataURL(mimeType, quality);
  };

  return (
    <>
      <Sidebar className="border-r-0" {...props}>
        <SidebarHeader className="p-4 pb-3">
          <div className="space-y-3">
            <Button
              onClick={() => setExportDialogOpen(true)}
              disabled={!uploadedImageUrl}
              className="w-full h-10"
              variant={uploadedImageUrl ? 'default' : 'secondary'}
            >
              <Download className="size-4 mr-2" />
              Export Image
            </Button>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-4 pb-4 space-y-6">
          <StyleTabs />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={handleExport}
      />
    </>
  );
}
