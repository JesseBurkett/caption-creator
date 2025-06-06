
import React, { useState } from 'react';
import { PhotoUpload } from '@/components/PhotoUpload';
import { CaptionGenerator } from '@/components/CaptionGenerator';
import { PhotoEditor } from '@/components/PhotoEditor';
import { Card } from '@/components/ui/card';

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [generatedCaption, setGeneratedCaption] = useState<string>('');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setGeneratedCaption('');
  };

  const handleCaptionGenerated = (caption: string) => {
    setGeneratedCaption(caption);
  };

  const resetEditor = () => {
    setUploadedImage(null);
    setImagePreview('');
    setGeneratedCaption('');
    setIsGeneratingCaption(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Photo Caption Editor
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Upload your photo, generate an AI caption, and customize how it appears on your image
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
                      onClick={resetEditor}
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
    </div>
  );
};

export default Index;
