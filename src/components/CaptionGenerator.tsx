
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, RefreshCw } from 'lucide-react';
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers to use browser cache
env.allowLocalModels = false;
env.useBrowserCache = true;

interface CaptionGeneratorProps {
  image: File | null;
  onCaptionGenerated: (caption: string) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

export const CaptionGenerator: React.FC<CaptionGeneratorProps> = ({
  image,
  onCaptionGenerated,
  isGenerating,
  setIsGenerating
}) => {
  const [caption, setCaption] = useState('');

  const generateCaption = async () => {
    if (!image) return;

    setIsGenerating(true);
    try {
      console.log('Loading image captioning model...');
      
      // Use a smaller, faster model for better performance
      const captioner = await pipeline(
        'image-to-text',
        'Xenova/vit-gpt2-image-captioning',
        { device: 'webgpu' }
      );

      console.log('Model loaded, generating caption...');
      
      // Convert file to URL for the model
      const imageUrl = URL.createObjectURL(image);
      const result = await captioner(imageUrl);
      
      console.log('Caption generated:', result);
      
      let generatedText = '';
      if (Array.isArray(result) && result.length > 0) {
        generatedText = result[0].generated_text || '';
      } else if (result && typeof result === 'object' && 'generated_text' in result) {
        generatedText = result.generated_text || '';
      }

      // Clean up the caption
      const cleanCaption = generatedText
        .replace(/^(a |an |the )/i, '')
        .split('.')[0]
        .trim();
      
      const finalCaption = cleanCaption.charAt(0).toUpperCase() + cleanCaption.slice(1);
      
      setCaption(finalCaption);
      onCaptionGenerated(finalCaption);
      
      // Clean up the object URL
      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error('Error generating caption:', error);
      const fallbackCaption = 'A beautiful moment captured in time';
      setCaption(fallbackCaption);
      onCaptionGenerated(fallbackCaption);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCaption = e.target.value;
    setCaption(newCaption);
    onCaptionGenerated(newCaption);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Caption
          </h2>
          <Button
            onClick={generateCaption}
            disabled={!image || isGenerating}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Caption'}
          </Button>
        </div>

        <Textarea
          value={caption}
          onChange={handleCaptionChange}
          placeholder="Click 'Generate Caption' to create an AI caption, or write your own..."
          className="min-h-24 resize-none"
          disabled={isGenerating}
        />

        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>AI is analyzing your photo and generating a caption...</span>
          </div>
        )}

        <p className="text-sm text-gray-500">
          You can edit the generated caption or write your own before placing it on the photo.
        </p>
      </div>
    </Card>
  );
};
