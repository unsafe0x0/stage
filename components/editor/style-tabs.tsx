'use client';

import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AspectRatioDropdown } from '@/components/aspect-ratio/aspect-ratio-dropdown';
import { TextOverlayControls } from '@/components/text-overlay/text-overlay-controls';
import { useImageStore } from '@/lib/store';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { gradientColors, type GradientKey } from '@/lib/constants/gradient-colors';
import { solidColors, type SolidColorKey } from '@/lib/constants/solid-colors';
import { Button } from '@/components/ui/button';
import { getCldImageUrl } from '@/lib/cloudinary';
import { cloudinaryPublicIds } from '@/lib/cloudinary-backgrounds';
import { useDropzone } from 'react-dropzone';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/constants';
import { ImageSquare as ImageIcon } from '@phosphor-icons/react';

export function StyleTabs() {
  const {
    backgroundConfig,
    borderRadius,
    imageOpacity,
    setBackgroundType,
    setBackgroundValue,
    setBackgroundOpacity,
    setBackgroundBlur,
    setBorderRadius,
    setImageOpacity,
  } = useImageStore();

  const [bgUploadError, setBgUploadError] = React.useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `File type not supported. Please use: ${ALLOWED_IMAGE_TYPES.join(', ')}`;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `File size too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  const onBgDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const validationError = validateFile(file);
        if (validationError) {
          setBgUploadError(validationError);
          return;
        }

        setBgUploadError(null);
        const blobUrl = URL.createObjectURL(file);
        setBackgroundValue(blobUrl);
        setBackgroundType('image');
      }
    },
    [setBackgroundValue, setBackgroundType]
  );

  const { getRootProps: getBgRootProps, getInputProps: getBgInputProps, isDragActive: isBgDragActive } = useDropzone({
    onDrop: onBgDrop,
    accept: {
      'image/*': ALLOWED_IMAGE_TYPES.map((type) => type.split('/')[1]),
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: false,
  });

  return (
    <Tabs defaultValue="aspect" className="w-full">
      <TabsList className="grid w-full grid-cols-4 gap-1">
        <TabsTrigger value="aspect" className="text-xs px-2 py-1.5">Aspect</TabsTrigger>
        <TabsTrigger value="background" className="text-xs px-2 py-1.5">Background</TabsTrigger>
        <TabsTrigger value="image" className="text-xs px-2 py-1.5">Image</TabsTrigger>
        <TabsTrigger value="text" className="text-xs px-2 py-1.5">Text</TabsTrigger>
      </TabsList>

      <TabsContent value="aspect" className="space-y-4 mt-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Aspect Ratio</Label>
          <AspectRatioDropdown />
        </div>
      </TabsContent>

      <TabsContent value="background" className="space-y-4 mt-4">
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Background Type</Label>
            <div className="flex gap-2">
              <Button
                variant={backgroundConfig.type === 'gradient' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBackgroundType('gradient')}
                className="flex-1 text-xs"
              >
                Gradient
              </Button>
              <Button
                variant={backgroundConfig.type === 'solid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBackgroundType('solid')}
                className="flex-1 text-xs"
              >
                Solid
              </Button>
              <Button
                variant={backgroundConfig.type === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBackgroundType('image')}
                className="flex-1 text-xs"
              >
                Image
              </Button>
            </div>
          </div>

          {backgroundConfig.type === 'gradient' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Gradient</Label>
              <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {(Object.keys(gradientColors) as GradientKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setBackgroundValue(key)}
                    className={`h-16 rounded-md border-2 transition-all ${
                      backgroundConfig.value === key
                        ? 'border-primary ring-2 ring-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      background: gradientColors[key],
                    }}
                    title={key.replace(/_/g, ' ')}
                  />
                ))}
              </div>
            </div>
          )}

          {backgroundConfig.type === 'solid' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Color</Label>
              <div className="grid grid-cols-4 gap-2.5">
                {(Object.keys(solidColors) as SolidColorKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setBackgroundValue(key)}
                    className={`h-10 rounded-md border-2 transition-all ${
                      backgroundConfig.value === key
                        ? 'border-primary ring-2 ring-primary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{
                      backgroundColor: solidColors[key],
                    }}
                    title={key.replace(/_/g, ' ')}
                  />
                ))}
              </div>
            </div>
          )}

          {backgroundConfig.type === 'image' && (
            <div className="space-y-4">
              {cloudinaryPublicIds.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Preset Backgrounds</Label>
                  <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {cloudinaryPublicIds.map((publicId, idx) => {
                      const thumbnailUrl = getCldImageUrl({
                        src: publicId,
                        width: 300,
                        height: 200,
                        quality: 'auto',
                        format: 'auto',
                        crop: 'fill',
                        gravity: 'auto',
                      });

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setBackgroundValue(publicId);
                            setBackgroundType('image');
                          }}
                          className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                            backgroundConfig.value === publicId
                              ? 'border-primary ring-2 ring-primary'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          title={`Use background ${idx + 1}`}
                        >
                          <img
                            src={thumbnailUrl}
                            alt={`Background ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-sm font-medium">Upload Background Image</Label>
                <div
                  {...getBgRootProps()}
                  className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                    isBgDragActive
                      ? 'border-primary bg-primary/5 scale-[1.02]'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <input {...getBgInputProps()} />
                  <div className={`mb-3 transition-colors flex items-center justify-center w-full ${isBgDragActive ? 'text-primary' : 'text-gray-400'}`}>
                    <ImageIcon size={40} weight="duotone" />
                  </div>
                  {isBgDragActive ? (
                    <p className="text-sm font-medium text-primary text-center">Drop the image here...</p>
                  ) : (
                    <div className="space-y-1 text-center">
                      <p className="text-xs font-medium text-gray-700">
                        Drag & drop an image here
                      </p>
                      <p className="text-xs text-gray-500">
                        or click to browse • PNG, JPG, WEBP up to {MAX_IMAGE_SIZE / 1024 / 1024}MB
                      </p>
                    </div>
                  )}
                </div>
                {bgUploadError && (
                  <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-2">
                    {bgUploadError}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Background Image URL</Label>
                <input
                  type="text"
                  value={typeof backgroundConfig.value === 'string' && !cloudinaryPublicIds.includes(backgroundConfig.value) ? backgroundConfig.value : ''}
                  onChange={(e) => setBackgroundValue(e.target.value)}
                  placeholder="Enter image URL"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Background Blur</Label>
                  <span className="text-sm text-muted-foreground">
                    {backgroundConfig.blur || 0}px
                  </span>
                </div>
                <Slider
                  value={[backgroundConfig.blur || 0]}
                  onValueChange={(value) => setBackgroundBlur(value[0])}
                  min={0}
                  max={100}
                  step={1}
                />
                <p className="text-xs text-muted-foreground">
                  Adjust the blur intensity for the background image
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Opacity</Label>
              <span className="text-sm text-muted-foreground">
                {Math.round((backgroundConfig.opacity || 1) * 100)}%
              </span>
            </div>
            <Slider
              value={[backgroundConfig.opacity || 1]}
              onValueChange={(value) => setBackgroundOpacity(value[0])}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="image" className="space-y-4 mt-4">
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Border Radius</Label>
              <span className="text-sm text-muted-foreground">{borderRadius}px</span>
            </div>
            <Slider
              value={[borderRadius]}
              onValueChange={(value) => setBorderRadius(value[0])}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Image Opacity</Label>
              <span className="text-sm text-muted-foreground">
                {Math.round(imageOpacity * 100)}%
              </span>
            </div>
            <Slider
              value={[imageOpacity]}
              onValueChange={(value) => setImageOpacity(value[0])}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="text" className="mt-4">
        <TextOverlayControls />
      </TabsContent>
    </Tabs>
  );
}
