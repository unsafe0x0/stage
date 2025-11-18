'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Image as KonvaImage,
  Group,
  Circle,
  Text,
  Path,
  Transformer,
} from 'react-konva';
import Konva from 'konva';
import { useEditorStore } from '@/lib/store';
import { useImageStore } from '@/lib/store';
import { generatePattern } from '@/lib/patterns';
import { useResponsiveCanvasDimensions } from '@/hooks/useAspectRatioDimensions';
import { getBackgroundCSS } from '@/lib/constants/backgrounds';
import { getFontCSS } from '@/lib/constants/fonts';
import { generateNoiseTexture } from '@/lib/export/export-utils';
import { getCldImageUrl } from '@/lib/cloudinary';
import { OVERLAY_PUBLIC_IDS } from '@/lib/cloudinary-overlays';
import { MockupRenderer } from '@/components/mockups/MockupRenderer';

// Global ref to store the Konva stage for export
let globalKonvaStage: any = null;

/**
 * Parse CSS linear gradient string to Konva gradient properties
 * Example: "linear-gradient(to right, #FF6B6B, #FFE66D)"
 */
function parseLinearGradient(
  gradientString: string,
  width: number,
  height: number
) {
  // Extract direction and colors from CSS gradient string
  const match = gradientString.match(/linear-gradient\((.+)\)/);
  if (!match) return null;

  const parts = match[1].split(',').map((p) => p.trim());
  const direction = parts[0];
  const colors = parts.slice(1);

  // Determine gradient direction
  let startPoint = { x: 0, y: 0 };
  let endPoint = { x: width, y: 0 }; // Default to horizontal (to right)

  if (direction.includes('right')) {
    startPoint = { x: 0, y: 0 };
    endPoint = { x: width, y: 0 };
  } else if (direction.includes('left')) {
    startPoint = { x: width, y: 0 };
    endPoint = { x: 0, y: 0 };
  } else if (direction.includes('bottom')) {
    startPoint = { x: 0, y: 0 };
    endPoint = { x: 0, y: height };
  } else if (direction.includes('top')) {
    startPoint = { x: 0, y: height };
    endPoint = { x: 0, y: 0 };
  }

  // Build color stops array [position, color, position, color, ...]
  const colorStops: (number | string)[] = [];
  colors.forEach((color, index) => {
    const position = index / (colors.length - 1);
    colorStops.push(position, color.trim());
  });

  return {
    startPoint,
    endPoint,
    colorStops,
  };
}

function CanvasRenderer({ image }: { image: HTMLImageElement }) {
  const stageRef = useRef<any>(null);

  // Store stage globally for export
  useEffect(() => {
    const updateStage = () => {
      if (stageRef.current) {
        // react-konva Stage ref gives us the Stage instance directly
        globalKonvaStage = stageRef.current;
      }
    };

    updateStage();
    // Also check after a short delay to ensure ref is set
    const timeout = setTimeout(updateStage, 100);

    return () => {
      clearTimeout(timeout);
      globalKonvaStage = null;
    };
  });
  const patternRectRef = useRef<any>(null);
  const noiseRectRef = useRef<any>(null);
  const backgroundRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [patternImage, setPatternImage] = useState<HTMLCanvasElement | null>(
    null
  );
  const [noiseImage, setNoiseImage] = useState<HTMLImageElement | null>(null);

  const {
    screenshot,
    setScreenshot,
    background,
    shadow,
    pattern: patternStyle,
    frame,
    canvas,
    noise,
  } = useEditorStore();

  const {
    backgroundConfig,
    backgroundBorderRadius,
    backgroundBlur,
    backgroundNoise,
    perspective3D,
    imageOpacity,
    textOverlays,
    imageOverlays,
    mockups,
    updateTextOverlay,
    updateImageOverlay,
    updateMockup,
  } = useImageStore();

  const hasMockups = mockups.length > 0 && mockups.some((m) => m.isVisible);

  const responsiveDimensions = useResponsiveCanvasDimensions();
  const backgroundStyle = getBackgroundCSS(backgroundConfig);

  // Track viewport size for responsive canvas sizing
  const [viewportSize, setViewportSize] = useState({
    width: 1920,
    height: 1080,
  });

  // Load background image if type is 'image'
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  // Generate noise texture for background noise effect
  const [noiseTexture, setNoiseTexture] = useState<HTMLCanvasElement | null>(
    null
  );

  const [loadedOverlayImages, setLoadedOverlayImages] = useState<
    Record<string, HTMLImageElement>
  >({});

  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(
    null
  );
  const [isMainImageSelected, setIsMainImageSelected] = useState(false);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const transformerRef = useRef<any>(null);
  const overlayRefs = useRef<Record<string, any>>({});
  const layerRef = useRef<any>(null);
  const mainImageRef = useRef<any>(null);
  const mainImageTransformerRef = useRef<any>(null);
  const textRefs = useRef<Record<string, any>>({});
  const textTransformerRef = useRef<any>(null);
  const textLayerRef = useRef<any>(null);

  useEffect(() => {
    if (backgroundNoise > 0) {
      // Generate noise texture using Gaussian distribution for realistic grain
      const intensity = backgroundNoise / 100; // Convert percentage to 0-1 range
      const noiseCanvas = generateNoiseTexture(200, 200, intensity);
      setNoiseTexture(noiseCanvas);
    } else {
      setNoiseTexture(null);
    }
  }, [backgroundNoise]);

  // Get container dimensions early for use in useEffect
  const containerWidth = responsiveDimensions.width;
  const containerHeight = responsiveDimensions.height;

  useEffect(() => {
    if (backgroundConfig.type === 'image' && backgroundConfig.value) {
      const imageValue = backgroundConfig.value as string;

      // Check if it's a valid image URL/blob/data URI or Cloudinary public ID
      // Skip if it looks like a gradient key (e.g., "primary_gradient")
      const isValidImageValue =
        imageValue.startsWith('http') ||
        imageValue.startsWith('blob:') ||
        imageValue.startsWith('data:') ||
        // Check if it might be a Cloudinary public ID (not a gradient key)
        (typeof imageValue === 'string' && !imageValue.includes('_gradient'));

      if (!isValidImageValue) {
        setBgImage(null);
        return;
      }

      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => setBgImage(img);
      img.onerror = () => {
        console.error(
          'Failed to load background image:',
          backgroundConfig.value
        );
        setBgImage(null);
      };

      // Check if it's a Cloudinary public ID or URL
      let imageUrl = imageValue;
      if (
        typeof imageUrl === 'string' &&
        !imageUrl.startsWith('http') &&
        !imageUrl.startsWith('blob:') &&
        !imageUrl.startsWith('data:')
      ) {
        // It might be a Cloudinary public ID, construct URL
        const { cloudinaryPublicIds } = require('@/lib/cloudinary-backgrounds');
        if (cloudinaryPublicIds.includes(imageUrl)) {
          // Use container dimensions for better quality
          imageUrl = getCldImageUrl({
            src: imageUrl,
            width: Math.max(containerWidth, 1920),
            height: Math.max(containerHeight, 1080),
            quality: 'auto',
            format: 'auto',
            crop: 'fill',
            gravity: 'auto',
          });
        } else {
          // Invalid image value, don't try to load
          setBgImage(null);
          return;
        }
      }

      img.src = imageUrl;
    } else {
      setBgImage(null);
    }
  }, [backgroundConfig, containerWidth, containerHeight]);

  // Load overlay images
  useEffect(() => {
    const loadOverlays = async () => {
      const loadedImages: Record<string, HTMLImageElement> = {};

      for (const overlay of imageOverlays) {
        if (!overlay.isVisible) continue;

        try {
          const isCloudinaryId =
            OVERLAY_PUBLIC_IDS.includes(overlay.src as any) ||
            (typeof overlay.src === 'string' &&
              overlay.src.startsWith('overlays/'));

          const imageUrl =
            isCloudinaryId && !overlay.isCustom
              ? getCldImageUrl({
                  src: overlay.src,
                  width: overlay.size * 2,
                  height: overlay.size * 2,
                  quality: 'auto',
                  format: 'auto',
                  crop: 'fit',
                })
              : overlay.src;

          const img = new window.Image();
          img.crossOrigin = 'anonymous';

          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              loadedImages[overlay.id] = img;
              resolve();
            };
            img.onerror = reject;
            img.src = imageUrl;
          });
        } catch (error) {
          console.error(
            `Failed to load overlay image for ${overlay.id}:`,
            error
          );
        }
      }

      setLoadedOverlayImages(loadedImages);
    };

    loadOverlays();
  }, [imageOverlays]);

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  useEffect(() => {
    if (!patternStyle.enabled) {
      setPatternImage(null);
      return;
    }

    const newPattern = generatePattern(
      patternStyle.type,
      patternStyle.scale,
      patternStyle.spacing,
      patternStyle.color,
      patternStyle.rotation,
      patternStyle.blur
    );
    setPatternImage(newPattern);
  }, [
    patternStyle.enabled,
    patternStyle.type,
    patternStyle.scale,
    patternStyle.spacing,
    patternStyle.color,
    patternStyle.rotation,
    patternStyle.blur,
  ]);

  useEffect(() => {
    if (!noise.enabled || noise.type === 'none') {
      setNoiseImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setNoiseImage(img);
    img.onerror = () => setNoiseImage(null);
    img.src = `/${noise.type}.jpg`;
  }, [noise.enabled, noise.type]);

  /* ─────────────────── layout helpers ─────────────────── */
  const imageAspect = image.naturalWidth / image.naturalHeight;

  // Calculate canvas aspect ratio from selected aspect ratio using responsive dimensions
  const canvasAspect = containerWidth / containerHeight;

  // Calculate content area (image area without padding)
  // Use viewport-aware dimensions, respecting the selected aspect ratio
  const availableWidth = Math.min(viewportSize.width * 1.1, containerWidth);
  const availableHeight = Math.min(viewportSize.height * 1.1, containerHeight);

  // Calculate canvas dimensions that maintain the selected aspect ratio
  let canvasW, canvasH;
  if (availableWidth / availableHeight > canvasAspect) {
    // Height is the limiting factor
    canvasH = availableHeight - canvas.padding * 2;
    canvasW = canvasH * canvasAspect;
  } else {
    // Width is the limiting factor
    canvasW = availableWidth - canvas.padding * 2;
    canvasH = canvasW / canvasAspect;
  }

  // Ensure reasonable dimensions
  const minContentSize = 300;
  canvasW = Math.max(canvasW, minContentSize);
  canvasH = Math.max(canvasH, minContentSize);

  // Content dimensions (without padding)
  const contentW = canvasW - canvas.padding * 2;
  const contentH = canvasH - canvas.padding * 2;

  useEffect(() => {
    if (patternRectRef.current) {
      patternRectRef.current.cache();
    }
  }, [patternImage, canvasW, canvasH, patternStyle.opacity, patternStyle.blur]);

  // Cache background when blur is active
  useEffect(() => {
    if (backgroundRef.current && backgroundBlur > 0) {
      backgroundRef.current.cache();
      backgroundRef.current.getLayer()?.batchDraw();
    }
  }, [
    backgroundBlur,
    backgroundConfig,
    backgroundBorderRadius,
    canvasW,
    canvasH,
    bgImage,
  ]);

  useEffect(() => {
    if (transformerRef.current) {
      if (selectedOverlayId && overlayRefs.current[selectedOverlayId]) {
        const node = overlayRefs.current[selectedOverlayId];
        transformerRef.current.nodes([node]);
      } else {
        transformerRef.current.nodes([]);
      }
      layerRef.current?.batchDraw();
    }
  }, [selectedOverlayId, imageOverlays]);

  useEffect(() => {
    if (mainImageTransformerRef.current) {
      if (isMainImageSelected && mainImageRef.current) {
        mainImageTransformerRef.current.nodes([mainImageRef.current]);
      } else {
        mainImageTransformerRef.current.nodes([]);
      }
      mainImageRef.current?.getLayer()?.batchDraw();
    }
  }, [isMainImageSelected]);

  useEffect(() => {
    if (textTransformerRef.current) {
      if (selectedTextId && textRefs.current[selectedTextId]) {
        const node = textRefs.current[selectedTextId];
        textTransformerRef.current.nodes([node]);
      } else {
        textTransformerRef.current.nodes([]);
      }
      textLayerRef.current?.batchDraw();
    }
  }, [selectedTextId, textOverlays]);

  let imageScaledW, imageScaledH;
  if (contentW / contentH > imageAspect) {
    imageScaledH = contentH * screenshot.scale;
    imageScaledW = imageScaledH * imageAspect;
  } else {
    imageScaledW = contentW * screenshot.scale;
    imageScaledH = imageScaledW / imageAspect;
  }

  /* ─────────────────── frame helpers ─────────────────── */
  const showFrame = frame.enabled && frame.type !== 'none';
  const frameOffset =
    showFrame && frame.type === 'solid'
      ? frame.width
      : showFrame && frame.type === 'ruler'
      ? frame.width + 2
      : 0;
  const windowPadding =
    showFrame && frame.type === 'window' ? frame.padding || 20 : 0;
  const windowHeader = showFrame && frame.type === 'window' ? 40 : 0;
  const eclipseBorder =
    showFrame && frame.type === 'eclipse' ? frame.width + 2 : 0;
  const framedW =
    imageScaledW + frameOffset * 2 + windowPadding * 2 + eclipseBorder;
  const framedH =
    imageScaledH +
    frameOffset * 2 +
    windowPadding * 2 +
    windowHeader +
    eclipseBorder;

  const shadowProps = shadow.enabled
    ? (() => {
        const { elevation, side, softness, color, intensity } = shadow;
        const diag = elevation * 0.707;
        const offset =
          side === 'bottom'
            ? { x: 0, y: elevation }
            : side === 'right'
            ? { x: elevation, y: 0 }
            : side === 'bottom-right'
            ? { x: diag, y: diag }
            : { x: 0, y: 0 };

        return {
          shadowColor: color,
          shadowBlur: softness,
          shadowOffsetX: offset.x,
          shadowOffsetY: offset.y,
          shadowOpacity: intensity,
        };
      })()
    : {};

  // Build CSS 3D transform string for image only
  // Include screenshot.rotation to match Konva Group rotation
  const perspective3DTransform = `
    translate(${perspective3D.translateX}%, ${perspective3D.translateY}%)
    scale(${perspective3D.scale})
    rotateX(${perspective3D.rotateX}deg)
    rotateY(${perspective3D.rotateY}deg)
    rotateZ(${perspective3D.rotateZ + screenshot.rotation}deg)
  `
    .replace(/\s+/g, ' ')
    .trim();

  // Check if 3D transforms are active (any non-default value)
  const has3DTransform =
    perspective3D.rotateX !== 0 ||
    perspective3D.rotateY !== 0 ||
    perspective3D.rotateZ !== 0 ||
    perspective3D.translateX !== 0 ||
    perspective3D.translateY !== 0 ||
    perspective3D.scale !== 1;

  // Calculate image position relative to canvas
  // Account for Group position and offset
  const groupCenterX = canvasW / 2 + screenshot.offsetX;
  const groupCenterY = canvasH / 2 + screenshot.offsetY;
  const imageX = groupCenterX + frameOffset + windowPadding - imageScaledW / 2;
  const imageY =
    groupCenterY +
    frameOffset +
    windowPadding +
    windowHeader -
    imageScaledH / 2;

  // Helper function to parse gradient from CSS string
  const parseGradient = (bgStyle: React.CSSProperties) => {
    if (backgroundConfig.type === 'gradient' && bgStyle.background) {
      const gradientStr = bgStyle.background as string;
      return gradientStr;
    }
    return null;
  };

  /* ─────────────────── render ─────────────────── */
  return (
    <div
      ref={containerRef}
      id="image-render-card"
      className="flex items-center justify-center"
      style={{
        width: `${containerWidth}px`,
        maxWidth: `${containerWidth}px`,
        aspectRatio: responsiveDimensions.aspectRatio,
        maxHeight: 'calc(100vh - 200px)',
        backgroundColor: 'transparent',
        padding: '0px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: `${canvasW}px`,
          height: `${canvasH}px`,
          minWidth: `${canvasW}px`,
          minHeight: `${canvasH}px`,
          overflow: 'hidden',
        }}
      >
        {/* 3D Transformed Image Overlay - Only when 3D transforms are active (HTML fallback for 3D) */}
        {has3DTransform && (
          <div
            data-3d-overlay="true"
            data-untransformed-x={groupCenterX - framedW / 2}
            data-untransformed-y={groupCenterY - framedH / 2}
            data-untransformed-width={framedW}
            data-untransformed-height={framedH}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${canvasW}px`,
              height: `${canvasH}px`,
              perspective: `${perspective3D.perspective}px`,
              transformStyle: 'preserve-3d',
              zIndex: 15,
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            {/* Shadow wrapper - transforms with the frame */}
            <div
              style={{
                position: 'absolute',
                left: `${groupCenterX - framedW / 2}px`,
                top: `${groupCenterY - framedH / 2}px`,
                width: `${framedW}px`,
                height: `${framedH}px`,
                transform: perspective3DTransform,
                transformOrigin: 'center center',
                willChange: 'transform',
                transition: 'transform 0.125s linear',
                ...(shadow.enabled && {
                  filter: `drop-shadow(${
                    shadow.side === 'bottom'
                      ? `0px ${shadow.elevation}px`
                      : shadow.side === 'right'
                      ? `${shadow.elevation}px 0px`
                      : shadow.side === 'bottom-right'
                      ? `${shadow.elevation * 0.707}px ${shadow.elevation * 0.707}px`
                      : '0px 0px'
                  } ${shadow.softness}px ${shadow.color})`,
                  opacity: shadow.intensity,
                }),
              }}
            >
              {/* Frame Container */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                }}
              >
                {/* Solid Frame */}
                {showFrame && frame.type === 'solid' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: frame.color,
                      borderRadius: `${screenshot.radius}px`,
                    }}
                  />
                )}

                {/* Glassy Frame */}
                {showFrame && frame.type === 'glassy' && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${frameOffset + windowPadding}px`,
                      top: `${frameOffset + windowPadding + windowHeader}px`,
                      width: `${imageScaledW}px`,
                      height: `${imageScaledH}px`,
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      border: `${frame.width * 4 + 6}px solid rgba(255, 255, 255, 0.3)`,
                      borderRadius: `${screenshot.radius}px`,
                    }}
                  />
                )}

                {/* Ruler Frame */}
                {showFrame && frame.type === 'ruler' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: `${screenshot.radius}px`,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.9)',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Ruler marks background */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: `${screenshot.radius}px`,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Top ruler marks */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '10px' }}>
                        {Array.from({ length: Math.floor(framedW / 10) - 1 }).map((_, i) => (
                          <div
                            key={`t-${i}`}
                            style={{
                              position: 'absolute',
                              left: `${i * 10}px`,
                              top: '1px',
                              width: '2px',
                              height: (i + 1) % 5 === 0 ? '10px' : '5px',
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            }}
                          />
                        ))}
                      </div>
                      {/* Left ruler marks */}
                      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '10px' }}>
                        {Array.from({ length: Math.floor(framedH / 10) - 1 }).map((_, i) => (
                          <div
                            key={`l-${i}`}
                            style={{
                              position: 'absolute',
                              left: '1px',
                              top: `${i * 10}px`,
                              width: (i + 1) % 5 === 0 ? '10px' : '5px',
                              height: '2px',
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Infinite Mirror Frame */}
                {showFrame && frame.type === 'infinite-mirror' && (
                  <>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          position: 'absolute',
                          left: `${-i * 7.5}px`,
                          top: `${-i * 7.5}px`,
                          width: `${framedW + i * 15}px`,
                          height: `${framedH + i * 15}px`,
                          border: `4px solid ${frame.color}`,
                          borderRadius: `${screenshot.radius + i * 5}px`,
                          opacity: 0.3 - i * 0.07,
                          boxSizing: 'border-box',
                        }}
                      />
                    ))}
                  </>
                )}

                {/* Eclipse Frame */}
                {showFrame && frame.type === 'eclipse' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: `${screenshot.radius + eclipseBorder}px`,
                      backgroundColor: frame.color,
                      border: `${eclipseBorder}px solid ${frame.color}`,
                      boxSizing: 'border-box',
                    }}
                  />
                )}

                {/* Stack Frame */}
                {showFrame && frame.type === 'stack' && (
                  <>
                    {/* Bottom layer */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${(framedW - framedW / 1.2) / 2}px`,
                        top: '-40px',
                        width: `${framedW / 1.2}px`,
                        height: `${framedH / 5}px`,
                        backgroundColor: frame.theme === 'dark' ? '#444444' : '#f5f5f5',
                        borderRadius: `${screenshot.radius}px`,
                      }}
                    />
                    {/* Middle layer */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${(framedW - framedW / 1.1) / 2}px`,
                        top: '-20px',
                        width: `${framedW / 1.1}px`,
                        height: `${framedH / 5}px`,
                        backgroundColor: frame.theme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                        borderRadius: `${screenshot.radius}px`,
                      }}
                    />
                    {/* Top layer */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: frame.theme === 'dark' ? '#555555' : '#e8e8e8',
                        borderRadius: `${screenshot.radius}px`,
                      }}
                    />
                  </>
                )}

                {/* Window Frame */}
                {showFrame && frame.type === 'window' && (
                  <>
                    {/* Main window background */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: frame.theme === 'dark' ? '#2f2f2f' : '#fefefe',
                        borderRadius: `${screenshot.radius}px`,
                      }}
                    />
                    {/* Header */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: `${windowHeader}px`,
                        backgroundColor: frame.theme === 'dark' ? '#4a4a4a' : '#e2e2e2',
                        borderRadius: `${screenshot.radius}px ${screenshot.radius}px 0 0`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Window control buttons */}
                      <div style={{ position: 'absolute', left: '15px', display: 'flex', gap: '8px' }}>
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: '#ff5f57',
                          }}
                        />
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: '#febc2e',
                          }}
                        />
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: '#28c840',
                          }}
                        />
                      </div>
                      {/* Title */}
                      {frame.title && (
                        <div
                          style={{
                            color: frame.theme === 'dark' ? '#f0f0f0' : '#4f4f4f',
                            fontSize: '14px',
                            fontWeight: '500',
                          }}
                        >
                          {frame.title}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Dotted Frame */}
                {showFrame && frame.type === 'dotted' && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      border: `${frame.width}px dashed ${frame.color}`,
                      borderRadius: `${screenshot.radius}px`,
                      boxSizing: 'border-box',
                    }}
                  />
                )}

                {/* Focus Frame - Corner brackets */}
                {showFrame && frame.type === 'focus' && (
                  <>
                    {/* Top-left corner */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${frameOffset}px`,
                        top: `${frameOffset}px`,
                        width: `${frame.width * 3}px`,
                        height: `${frame.width}px`,
                        backgroundColor: frame.color,
                        borderRadius: `${frame.width / 2}px 0 0 0`,
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: `${frameOffset}px`,
                        top: `${frameOffset}px`,
                        width: `${frame.width}px`,
                        height: `${frame.width * 3}px`,
                        backgroundColor: frame.color,
                        borderRadius: `${frame.width / 2}px 0 0 0`,
                      }}
                    />
                    {/* Top-right corner */}
                    <div
                      style={{
                        position: 'absolute',
                        right: `${frameOffset}px`,
                        top: `${frameOffset}px`,
                        width: `${frame.width * 3}px`,
                        height: `${frame.width}px`,
                        backgroundColor: frame.color,
                        borderRadius: `0 ${frame.width / 2}px 0 0`,
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        right: `${frameOffset}px`,
                        top: `${frameOffset}px`,
                        width: `${frame.width}px`,
                        height: `${frame.width * 3}px`,
                        backgroundColor: frame.color,
                        borderRadius: `0 ${frame.width / 2}px 0 0`,
                      }}
                    />
                    {/* Bottom-left corner */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `${frameOffset}px`,
                        bottom: `${frameOffset}px`,
                        width: `${frame.width * 3}px`,
                        height: `${frame.width}px`,
                        backgroundColor: frame.color,
                        borderRadius: `0 0 0 ${frame.width / 2}px`,
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: `${frameOffset}px`,
                        bottom: `${frameOffset}px`,
                        width: `${frame.width}px`,
                        height: `${frame.width * 3}px`,
                        backgroundColor: frame.color,
                        borderRadius: `0 0 0 ${frame.width / 2}px`,
                      }}
                    />
                    {/* Bottom-right corner */}
                    <div
                      style={{
                        position: 'absolute',
                        right: `${frameOffset}px`,
                        bottom: `${frameOffset}px`,
                        width: `${frame.width * 3}px`,
                        height: `${frame.width}px`,
                        backgroundColor: frame.color,
                        borderRadius: `0 0 ${frame.width / 2}px 0`,
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        right: `${frameOffset}px`,
                        bottom: `${frameOffset}px`,
                        width: `${frame.width}px`,
                        height: `${frame.width * 3}px`,
                        backgroundColor: frame.color,
                        borderRadius: `0 0 ${frame.width / 2}px 0`,
                      }}
                    />
                  </>
                )}

                {/* Main Image */}
                <img
                  src={image.src}
                  alt="3D transformed"
                  style={{
                    position: 'absolute',
                    left: `${frameOffset + windowPadding}px`,
                    top: `${frameOffset + windowPadding + windowHeader}px`,
                    width: `${imageScaledW}px`,
                    height: `${imageScaledH}px`,
                    objectFit: 'cover',
                    opacity: imageOpacity,
                    borderRadius:
                      showFrame && frame.type === 'window'
                        ? `0 0 ${screenshot.radius}px ${screenshot.radius}px`
                        : showFrame && frame.type === 'ruler'
                        ? `${screenshot.radius * 0.8}px`
                        : `${screenshot.radius}px`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Pure Canvas Rendering with Konva */}
        <Stage
          width={canvasW}
          height={canvasH}
          ref={stageRef}
          className="hires-stage"
          style={{
            display: 'block',
            backgroundColor: 'transparent',
            overflow: 'hidden',
            position: 'relative',
            borderRadius: `${backgroundBorderRadius}px`,
          }}
          onMouseDown={(e) => {
            const clickedOnTransformer =
              e.target.getParent()?.className === 'Transformer';
            if (clickedOnTransformer) {
              return;
            }

            const clickedOnOverlay =
              e.target.attrs.image &&
              overlayRefs.current[
                Object.keys(overlayRefs.current).find(
                  (key) => overlayRefs.current[key] === e.target
                ) || ''
              ];

            const clickedOnMainImage = e.target === mainImageRef.current;

            const clickedOnText =
              e.target.attrs.text !== undefined &&
              textRefs.current[
                Object.keys(textRefs.current).find(
                  (key) => textRefs.current[key] === e.target
                ) || ''
              ];

            if (!clickedOnOverlay && !clickedOnMainImage && !clickedOnText) {
              setSelectedOverlayId(null);
              setIsMainImageSelected(false);
              setSelectedTextId(null);
            }
          }}
        >
          {/* Background Layer - Canvas based */}
          <Layer>
            {backgroundConfig.type === 'image' && bgImage ? (
              <KonvaImage
                ref={backgroundRef}
                image={bgImage}
                width={canvasW}
                height={canvasH}
                opacity={backgroundConfig.opacity ?? 1}
                cornerRadius={backgroundBorderRadius}
                filters={backgroundBlur > 0 ? [Konva.Filters.Blur] : []}
                blurRadius={backgroundBlur}
              />
            ) : backgroundConfig.type === 'gradient' &&
              backgroundStyle.background ? (
              (() => {
                const gradientProps = parseLinearGradient(
                  backgroundStyle.background as string,
                  canvasW,
                  canvasH
                );
                return gradientProps ? (
                  <Rect
                    ref={backgroundRef}
                    width={canvasW}
                    height={canvasH}
                    fillLinearGradientStartPoint={gradientProps.startPoint}
                    fillLinearGradientEndPoint={gradientProps.endPoint}
                    fillLinearGradientColorStops={gradientProps.colorStops}
                    opacity={backgroundConfig.opacity ?? 1}
                    cornerRadius={backgroundBorderRadius}
                    filters={backgroundBlur > 0 ? [Konva.Filters.Blur] : []}
                    blurRadius={backgroundBlur}
                  />
                ) : (
                  <Rect
                    ref={backgroundRef}
                    width={canvasW}
                    height={canvasH}
                    fill="#ffffff"
                    opacity={backgroundConfig.opacity ?? 1}
                    cornerRadius={backgroundBorderRadius}
                  />
                );
              })()
            ) : (
              <Rect
                ref={backgroundRef}
                width={canvasW}
                height={canvasH}
                fill={
                  backgroundConfig.type === 'solid'
                    ? (backgroundStyle.backgroundColor as string)
                    : '#ffffff'
                }
                opacity={backgroundConfig.opacity ?? 1}
                cornerRadius={backgroundBorderRadius}
                filters={backgroundBlur > 0 ? [Konva.Filters.Blur] : []}
                blurRadius={backgroundBlur}
              />
            )}

            {/* Noise overlay on background */}
            {noiseTexture && backgroundNoise > 0 && (
              <Rect
                width={canvasW}
                height={canvasH}
                fillPatternImage={noiseTexture as any}
                fillPatternRepeat="repeat"
                opacity={backgroundNoise / 100}
                globalCompositeOperation="overlay"
                cornerRadius={backgroundBorderRadius}
              />
            )}
          </Layer>

          {/* Pattern Layer */}
          <Layer>
            {patternImage && (
              <Rect
                ref={patternRectRef}
                width={canvasW}
                height={canvasH}
                fillPatternImage={patternImage as any}
                fillPatternRepeat="repeat"
                opacity={patternStyle.opacity}
                perfectDrawEnabled={false}
              />
            )}
          </Layer>

          {/* Noise Layer (texture noise, not background noise) */}
          <Layer>
            {noiseImage && (
              <Rect
                ref={noiseRectRef}
                width={canvasW}
                height={canvasH}
                fillPatternImage={noiseImage as any}
                fillPatternRepeat="repeat"
                opacity={noise.opacity}
                perfectDrawEnabled={false}
              />
            )}
          </Layer>

          {/* Main Image Layer - Hide when mockups are active */}
          {!hasMockups && (
            <Layer>
                <Group
                  x={canvasW / 2 + screenshot.offsetX}
                  y={canvasH / 2 + screenshot.offsetY}
                  width={framedW}
                  height={framedH}
                  offsetX={framedW / 2}
                  offsetY={framedH / 2}
                  rotation={screenshot.rotation}
                  draggable={true}
                  onDragEnd={(e) => {
                    const node = e.target;
                    // Persist group offset relative to canvas center
                    const newOffsetX = node.x() - canvasW / 2;
                    const newOffsetY = node.y() - canvasH / 2;
                    // update store (partial update expected)
                    if (typeof setScreenshot === 'function') {
                      setScreenshot({ offsetX: newOffsetX, offsetY: newOffsetY });
                    }
                  }}
                >
                {/* Solid Frame - Hide in 3D mode */}
                {showFrame && frame.type === 'solid' && !has3DTransform && (
                  <Rect
                    width={framedW}
                    height={framedH}
                    fill={frame.color}
                    cornerRadius={screenshot.radius}
                    {...shadowProps}
                  />
                )}

                {/* Glassy Frame - Hide in 3D mode */}
                {showFrame && frame.type === 'glassy' && !has3DTransform && (
                  <Rect
                    x={frameOffset + windowPadding}
                    y={frameOffset + windowPadding + windowHeader}
                    width={imageScaledW}
                    height={imageScaledH}
                    fill="rgba(255, 255, 255, 0.15)"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth={frame.width * 4 + 6}
                    cornerRadius={screenshot.radius}
                    shadowForStrokeEnabled
                    {...shadowProps}
                  />
                )}

                {/* Ruler Frame - Hide in 3D mode */}
                {showFrame && frame.type === 'ruler' && !has3DTransform && (
                  <Group>
                    <Rect
                      width={framedW}
                      height={framedH}
                      cornerRadius={screenshot.radius}
                      fill="rgba(0,0,0,0.3)"
                      shadowForStrokeEnabled
                      {...shadowProps}
                    />

                    <Rect
                      width={framedW - 1}
                      height={framedH - 1}
                      x={1}
                      y={1}
                      stroke="rgba(255, 255, 255, 0.9)"
                      strokeWidth={1}
                      cornerRadius={Math.max(0, screenshot.radius - 2)}
                    />

                    <Group>
                      <Rect
                        width={framedW}
                        height={framedH}
                        fill="rgba(255, 255, 255, 0.2)"
                        cornerRadius={screenshot.radius}
                      />
                      <Group globalCompositeOperation="source-atop">
                        {/* Top ruler marks */}
                        {Array.from({
                          length: Math.floor(framedW / 10) - 1,
                        }).map((_, i) => (
                          <Rect
                            key={`t-${i}`}
                            x={i * 10}
                            y={1}
                            width={2}
                            height={(i + 1) % 5 === 0 ? 10 : 5}
                            fill="rgba(0, 0, 0, 0.8)"
                          />
                        ))}
                        {/* Left ruler marks */}
                        {Array.from({
                          length: Math.floor(framedH / 10) - 1,
                        }).map((_, i) => (
                          <Rect
                            key={`l-${i}`}
                            x={1}
                            y={i * 10}
                            width={(i + 1) % 5 === 0 ? 10 : 5}
                            height={2}
                            fill="rgba(0, 0, 0, 0.8)"
                          />
                        ))}
                        {/* Right ruler marks */}
                        {Array.from({
                          length: Math.floor(framedH / 10) - 1,
                        }).map((_, i) => (
                          <Rect
                            key={`r-${i}`}
                            x={framedW - 1}
                            y={i * 10}
                            width={(i + 1) % 5 === 0 ? -10 : -5}
                            height={2}
                            fill="rgba(0, 0, 0, 0.8)"
                          />
                        ))}
                        {/* Bottom ruler marks */}
                        {Array.from({
                          length: Math.floor(framedW / 10) - 1,
                        }).map((_, i) => (
                          <Rect
                            key={`b-${i}`}
                            x={i * 10}
                            y={framedH - 1}
                            width={2}
                            height={(i + 1) % 5 === 0 ? -10 : -5}
                            fill="rgba(0, 0, 0, 0.8)"
                          />
                        ))}
                      </Group>
                    </Group>

                    <Rect
                      width={framedW}
                      height={framedH}
                      stroke="rgba(0, 0, 0, 0.15)"
                      strokeWidth={1}
                      cornerRadius={screenshot.radius}
                    />
                  </Group>
                )}

                {/* Infinite Mirror Frame - Hide in 3D mode */}
                {showFrame && frame.type === 'infinite-mirror' && !has3DTransform && (
                  <>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Rect
                        key={i}
                        width={framedW + i * 15}
                        height={framedH + i * 15}
                        x={-i * 7.5}
                        y={-i * 7.5}
                        stroke={frame.color}
                        strokeWidth={4}
                        cornerRadius={screenshot.radius + i * 5}
                        opacity={0.3 - i * 0.07}
                        {...(i === 0
                          ? { ...shadowProps, shadowForStrokeEnabled: true }
                          : {})}
                      />
                    ))}
                  </>
                )}

                {/* Eclipse Frame - Hide in 3D mode */}
                {showFrame && frame.type === 'eclipse' && !has3DTransform && (
                  <Group>
                    <Rect
                      width={framedW}
                      height={framedH}
                      fill={frame.color}
                      cornerRadius={screenshot.radius + eclipseBorder}
                      {...shadowProps}
                    />
                    <Rect
                      globalCompositeOperation="destination-out"
                      x={eclipseBorder}
                      y={eclipseBorder}
                      width={framedW - eclipseBorder * 2}
                      height={framedH - eclipseBorder * 2}
                      fill="black"
                      cornerRadius={screenshot.radius}
                    />
                  </Group>
                )}

                {/* Stack Frame - Hide in 3D mode */}
                {showFrame && frame.type === 'stack' && !has3DTransform && (
                  <>
                    {/* Bottom layer - darkest */}
                    <Rect
                      width={framedW / 1.2}
                      height={framedH / 5}
                      x={(framedW - framedW / 1.2) / 2}
                      y={-40}
                      fill={frame.theme === 'dark' ? '#444444' : '#f5f5f5'}
                      cornerRadius={screenshot.radius}
                      opacity={1}
                      {...shadowProps}
                    />
                    {/* Middle layer */}
                    <Rect
                      width={framedW / 1.1}
                      height={framedH / 5}
                      x={(framedW - framedW / 1.1) / 2}
                      y={-20}
                      fill={frame.theme === 'dark' ? '#2a2a2a' : '#f0f0f0'}
                      cornerRadius={screenshot.radius}
                      opacity={1}
                    />
                    {/* Top layer - lightest, will have image on top */}
                    <Rect
                      width={framedW}
                      height={framedH}
                      fill={frame.theme === 'dark' ? '#555555' : '#e8e8e8'}
                      cornerRadius={screenshot.radius}
                      {...shadowProps}
                    />
                  </>
                )}

                {/* Window Frame - Hide in 3D mode */}
                {showFrame && frame.type === 'window' && !has3DTransform && (
                  <>
                    <Rect // main window
                      width={framedW}
                      height={framedH}
                      fill={frame.theme === 'dark' ? '#2f2f2f' : '#fefefe'}
                      cornerRadius={[
                        screenshot.radius / 2,
                        screenshot.radius / 2,
                        screenshot.radius,
                        screenshot.radius,
                      ]}
                      {...shadowProps}
                    />
                    <Rect // header
                      width={framedW}
                      height={windowHeader}
                      fill={frame.theme === 'dark' ? '#4a4a4a' : '#e2e2e2'}
                      cornerRadius={[
                        screenshot.radius,
                        screenshot.radius,
                        0,
                        0,
                      ]}
                    />
                    {/* Window control buttons (red, yellow, green) */}
                    <Circle x={25} y={20} radius={10} fill="#ff5f57" />
                    <Circle x={50} y={20} radius={10} fill="#febc2e" />
                    <Circle x={75} y={20} radius={10} fill="#28c840" />
                    <Text
                      text={frame.title || ''}
                      x={0}
                      y={0}
                      width={framedW}
                      height={windowHeader}
                      align="center"
                      verticalAlign="middle"
                      fill={frame.theme === 'dark' ? '#f0f0f0' : '#4f4f4f'}
                      fontSize={16}
                    />
                  </>
                )}

                {/* Dotted Frame - Hide in 3D mode */}
                {showFrame && frame.type === 'dotted' && !has3DTransform && (
                  <Rect
                    width={framedW}
                    height={framedH}
                    stroke={frame.color}
                    strokeWidth={frame.width}
                    dash={[frame.width * 2, frame.width * 1.2]}
                    cornerRadius={screenshot.radius}
                  />
                )}

                {/* Focus Frame - Hide in 3D mode */}
                {showFrame && frame.type === 'focus' && !has3DTransform && (
                  <Group>
                    <Path
                      data={`M ${frameOffset}, ${
                        frameOffset + frame.width * 1.5
                      } Q ${frameOffset}, ${frameOffset} ${
                        frameOffset + frame.width * 1.5
                      }, ${frameOffset}`}
                      stroke={frame.color}
                      strokeWidth={frame.width}
                      lineCap="round"
                      {...shadowProps}
                    />
                    <Path
                      data={`M ${frameOffset + imageScaledW}, ${
                        frameOffset + imageScaledH - frame.width * 1.5
                      } Q ${frameOffset + imageScaledW}, ${
                        frameOffset + imageScaledH
                      } ${frameOffset + imageScaledW - frame.width * 1.5}, ${
                        frameOffset + imageScaledH
                      }`}
                      stroke={frame.color}
                      strokeWidth={frame.width}
                      lineCap="round"
                      {...shadowProps}
                    />
                    <Path
                      data={`M ${
                        frameOffset + imageScaledW - frame.width * 1.5
                      }, ${frameOffset} Q ${
                        frameOffset + imageScaledW
                      }, ${frameOffset} ${frameOffset + imageScaledW}, ${
                        frameOffset + frame.width * 1.5
                      }`}
                      stroke={frame.color}
                      strokeWidth={frame.width}
                      lineCap="round"
                      {...shadowProps}
                    />
                    <Path
                      data={`M ${frameOffset + frame.width * 1.5}, ${
                        frameOffset + imageScaledH
                      } Q ${frameOffset}, ${
                        frameOffset + imageScaledH
                      } ${frameOffset}, ${
                        frameOffset + imageScaledH - frame.width * 1.5
                      }`}
                      stroke={frame.color}
                      strokeWidth={frame.width}
                      lineCap="round"
                      {...shadowProps}
                    />
                  </Group>
                )}

                <KonvaImage
                  ref={mainImageRef}
                  image={image}
                  x={frameOffset + windowPadding}
                  y={frameOffset + windowPadding + windowHeader}
                  width={imageScaledW}
                  height={imageScaledH}
                  opacity={has3DTransform ? 0 : imageOpacity}
                  cornerRadius={
                    showFrame && frame.type === 'window'
                      ? [0, 0, screenshot.radius, screenshot.radius]
                      : showFrame && frame.type === 'ruler'
                      ? screenshot.radius * 0.8
                      : screenshot.radius
                  }
                  imageSmoothingEnabled={false}
                  draggable={false}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    setIsMainImageSelected(true);
                    setSelectedOverlayId(null);
                    setSelectedTextId(null);
                  }}
                  onTap={(e) => {
                    e.cancelBubble = true;
                    setIsMainImageSelected(true);
                    setSelectedOverlayId(null);
                    setSelectedTextId(null);
                  }}
                  onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                      container.style.cursor = 'move';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                      container.style.cursor = 'default';
                    }
                  }}
                  {...(!showFrame ||
                  frame.type === 'none' ||
                  frame.type === 'dotted'
                    ? shadowProps
                    : {})}
                />
                <Transformer
                  ref={mainImageTransformerRef}
                  keepRatio={true}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (
                      Math.abs(newBox.width) < 50 ||
                      Math.abs(newBox.height) < 50
                    ) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                />
              </Group>
            </Layer>
          )}

          {/* Text Overlays Layer - Canvas based */}
          <Layer ref={textLayerRef}>
            {textOverlays.map((overlay) => {
              if (!overlay.isVisible) return null;

              const textX = (overlay.position.x / 100) * canvasW;
              const textY = (overlay.position.y / 100) * canvasH;

              return (
                <Text
                  key={overlay.id}
                  ref={(node) => {
                    if (node) {
                      textRefs.current[overlay.id] = node;
                    } else {
                      delete textRefs.current[overlay.id];
                    }
                  }}
                  x={textX}
                  y={textY}
                  text={overlay.text}
                  fontSize={overlay.fontSize}
                  fontFamily={getFontCSS(overlay.fontFamily)}
                  fill={overlay.color}
                  opacity={overlay.opacity}
                  offsetX={0}
                  offsetY={0}
                  align="center"
                  verticalAlign="middle"
                  shadowColor={
                    overlay.textShadow.enabled
                      ? overlay.textShadow.color
                      : undefined
                  }
                  shadowBlur={
                    overlay.textShadow.enabled ? overlay.textShadow.blur : 0
                  }
                  shadowOffsetX={
                    overlay.textShadow.enabled ? overlay.textShadow.offsetX : 0
                  }
                  shadowOffsetY={
                    overlay.textShadow.enabled ? overlay.textShadow.offsetY : 0
                  }
                  fontStyle={
                    String(overlay.fontWeight).includes('italic')
                      ? 'italic'
                      : 'normal'
                  }
                  fontVariant={String(overlay.fontWeight)}
                  draggable={true}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    setSelectedTextId(overlay.id);
                    setSelectedOverlayId(null);
                    setIsMainImageSelected(false);
                  }}
                  onTap={(e) => {
                    e.cancelBubble = true;
                    setSelectedTextId(overlay.id);
                    setSelectedOverlayId(null);
                    setIsMainImageSelected(false);
                  }}
                  onDragEnd={(e) => {
                    const newX = (e.target.x() / canvasW) * 100;
                    const newY = (e.target.y() / canvasH) * 100;
                    updateTextOverlay(overlay.id, {
                      position: { x: newX, y: newY },
                    });
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    const newFontSize = Math.max(
                      Math.round(overlay.fontSize * scaleX),
                      8
                    );

                    node.scaleX(1);
                    node.scaleY(1);

                    const newX = (node.x() / canvasW) * 100;
                    const newY = (node.y() / canvasH) * 100;

                    updateTextOverlay(overlay.id, {
                      position: { x: newX, y: newY },
                      fontSize: newFontSize,
                    });
                  }}
                  onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                      container.style.cursor = 'move';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                      container.style.cursor = 'default';
                    }
                  }}
                />
              );
            })}
            <Transformer
              ref={textTransformerRef}
              keepRatio={false}
              enabledAnchors={[
                'top-left',
                'top-right',
                'bottom-left',
                'bottom-right',
              ]}
              boundBoxFunc={(oldBox, newBox) => {
                if (
                  Math.abs(newBox.width) < 20 ||
                  Math.abs(newBox.height) < 20
                ) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>

          {/* Mockups Layer - Renders device frames with user image composited */}
          <Layer>
            {mockups.map((mockup) => (
              <MockupRenderer
                key={mockup.id}
                mockup={mockup}
                canvasWidth={canvasW}
                canvasHeight={canvasH}
              />
            ))}
          </Layer>

          {/* Image Overlays Layer - Canvas based */}
          <Layer ref={layerRef}>
            {imageOverlays.map((overlay) => {
              if (!overlay.isVisible) return null;

              const overlayImg = loadedOverlayImages[overlay.id];
              if (!overlayImg) return null;

              return (
                <KonvaImage
                  key={overlay.id}
                  ref={(node) => {
                    if (node) {
                      overlayRefs.current[overlay.id] = node;
                    } else {
                      delete overlayRefs.current[overlay.id];
                    }
                  }}
                  image={overlayImg}
                  x={overlay.position.x}
                  y={overlay.position.y}
                  width={overlay.size}
                  height={overlay.size}
                  opacity={overlay.opacity}
                  rotation={overlay.rotation}
                  scaleX={overlay.flipX ? -1 : 1}
                  scaleY={overlay.flipY ? -1 : 1}
                  offsetX={overlay.size / 2}
                  offsetY={overlay.size / 2}
                  draggable={true}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    setSelectedOverlayId(overlay.id);
                    setIsMainImageSelected(false);
                    setSelectedTextId(null);
                  }}
                  onTap={(e) => {
                    e.cancelBubble = true;
                    setSelectedOverlayId(overlay.id);
                    setIsMainImageSelected(false);
                    setSelectedTextId(null);
                  }}
                  onDragEnd={(e) => {
                    const node = e.target;
                    updateImageOverlay(overlay.id, {
                      position: { x: node.x(), y: node.y() },
                    });
                  }}
                  onTransform={(e) => {
                    const node = e.target;
                    node.setAttrs({
                      width: overlay.size,
                      height: overlay.size,
                      scaleX: node.scaleX(),
                      scaleY: node.scaleY(),
                    });
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    const baseScaleX = overlay.flipX ? -1 : 1;
                    const baseScaleY = overlay.flipY ? -1 : 1;

                    const actualScaleX = scaleX / baseScaleX;
                    const actualScaleY = scaleY / baseScaleY;

                    const newSize = Math.max(
                      Math.round(overlay.size * Math.abs(actualScaleX)),
                      20
                    );

                    updateImageOverlay(overlay.id, {
                      position: { x: node.x(), y: node.y() },
                      size: newSize,
                      rotation: node.rotation(),
                    });
                  }}
                  onMouseEnter={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                      container.style.cursor = 'move';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const container = e.target.getStage()?.container();
                    if (container) {
                      container.style.cursor = 'default';
                    }
                  }}
                />
              );
            })}
            <Transformer
              ref={transformerRef}
              keepRatio={false}
              boundBoxFunc={(oldBox, newBox) => {
                if (
                  Math.abs(newBox.width) < 20 ||
                  Math.abs(newBox.height) < 20
                ) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

// Export function to get the Konva stage
export function getKonvaStage(): any {
  return globalKonvaStage;
}

export default function ClientCanvas() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const { screenshot, setScreenshot } = useEditorStore();

  useEffect(() => {
    if (!screenshot.src) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.onerror = () => setScreenshot({ src: null });
    img.src = screenshot.src;
  }, [screenshot.src, setScreenshot]);

  if (!image) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <CanvasRenderer image={image} />;
}
