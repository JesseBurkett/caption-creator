
import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, FabricImage, FabricText } from 'fabric';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Download, Type, Palette } from 'lucide-react';

interface PhotoEditorProps {
  imageUrl: string;
  caption: string;
  onCaptionChange: (caption: string) => void;
}

export const PhotoEditor: React.FC<PhotoEditorProps> = ({
  imageUrl,
  caption,
  onCaptionChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [textObject, setTextObject] = useState<FabricText | null>(null);
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#ffffff');

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 400,
      backgroundColor: '#f5f5f5'
    });

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas || !imageUrl) return;

    // Load the image
    FabricImage.fromURL(imageUrl, {
      crossOrigin: 'anonymous'
    }).then((img) => {
      if (!fabricCanvas) return;
      
      // Clear canvas
      fabricCanvas.clear();
      
      // Scale image to fit canvas
      const canvasWidth = fabricCanvas.width || 600;
      const canvasHeight = fabricCanvas.height || 400;
      const imageWidth = img.width || 1;
      const imageHeight = img.height || 1;
      
      const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
      img.scale(scale);
      
      // Center the image
      fabricCanvas.centerObject(img);
      
      // Add image to canvas
      fabricCanvas.add(img);
      fabricCanvas.sendToBack(img);
      
      // Make image non-selectable
      img.selectable = false;
      img.evented = false;
      
      fabricCanvas.renderAll();
    });
  }, [fabricCanvas, imageUrl]);

  useEffect(() => {
    if (!fabricCanvas || !caption) return;

    // Remove existing text
    if (textObject) {
      fabricCanvas.remove(textObject);
    }

    // Add new text
    const text = new FabricText(caption, {
      left: fabricCanvas.width ? fabricCanvas.width / 2 : 300,
      top: fabricCanvas.height ? fabricCanvas.height - 80 : 320,
      fontSize: fontSize,
      fill: textColor,
      fontFamily: 'Arial',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      shadow: '2px 2px 4px rgba(0,0,0,0.5)'
    });

    fabricCanvas.add(text);
    setTextObject(text);

    // Add text editing listener
    const handleTextEdit = () => {
      if (text.text) {
        onCaptionChange(text.text);
      }
    };

    text.on('editingExited', handleTextEdit);

    fabricCanvas.renderAll();

    return () => {
      if (text) {
        text.off('editingExited', handleTextEdit);
      }
    };
  }, [fabricCanvas, caption, fontSize, textColor, onCaptionChange]);

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    
    if (textObject) {
      textObject.set('fontSize', newSize);
      fabricCanvas?.renderAll();
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setTextColor(color);
    
    if (textObject) {
      textObject.set('fill', color);
      fabricCanvas?.renderAll();
    }
  };

  const downloadImage = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2
    });
    
    const link = document.createElement('a');
    link.download = 'captioned-photo.png';
    link.href = dataURL;
    link.click();
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

        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <canvas ref={canvasRef} className="max-w-full" />
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
            <span className="text-sm text-gray-600 min-w-[2rem]">{fontSize}px</span>
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
          Double-click the text on the canvas to edit it. Drag to reposition.
        </p>
      </div>
    </Card>
  );
};
