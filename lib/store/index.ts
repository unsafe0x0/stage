'use client';

import { create } from 'zustand';
import { exportImageWithGradient } from './export-utils';
import { GradientKey } from '@/lib/constants/gradient-colors';
import { AspectRatioKey } from '@/lib/constants/aspect-ratios';
import { BackgroundConfig, BackgroundType } from '@/lib/constants/backgrounds';

interface TextShadow {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface TextOverlay {
  id: string;
  text: string;
  position: { x: number; y: number };
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  color: string;
  opacity: number;
  isVisible: boolean;
  orientation: 'horizontal' | 'vertical';
  textShadow: TextShadow;
}

export interface ImageBorder {
  enabled: boolean;
  width: number;
  color: string;
  type: 'none' | 'solid' | 'glassy' | 'infinite-mirror' | 'window' | 'stack' | 'ruler' | 'eclipse' | 'dotted' | 'focus';
  theme?: 'light' | 'dark'; // For window and stack types
  padding?: number; // For window type
  title?: string; // For window type
  // Legacy fields for backward compatibility
  style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'default' | 'outline' | 'border';
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  borderRadius?: number;
  inset?: boolean;
}

export interface ImageShadow {
  enabled: boolean;
  blur: number;
  offsetX: number;
  offsetY: number;
  spread: number;
  color: string;
}

interface ImageState {
  uploadedImageUrl: string | null;
  imageName: string | null;
  selectedGradient: GradientKey;
  borderRadius: number;
  backgroundBorderRadius: number;
  selectedAspectRatio: AspectRatioKey;
  backgroundConfig: BackgroundConfig;
  textOverlays: TextOverlay[];
  imageOpacity: number;
  imageScale: number;
  imageBorder: ImageBorder;
  imageShadow: ImageShadow;
  setImage: (file: File) => void;
  clearImage: () => void;
  setGradient: (gradient: GradientKey) => void;
  setBorderRadius: (radius: number) => void;
  setBackgroundBorderRadius: (radius: number) => void;
  setAspectRatio: (aspectRatio: AspectRatioKey) => void;
  setBackgroundConfig: (config: BackgroundConfig) => void;
  setBackgroundType: (type: BackgroundType) => void;
  setBackgroundValue: (value: string) => void;
  setBackgroundOpacity: (opacity: number) => void;
  addTextOverlay: (overlay: Omit<TextOverlay, 'id'>) => void;
  updateTextOverlay: (id: string, updates: Partial<TextOverlay>) => void;
  removeTextOverlay: (id: string) => void;
  clearTextOverlays: () => void;
  setImageOpacity: (opacity: number) => void;
  setImageScale: (scale: number) => void;
  setImageBorder: (border: ImageBorder | Partial<ImageBorder>) => void;
  setImageShadow: (shadow: ImageShadow | Partial<ImageShadow>) => void;
  exportImage: () => Promise<void>;
}

export const useImageStore = create<ImageState>((set, get) => ({
  uploadedImageUrl: null,
  imageName: null,
  selectedGradient: 'primary_gradient',
  borderRadius: 0, // Sharp edge by default
  backgroundBorderRadius: 0, // Sharp edge by default
  selectedAspectRatio: '16_9',
  backgroundConfig: {
    type: 'gradient',
    value: 'primary_gradient',
    opacity: 1,
  },
  textOverlays: [],
  imageOpacity: 1,
  imageScale: 100,
  imageBorder: {
    enabled: false,
    width: 2,
    color: '#000000',
    type: 'none',
    theme: 'light',
    padding: 20,
    title: '',
  },
  imageShadow: {
    enabled: false,
    blur: 10,
    offsetX: 0,
    offsetY: 4,
    spread: 0,
    color: 'rgba(0, 0, 0, 0.3)',
  },

  setImage: (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    set({
      uploadedImageUrl: imageUrl,
      imageName: file.name,
    });
  },

  clearImage: () => {
    const { uploadedImageUrl } = get();
    if (uploadedImageUrl) {
      URL.revokeObjectURL(uploadedImageUrl);
    }
    set({
      uploadedImageUrl: null,
      imageName: null,
    });
  },

  setGradient: (gradient: GradientKey) => {
    set({ selectedGradient: gradient });
  },

  setBorderRadius: (radius: number) => {
    set({ borderRadius: radius });
  },

  setBackgroundBorderRadius: (radius: number) => {
    set({ backgroundBorderRadius: radius });
  },

  setAspectRatio: (aspectRatio: AspectRatioKey) => {
    set({ selectedAspectRatio: aspectRatio });
  },

  setBackgroundConfig: (config: BackgroundConfig) => {
    set({ backgroundConfig: config });
  },

  setBackgroundType: (type: BackgroundType) => {
    const { backgroundConfig } = get();
    set({
      backgroundConfig: {
        ...backgroundConfig,
        type,
      },
    });
  },

  setBackgroundValue: (value: string) => {
    const { backgroundConfig } = get();
    set({
      backgroundConfig: {
        ...backgroundConfig,
        value,
      },
    });
  },

  setBackgroundOpacity: (opacity: number) => {
    const { backgroundConfig } = get();
    set({
      backgroundConfig: {
        ...backgroundConfig,
        opacity,
      },
    });
  },

  addTextOverlay: (overlay) => {
    const id = `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set((state) => ({
      textOverlays: [...state.textOverlays, { ...overlay, id }],
    }));
  },

  updateTextOverlay: (id, updates) => {
    set((state) => ({
      textOverlays: state.textOverlays.map((overlay) =>
        overlay.id === id ? { ...overlay, ...updates } : overlay
      ),
    }));
  },

  removeTextOverlay: (id) => {
    set((state) => ({
      textOverlays: state.textOverlays.filter((overlay) => overlay.id !== id),
    }));
  },

  clearTextOverlays: () => {
    set({ textOverlays: [] });
  },

  setImageOpacity: (opacity: number) => {
    set({ imageOpacity: opacity });
  },

  setImageScale: (scale: number) => {
    set({ imageScale: scale });
  },

  setImageBorder: (border: ImageBorder | Partial<ImageBorder>) => {
    const currentBorder = get().imageBorder;
    set({
      imageBorder: {
        ...currentBorder,
        ...border,
      },
    });
  },

  setImageShadow: (shadow: ImageShadow | Partial<ImageShadow>) => {
    const currentShadow = get().imageShadow;
    set({
      imageShadow: {
        ...currentShadow,
        ...shadow,
      },
    });
  },

  exportImage: async () => {
    try {
      // Target the image render card element
      await exportImageWithGradient('image-render-card');
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  },
}));
