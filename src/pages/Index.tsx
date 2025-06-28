import React, { useRef, useState } from "react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { CaptionGenerator } from "@/components/CaptionGenerator";
import { PhotoEditor } from "@/components/PhotoEditor";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, AlertTriangle, Plus } from "lucide-react";

// Helper to generate unique IDs for photos
const generateId = () => Math.random().toString(36).substr(2, 9);

// Photo type
interface Photo {
  id: string;
  file: File;
  preview: string;
  caption: string;
}

// Sidebar component
const Sidebar: React.FC<{
  photos: Photo[];
  selectedPhotoId: string | null;
  onSelect: (id: string) => void;
  onUploadClick: () => void;
  onDelete: (id: string) => void;
}> = ({ photos, selectedPhotoId, onSelect, onUploadClick, onDelete }) => (
  <aside className="w-28 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-4">
    <Button
      variant="outline"
      size="icon"
      className="mb-2"
      onClick={onUploadClick}
      title="Upload New Photo"
    >
      <Plus className="w-5 h-5" />
    </Button>
    <div className="flex flex-col gap-3 w-full items-center">
      {photos.map((photo) => (
        <div key={photo.id} className="relative group w-16 h-16">
          <button
            onClick={() => onSelect(photo.id)}
            className={`rounded border-2 w-16 h-16 overflow-hidden flex items-center justify-center transition-all ${
              selectedPhotoId === photo.id
                ? "border-blue-500 ring-2 ring-blue-300"
                : "border-gray-200 hover:border-blue-300"
            }`}
            style={{ background: "#f9f9f9" }}
          >
            <img
              src={photo.preview}
              alt="Thumbnail"
              className="object-cover w-full h-full"
            />
          </button>
          {/* X button appears on hover */}
          <button
            onClick={() => onDelete(photo.id)}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border border-gray-300 text-gray-500 hover:bg-red-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow"
            title="Remove photo"
            tabIndex={-1}
            type="button"
          >
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path
                fillRule="evenodd"
                d="M10 8.586l4.95-4.95a1 1 0 111.414 1.415L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414L8.586 10l-4.95-4.95A1 1 0 115.05 3.636L10 8.586z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  </aside>
);

const Index = () => {
  // Array of photos
  const [photos, setPhotos] = useState<Photo[]>([]);
  // ID of the currently selected photo
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  // For confirmation modal
  const [showResetDialog, setShowResetDialog] = useState(false);
  // For caption generation state
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  // For upload modal
  const [showUpload, setShowUpload] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [photoIdToDelete, setPhotoIdToDelete] = useState<string | null>(null);

  // Get the currently selected photo object
  const selectedPhoto = photos.find((p) => p.id === selectedPhotoId) || null;

  // Handle uploading a new photo
  const handleImageUpload = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    const newPhoto: Photo = {
      id: generateId(),
      file,
      preview: previewUrl,
      caption: "",
    };
    setPhotos((prev) => {
      const updated = [...prev, newPhoto];
      console.log("Photos after upload:", updated);
      return updated;
    });
    setSelectedPhotoId(newPhoto.id);
    console.log("Selected photo ID after upload:", newPhoto.id);
    setShowUpload(false);
  };

  // Handle updating the caption for the selected photo
  const handleCaptionGenerated = (caption: string) => {
    if (!selectedPhotoId) return;
    setPhotos((prev) => {
      const updated = prev.map((photo) =>
        photo.id === selectedPhotoId ? { ...photo, caption } : photo
      );
      console.log("Photos after caption update:", updated);
      return updated;
    });
  };

  // Reset editor (deselect photo, but keep photos in state)
  const resetEditor = () => {
    setSelectedPhotoId(null);
    setShowResetDialog(false);
    setIsGeneratingCaption(false);
    console.log("Editor reset. Selected photo ID:", null);
  };

  // Handle 'Upload Different Photo' (show modal if caption exists)
  const handleUploadDifferentPhoto = () => {
    if (selectedPhoto && selectedPhoto.caption.trim()) {
      setShowResetDialog(true);
    } else {
      resetEditor();
    }
  };

  // Show upload modal or panel
  const handleShowUpload = () => setShowUpload(true);
  const handleHideUpload = () => setShowUpload(false);

  // Handle deleting a photo
  const handleDeletePhoto = (id: string) => {
    setPhotos((prev) => {
      const updated = prev.filter((photo) => photo.id !== id);
      // If the deleted photo was selected, select another or none
      if (selectedPhotoId === id) {
        if (updated.length > 0) {
          setSelectedPhotoId(updated[0].id);
        } else {
          setSelectedPhotoId(null);
        }
      }
      return updated;
    });
  };

  // Handle delete button click (show modal)
  const handleDeleteClick = (id: string) => {
    setPhotoIdToDelete(id);
    setShowDeleteDialog(true);
  };

  // Confirm deletion
  const confirmDeletePhoto = () => {
    if (photoIdToDelete) {
      handleDeletePhoto(photoIdToDelete);
    }
    setShowDeleteDialog(false);
    setPhotoIdToDelete(null);
  };

  // Cancel deletion
  const cancelDeletePhoto = () => {
    setShowDeleteDialog(false);
    setPhotoIdToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Photo Caption Editor
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Upload your photo, generate a caption, and customize how it appears
            on your image
          </p>
        </div>

        {/* If no photos, show original intro/upload UI only */}
        {photos.length === 0 ? (
          <div className="max-w-6xl mx-auto">
            <PhotoUpload onImageUpload={handleImageUpload} />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto flex">
            {/* Sidebar always visible if there are photos */}
            <Sidebar
              photos={photos}
              selectedPhotoId={selectedPhotoId}
              onSelect={setSelectedPhotoId}
              onUploadClick={handleShowUpload}
              onDelete={handleDeleteClick}
            />

            <div className="flex-1">
              {/* Show upload panel if upload is triggered */}
              {showUpload && (
                <div className="flex justify-center items-center h-full min-h-[400px]">
                  <PhotoUpload onImageUpload={handleImageUpload} />
                  <Button
                    onClick={handleHideUpload}
                    variant="ghost"
                    className="ml-4"
                  >
                    Cancel
                  </Button>
                </div>
              )}
              {selectedPhoto && !showUpload && (
                <div className="flex flex-col gap-8">
                  <div className="w-full">
                    <PhotoEditor
                      imageUrl={selectedPhoto.preview}
                      caption={selectedPhoto.caption}
                      onCaptionChange={handleCaptionGenerated}
                    />
                  </div>
                  <div className="w-full">
                    <CaptionGenerator
                      image={selectedPhoto.file}
                      onCaptionGenerated={handleCaptionGenerated}
                      isGenerating={isGeneratingCaption}
                      setIsGenerating={setIsGeneratingCaption}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <AlertDialogTitle className="text-lg">
                Unsaved Changes
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600">
              {isGeneratingCaption
                ? "You're currently generating a caption. Are you sure you want to upload a different photo and lose your progress?"
                : "You have a caption that hasn't been saved. Are you sure you want to upload a different photo and lose your current work?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="flex-1">
                Keep Current Photo
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={resetEditor}
                variant="destructive"
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Upload New Photo
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Modal for deleting photo */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <AlertDialogTitle className="text-lg">
                Delete Photo?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-gray-600">
              Deleting this photo will also delete its caption and any edits.
              This action cannot be undone. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel asChild>
              <Button
                variant="outline"
                className="flex-1"
                onClick={cancelDeletePhoto}
              >
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                onClick={confirmDeletePhoto}
                variant="destructive"
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                Delete Photo
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
