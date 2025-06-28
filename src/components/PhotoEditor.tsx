import React, { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, FabricImage, FabricText } from "fabric";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Type, Palette } from "lucide-react";

interface PhotoEditorProps {
  imageUrl: string;
  caption: string;
  onCaptionChange: (caption: string) => void;
}

const MAX_WIDTH = 600;
const MAX_HEIGHT = 600;

// Font options with display names and actual font families
const fontOptions = [
  { value: "Arial", label: "Arial", preview: "Arial" },
  { value: "Helvetica", label: "Helvetica", preview: "Helvetica" },
  {
    value: "Times New Roman",
    label: "Times New Roman",
    preview: "Times New Roman",
  },
  { value: "Georgia", label: "Georgia", preview: "Georgia" },
  { value: "Verdana", label: "Verdana", preview: "Verdana" },
  { value: "Trebuchet MS", label: "Trebuchet MS", preview: "Trebuchet MS" },
  { value: "Impact", label: "Impact", preview: "Impact" },
  { value: "Comic Sans MS", label: "Comic Sans MS", preview: "Comic Sans MS" },
  { value: "Courier New", label: "Courier New", preview: "Courier New" },
  {
    value: "Lucida Console",
    label: "Lucida Console",
    preview: "Lucida Console",
  },
  { value: "Tahoma", label: "Tahoma", preview: "Tahoma" },
  { value: "Arial Black", label: "Arial Black", preview: "Arial Black" },
];

export const PhotoEditor: React.FC<PhotoEditorProps> = ({
  imageUrl,
  caption,
  onCaptionChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [textObject, setTextObject] = useState<FabricText | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [canvasDims, setCanvasDims] = useState<{
    width: number;
    height: number;
  }>({ width: MAX_WIDTH, height: MAX_HEIGHT });
  const [originalDims, setOriginalDims] = useState<{
    width: number;
    height: number;
  }>({ width: MAX_WIDTH, height: MAX_HEIGHT });
  // Persist text position, angle, and scale
  const [textState, setTextState] = useState({
    left: canvasDims.width / 2,
    top: canvasDims.height - 80,
    angle: 0,
    scaleX: 1,
    scaleY: 1,
  });

  // Reset text position when image changes
  useEffect(() => {
    setTextState({
      left: canvasDims.width / 2,
      top: canvasDims.height - 80,
      angle: 0,
      scaleX: 1,
      scaleY: 1,
    });
  }, [imageUrl, canvasDims.width, canvasDims.height]);

  // Dynamically determine image size and set canvas size
  useEffect(() => {
    if (!imageUrl) return;
    const img = new window.Image();
    img.onload = () => {
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      setOriginalDims({ width, height });
      // Scale down to fit max box
      const scale = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height, 1);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      setCanvasDims({ width, height });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new FabricCanvas(canvasRef.current, {
      width: canvasDims.width,
      height: canvasDims.height,
      backgroundColor: "#f5f5f5",
    });
    setFabricCanvas(canvas);
    // Add canvas-level double-click handler
    canvas.on("mouse:dblclick", (options) => {
      if (options.target && options.target.type === "text") {
        const text = options.target as FabricText;
        text.set("editing", true);
        canvas.setActiveObject(text);
        canvas.renderAll();
      }
    });
    return () => {
      canvas.dispose();
    };
  }, [canvasDims.width, canvasDims.height]);

  useEffect(() => {
    if (!fabricCanvas || !imageUrl) return;
    // Load the image
    FabricImage.fromURL(imageUrl, {
      crossOrigin: "anonymous",
    }).then((img) => {
      if (!fabricCanvas) return;
      // Clear canvas
      fabricCanvas.clear();
      // Scale image to fit canvas exactly
      const canvasWidth = fabricCanvas.width || MAX_WIDTH;
      const canvasHeight = fabricCanvas.height || MAX_HEIGHT;
      const imageWidth = img.width || 1;
      const imageHeight = img.height || 1;
      const scale = Math.min(
        canvasWidth / imageWidth,
        canvasHeight / imageHeight
      );
      img.scale(scale);
      // Center the image
      img.left = (canvasWidth - img.getScaledWidth()) / 2;
      img.top = (canvasHeight - img.getScaledHeight()) / 2;
      // Add image to canvas
      fabricCanvas.add(img);
      // Make image non-selectable and non-interactive
      img.selectable = false;
      img.evented = false;
      fabricCanvas.renderAll();
    });
  }, [fabricCanvas, imageUrl, canvasDims.width, canvasDims.height]);

  useEffect(() => {
    if (!fabricCanvas || !caption) return;
    // Remove existing text
    if (textObject) {
      fabricCanvas.remove(textObject);
    }
    // Add new text
    const text = new FabricText(caption, {
      left: textState.left,
      top: textState.top,
      angle: textState.angle,
      scaleX: textState.scaleX,
      scaleY: textState.scaleY,
      fontSize: fontSize,
      fill: textColor,
      fontFamily: fontFamily,
      textAlign: "center",
      originX: "center",
      originY: "center",
      selectable: true,
      editable: true,
      hasControls: true,
      hasBorders: true,
    });
    fabricCanvas.add(text);
    setTextObject(text);
    // Add text editing listener
    const handleTextEdit = () => {
      if (text.text) {
        onCaptionChange(text.text);
      }
      // Save position, angle, and scale only after modification is complete
      setTextState({
        left: text.left ?? canvasDims.width / 2,
        top: text.top ?? canvasDims.height - 80,
        angle: text.angle ?? 0,
        scaleX: text.scaleX ?? 1,
        scaleY: text.scaleY ?? 1,
      });
    };
    text.on("modified", handleTextEdit);
    fabricCanvas.renderAll();
    return () => {
      if (text) {
        text.off("modified", handleTextEdit);
      }
    };
  }, [
    fabricCanvas,
    caption,
    fontSize,
    textColor,
    fontFamily,
    onCaptionChange,
    canvasDims.width,
    canvasDims.height,
    textState.left,
    textState.top,
    textState.angle,
    textState.scaleX,
    textState.scaleY,
  ]);

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    if (textObject) {
      textObject.set("fontSize", newSize);
      fabricCanvas?.renderAll();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setTextColor(color);
    if (textObject) {
      textObject.set("fill", color);
      fabricCanvas?.renderAll();
    }
  };

  const handleFontChange = (value: string) => {
    setFontFamily(value);
    if (textObject) {
      textObject.set("fontFamily", value);
      fabricCanvas?.renderAll();
    }
  };

  const downloadImage = () => {
    if (!fabricCanvas) return;
    // Create a temp canvas at the original image resolution
    const tempCanvas = new FabricCanvas(null, {
      width: originalDims.width,
      height: originalDims.height,
      backgroundColor: "#f5f5f5",
    });
    // Add the image at full size
    FabricImage.fromURL(imageUrl, {
      crossOrigin: "anonymous",
    }).then((img) => {
      img.left = 0;
      img.top = 0;
      img.scaleX = 1;
      img.scaleY = 1;
      img.selectable = false;
      img.evented = false;
      tempCanvas.add(img);
      // Scale text properties proportionally
      const scaleX = originalDims.width / canvasDims.width;
      const scaleY = originalDims.height / canvasDims.height;
      const text = new FabricText(caption, {
        left: textState.left * scaleX,
        top: textState.top * scaleY,
        angle: textState.angle,
        scaleX: textState.scaleX * scaleX,
        scaleY: textState.scaleY * scaleY,
        fontSize: fontSize,
        fill: textColor,
        fontFamily: fontFamily,
        textAlign: "center",
        originX: "center",
        originY: "center",
        selectable: false,
        editable: false,
        hasControls: false,
        hasBorders: false,
      });
      tempCanvas.add(text);
      tempCanvas.renderAll();
      const dataURL = tempCanvas.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 1,
      });
      const link = document.createElement("a");
      link.download = "captioned-photo.png";
      link.href = dataURL;
      link.click();
      tempCanvas.dispose();
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Type className="w-5 h-5 text-blue-500" />
            Photo Editor
          </h2>
          <Button onClick={downloadImage} className="gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
        </div>
        <div className="flex justify-center">
          <div
            className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
            style={{ width: canvasDims.width, height: canvasDims.height }}
          >
            <canvas
              ref={canvasRef}
              width={canvasDims.width}
              height={canvasDims.height}
              className="block max-w-full h-auto"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <span className="text-sm font-medium">Font Size:</span>
            </div>
            <div className="flex-1">
              <Slider
                value={[fontSize]}
                onValueChange={handleFontSizeChange}
                min={12}
                max={72}
                step={1}
                className="w-full"
              />
            </div>
            <span className="text-sm text-gray-600 min-w-[2rem]">
              {fontSize}px
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <span className="text-sm font-medium">Font Family:</span>
            </div>
            <div className="flex-1">
              <Select value={fontFamily} onValueChange={handleFontChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>
                        {font.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="text-sm font-medium">Text Color:</span>
            </div>
            <input
              type="color"
              value={textColor}
              onChange={handleColorChange}
              className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
            />
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Double-click the text to edit it, or drag to reposition the caption.
        </p>
      </div>
    </Card>
  );
};
