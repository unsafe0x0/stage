'use client';

import { useEffect } from 'react';
import { useImageStore } from '@/lib/store';
import { useCanvasContext } from '@/components/canvas/CanvasContext';
import { aspectRatios } from '@/lib/constants/aspect-ratios';
import { ASPECT_RATIO_PRESETS, type AspectRatioPreset } from '@/lib/constants';

/**
 * Bridge component that syncs the image store with the canvas context
 * This ensures aspect ratio changes and other state updates are reflected in the canvas
 */
export function CanvasImageStoreBridge() {
  const { setAspectRatio: setCanvasAspectRatio, operations } = useCanvasContext();
  const { selectedAspectRatio, uploadedImageUrl } = useImageStore();

  // Sync aspect ratio changes with canvas
  useEffect(() => {
    const aspectRatio = aspectRatios.find((ar) => ar.id === selectedAspectRatio);
    if (aspectRatio) {
      // Find matching preset or create one
      const matchingPreset = ASPECT_RATIO_PRESETS.find(
        (preset) => preset.ratio === aspectRatio.ratio.toString()
      ) || {
        id: aspectRatio.id,
        name: aspectRatio.name,
        category: 'Custom',
        width: aspectRatio.width * 100,
        height: aspectRatio.height * 100,
        ratio: aspectRatio.ratio.toString(),
      };

      setCanvasAspectRatio(matchingPreset as AspectRatioPreset);
    }
  }, [selectedAspectRatio, setCanvasAspectRatio]);

  // Sync image uploads with canvas
  useEffect(() => {
    if (uploadedImageUrl && operations) {
      // Add image to canvas if not already added
      operations.addImage(uploadedImageUrl).catch((err) => {
        console.error('Failed to add image to canvas:', err);
      });
    }
  }, [uploadedImageUrl, operations]);

  return null;
}

