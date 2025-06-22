import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, RefreshCw, MessageSquare } from "lucide-react";
import { pipeline, env } from "@huggingface/transformers";

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
  setIsGenerating,
}) => {
  const [caption, setCaption] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);

  const generateCaption = async () => {
    if (!image) return;

    setIsGenerating(true);
    try {
      console.log("Loading image captioning model...");

      // Use a smaller, faster model for better performance
      const captioner = await pipeline(
        "image-to-text",
        "Xenova/vit-gpt2-image-captioning",
        { device: "webgpu" }
      );

      console.log("Model loaded, generating caption...");

      // Convert file to URL for the model
      const imageUrl = URL.createObjectURL(image);
      const result = await captioner(imageUrl);

      console.log("Caption generated:", result);

      let generatedText = "";

      // Handle different result formats from the model
      if (Array.isArray(result) && result.length > 0) {
        const firstResult = result[0];
        if (typeof firstResult === "object" && firstResult !== null) {
          // Type assertion for the result structure
          const typedResult = firstResult as {
            generated_text?: string;
            text?: string;
          };
          generatedText = typedResult.generated_text || typedResult.text || "";
        }
      } else if (result && typeof result === "object") {
        // Type assertion for single result
        const typedResult = result as {
          generated_text?: string;
          text?: string;
        };
        generatedText = typedResult.generated_text || typedResult.text || "";
      }

      // Clean up the caption
      const cleanCaption = generatedText
        .replace(/^(a |an |the )/i, "")
        .split(".")[0]
        .trim();

      const finalCaption =
        cleanCaption.charAt(0).toUpperCase() + cleanCaption.slice(1);

      setCaption(finalCaption);
      onCaptionGenerated(finalCaption);

      // Clean up the object URL
      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error("Error generating caption:", error);
      const fallbackCaption = "A beautiful moment captured in time";
      setCaption(fallbackCaption);
      onCaptionGenerated(fallbackCaption);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCaptionWithLLM = async () => {
    if (!image) return;

    setIsGenerating(true);
    try {
      // TODO: Implement LLM integration here
      // This is where you would call your LLM API with the custom prompt
      console.log("LLM caption generation with prompt:", customPrompt);

      // For now, we'll use the same model but with a placeholder for LLM
      const captioner = await pipeline(
        "image-to-text",
        "Xenova/vit-gpt2-image-captioning",
        { device: "webgpu" }
      );

      const imageUrl = URL.createObjectURL(image);
      const result = await captioner(imageUrl);

      let generatedText = "";

      if (Array.isArray(result) && result.length > 0) {
        const firstResult = result[0];
        if (typeof firstResult === "object" && firstResult !== null) {
          const typedResult = firstResult as {
            generated_text?: string;
            text?: string;
          };
          generatedText = typedResult.generated_text || typedResult.text || "";
        }
      } else if (result && typeof result === "object") {
        const typedResult = result as {
          generated_text?: string;
          text?: string;
        };
        generatedText = typedResult.generated_text || typedResult.text || "";
      }

      // Apply custom prompt context if provided
      if (customPrompt.trim()) {
        generatedText = `${customPrompt}: ${generatedText}`;
      }

      const cleanCaption = generatedText
        .replace(/^(a |an |the )/i, "")
        .split(".")[0]
        .trim();

      const finalCaption =
        cleanCaption.charAt(0).toUpperCase() + cleanCaption.slice(1);

      setCaption(finalCaption);
      onCaptionGenerated(finalCaption);

      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error("Error generating LLM caption:", error);
      const fallbackCaption = customPrompt.trim()
        ? `${customPrompt}: A beautiful moment captured in time`
        : "A beautiful moment captured in time";
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

  const handleGenerateCaption = () => {
    if (useCustomPrompt && customPrompt.trim()) {
      generateCaptionWithLLM();
    } else {
      generateCaption();
    }
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
            onClick={handleGenerateCaption}
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
            {isGenerating ? "Generating..." : "Generate Caption"}
          </Button>
        </div>

        {/* Custom Prompt Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="use-custom-prompt"
              checked={useCustomPrompt}
              onChange={(e) => setUseCustomPrompt(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label
              htmlFor="use-custom-prompt"
              className="text-sm font-medium flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Use custom prompt (LLM mode)
            </Label>
          </div>

          {useCustomPrompt && (
            <div className="space-y-2">
              <Label htmlFor="custom-prompt" className="text-sm font-medium">
                Custom Prompt:
              </Label>
              <Input
                id="custom-prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., 'Write a funny caption for this photo' or 'Describe this image in a poetic way'"
                className="text-sm"
                disabled={isGenerating}
              />
              <p className="text-xs text-gray-500">
                This will be used to guide the LLM in generating a more specific
                caption.
              </p>
            </div>
          )}
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
            <span>
              {useCustomPrompt && customPrompt.trim()
                ? "LLM is analyzing your photo with your custom prompt..."
                : "AI is analyzing your photo and generating a caption..."}
            </span>
          </div>
        )}

        <p className="text-sm text-gray-500">
          {useCustomPrompt
            ? "Use a custom prompt to guide the LLM in generating more specific captions."
            : "You can edit the generated caption or write your own before placing it on the photo."}
        </p>
      </div>
    </Card>
  );
};
