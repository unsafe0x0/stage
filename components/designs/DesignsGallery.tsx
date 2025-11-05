"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Instrument_Serif } from "next/font/google";
import { Navigation } from "@/components/landing/Navigation";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FaTrash, FaFolderOpen, FaSpinner } from "react-icons/fa";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Design {
  id: string;
  name: string;
  description?: string;
  previewUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export function DesignsGallery() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [designToDelete, setDesignToDelete] = useState<Design | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loadingDesignId, setLoadingDesignId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/designs");
      if (!response.ok) {
        throw new Error("Failed to fetch designs");
      }
      const data = await response.json();
      setDesigns(data.designs || []);
    } catch (error) {
      console.error("Error fetching designs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!designToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/designs/${designToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete design");
      }

      // Remove from local state
      setDesigns((prev) => prev.filter((d) => d.id !== designToDelete.id));
      setDeleteDialogOpen(false);
      setDesignToDelete(null);
    } catch (error) {
      console.error("Error deleting design:", error);
      alert("Failed to delete design. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleLoad = async (designId: string) => {
    try {
      setLoadingDesignId(designId);
      const response = await fetch(`/api/designs/${designId}`);
      if (!response.ok) {
        throw new Error("Failed to load design");
      }
      const data = await response.json();
      
      // Store the design data in sessionStorage to load it in the editor
      sessionStorage.setItem("loadDesign", JSON.stringify(data.design));
      
      // Navigate to editor
      router.push("/home");
    } catch (error) {
      console.error("Error loading design:", error);
      alert("Failed to load design. Please try again.");
      setLoadingDesignId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation ctaLabel="Editor" ctaHref="/home" />
      <div className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="mb-6 sm:mb-8">
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 px-2 sm:px-0 ${instrumentSerif.className}`}>
            My Designs
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2 sm:px-0">
            Manage and load your saved designs
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : designs.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh] px-4">
            <Card className="p-8 sm:p-12 md:p-16 text-center max-w-md w-full border shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-xl opacity-60"></div>
                  <div className="relative bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-6">
                    <FaFolderOpen className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                  No designs yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-8 leading-relaxed max-w-sm mx-auto">
                  Start creating and save your designs to see them here. Your saved work will appear in this gallery for easy access.
                </p>
                <Button 
                  onClick={() => router.push("/home")} 
                  size="lg"
                  className="px-6 sm:px-8 py-4 sm:py-6 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transition-all duration-200 touch-manipulation min-h-[44px] w-full sm:w-auto"
                >
                  Go to Editor
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {designs.map((design) => (
              <Card
                key={design.id}
                className="overflow-hidden hover:shadow-lg transition-shadow border-0"
              >
                <div className="aspect-video relative bg-gray-100">
                  {design.previewUrl ? (
                    <img
                      src={design.previewUrl}
                      alt={design.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaFolderOpen className="w-10 h-10 sm:w-12 sm:h-12" />
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 truncate">
                    {design.name}
                  </h3>
                  {design.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                      {design.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mb-3 sm:mb-4">
                    Updated {formatDate(design.updatedAt)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1 text-xs sm:text-sm touch-manipulation min-h-[36px]"
                      onClick={() => handleLoad(design.id)}
                      disabled={loadingDesignId === design.id || deleting}
                    >
                      {loadingDesignId === design.id ? (
                        <>
                          <FaSpinner className="w-3 h-3 sm:w-4 sm:h-4 mr-1 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <FaFolderOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Load
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setDesignToDelete(design);
                        setDeleteDialogOpen(true);
                      }}
                      disabled={loadingDesignId === design.id || deleting}
                      className="touch-manipulation min-h-[36px] px-2 sm:px-3"
                    >
                      <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="mx-4 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Design?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{designToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel disabled={deleting} className="w-full sm:w-auto touch-manipulation min-h-[44px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 touch-manipulation min-h-[44px]"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

