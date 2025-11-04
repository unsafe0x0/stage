"use client";

import * as React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarLeft } from "./sidebar-left";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { useImageStore } from "@/lib/store";
import { ImageRenderCard } from "@/components/image-render/image-render-card";
import { useDropzone } from "react-dropzone";
import { ImageSquare as ImageIcon } from "@phosphor-icons/react";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/constants";

function EditorContent() {
  const { uploadedImageUrl, setImage } = useImageStore();
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `File type not supported. Please use: ${ALLOWED_IMAGE_TYPES.join(", ")}`;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `File size too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  const handleUpload = React.useCallback(async (imageUrl: string) => {
    // Convert blob URL to File object for the store
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'uploaded-image.png', { type: blob.type });
      setImage(file);
      setUploadError(null);
    } catch (error) {
      console.error('Failed to process uploaded image:', error);
      setUploadError("Failed to load image. Please try again.");
    }
  }, [setImage]);

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const validationError = validateFile(file);
        if (validationError) {
          setUploadError(validationError);
          return;
        }

        setUploadError(null);
        const blobUrl = URL.createObjectURL(file);
        await handleUpload(blobUrl);
      }
    },
    [handleUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": ALLOWED_IMAGE_TYPES.map((type) => type.split("/")[1]),
    },
    maxSize: MAX_IMAGE_SIZE,
    multiple: false,
  });

  return (
    <SidebarProvider>
      <SidebarLeft />
      <SidebarInset>
        <div className="min-h-screen flex flex-col relative bg-gray-50">
          <div className="border-b px-4 py-2 flex items-center gap-2">
            <SidebarTrigger />
            <Navigation ctaLabel="Home" ctaHref="/" />
          </div>
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 xl:p-20">
            {!uploadedImageUrl ? (
              <div className="w-full max-w-4xl">
                <div className="space-y-4">
                  <div className="text-center space-y-2 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Upload Image</h2>
                    <p className="text-sm text-gray-600">
                      Drag & drop or click to upload
                    </p>
                  </div>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-6 sm:p-10 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center touch-manipulation ${
                      isDragActive
                        ? "border-blue-500 bg-blue-50/50 scale-[1.02]"
                        : "border-gray-200 hover:border-blue-400 hover:bg-gray-50/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className={`mb-3 sm:mb-4 transition-colors flex items-center justify-center w-full ${isDragActive ? "text-blue-500" : "text-gray-400"}`}>
                      <ImageIcon size={48} weight="duotone" className="sm:w-14 sm:h-14" />
                    </div>
                    {isDragActive ? (
                      <p className="text-sm font-medium text-blue-600 text-center">Drop the image here...</p>
                    ) : (
                      <div className="space-y-2 text-center px-2">
                        <p className="text-sm font-semibold text-gray-700">
                          Drag & drop an image here
                        </p>
                        <p className="text-xs text-gray-500">
                          or tap to browse • PNG, JPG, WEBP up to {MAX_IMAGE_SIZE / 1024 / 1024}MB
                        </p>
                      </div>
                    )}
                  </div>
                  {uploadError && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                      {uploadError}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageRenderCard imageUrl={uploadedImageUrl} />
              </div>
            )}
          </div>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function EditorLayout() {
  return <EditorContent />;
}
