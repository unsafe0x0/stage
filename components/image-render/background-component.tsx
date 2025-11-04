import { aspectRatios } from '@/lib/constants/aspect-ratios';
import { getBackgroundCSS } from '@/lib/constants/backgrounds';
import { useImageStore } from '@/lib/store';
import { ContentContainer } from './content-container';
import { TextOverlayRenderer } from './text-overlay-renderer';
import React from 'react';

interface BackgroundComponentProps {
  imageUrl?: string;
  children?: React.ReactNode;
}

export const BackgroundComponent = ({
  imageUrl,
  children,
}: BackgroundComponentProps) => {
  const { backgroundConfig, selectedAspectRatio } = useImageStore();
  const backgroundStyle = getBackgroundCSS(backgroundConfig);
  const aspectRatio =
    aspectRatios.find((ar) => ar.id === selectedAspectRatio)?.ratio || 1;

  // Extract blur from backgroundStyle if it exists
  const { filter, ...restBackgroundStyle } = backgroundStyle;
  const hasBlur = backgroundConfig.type === 'image' && (backgroundConfig.blur || 0) > 0;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-7xl flex items-center justify-center">
        <div
          id="image-render-card"
          className="rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center p-8 relative"
          style={{
            ...restBackgroundStyle,
            aspectRatio,
            maxHeight: '80vh',
          }}
        >
          {/* Blur overlay for background images */}
          {hasBlur && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: restBackgroundStyle.backgroundImage,
                backgroundSize: restBackgroundStyle.backgroundSize,
                backgroundPosition: restBackgroundStyle.backgroundPosition,
                backgroundRepeat: restBackgroundStyle.backgroundRepeat,
                filter: filter,
                zIndex: 0,
              }}
            />
          )}
          <div className="p-6 w-full h-full flex items-center justify-center relative z-10">
            <ContentContainer imageUrl={imageUrl}>{children}</ContentContainer>
            <TextOverlayRenderer />
          </div>
        </div>
      </div>
    </div>
  );
};

