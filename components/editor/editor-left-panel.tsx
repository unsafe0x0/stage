'use client';

import * as React from 'react';
import { TextOverlayControls } from '@/components/text-overlay/text-overlay-controls';
import { StyleTabs } from './style-tabs';
import { Button } from '@/components/ui/button';
import { CloudUpload, Download, Trash2 } from 'lucide-react';
import { useImageStore } from '@/lib/store';
import { ExportDialog } from '@/components/canvas/dialogs/ExportDialog';
import { useExport } from '@/hooks/useExport';
import { PresetSelector } from '@/components/presets/PresetSelector';

export function EditorLeftPanel() {
  const { 
    uploadedImageUrl, 
    selectedAspectRatio, 
    clearImage,
  } = useImageStore();
  
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);

  const {
    settings: exportSettings,
    isExporting,
    updateFormat,
    updateQuality,
    updateScale,
    exportImage,
  } = useExport(selectedAspectRatio);

  return (
    <>
      <div className="w-80 bg-gray-100 border-r border-gray-200 flex flex-col rounded-r-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white rounded-t-r-2xl">
          <PresetSelector />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Text Overlays Section */}
            <TextOverlayControls />
            
            {/* Style Controls */}
            <StyleTabs />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-r-2xl space-y-2">
          <Button
            onClick={() => setExportDialogOpen(true)}
            disabled={!uploadedImageUrl}
            className="w-full h-11 justify-center gap-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-sm hover:shadow-md transition-all font-medium"
          >
            <Download className="size-4" />
            <span>Download</span>
          </Button>
          <Button
            onClick={clearImage}
            disabled={!uploadedImageUrl}
            variant="outline"
            className="w-full h-10 justify-center gap-2 rounded-xl border-gray-300 hover:bg-gray-50 text-gray-700 transition-all"
          >
            <Trash2 className="size-4" />
            <span>Remove Image</span>
          </Button>
        </div>
      </div>

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExport={() => exportImage().then(() => {})}
        format={exportSettings.format}
        quality={exportSettings.quality}
        scale={exportSettings.scale}
        isExporting={isExporting}
        onFormatChange={updateFormat}
        onQualityChange={updateQuality}
        onScaleChange={updateScale}
      />
    </>
  );
}

