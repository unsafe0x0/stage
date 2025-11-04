'use client';

import { useImageStore } from '@/lib/store';
import { ImageRenderCard } from '@/components/image-render/image-render-card';
import { ImageUploadSimple } from '@/components/image-render/image-upload-simple';

export const EditorMain = () => {
  const { uploadedImageUrl, setImage } = useImageStore();

  const handleImageUpload = (file: File) => {
    setImage(file);
  };

  if (!uploadedImageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-4xl w-full">
          <ImageUploadSimple onImageUpload={handleImageUpload} />
        </div>
      </div>
    );
  }

  return <ImageRenderCard imageUrl={uploadedImageUrl} />;
};

