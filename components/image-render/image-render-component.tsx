import { useImageStore } from '@/lib/store';

interface ImageRenderComponentProps {
  imageUrl: string;
}

export const ImageRenderComponent = ({
  imageUrl,
}: ImageRenderComponentProps) => {
  const { borderRadius, imageOpacity, imageBorder, imageShadow, imageScale } = useImageStore();

  // Build shadow style
  const shadowStyle = imageShadow.enabled
    ? `${imageShadow.offsetX}px ${imageShadow.offsetY}px ${imageShadow.blur}px ${imageShadow.spread}px ${imageShadow.color}`
    : 'none';

  // Default shadow for styles that need it
  const defaultShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';

  // Build border styles based on frame type
  const getBorderStyles = () => {
    const baseStyles: React.CSSProperties = {
      borderRadius: `${borderRadius}px`,
      opacity: imageOpacity,
      transform: `scale(${imageScale / 100})`,
      transformOrigin: 'center',
      boxShadow: shadowStyle !== 'none' ? shadowStyle : undefined,
    };

    if (!imageBorder.enabled || imageBorder.type === 'none') {
      return baseStyles;
    }

    const borderColor = imageBorder.color || '#000000';
    const borderWidth = imageBorder.width || 2;

    // Apply border radius
    const borderRadiusStyle = { borderRadius: `${borderRadius}px` };

    switch (imageBorder.type) {
      case 'solid':
        return {
          ...baseStyles,
          ...borderRadiusStyle,
          border: `${borderWidth}px solid ${borderColor}`,
          boxShadow: shadowStyle !== 'none' ? shadowStyle : defaultShadow,
        };

      case 'dotted':
        return {
          ...baseStyles,
          ...borderRadiusStyle,
          border: `${borderWidth}px dotted ${borderColor}`,
          boxShadow: shadowStyle !== 'none' ? shadowStyle : defaultShadow,
        };

      case 'glassy':
        return {
          ...baseStyles,
          ...borderRadiusStyle,
          border: `${borderWidth}px solid rgba(255, 255, 255, 0.5)`,
          backdropFilter: 'blur(10px)',
          boxShadow: shadowStyle !== 'none' ? shadowStyle : defaultShadow,
        };

      case 'infinite-mirror':
        return {
          ...baseStyles,
          ...borderRadiusStyle,
          border: `${borderWidth}px solid ${borderColor}`,
          padding: `${borderWidth}px`,
          boxShadow: shadowStyle !== 'none' ? shadowStyle : defaultShadow,
        };

      case 'eclipse':
        return {
          ...baseStyles,
          borderRadius: '50%',
          border: `${borderWidth}px solid ${borderColor}`,
          boxShadow: shadowStyle !== 'none' ? shadowStyle : defaultShadow,
        };

      case 'focus':
        return {
          ...baseStyles,
          ...borderRadiusStyle,
          border: `${borderWidth}px solid ${borderColor}`,
          boxShadow: shadowStyle !== 'none' ? shadowStyle : defaultShadow,
        };

      case 'ruler':
        return {
          ...baseStyles,
          ...borderRadiusStyle,
          border: `${borderWidth}px solid ${borderColor}`,
          background: 'rgba(251, 191, 36, 0.8)',
          boxShadow: shadowStyle !== 'none' ? shadowStyle : defaultShadow,
        };

      case 'window':
      case 'stack':
        // These require more complex rendering with wrapper elements
        // For now, apply a basic border
        return {
          ...baseStyles,
          ...borderRadiusStyle,
          border: `${borderWidth}px solid ${borderColor}`,
          boxShadow: shadowStyle !== 'none' ? shadowStyle : defaultShadow,
        };

      default:
        return baseStyles;
    }
  };

  const borderStyles = getBorderStyles();

  return (
    <img
      src={imageUrl}
      alt="Uploaded image"
      className="max-w-full max-h-full object-contain"
      style={{
        ...borderStyles,
        maxWidth: '100%',
        maxHeight: '100%',
        width: 'auto',
        height: 'auto',
        display: 'block',
        margin: '0 auto',
        objectFit: 'contain',
        objectPosition: 'center',
      }}
    />
  );
};

