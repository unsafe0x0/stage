'use client';

import * as React from 'react';
import { useImageStore } from '@/lib/store';
import { AspectRatioDropdown } from '@/components/aspect-ratio/aspect-ratio-dropdown';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';
import { aspectRatios } from '@/lib/constants/aspect-ratios';
import { useDropzone } from 'react-dropzone';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/constants';
import { getCldImageUrl } from '@/lib/cloudinary';
import { backgroundCategories, getAvailableCategories, cloudinaryPublicIds } from '@/lib/cloudinary-backgrounds';
import { gradientColors, type GradientKey } from '@/lib/constants/gradient-colors';
import { solidColors, type SolidColorKey } from '@/lib/constants/solid-colors';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { FaImage, FaTimes } from 'react-icons/fa';

export function EditorRightPanel() {
  const { 
    selectedAspectRatio,
    backgroundConfig,
    backgroundBorderRadius,
    setBackgroundType,
    setBackgroundValue,
    setBackgroundOpacity,
    setBackgroundBorderRadius,
  } = useImageStore();
  
  const [expanded, setExpanded] = React.useState(true);
  const [bgUploadError, setBgUploadError] = React.useState<string | null>(null);
  const selectedRatio = aspectRatios.find((ar) => ar.id === selectedAspectRatio);

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
    <div className="w-80 bg-gray-100 border-l border-gray-200 flex flex-col rounded-l-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-l-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Canvas Settings</h3>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
        
        {expanded && (
          <>
            {/* Aspect Ratio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">Aspect Ratio</span>
                <button className="p-1 rounded hover:bg-gray-100">
                  <Maximize2 className="size-3.5 text-gray-500" />
                </button>
              </div>
              {selectedRatio && (
                <div className="text-xs text-gray-500">
                  {selectedRatio.width}:{selectedRatio.height} • {selectedRatio.width}x{selectedRatio.height}
                </div>
              )}
              <AspectRatioDropdown />
            </div>
          </>
        )}
      </div>

      {expanded && (
        <>
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Background Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Background</h4>
              
              {/* Background Type Selector */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-gray-700">Background Type</Label>
              <div className="flex gap-2">
                <Button
                  variant={backgroundConfig.type === 'gradient' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setBackgroundType('gradient');
                    if (!backgroundConfig.value || typeof backgroundConfig.value !== 'string' || !gradientColors[backgroundConfig.value as GradientKey]) {
                      setBackgroundValue('primary_gradient');
                    }
                  }}
                    className={`flex-1 text-xs font-medium transition-all rounded-lg h-8 ${
                    backgroundConfig.type === 'gradient'
                        ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm'
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700 bg-white'
                  }`}
                >
                  Gradient
                </Button>
                <Button
                  variant={backgroundConfig.type === 'solid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setBackgroundType('solid');
                    if (!backgroundConfig.value || typeof backgroundConfig.value !== 'string' || !solidColors[backgroundConfig.value as SolidColorKey]) {
                      setBackgroundValue('white');
                    }
                  }}
                    className={`flex-1 text-xs font-medium transition-all rounded-lg h-8 ${
                    backgroundConfig.type === 'solid'
                        ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm'
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700 bg-white'
                  }`}
                >
                  Solid
                </Button>
                <Button
                  variant={backgroundConfig.type === 'image' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBackgroundType('image')}
                    className={`flex-1 text-xs font-medium transition-all rounded-lg h-8 ${
                    backgroundConfig.type === 'image'
                        ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm'
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700 bg-white'
                  }`}
                >
                  Image
                </Button>
                </div>
              </div>
              
              {/* Gradient Selector */}
              {backgroundConfig.type === 'gradient' && (
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-gray-700">Gradient</Label>
                  <div className="grid grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {(Object.keys(gradientColors) as GradientKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => setBackgroundValue(key)}
                        className={`h-16 rounded-lg border-2 transition-all ${
                          backgroundConfig.value === key
                            ? 'border-gray-900 ring-2 ring-gray-300 shadow-sm'
                            : 'border-gray-300 hover:border-gray-400'
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

              {/* Solid Color Selector */}
                {backgroundConfig.type === 'solid' && (
                        <div className="space-y-3">
                  <Label className="text-xs font-medium text-gray-700">Color</Label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {(Object.keys(solidColors) as SolidColorKey[]).map((key) => (
                              <button
                                key={key}
                        onClick={() => setBackgroundValue(key)}
                        className={`h-10 rounded-lg border-2 transition-all ${
                                  backgroundConfig.value === key
                            ? 'border-gray-900 ring-2 ring-gray-300 shadow-sm'
                                    : 'border-gray-300 hover:border-gray-400'
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

              {/* Image Background Selector */}
              {backgroundConfig.type === 'image' && (
                <div className="space-y-4">
                  {/* Current Background Preview */}
                  {backgroundConfig.value && 
                   (backgroundConfig.value.startsWith('blob:') || 
                    backgroundConfig.value.startsWith('http') || 
                    backgroundConfig.value.startsWith('data:') ||
                    cloudinaryPublicIds.includes(backgroundConfig.value)) && (
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700">Current Background</Label>
                      <div className="relative rounded-lg overflow-hidden border border-gray-300 aspect-video bg-gray-50">
                        {(() => {
                          // Check if it's a Cloudinary public ID
                          const isCloudinaryPublicId = typeof backgroundConfig.value === 'string' && 
                            !backgroundConfig.value.startsWith('blob:') && 
                            !backgroundConfig.value.startsWith('http') && 
                            !backgroundConfig.value.startsWith('data:') &&
                            cloudinaryPublicIds.includes(backgroundConfig.value);
                          
                          let imageUrl = backgroundConfig.value as string;
                          
                          // If it's a Cloudinary public ID, get the optimized URL
                          if (isCloudinaryPublicId) {
                            imageUrl = getCldImageUrl({
                              src: backgroundConfig.value as string,
                              width: 600,
                              height: 400,
                              quality: 'auto',
                              format: 'auto',
                              crop: 'fill',
                              gravity: 'auto',
                            });
                          }
                          
                          return (
                            <>
                              <img
                                src={imageUrl}
                                alt="Current background"
                                className="w-full h-full object-cover"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white border-0 shadow-md px-3 py-1.5 h-auto"
                                onClick={() => {
                                  // Reset to default gradient
                                  setBackgroundType('gradient');
                                  setBackgroundValue('primary_gradient');
                                  // If it's a blob URL, revoke it
                                  if (backgroundConfig.value.startsWith('blob:')) {
                                    URL.revokeObjectURL(backgroundConfig.value);
                                  }
                                }}
                              >
                                <FaTimes size={14} />
                                <span className="text-xs font-medium">Remove</span>
                              </Button>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Preset Backgrounds */}
                  {backgroundCategories && Object.keys(backgroundCategories).length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-xs font-medium text-gray-700">Preset Backgrounds</Label>
                      <div className="max-h-[400px] overflow-y-auto pr-1 space-y-3">
                        {getAvailableCategories()
                          .filter((category: string) => category !== 'demo' && category !== 'nature')
                          .map((category: string) => {
                            const categoryBackgrounds = backgroundCategories[category];
                            if (!categoryBackgrounds || categoryBackgrounds.length === 0) return null;

                            const categoryDisplayName = category.charAt(0).toUpperCase() + category.slice(1);

                            return (
                              <div key={category} className="space-y-2">
                                <Label className="text-xs font-medium text-gray-600 capitalize">
                                  {categoryDisplayName} Wallpapers
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                  {categoryBackgrounds.map((publicId: string, idx: number) => {
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
                                        key={`${category}-${idx}`}
                                        onClick={() => {
                                          setBackgroundValue(publicId);
                                          setBackgroundType('image');
                                        }}
                                        className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                                          backgroundConfig.value === publicId
                                            ? 'border-gray-900 ring-2 ring-gray-300 shadow-sm'
                                            : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                        title={`${categoryDisplayName} ${idx + 1}`}
                                      >
                                        <img
                                          src={thumbnailUrl}
                                          alt={`${categoryDisplayName} ${idx + 1}`}
                                          className="w-full h-full object-cover"
                                          loading="lazy"
                                        />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Upload Background Image */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-700">Upload Background Image</Label>
                    <div
                      {...getBgRootProps()}
                      className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                        isBgDragActive
                          ? 'border-gray-900 bg-gray-50 scale-[1.02]'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <input {...getBgInputProps()} />
                      <div className={`mb-3 transition-colors flex items-center justify-center w-full ${isBgDragActive ? 'text-gray-900' : 'text-gray-400'}`}>
                        <FaImage size={32} />
                      </div>
                      {isBgDragActive ? (
                        <p className="text-xs font-medium text-gray-900 text-center">Drop the image here...</p>
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
                      <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                        {bgUploadError}
                      </div>
                    )}
                  </div>
                  </div>
                )}

              {/* Border Radius */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-gray-700">Border Radius</Label>
                <div className="flex gap-2 mb-2">
                  <Button
                    variant={backgroundBorderRadius === 0 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBackgroundBorderRadius(0)}
                    className={`flex-1 text-xs font-medium transition-all rounded-lg h-8 ${
                      backgroundBorderRadius === 0
                        ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm'
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700 bg-white'
                    }`}
                  >
                    Sharp Edge
                  </Button>
                  <Button
                    variant={backgroundBorderRadius > 0 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBackgroundBorderRadius(24)}
                    className={`flex-1 text-xs font-medium transition-all rounded-lg h-8 ${
                      backgroundBorderRadius > 0
                        ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-sm'
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700 bg-white'
                    }`}
                  >
                    Rounded
                  </Button>
                </div>
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs font-medium text-gray-700">Border Radius</Label>
                  <span className="text-xs text-gray-600 font-medium">{backgroundBorderRadius}px</span>
                </div>
                <Slider
                  value={[backgroundBorderRadius]}
                  onValueChange={(value) => setBackgroundBorderRadius(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Opacity */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium text-gray-700">Opacity</Label>
                  <span className="text-xs text-gray-600 font-medium">
                    {Math.round((backgroundConfig.opacity || 1) * 100)}%
                  </span>
                </div>
                <Slider
                  value={[backgroundConfig.opacity || 1]}
                  onValueChange={(value) => setBackgroundOpacity(value[0])}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>
            </div>

            {/* Position Section - Placeholder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Position</h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span className="text-xs text-gray-700">Snap to Grid</span>
                </label>
              </div>
              <div className="w-full h-32 bg-gray-50 rounded-xl border border-gray-300 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

