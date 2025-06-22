import React, { useState } from "react";
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
import { ImageIcon, AlertTriangle } from "lucide-react";

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [generatedCaption, setGeneratedCaption] = useState<string>("");
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setGeneratedCaption("");
  };

  const handleCaptionGenerated = (caption: string) => {
    setGeneratedCaption(caption);
  };

  const resetEditor = () => {
    setUploadedImage(null);
    setImagePreview("");
    setGeneratedCaption("");
    setIsGeneratingCaption(false);
    setShowResetDialog(false);
  };

  const handleUploadDifferentPhoto = () => {
    // Check if user has a caption or is currently generating one
    if (generatedCaption.trim() || isGeneratingCaption) {
      setShowResetDialog(true);
    } else {
      resetEditor();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Photo Caption Editor
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Upload your photo, generate an AI caption, and customize how it
            appears on your image
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {!uploadedImage ? (
            <PhotoUpload onImageUpload={handleImageUpload} />
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Your Photo</h2>
                    <button
                      onClick={handleUploadDifferentPhoto}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Upload Different Photo
                    </button>
                  </div>
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Uploaded preview"
                      className="w-full h-auto max-h-96 object-contain bg-gray-50"
                    />
                  </div>
                </Card>

                <CaptionGenerator
                  image={uploadedImage}
                  onCaptionGenerated={handleCaptionGenerated}
                  isGenerating={isGeneratingCaption}
                  setIsGenerating={setIsGeneratingCaption}
                />
              </div>

              <div>
                <PhotoEditor
                  imageUrl={imagePreview}
                  caption={generatedCaption}
                  onCaptionChange={setGeneratedCaption}
                />
              </div>
            </div>
          )}
        </div>
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
    </div>
  );
};

export default Index;
