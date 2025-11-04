import { gradientColors, GradientKey } from './gradient-colors';
import { SolidColorKey, solidColors } from './solid-colors';
import { getCldImageUrl } from '@/lib/cloudinary';
import { cloudinaryPublicIds } from '@/lib/cloudinary-backgrounds';

export type BackgroundType = 'gradient' | 'solid' | 'image';

export interface BackgroundConfig {
  type: BackgroundType;
  value: GradientKey | SolidColorKey | string;
  opacity?: number;
  blur?: number; // Blur radius for background images (0-100)
}

export const getBackgroundStyle = (config: BackgroundConfig): string => {
  const { type, value, opacity = 1 } = config;

  switch (type) {
    case 'gradient':
      return gradientColors[value as GradientKey];

    case 'solid':
      const color = solidColors[value as SolidColorKey];
      return color;

    case 'image':
      return `url(${value})`;

    default:
      return gradientColors.primary_gradient;
  }
};

export const getBackgroundCSS = (
  config: BackgroundConfig
): React.CSSProperties => {
  const { type, value, opacity = 1, blur = 0 } = config;

  switch (type) {
    case 'gradient':
      return {
        background: gradientColors[value as GradientKey],
        opacity,
      };

    case 'solid':
      const color = solidColors[value as SolidColorKey];
      return {
        backgroundColor: color,
        opacity,
      };

    case 'image':
      // Check if it's a Cloudinary public ID
      const isCloudinaryPublicId = typeof value === 'string' && 
        !value.startsWith('blob:') && 
        !value.startsWith('http') && 
        !value.startsWith('data:') &&
        cloudinaryPublicIds.includes(value);
      
      let imageUrl = value as string;
      
      // If it's a Cloudinary public ID, get the optimized URL
      if (isCloudinaryPublicId) {
        imageUrl = getCldImageUrl({
          src: value as string,
          width: 1920,
          height: 1080,
          quality: 'auto',
          format: 'auto',
          crop: 'fill',
          gravity: 'auto',
        });
      }
      
      const styles: React.CSSProperties = {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity,
      };

      // Apply blur filter if blur > 0
      // Note: CSS filter blur applies to the entire element, so we need to apply it to a pseudo-element or wrapper
      if (blur > 0) {
        styles.filter = `blur(${blur}px)`;
      }
      
      return styles;

    default:
      return {
        background: gradientColors.primary_gradient,
        opacity,
      };
  }
};
